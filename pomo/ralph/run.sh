#!/bin/bash
# Ralph Runner - Autonomous Development Loop
# Usage: ./ralph/run.sh [max_iterations] [timeout_minutes]
#
# Features:
# - Timeout protection (default 10 min)
# - Signal handling (clean Ctrl+C)
# - Stuck detection (same story 3x = blocked)
# - Status files for monitor.sh
# - [SKIP] prefix auto-skips stories
# - [MANUAL] prefix blocks immediately
# - Better stuck messages (shows WHY)

set -e

RALPH_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$RALPH_DIR")"
MAX_ITERATIONS=${1:-5}
TIMEOUT_MINUTES=${2:-10}
TIMEOUT_SECONDS=$((TIMEOUT_MINUTES * 60))
ITERATION=1

# Status files for monitor
STATUS_FILE="$RALPH_DIR/.ralph_status"
LOG_FILE="$RALPH_DIR/.ralph_log"
LAST_STORY_FILE="$RALPH_DIR/.ralph_last_story"
STUCK_COUNT_FILE="$RALPH_DIR/.ralph_stuck_count"

# Spinner PID (global for cleanup)
SPIN_PID=""

cd "$PROJECT_ROOT"

# ============================================
# Signal handling - clean shutdown
# ============================================
cleanup() {
    echo ""
    echo "Received shutdown signal..."

    # Kill spinner if running
    if [ -n "$SPIN_PID" ]; then
        kill $SPIN_PID 2>/dev/null
    fi

    # Update status
    echo "INTERRUPTED" > "$STATUS_FILE"
    log_activity "Loop interrupted by user (Ctrl+C)"

    echo "Ralph stopped cleanly."
    exit 0
}

trap cleanup SIGINT SIGTERM

# ============================================
# Helper functions
# ============================================
count_remaining() {
    grep -c '"passes": false' "$RALPH_DIR/prd.json" 2>/dev/null || echo "0"
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
    # Get the title of a story by its ID
    local story_id="$1"
    grep -A2 "\"id\": \"$story_id\"" "$RALPH_DIR/prd.json" 2>/dev/null | grep '"title"' | head -1 | sed 's/.*"title"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/'
}

check_story_prefix() {
    # Check if story title has a special prefix
    # Returns: "SKIP", "MANUAL", or "RUN"
    local story_id="$1"
    local title=$(get_story_title "$story_id")

    # Check for [SKIP anywhere in title (case insensitive)
    if echo "$title" | grep -qi '\[SKIP'; then
        echo "SKIP"
    # Check for [MANUAL] anywhere in title (case insensitive)
    elif echo "$title" | grep -qi '\[MANUAL'; then
        echo "MANUAL"
    else
        echo "RUN"
    fi
}

auto_skip_story() {
    # Mark a story as passed (skipped) without running it
    local story_id="$1"
    local reason="$2"

    # Use sed to change passes: false to passes: true for this story
    # Find the story by ID and change the next occurrence of "passes": false
    sed -i "/${story_id}/,/\"passes\"/ s/\"passes\": false/\"passes\": true/" "$RALPH_DIR/prd.json"

    log_activity "AUTO-SKIP: $story_id - $reason"
    echo "  [AUTO-SKIP] $story_id: $reason"
}

log_activity() {
    local msg="$1"
    local timestamp=$(date '+%H:%M:%S')
    echo "[$timestamp] $msg" >> "$LOG_FILE"
    # Keep only last 50 lines
    tail -50 "$LOG_FILE" > "$LOG_FILE.tmp" 2>/dev/null && mv "$LOG_FILE.tmp" "$LOG_FILE"
}

update_status() {
    echo "$1" > "$STATUS_FILE"
    echo "$(date +%s)" > "$STATUS_FILE.start"
}

