# CodeFocus Architecture Diagrams

## Current Architecture (Problematic)

```mermaid
flowchart TB
    subgraph Browser["Browser Storage"]
        LS[("localStorage<br/>codefocus-stats")]
    end

    subgraph PageState["page.tsx State (SESSION - Lost on Refresh)"]
        SP[completedPomodoros]
        TK[tasks: Task[]]
        ST[settings]
        TM[timer state]
        AT[activeTaskId]
    end

    subgraph UseStats["useStats() Hook"]
        subgraph PersistedStats["Persisted Stats"]
            CS[currentStreak]
            LS2[longestStreak]
            TFM[totalFocusMinutes]
            TP[totalPomodoros]
            DS[dailyStats: DayStats[]]
            LAD[lastActiveDate]
            PR[personalRecords]
            GL[goals]
        end

        subgraph Functions["Functions"]
            RP[recordPomodoro]
            RS[recordSkip]
            GFS[getFocusScore]
            GTS[getTodayStats]
            GHD[getHeatmapData]
            GTH[getTotalHours]
            GLV[getLevel]
            GGP[getGoalProgress]
            SG[setGoals - UNUSED!]
        end
    end

    subgraph Components["UI Components"]
        SC[StatsCard]
        GP[GoalProgress]
        SH[StreakHeatmap]
        RD[ReportDialog]
        TL[TaskList]
        SD[SettingsDialog]
    end

    %% Data Flow
    LS <--> UseStats
    UseStats --> SC
    UseStats --> GP
    UseStats --> SH

    %% PROBLEM: ReportDialog uses session state, not persisted!
    PageState --> RD
    PageState --> TL
    PageState --> SD

    %% Styling for problems
    style RD fill:#ff6b6b,stroke:#c92a2a,color:#fff
    style TK fill:#ff6b6b,stroke:#c92a2a,color:#fff
    style SP fill:#ffa94d,stroke:#e67700
    style SG fill:#ff6b6b,stroke:#c92a2a,color:#fff
    style PR fill:#ffa94d,stroke:#e67700
    style LS2 fill:#ffa94d,stroke:#e67700
```

### Legend
- 🔴 **Red**: Critical issues (data not persisted, broken connections)
- 🟠 **Orange**: Data tracked but never displayed
- Default: Working correctly

---

## Current Data Flow Problems

```mermaid
flowchart LR
    subgraph Problems["Critical Issues"]
        P1["1. ReportDialog<br/>Shows SESSION data only<br/>Not historical stats"]
        P2["2. Tasks[]<br/>Lost on page refresh<br/>Not persisted"]
        P3["3. Goals<br/>setGoals() exists<br/>No UI to call it"]
        P4["4. Records<br/>personalRecords tracked<br/>Never displayed"]
        P5["5. longestStreak<br/>Tracked in stats<br/>Never shown"]
    end

    subgraph Root["Root Cause"]
        RC["Fragmented State Model<br/>Session vs Persisted<br/>not clearly separated"]
    end

    RC --> P1
    RC --> P2
    RC --> P3
    RC --> P4
    RC --> P5

    style RC fill:#c92a2a,color:#fff
    style P1 fill:#ff6b6b,color:#fff
    style P2 fill:#ff6b6b,color:#fff
    style P3 fill:#ffa94d
    style P4 fill:#ffa94d
    style P5 fill:#ffa94d
```

---

## Desired Architecture

