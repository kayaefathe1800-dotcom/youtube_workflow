// components/CalendarView.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { STAGE_COLORS } from '@/types/video'
import type { Video, Stage } from '@/types/video'

type Props = {
  videos: Video[]
  onVideoClick: (video: Video) => void
}

type CalEvent = {
  video: Video
  type: 'publish' | 'stageDue'
  stage?: Stage
}

function buildCalendar(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function eventsOnDate(videos: Video[], dateStr: string): CalEvent[] {
  const events: CalEvent[] = []
  for (const v of videos) {
    if (v.publishDate === dateStr) {
      events.push({ video: v, type: 'publish' })
    }
    // Show current stage deadline
    const stageDue = v.stageDueDates?.[v.stage]
    if (stageDue === dateStr) {
      events.push({ video: v, type: 'stageDue', stage: v.stage })
    }
  }
  return events
}

function getWeekDates(baseDate: Date): Date[] {
  const day = baseDate.getDay() // 0=Sun
  const start = new Date(baseDate)
  start.setDate(baseDate.getDate() - day)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d
  })
}

function EventChip({ event, onClick }: { event: CalEvent; onClick: () => void }) {
  const className =
    event.type === 'publish'
      ? 'bg-green-100 text-green-700'
      : STAGE_COLORS[event.stage!].badge
  const label =
    event.type === 'publish'
      ? `📅 ${event.video.title}`
      : `${event.stage} ${event.video.title}`
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick()
      }}
      className={`text-xs rounded px-1 py-0.5 mb-0.5 truncate cursor-pointer ${className}`}
      title={event.video.title}
    >
      {label}
    </div>
  )
}

