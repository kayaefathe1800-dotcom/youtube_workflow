// components/CalendarView.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { STAGE_COLORS } from '@/types/video'
import type { Video } from '@/types/video'

type Props = {
  videos: Video[]
  onVideoClick: (video: Video) => void
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

export function CalendarView({ videos, onVideoClick }: Props) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

  const cells = buildCalendar(year, month)

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  function videosOnDay(day: number) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return videos.filter((v) => v.publishDate === dateStr)
  }

  const todayStr = today.toISOString().slice(0, 10)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Button type="button" variant="outline" size="sm" onClick={prevMonth}>‹ 前月</Button>
        <h2 className="font-bold text-lg">{year}年{month + 1}月</h2>
        <Button type="button" variant="outline" size="sm" onClick={nextMonth}>翌月 ›</Button>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {['日', '月', '火', '水', '木', '金', '土'].map((d) => (
          <div key={d} className="text-center text-xs text-gray-400 py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />
          const dayVideos = videosOnDay(day)
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const isToday = dateStr === todayStr
          return (
            <div key={i} className={`min-h-16 rounded-lg p-1 border ${isToday ? 'border-blue-400 bg-blue-50' : 'border-gray-100 bg-white'}`}>
              <div className={`text-xs font-medium mb-1 ${isToday ? 'text-blue-600' : 'text-gray-600'}`}>{day}</div>
              {dayVideos.map((v) => (
                <div
                  key={v.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onVideoClick(v)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onVideoClick(v) }}
                  className={`text-xs rounded px-1 py-0.5 mb-0.5 truncate cursor-pointer ${STAGE_COLORS[v.stage].badge}`}
                  title={v.title}
                >
                  {v.title}
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
