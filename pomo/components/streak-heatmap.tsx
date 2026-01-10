"use client"

import HeatMap from "@uiw/react-heat-map"
import { useTheme } from "next-themes"
import { useState, useEffect, useMemo } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface StreakHeatmapProps {
  data: { date: string; count: number; level: number }[][]
}

export function StreakHeatmap({ data }: StreakHeatmapProps) {
  const { resolvedTheme, theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [hoveredDay, setHoveredDay] = useState<{ date: string; count: number } | null>(null)
  const [periodOffset, setPeriodOffset] = useState(0) // 0 = current half, -1 = previous, etc.

  useEffect(() => {
    setMounted(true)
  }, [])

  // Get today's date
  const today = new Date()
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth()
  const todayStr = `${currentYear}/${String(currentMonth + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`

  // Calculate the 6-month period to display
  const { startDate, endDate, periodLabel } = useMemo(() => {
    // Determine current half: H1 (Jan-Jun) = 0, H2 (Jul-Dec) = 1
    const currentHalf = currentMonth < 6 ? 0 : 1

    // Calculate target half with offset
    let targetHalf = currentHalf + periodOffset
    let targetYear = currentYear

    // Normalize: each year has 2 halves (0 and 1)
    while (targetHalf < 0) {
      targetHalf += 2
      targetYear--
    }
    while (targetHalf > 1) {
      targetHalf -= 2
      targetYear++
    }

    // Calculate dates
    const startMonth = targetHalf === 0 ? 0 : 6 // Jan or Jul
    const start = new Date(targetYear, startMonth, 1)
    const end = new Date(targetYear, startMonth + 6, 0) // Last day of the 6th month

    // Period label
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const label = `${monthNames[startMonth]} - ${monthNames[startMonth + 5]} ${targetYear}`

    return { startDate: start, endDate: end, periodLabel: label }
  }, [currentYear, currentMonth, periodOffset])

  // Flatten and convert data to the format expected by @uiw/react-heat-map
  const flatData = data.flat()
    .filter(item => item && item.date && item.count > 0)
    .map(item => ({
      date: item.date.replace(/-/g, '/'),
      count: item.count,
    }))

  // Find today's data for default display
  const todayData = flatData.find(d => d.date === todayStr)
  const displayDay = hoveredDay || (todayData ? { date: todayData.date, count: todayData.count } : { date: todayStr, count: 0 })

  // Color schemes - keys are count thresholds
  // 0 = no activity, 1+ = increasing activity levels
  const lightColors: Record<number, string> = {
    0: '#ebedf0',  // no activity (lightest)
    1: '#c6c6c6',  // 1-2 pomodoros
    3: '#9e9e9e',  // 3-4 pomodoros
    5: '#6e6e6e',  // 5-7 pomodoros
    8: '#333333',  // 8+ pomodoros (darkest)
  }

  const darkColors: Record<number, string> = {
    0: '#2d2d2d',  // no activity (darkest in dark mode)
    1: '#4a4a4a',  // 1-2 pomodoros
    3: '#6e6e6e',  // 3-4 pomodoros
    5: '#9e9e9e',  // 5-7 pomodoros
    8: '#e0e0e0',  // 8+ pomodoros (lightest in dark mode)
  }

  // Cute theme - pink gradient
  const cuteColors: Record<number, string> = {
    0: '#FFF0F5',  // lavender blush (no activity)
    1: '#FFD6E0',  // light pink
    3: '#F8A5B8',  // medium pink
    5: '#E07090',  // deeper pink
    8: '#C05068',  // primary pink (most activity)
  }

  // Select colors based on theme
  const isCute = theme === 'cute'
  const colors = isCute ? cuteColors : (resolvedTheme === 'dark' ? darkColors : lightColors)
  const textColor = isCute ? '#7B6B7B' : (resolvedTheme === 'dark' ? '#a1a1aa' : '#71717a')

  if (!mounted) {
    return (
      <div>
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="text-xs sm:text-sm font-medium tracking-wide">Activity</h3>
        </div>
        <div className="border border-border bg-card p-4 sm:p-5">
          <div className="h-[140px] animate-pulse bg-muted rounded" />
        </div>
      </div>
    )
  }

  const formatDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr.replace(/\//g, '-'))
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-xs sm:text-sm font-medium tracking-wide">Activity</h3>
      </div>

      <div className="border border-border bg-card p-4 sm:p-5">
        {/* Day info - shows today by default, or hovered day */}
        <div className="h-5 mb-3">
          <p className="text-xs sm:text-sm text-muted-foreground">
            <span className="text-foreground font-medium">
              {displayDay.count} pomodoro{displayDay.count !== 1 ? "s" : ""}
            </span>{" "}
            on {formatDisplayDate(displayDay.date)}
            {displayDay.date === todayStr && !hoveredDay && " (today)"}
          </p>
        </div>

        <div className="overflow-x-auto heatmap-container">
          <style>{`
            .heatmap-container svg text {
              fill: ${textColor} !important;
            }
          `}</style>
          <HeatMap
            value={flatData}
            startDate={startDate}
            endDate={endDate}
            width="100%"
            rectSize={14}
            space={3}
            rectProps={{
              rx: 7,  // Half of rectSize (14) for perfect circles
            }}
            weekLabels={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']}
            monthLabels={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']}
            panelColors={colors}
            rectRender={({ key, ...props }, data) => {
              return (
                <rect
                  key={key}
                  {...props}
                  onMouseEnter={() => {
                    if (data.date) {
                      setHoveredDay({ date: data.date, count: data.count || 0 })
                    }
                  }}
                  onMouseLeave={() => setHoveredDay(null)}
                  style={{ cursor: 'pointer' }}
                />
              )
            }}
            legendRender={({ key, ...props }) => <rect key={key} {...props} rx={7} />}
          />
        </div>

        {/* Navigation & Legend */}
        <div className="flex items-center justify-between mt-3 text-[10px] sm:text-xs text-muted-foreground">
          {/* Period Navigation */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPeriodOffset(prev => prev - 1)}
              className="p-0.5 hover:text-foreground transition-colors"
              aria-label="Previous period"
            >
              <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <span className="min-w-[100px] sm:min-w-[120px] text-center">{periodLabel}</span>
            <button
              onClick={() => setPeriodOffset(prev => prev + 1)}
              disabled={periodOffset >= 0}
              className={`p-0.5 transition-colors ${
                periodOffset >= 0 ? 'opacity-30 cursor-not-allowed' : 'hover:text-foreground'
              }`}
              aria-label="Next period"
            >
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-1.5">
            <span>Less</span>
            <div className="flex gap-1">
              {[0, 1, 3, 5, 8].map((threshold) => (
                <div
                  key={threshold}
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: colors[threshold] }}
                />
              ))}
            </div>
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  )
}