check_stuck() {
    local current_story="$1"
    local last_story=""
    local stuck_count=0

    if [ -f "$LAST_STORY_FILE" ]; then
        last_story=$(cat "$LAST_STORY_FILE")
    fi

    if [ -f "$STUCK_COUNT_FILE" ]; then
        stuck_count=$(cat "$STUCK_COUNT_FILE")
    fi

    if [ "$current_story" = "$last_story" ]; then
        stuck_count=$((stuck_count + 1))
        echo "$stuck_count" > "$STUCK_COUNT_FILE"

        if [ "$stuck_count" -ge 3 ]; then
            # Analyze WHY we're stuck by checking recent log entries
            local reason="unknown"
            local timeout_count=$(grep -c "TIMEOUT.*$current_story" "$LOG_FILE" 2>/dev/null || echo "0")
            local error_count=$(grep -c "ERROR.*$current_story" "$LOG_FILE" 2>/dev/null || echo "0")

            if [ "$timeout_count" -ge 2 ]; then
                reason="TIMEOUT - task may need longer timeout or is too complex"
            elif [ "$error_count" -ge 2 ]; then
                reason="ERROR - Claude encountered repeated errors"
            else
                reason="UNKNOWN - check progress.md for details"
            fi

            # Store reason for display
            echo "$reason" > "$RALPH_DIR/.ralph_stuck_reason"
            return 1  # Stuck!
        fi
    else
        # New story, reset counter
        echo "0" > "$STUCK_COUNT_FILE"
    fi

    echo "$current_story" > "$LAST_STORY_FILE"
    return 0
}

# ============================================
# Startup
# ============================================
echo "=========================================="
echo "  Ralph Autonomous Development Agent"
echo "=========================================="
echo "Project: $PROJECT_ROOT"
echo "PRD: ralph/prd.json"
echo "Max iterations: $MAX_ITERATIONS"
echo "Timeout: ${TIMEOUT_MINUTES} minutes"
echo ""
echo "TIP: Run ./ralph/monitor.sh in another terminal for live status"
echo ""

# Initialize log
echo "" > "$LOG_FILE"
log_activity "Ralph started (max: $MAX_ITERATIONS iterations)"

# Check for required files
if [ ! -f "$RALPH_DIR/prd.json" ]; then
    echo "ERROR: ralph/prd.json not found"
    exit 1
fi

REMAINING=$(count_remaining)
echo "Stories remaining: $REMAINING"
echo ""

if [ "$REMAINING" -eq 0 ]; then
    echo "All stories complete! Nothing to do."
    update_status "COMPLETE"
    exit 0
fi

echo "Starting Ralph loop..."
echo "Press Ctrl+C to stop gracefully"
echo ""

# ============================================
# The Ralph prompt
# ============================================
RALPH_PROMPT='You are Ralph, an autonomous development agent.

INSTRUCTIONS:
1. Read ralph/prd.json to find the FIRST story with "passes": false
2. Read ralph/RALPH_PROMPT.md for your operating rules
3. Read ralph/AGENT.md for project-specific instructions
4. Execute ONLY that one story - follow acceptance criteria exactly
5. After completing, update prd.json to set "passes": true for that story
6. Append your progress to ralph/progress.md
7. End with the RALPH_STATUS block

CRITICAL RULES:
- ONE story per iteration
- NEVER run git commit, push, or destructive commands
- Always run TypeScript check after code changes
- If blocked, set STATUS: BLOCKED and explain why

Begin now with the first incomplete story.'

