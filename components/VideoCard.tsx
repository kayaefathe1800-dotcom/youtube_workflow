'use client'

import { getDaysUntil } from '@/lib/utils'
import { STAGE_COLORS } from '@/types/video'
import type { Video, Stage } from '@/types/video'

type Props = {
  video: Video
  onClick: () => void
}

const STAGE_LEFT_BORDER: Record<Stage, string> = {
  '企画':     'border-l-blue-400',
  '台本':     'border-l-yellow-400',
  '編集':     'border-l-purple-400',
  'サムネイル': 'border-l-pink-400',
  '公開':     'border-l-emerald-400',
}

function DaysUntilBadge({ publishDate }: { publishDate?: string }) {
  const days = getDaysUntil(publishDate)
  if (days === null) return null
  const color =
    days < 0
      ? 'bg-gray-100 text-gray-500'
      : days <= 7
      ? 'bg-red-100 text-red-600 font-semibold'
      : days <= 14
      ? 'bg-orange-100 text-orange-600'
      : 'bg-gray-100 text-gray-500'
  const label =
    days < 0 ? `${Math.abs(days)}日経過` :
    days === 0 ? '今日！' :
    `あと${days}日`
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full ${color}`}>
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
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick() }}
      className={`
        bg-white rounded-xl shadow-sm border-l-4 ${STAGE_LEFT_BORDER[video.stage]}
        px-4 py-3.5 flex items-center gap-4
        cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-150
      `}
    >
      {/* サムネイル */}
      <div className={`w-11 h-11 rounded-lg flex-shrink-0 flex items-center justify-center text-xl overflow-hidden ${colors.bg}`}>
        {video.thumbnailBase64 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={video.thumbnailBase64} alt="" className="w-full h-full object-cover" />
        ) : (
          '🎬'
        )}
      </div>

      {/* メイン */}
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-gray-900 text-sm truncate mb-1.5">
          {video.title}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {video.publishDate && (
            <span className="text-xs text-gray-400">
              📅 {video.publishDate.replace(/-/g, '/')}
            </span>
          )}
          <DaysUntilBadge publishDate={video.publishDate} />
          {video.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-xs text-gray-400">#{tag}</span>
          ))}
          {totalSeconds > 0 && (
            <span className="text-xs text-gray-400">
              ⏱ {totalHours > 0 ? `${totalHours}h ` : ''}{totalMinutes}m
            </span>
          )}
        </div>
      </div>

      {/* ステージバッジ */}
      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${colors.badge}`}>
        {video.stage}
      </span>
    </div>
  )
}
