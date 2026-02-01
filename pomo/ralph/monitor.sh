#!/bin/bash
# Ralph Monitor - Live Dashboard
# Usage: ./ralph/monitor.sh
#
# Features:
# - Live status with story title
# - Stuck detection with reason
# - Phase progress tracking
# - Recent activity log

RALPH_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$RALPH_DIR")"
STATUS_FILE="$RALPH_DIR/.ralph_status"
LOG_FILE="$RALPH_DIR/.ralph_log"
STUCK_COUNT_FILE="$RALPH_DIR/.ralph_stuck_count"
STUCK_REASON_FILE="$RALPH_DIR/.ralph_stuck_reason"
LAST_STORY_FILE="$RALPH_DIR/.ralph_last_story"

# Colors
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
GRAY='\033[0;90m'
NC='\033[0m' # No Color
BOLD='\033[1m'
DIM='\033[2m'

# Hide cursor
tput civis

# Restore cursor on exit
trap 'tput cnorm; echo ""; exit 0' SIGINT SIGTERM

# Count stories
count_total() {
    grep -c '"id":' "$RALPH_DIR/prd.json" 2>/dev/null || echo "0"
}

count_remaining() {
    grep -c '"passes": false' "$RALPH_DIR/prd.json" 2>/dev/null || echo "0"
}

count_complete() {
    grep -c '"passes": true' "$RALPH_DIR/prd.json" 2>/dev/null || echo "0"
}

get_current_story() {
    # Find first story with passes: false and extract its ID
    local story_id=$(grep -B5 '"passes": false' "$RALPH_DIR/prd.json" 2>/dev/null | grep '"id"' | head -1 | sed 's/.*"id"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')
    if [ -z "$story_id" ]; then
        echo "none"
    else
        echo "$story_id"
    fi
}

