'use client'

import { STAGES, STAGE_COLORS } from '@/types/video'
import type { Video } from '@/types/video'

type Props = {
  videos: Video[]
  activeStage: string | null
  onStageClick: (stage: string | null) => void
}

export function StageSummary({ videos, activeStage, onStageClick }: Props) {
  return (
    <div className="grid grid-cols-5 gap-3 mb-6">
      {STAGES.map((stage) => {
        const count = videos.filter((v) => v.stage === stage).length
        const colors = STAGE_COLORS[stage]
        const isActive = activeStage === stage
        return (
          <button
            type="button"
            key={stage}
            onClick={() => onStageClick(isActive ? null : stage)}
            className={`rounded-lg p-3 text-center border transition-all ${
              isActive
                ? `${colors.bg} border-current ${colors.text} ring-2 ring-offset-1`
                : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className={`text-xs font-medium mb-1 ${isActive ? colors.text : 'text-gray-500'}`}>
              {stage}
            </div>
            <div className={`text-2xl font-bold ${isActive ? colors.text : 'text-gray-800'}`}>
              {count}
            </div>
          </button>
        )
      })}
    </div>
  )
}
