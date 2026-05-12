'use client'

import { useMemo } from 'react'
import { getDaysUntil } from '@/lib/utils'
import { STAGE_COLORS } from '@/types/video'
import type { Video, Stage } from '@/types/video'

type Props = {
  videos: Video[]
  onVideoClick: (video: Video) => void
}

type TaskItem = {
  video: Video
  type: 'stageDue' | 'publish'
  stage?: Stage
  dateStr: string
  days: number
}

export function TodayTasks({ videos, onVideoClick }: Props) {
  const tasks = useMemo<TaskItem[]>(() => {
    const items: TaskItem[] = []
    const today = new Date().toISOString().slice(0, 10)

    for (const v of videos) {
      if (v.stage === '公開') continue // skip already published

      // Current stage deadline
      const stageDue = v.stageDueDates?.[v.stage]
      if (stageDue) {
        const days = getDaysUntil(stageDue)
        if (days !== null && days <= 3) {
          items.push({ video: v, type: 'stageDue', stage: v.stage, dateStr: stageDue, days })
        }
      }

      // Publish date
      if (v.publishDate) {
        const days = getDaysUntil(v.publishDate)
        if (days !== null && days <= 7 && days >= 0) {
          items.push({ video: v, type: 'publish', dateStr: v.publishDate, days })
        }
      }
    }

    // Sort: overdue first, then by days
    return items.sort((a, b) => a.days - b.days)
  }, [videos])

  if (tasks.length === 0) return null

  return (
    <div className="mb-6">
      <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <span>🔔</span> 今週のタスク
      </h2>
      <div className="flex flex-col gap-2">
        {tasks.map((task, i) => {
          const colors = STAGE_COLORS[task.video.stage]
          const isOverdue = task.days < 0
          const isToday = task.days === 0
          const urgencyColor = isOverdue
            ? 'border-l-red-500 bg-red-50'
            : isToday
            ? 'border-l-orange-400 bg-orange-50'
            : 'border-l-yellow-400 bg-yellow-50'

          const label = isOverdue
            ? `${Math.abs(task.days)}日超過`
            : isToday
            ? '今日！'
            : `あと${task.days}日`

          const taskLabel = task.type === 'publish'
            ? '公開予定'
            : `${task.stage}締切`

          return (
            <button
              key={i}
              type="button"
              onClick={() => onVideoClick(task.video)}
              className={`w-full text-left border-l-4 ${urgencyColor} rounded-xl px-4 py-3 flex items-center gap-3 hover:brightness-95 transition-all`}
            >
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-gray-900 truncate">{task.video.title}</div>
                <div className="text-xs text-gray-500 mt-0.5">{taskLabel} · {task.dateStr.replace(/-/g, '/')}</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${colors.badge}`}>
                  {task.video.stage}
                </span>
                <span className={`text-xs font-bold ${isOverdue || isToday ? 'text-red-600' : 'text-yellow-700'}`}>
                  {label}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