export function CalendarView({ videos, onVideoClick }: Props) {
  const today = new Date()
  const todayStr = toDateStr(today)

  const [view, setView] = useState<'month' | 'week' | 'day'>('month')
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [currentDate, setCurrentDate] = useState(new Date(today))

  // ---- View toggle ----
  const viewTabs = (
    <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
      {(['month', 'week', 'day'] as const).map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => setView(v)}
          className={`flex-1 text-xs font-medium py-1 px-2 rounded-md transition-all ${
            view === v
              ? 'bg-white shadow-sm text-gray-900'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {v === 'month' ? '月' : v === 'week' ? '週' : '日'}
        </button>
      ))}
    </div>
  )

  // ---- MONTH VIEW ----
  if (view === 'month') {
    const cells = buildCalendar(year, month)

    const prevMonth = () => {
      if (month === 0) {
        setYear((y) => y - 1)
        setMonth(11)
      } else {
        setMonth((m) => m - 1)
      }
    }
    const nextMonth = () => {
      if (month === 11) {
        setYear((y) => y + 1)
        setMonth(0)
      } else {
        setMonth((m) => m + 1)
      }
    }

    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <Button type="button" variant="outline" size="sm" onClick={prevMonth}>
            ‹ 前月
          </Button>
          <div className="flex flex-col items-center gap-2">
            <h2 className="font-bold text-lg">
              {year}年{month + 1}月
            </h2>
            {viewTabs}
          </div>
          <Button type="button" variant="outline" size="sm" onClick={nextMonth}>
            翌月 ›
          </Button>
        </div>

        <div className="grid grid-cols-7 mb-1">
          {['日', '月', '火', '水', '木', '金', '土'].map((d) => (
            <div key={d} className="text-center text-xs text-gray-400 py-1">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (!day) return <div key={i} />
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const isToday = dateStr === todayStr
            const events = eventsOnDate(videos, dateStr)
            return (
              <div
                key={i}
                className={`min-h-16 sm:min-h-20 rounded-lg p-1 border ${
                  isToday
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-gray-100 bg-white'
                }`}
              >
                <div
                  className={`text-xs font-medium mb-1 ${
                    isToday ? 'text-blue-600' : 'text-gray-600'
                  }`}
                >
                  {day}
                </div>
                {events.map((ev, j) => (
                  <EventChip
                    key={j}
                    event={ev}
                    onClick={() => onVideoClick(ev.video)}
                  />
                ))}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // ---- WEEK VIEW ----
  if (view === 'week') {
    const weekDates = getWeekDates(currentDate)
    const prevWeek = () => {
      const d = new Date(currentDate)
      d.setDate(d.getDate() - 7)
      setCurrentDate(d)
    }
    const nextWeek = () => {
      const d = new Date(currentDate)
      d.setDate(d.getDate() + 7)
      setCurrentDate(d)
    }
    const startStr = `${weekDates[0].getMonth() + 1}/${weekDates[0].getDate()}`
    const endStr = `${weekDates[6].getMonth() + 1}/${weekDates[6].getDate()}`

    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <Button type="button" variant="outline" size="sm" onClick={prevWeek}>
            ‹ 前週
          </Button>
          <div className="flex flex-col items-center gap-2">
            <span className="font-bold text-sm">
              {startStr} — {endStr}
            </span>
            {viewTabs}
          </div>
          <Button type="button" variant="outline" size="sm" onClick={nextWeek}>
            翌週 ›
          </Button>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {weekDates.map((d) => {
            const ds = toDateStr(d)
            const isToday = ds === todayStr
            const dayName = ['日', '月', '火', '水', '木', '金', '土'][d.getDay()]
            const events = eventsOnDate(videos, ds)
            return (
              <div
                key={ds}
                className={`min-h-24 rounded-xl p-1.5 border ${
                  isToday
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-gray-100 bg-white'
                }`}
              >
                <div
                  className={`text-xs font-semibold mb-1 ${
                    isToday ? 'text-blue-600' : 'text-gray-500'
                  }`}
                >
                  {dayName} {d.getDate()}
                </div>
                {events.map((ev, i) => (
                  <EventChip
                    key={i}
                    event={ev}
                    onClick={() => onVideoClick(ev.video)}
                  />
                ))}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // ---- DAY VIEW ----
  if (view === 'day') {
    const ds = toDateStr(currentDate)
    const prevDay = () => {
      const d = new Date(currentDate)
      d.setDate(d.getDate() - 1)
      setCurrentDate(d)
    }
    const nextDay = () => {
      const d = new Date(currentDate)
      d.setDate(d.getDate() + 1)
      setCurrentDate(d)
    }
    const isToday = ds === todayStr
    const events = eventsOnDate(videos, ds)
    const dayNames = ['日', '月', '火', '水', '木', '金', '土']

    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <Button type="button" variant="outline" size="sm" onClick={prevDay}>
            ‹ 前日
          </Button>
          <div className="flex flex-col items-center gap-2">
            <span className={`font-bold text-sm ${isToday ? 'text-blue-600' : ''}`}>
              {currentDate.getFullYear()}年{currentDate.getMonth() + 1}月
              {currentDate.getDate()}日（{dayNames[currentDate.getDay()]}）
              {isToday && ' 今日'}
            </span>
            {viewTabs}
          </div>
          <Button type="button" variant="outline" size="sm" onClick={nextDay}>
            翌日 ›
          </Button>
        </div>

        <div
          className={`rounded-xl border p-4 min-h-32 ${
            isToday ? 'border-blue-200 bg-blue-50' : 'border-gray-100 bg-white'
          }`}
        >
          {events.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">
              この日の予定はありません
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {events.map((ev, i) => {
                const colors = STAGE_COLORS[ev.video.stage]
                const label =
                  ev.type === 'publish' ? '公開予定' : `${ev.stage}締切`
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => onVideoClick(ev.video)}
                    className="w-full text-left rounded-xl px-4 py-3 flex items-center gap-3 border border-gray-100 bg-white hover:shadow-sm transition-all"
                  >
                    <div
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        ev.type === 'publish'
                          ? 'bg-green-400'
                          : colors.bg.replace('100', '400')
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-gray-900 truncate">
                        {ev.video.title}
                      </div>
                      <div className="text-xs text-gray-500">{label}</div>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${colors.badge}`}
                    >
                      {ev.video.stage}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div className="mt-3 text-center">
          <button
            type="button"
            onClick={() => setCurrentDate(new Date())}
            className="text-xs text-blue-500 hover:underline"
          >
            今日に戻る
          </button>
        </div>
      </div>
    )
  }

  return null
}
