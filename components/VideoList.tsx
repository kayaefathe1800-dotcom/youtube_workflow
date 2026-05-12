'use client'

import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { VideoCard } from '@/components/VideoCard'
import type { Video } from '@/types/video'
import { STAGES } from '@/types/video'

type Props = {
  videos: Video[]
  activeStage: string | null
  onVideoClick: (video: Video) => void
}

export function VideoList({ videos, activeStage, onVideoClick }: Props) {
  const [query, setQuery] = useState('')
  const [stageFilter, setStageFilter] = useState<string>('all')

  const filtered = useMemo(() => {
    return videos.filter((v) => {
      const matchStage = activeStage
        ? v.stage === activeStage
        : stageFilter === 'all' || v.stage === stageFilter
      const matchQuery = v.title.toLowerCase().includes(query.toLowerCase())
      return matchStage && matchQuery
    })
  }, [videos, activeStage, stageFilter, query])

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <Input
          placeholder="タイトルで検索..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1"
        />
        {!activeStage && (
          <Select value={stageFilter} onValueChange={(v) => setStageFilter(v ?? 'all')}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべてのステージ</SelectItem>
              {STAGES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          動画がありません
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((v) => (
            <VideoCard key={v.id} video={v} onClick={() => onVideoClick(v)} />
          ))}
        </div>
      )}
    </div>
  )
}
