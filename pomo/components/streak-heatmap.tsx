"use client"

import HeatMap from "@uiw/react-heat-map"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"

interface StreakHeatmapProps {
  data: { date: string; count: number; level: number }[][]
}

export function StreakHeatmap({ data }: StreakHeatmapProps) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [hoveredDay, setHoveredDay] = useState<{ date: string; count: number } | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Get today's date
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  const todayStr = `${year}/${month}/${day}`

  // Flatten and convert data to the format expected by @uiw/react-heat-map
  // Format: { date: 'YYYY/MM/DD', count: number }
  // Only include days with actual activity (count > 0) - empty days will show as lightest
  const flatData = data.flat()
    .filter(item => item && item.date && item.count > 0)
    .map(item => ({
      date: item.date.replace(/-/g, '/'),
      count: item.count,
    }))

  // Calculate start date (180 days ago - ~6 months)
  const startDate = new Date(today)
  startDate.setDate(today.getDate() - 180)

  // Find today's data for default display
  const todayData = flatData.find(d => d.date === todayStr)
  const displayDay = hoveredDay || (todayData ? { date: todayData.date, count: todayData.count } : { date: todayStr, count: 0 })

  // Color scheme - keys are count thresholds
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

  const colors = resolvedTheme === 'dark' ? darkColors : lightColors
  const textColor = resolvedTheme === 'dark' ? '#a1a1aa' : '#71717a' // zinc-400 / zinc-500

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
            endDate={today}
            width="100%"
            rectSize={14}
            space={3}
            rectProps={{
              rx: 2,
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
            legendRender={({ key, ...props }) => <rect key={key} {...props} rx={2} />}
          />
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-1.5 mt-3 text-[10px] sm:text-xs text-muted-foreground">
          <span>Less</span>
          <div className="flex gap-0.5">
            {[0, 1, 3, 5, 8].map((threshold) => (
              <div
                key={threshold}
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: colors[threshold] }}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  )
}
