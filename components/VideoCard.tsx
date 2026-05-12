'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { getDaysUntil } from '@/lib/utils'
import { STAGE_COLORS, STAGE_PROGRESS_COLORS } from '@/types/video'
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

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: video.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        bg-white rounded-xl shadow-sm border-l-4 ${STAGE_LEFT_BORDER[video.stage]}
        px-4 py-3.5 flex items-center gap-4
        hover:shadow-md hover:-translate-y-0.5 transition-all duration-150
      `}
    >
      {/* ドラッグハンドル */}
      <span
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 px-1 touch-none flex-shrink-0 text-lg leading-none select-none"
        aria-label="ドラッグして並び替え"
      >
        ⠿
      </span>

      {/* サムネイル */}
      <div className={`w-11 h-11 rounded-lg flex-shrink-0 flex items-center justify-center text-xl overflow-hidden ${colors.bg}`}>
        {video.thumbnailBase64 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={video.thumbnailBase64} alt="" className="w-full h-full object-cover" />
        ) : (
          '🎬'
        )}
      </div>

      {/* メイン（クリック領域） */}
      <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick() }}
        className="flex-1 min-w-0 cursor-pointer"
      >
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
          {video.stageDueDates?.[video.stage] && (
            <span className="text-xs text-gray-400">
              🗓 {video.stageDueDates[video.stage]!.replace(/-/g, '/')}
            </span>
          )}
          {video.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-xs text-gray-400">#{tag}</span>
          ))}
          {totalSeconds > 0 && (
            <span className="text-xs text-gray-400">
              ⏱ {totalHours > 0 ? `${totalHours}h ` : ''}{totalMinutes}m
            </span>
          )}
        </div>
        {/* プログレスバー */}
        <div className="mt-2 w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${STAGE_PROGRESS_COLORS[video.stage]}`}
            style={{ width: `${video.stageProgress ?? 0}%` }}
          />
        </div>
      </div>

      {/* ステージバッジ */}
      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${colors.badge}`}>
        {video.stage}
      </span>
    </div>
  )
}
