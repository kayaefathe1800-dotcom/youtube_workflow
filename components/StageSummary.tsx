'use client'

import { STAGES, STAGE_COLORS } from '@/types/video'
import type { Video, Stage } from '@/types/video'

type Props = {
  videos: Video[]
  activeStage: string | null
  onStageClick: (stage: string | null) => void
}

const STAGE_TOP_BORDER: Record<Stage, string> = {
  '企画':     'border-t-blue-400',
  '台本':     'border-t-yellow-400',
  '編集':     'border-t-purple-400',
  'サムネイル': 'border-t-pink-400',
  '公開':     'border-t-emerald-400',
}

export function StageSummary({ videos, activeStage, onStageClick }: Props) {
  const total = videos.length

  return (
    <div className="grid grid-cols-5 gap-3 mb-6">
      {STAGES.map((stage) => {
        const count = videos.filter((v) => v.stage === stage).length
        const colors = STAGE_COLORS[stage]
        const isActive = activeStage === stage
        const pct = total > 0 ? Math.round((count / total) * 100) : 0

        return (
          <button
            type="button"
            key={stage}
            onClick={() => onStageClick(isActive ? null : stage)}
            className={`
              rounded-xl border-t-4 p-4 text-center transition-all duration-150 shadow-sm
              ${STAGE_TOP_BORDER[stage]}
              ${isActive
                ? `${colors.bg} shadow-md scale-[1.03]`
                : 'bg-white hover:shadow-md hover:-translate-y-0.5'
              }
            `}
          >
            <div className={`text-xs font-semibold mb-2 ${isActive ? colors.text : 'text-gray-500'}`}>
              {stage}
            </div>
            <div className={`text-3xl font-bold tracking-tight ${isActive ? colors.text : 'text-gray-800'}`}>
              {count}
            </div>
            <div className={`text-xs mt-1.5 ${isActive ? colors.text : 'text-gray-400'}`}>
              {total > 0 ? `${pct}%` : '—'}
            </div>
          </button>
        )
      })}
    </div>
  )
}