# ============================================
# Main loop
# ============================================
while [ $ITERATION -le $MAX_ITERATIONS ]; do
    REMAINING=$(count_remaining)
    CURRENT_STORY=$(get_current_story)

    if [ "$REMAINING" -eq 0 ]; then
        echo ""
        echo "=========================================="
        echo "  All stories complete!"
        echo "=========================================="
        update_status "COMPLETE"
        log_activity "All stories complete!"
        exit 0
    fi

    # Check for special prefixes in story title
    STORY_PREFIX=$(check_story_prefix "$CURRENT_STORY")
    STORY_TITLE=$(get_story_title "$CURRENT_STORY")

    if [ "$STORY_PREFIX" = "SKIP" ]; then
        auto_skip_story "$CURRENT_STORY" "Title has [SKIP] prefix"
        # Don't increment iteration - just continue to next story
        sleep 1
        continue
    fi

    if [ "$STORY_PREFIX" = "MANUAL" ]; then
        echo ""
        echo "=========================================="
        echo "  MANUAL TASK DETECTED!"
        echo "  Story: $CURRENT_STORY"
        echo "  Title: $STORY_TITLE"
        echo "=========================================="
        update_status "BLOCKED"
        log_activity "BLOCKED: Story $CURRENT_STORY requires manual intervention ([MANUAL] prefix)"
        echo ""
        echo "This task requires manual intervention."
        echo "Options:"
        echo "  1. Complete the task manually, then mark passes: true in prd.json"
        echo "  2. Change [MANUAL] to [SKIP] in the title to skip it"
        echo ""
        exit 1
    fi

    # Check if stuck on same story
    if ! check_stuck "$CURRENT_STORY"; then
        STUCK_REASON="check progress.md for details"
        if [ -f "$RALPH_DIR/.ralph_stuck_reason" ]; then
            STUCK_REASON=$(cat "$RALPH_DIR/.ralph_stuck_reason")
        fi

        echo ""
        echo "=========================================="
        echo "  STUCK DETECTED!"
        echo "  Story: $CURRENT_STORY"
        echo "  Title: $STORY_TITLE"
        echo "  Reason: $STUCK_REASON"
        echo "=========================================="
        update_status "BLOCKED"
        log_activity "BLOCKED: Story $CURRENT_STORY failed 3x - $STUCK_REASON"
        echo ""
        echo "Options:"
        echo "  1. Fix the issue and run Ralph again"
        echo "  2. Add [SKIP] to title to skip: \"[SKIP] $STORY_TITLE\""
        echo "  3. Reset stuck counter: echo 0 > ralph/.ralph_stuck_count"
        echo ""
        exit 1
    fi

    echo "=========================================="
    echo "  Iteration $ITERATION of $MAX_ITERATIONS"
    echo "  Stories remaining: $REMAINING"
    echo "  Current story: $CURRENT_STORY"
    echo "  Title: $STORY_TITLE"
    echo "=========================================="
    echo ""

    update_status "RUNNING"
    log_activity "Starting iteration $ITERATION - Story $CURRENT_STORY"

    echo "Claude is working... (timeout: ${TIMEOUT_MINUTES}min)"

    # Start a background spinner
    (while true; do
        for s in '⠋' '⠙' '⠹' '⠸' '⠼' '⠴' '⠦' '⠧' '⠇' '⠏'; do
            printf "\r  %s Working on story $CURRENT_STORY..." "$s"
            sleep 0.1
        done
    done) &
    SPIN_PID=$!

    # Run Claude with timeout
    set +e  # Don't exit on error
    timeout $TIMEOUT_SECONDS claude -p "$RALPH_PROMPT" --dangerously-skip-permissions
    EXIT_STATUS=$?
    set -e

    # Stop spinner
    kill $SPIN_PID 2>/dev/null
    SPIN_PID=""
    printf "\r                                              \r"

    # Handle timeout
    if [ $EXIT_STATUS -eq 124 ]; then
        echo ""
        echo "TIMEOUT: Claude exceeded ${TIMEOUT_MINUTES} minute limit"
        log_activity "TIMEOUT: Story $CURRENT_STORY exceeded time limit"
        update_status "TIMEOUT"
        echo "Continuing to next iteration..."
        ITERATION=$((ITERATION + 1))
        sleep 2
        continue
    fi

    # Handle other errors
    if [ $EXIT_STATUS -ne 0 ]; then
        echo ""
        echo "Claude exited with status $EXIT_STATUS"
        log_activity "ERROR: Claude exited with status $EXIT_STATUS"
        update_status "ERROR"
        echo "Continuing to next iteration..."
        ITERATION=$((ITERATION + 1))
        sleep 2
        continue
    fi

    log_activity "Completed iteration $ITERATION - Story $CURRENT_STORY"
    echo ""
    echo "Iteration $ITERATION complete."
    echo ""

    ITERATION=$((ITERATION + 1))

    # Small delay between iterations
    sleep 2
done

echo ""
echo "=========================================="
echo "  Reached max iterations ($MAX_ITERATIONS)"
echo "  Stories remaining: $(count_remaining)"
echo "=========================================="
update_status "IDLE"
log_activity "Reached max iterations ($MAX_ITERATIONS)"