```mermaid
flowchart TB
    subgraph Browser["Browser Storage"]
        LS[("localStorage<br/>codefocus-app")]
    end

    subgraph AppState["useAppState() - Single Source of Truth"]
        subgraph Session["Session State (Ephemeral)"]
            TM2[timer: mode, isRunning, timeLeft]
            SPC[sessionPomodoros]
            ATI[activeTaskId]
        end

        subgraph Persisted["Persisted State (localStorage)"]
            subgraph Stats["stats/"]
                TP2[totalPomodoros]
                TFM2[totalFocusMinutes]
                CS2[currentStreak]
                LS3[longestStreak]
                DS2[dailyStats[]]
                PR2[personalRecords]
            end

            subgraph Tasks["tasks/"]
                TKS[Task[]]
            end

            subgraph Settings["settings/"]
                PMD[pomodoro duration]
                BRK[break durations]
                AUT[auto-start options]
            end

            subgraph Goals["goals/"]
                DG[dailyTarget]
                WG[weeklyTarget]
            end
        end
    end

    subgraph Calculations["Pure Functions (lib/stats.ts)"]
        CF1[calculateStreak]
        CF2[calculateLevel]
        CF3[calculateFocusScore]
        CF4[generateHeatmapData]
        CF5[calculateGoalProgress]
    end

    subgraph Components["UI Components"]
        SC2[StatsCard]
        GP2[GoalProgress]
        SH2[StreakHeatmap]
        RD2[ReportDialog]
        TL2[TaskList]
        SD2[SettingsDialog]
        GD[GoalsDialog - NEW]
    end

    %% Data Flow
    LS <--> Persisted
    AppState --> Components
    Persisted --> Calculations
    Calculations --> Components

    %% All components now have access to everything
    style AppState fill:#51cf66,stroke:#2f9e44
    style Persisted fill:#69db7c,stroke:#2f9e44
    style Session fill:#d3f9d8,stroke:#2f9e44
    style Calculations fill:#a5d8ff,stroke:#1971c2
    style GD fill:#51cf66,stroke:#2f9e44,color:#fff
```

---

## State Structure Comparison

```mermaid
flowchart LR
    subgraph Current["CURRENT: Fragmented"]
        direction TB
        C1["page.tsx useState()"]
        C2["useStats() hook"]
        C3["No connection between them"]
        C1 --- C3
        C2 --- C3
    end

    subgraph Desired["DESIRED: Unified"]
        direction TB
        D1["useAppState()"]
        D2["session: {...}"]
        D3["persisted: {...}"]
        D1 --> D2
        D1 --> D3
    end

    Current -->|"Refactor"| Desired

    style Current fill:#ff6b6b
    style Desired fill:#51cf66
```

---

## Component Data Access (Before vs After)

```mermaid
flowchart TB
    subgraph Before["BEFORE: Mixed Data Sources"]
        B_RD["ReportDialog"]
        B_PS["page.tsx state<br/>(session only)"]
        B_US["useStats()<br/>(persisted)"]

        B_PS -->|"completedPomodoros<br/>tasks"| B_RD
        B_US -.->|"NO ACCESS"| B_RD
    end

    subgraph After["AFTER: Single Source"]
        A_RD["ReportDialog"]
        A_AS["useAppState()"]

        A_AS -->|"stats.totalPomodoros<br/>stats.dailyStats<br/>tasks<br/>goals"| A_RD
    end

    Before -->|"Refactor"| After

    style B_RD fill:#ff6b6b
    style A_RD fill:#51cf66
    style B_US stroke-dasharray: 5 5
```

---

## File Structure (Proposed)

```mermaid
flowchart TB
    subgraph Hooks["hooks/"]
        H1["use-app-state.ts<br/>(unified state)"]
        H2["use-timer.ts<br/>(timer logic)"]
    end

    subgraph Lib["lib/"]
        L1["storage.ts<br/>(localStorage adapter)"]
        L2["stats.ts<br/>(pure calculations)"]
        L3["types.ts<br/>(TypeScript interfaces)"]
    end

    subgraph Components["components/"]
        C1["stats-card.tsx"]
        C2["goal-progress.tsx"]
        C3["streak-heatmap.tsx"]
        C4["report-dialog.tsx"]
        C5["goals-dialog.tsx - NEW"]
        C6["settings-dialog.tsx"]
    end

    subgraph App["app/"]
        A1["page.tsx<br/>(uses useAppState)"]
    end

    H1 --> A1
    H2 --> A1
    L1 --> H1
    L2 --> H1
    L3 --> H1
    L3 --> Components
    A1 --> Components
```