get_story_title() {
    # Get the title of a story by its ID (truncated to fit display)
    local story_id="$1"
    local max_len="${2:-45}"
    local title=$(grep -A2 "\"id\": \"$story_id\"" "$RALPH_DIR/prd.json" 2>/dev/null | grep '"title"' | head -1 | sed 's/.*"title"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')

    if [ ${#title} -gt $max_len ]; then
        echo "${title:0:$((max_len-3))}..."
    else
        echo "$title"
    fi
}

get_story_phase() {
    # Get the phase of a story by its ID
    local story_id="$1"
    grep -A3 "\"id\": \"$story_id\"" "$RALPH_DIR/prd.json" 2>/dev/null | grep '"phase"' | head -1 | sed 's/.*"phase"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/'
}

get_stuck_count() {
    if [ -f "$STUCK_COUNT_FILE" ]; then
        cat "$STUCK_COUNT_FILE"
    else
        echo "0"
    fi
}

get_stuck_reason() {
    if [ -f "$STUCK_REASON_FILE" ]; then
        cat "$STUCK_REASON_FILE"
    else
        echo ""
    fi
}

count_by_phase() {
    # Count remaining stories in each phase
    local phase="$1"
    grep -B10 '"passes": false' "$RALPH_DIR/prd.json" 2>/dev/null | grep -c "\"phase\": \"$phase\"" || echo "0"
}

get_status() {
    if [ -f "$STATUS_FILE" ]; then
        cat "$STATUS_FILE"
    else
        echo "IDLE"
    fi
}

get_elapsed() {
    if [ -f "$STATUS_FILE.start" ]; then
        start=$(cat "$STATUS_FILE.start")
        now=$(date +%s)
        elapsed=$((now - start))
        printf "%02d:%02d" $((elapsed / 60)) $((elapsed % 60))
    else
        echo "00:00"
    fi
}

# Progress bar
progress_bar() {
    local complete=$1
    local total=$2
    local width=30

    if [ "$total" -eq 0 ]; then
        total=1
    fi

    local filled=$((complete * width / total))
    local empty=$((width - filled))

    printf "["
    printf "%${filled}s" | tr ' ' '='
    printf "%${empty}s" | tr ' ' '-'
    printf "]"
}

# Spinner frames for running status
SPINNER_FRAMES=('⠋' '⠙' '⠹' '⠸' '⠼' '⠴' '⠦' '⠧' '⠇' '⠏')
SPINNER_IDX=0

# Main display loop
while true; do
    clear

    TOTAL=$(count_total)
    REMAINING=$(count_remaining)
    COMPLETE=$(count_complete)
    CURRENT=$(get_current_story)
    CURRENT_TITLE=$(get_story_title "$CURRENT" 42)
    CURRENT_PHASE=$(get_story_phase "$CURRENT")
    STATUS=$(get_status)
    ELAPSED=$(get_elapsed)
    STUCK_COUNT=$(get_stuck_count)
    STUCK_REASON=$(get_stuck_reason)

    # Update spinner
    SPINNER="${SPINNER_FRAMES[$SPINNER_IDX]}"
    SPINNER_IDX=$(( (SPINNER_IDX + 1) % ${#SPINNER_FRAMES[@]} ))

    # Header
    echo -e "${BOLD}${CYAN}"
    echo "╔══════════════════════════════════════════════════════════╗"
    echo "║           🤖 RALPH AUTONOMOUS AGENT MONITOR              ║"
    echo "╚══════════════════════════════════════════════════════════╝"
    echo -e "${NC}"

    # Status section
    echo -e "${YELLOW}┌─ STATUS ─────────────────────────────────────────────────┐${NC}"

    # Status with color and details
    case "$STATUS" in
        "RUNNING")
            echo -e "│  State:   ${GREEN}${SPINNER} RUNNING${NC}  ${DIM}(elapsed: $ELAPSED)${NC}"
            ;;
        "BLOCKED")
            echo -e "│  State:   ${RED}◼ BLOCKED${NC}"
            if [ -n "$STUCK_REASON" ]; then
                echo -e "│  Reason:  ${RED}$STUCK_REASON${NC}"
            fi
            ;;
        "TIMEOUT")
            echo -e "│  State:   ${YELLOW}◼ TIMEOUT${NC}  ${DIM}(will retry)${NC}"
            ;;
        "ERROR")
            echo -e "│  State:   ${RED}◼ ERROR${NC}  ${DIM}(will retry)${NC}"
            ;;
        "COMPLETE")
            echo -e "│  State:   ${GREEN}✓ COMPLETE${NC}"
            ;;
        "INTERRUPTED")
            echo -e "│  State:   ${YELLOW}◼ INTERRUPTED${NC}"
            ;;
        *)
            echo -e "│  State:   ${GRAY}○ IDLE${NC}"
            ;;
    esac

    echo -e "│  Story:   ${BOLD}$CURRENT${NC}"
    if [ -n "$CURRENT_TITLE" ] && [ "$CURRENT" != "none" ]; then
        echo -e "│  Title:   ${DIM}$CURRENT_TITLE${NC}"
    fi
    if [ -n "$CURRENT_PHASE" ]; then
        echo -e "│  Phase:   ${MAGENTA}$CURRENT_PHASE${NC}"
    fi
    if [ "$STUCK_COUNT" -gt 0 ] && [ "$STATUS" != "BLOCKED" ]; then
        echo -e "│  Retries: ${YELLOW}$STUCK_COUNT / 3${NC}"
    fi
    echo -e "${YELLOW}└───────────────────────────────────────────────────────────┘${NC}"
    echo ""

    # Progress section
    PERCENT=0
    if [ "$TOTAL" -gt 0 ]; then
        PERCENT=$((COMPLETE * 100 / TOTAL))
    fi

    echo -e "${CYAN}┌─ PROGRESS ────────────────────────────────────────────────┐${NC}"
    echo -e "│"
    echo -e "│  $(progress_bar $COMPLETE $TOTAL)  ${BOLD}$PERCENT%${NC}"
    echo -e "│"
    echo -e "│  ${GREEN}✓${NC} Complete:  $COMPLETE"
    echo -e "│  ${YELLOW}◷${NC} Remaining: $REMAINING"
    echo -e "│  ${GRAY}Σ${NC} Total:     $TOTAL"
    echo -e "│"
    echo -e "${CYAN}└───────────────────────────────────────────────────────────┘${NC}"
    echo ""

    # Recent log section
    echo -e "${BLUE}┌─ RECENT ACTIVITY ─────────────────────────────────────────┐${NC}"
    if [ -f "$LOG_FILE" ] && [ -s "$LOG_FILE" ]; then
        tail -5 "$LOG_FILE" | while read line; do
            # Color-code log entries
            if echo "$line" | grep -q "BLOCKED\|ERROR"; then
                echo -e "│  ${RED}$line${NC}"
            elif echo "$line" | grep -q "TIMEOUT"; then
                echo -e "│  ${YELLOW}$line${NC}"
            elif echo "$line" | grep -q "AUTO-SKIP"; then
                echo -e "│  ${MAGENTA}$line${NC}"
            elif echo "$line" | grep -q "Completed\|complete"; then
                echo -e "│  ${GREEN}$line${NC}"
            else
                echo -e "│  ${DIM}$line${NC}"
            fi
        done
    else
        echo -e "│  ${DIM}No activity yet...${NC}"
    fi
    echo -e "${BLUE}└───────────────────────────────────────────────────────────┘${NC}"
    echo ""

    # Footer with helpful commands
    echo -e "${GRAY}Updated: $(date '+%H:%M:%S') │ Refresh: 2s │ Ctrl+C to exit${NC}"
    if [ "$STATUS" = "BLOCKED" ]; then
        echo -e "${DIM}Tip: Reset stuck counter: echo 0 > ralph/.ralph_stuck_count${NC}"
    fi

    sleep 2
done
