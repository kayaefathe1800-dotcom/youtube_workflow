'use client'

import { getDaysUntil } from '@/lib/utils'
import { STAGE_COLORS } from '@/types/video'
import type { Video } from '@/types/video'

type Props = {
  video: Video
  onClick: () => void
}

function DaysUntilBadge({ publishDate }: { publishDate?: string }) {
  const days = getDaysUntil(publishDate)
  if (days === null) return null
  const color =
    days < 0
      ? 'bg-red-100 text-red-700'
      : days <= 7
      ? 'bg-red-100 text-red-700'
      : days <= 14
      ? 'bg-orange-100 text-orange-700'
      : 'bg-gray-100 text-gray-500'
  const label = days < 0 ? `${Math.abs(days)}日経過` : days === 0 ? '今日' : `あと${days}日`
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>
      {label}
    </span>
  )
}

export function VideoCard({ video, onClick }: Props) {
  const colors = STAGE_COLORS[video.stage]
  const totalSeconds = video.workSessions.reduce((sum, s) => sum + s.durationSeconds, 0)
  const totalHours = Math.floor(totalSeconds / 3600)
  const totalMinutes = Math.floor((totalSeconds % 3600) / 60)

  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex items-center gap-3 cursor-pointer hover:border-gray-300 hover:shadow-sm transition-all"
    >
      {/* サムネイル or アイコン */}
      <div className={`w-12 h-12 rounded-lg flex-shrink-0 flex items-center justify-center text-xl ${colors.bg}`}>
        {video.thumbnailBase64 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={video.thumbnailBase64} alt="" className="w-full h-full object-cover rounded-lg" />
        ) : (
          '🎬'
        )}
      </div>

      {/* 本文 */}
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm truncate mb-1">{video.title}</div>
        <div className="flex items-center gap-2 flex-wrap">
          {video.publishDate && (
            <span className="text-xs text-gray-500">
              公開予定: {video.publishDate.replace(/-/g, '/')}
            </span>
          )}
          <DaysUntilBadge publishDate={video.publishDate} />
          {video.tags.map((tag) => (
            <span key={tag} className="text-xs text-gray-400">#{tag}</span>
          ))}
          {totalSeconds > 0 && (
            <span className="text-xs text-gray-400">
              作業: {totalHours > 0 ? `${totalHours}h ` : ''}{totalMinutes}m
            </span>
          )}
        </div>
      </div>

      {/* ステージバッジ */}
      <span className={`text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0 ${colors.badge}`}>
        {video.stage}
      </span>
    </div>
  )
}
