'use client'

import { useState, useMemo } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
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
  onReorder: (orderedIds: string[]) => void
}

export function VideoList({ videos, activeStage, onVideoClick, onReorder }: Props) {
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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = filtered.findIndex((v) => v.id === active.id)
    const newIndex = filtered.findIndex((v) => v.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    const reordered = arrayMove(filtered, oldIndex, newIndex)
    // Build new full order: non-filtered videos keep their relative order, filtered slots get the new order
    const filteredIds = new Set(filtered.map((v) => v.id))
    const allIds = videos.map((v) => v.id)
    let reorderedIdx = 0
    const newOrder = allIds.map((id) => {
      if (filteredIds.has(id)) return reordered[reorderedIdx++].id
      return id
    })
    onReorder(newOrder)
  }

  return (
    <div>
      {/* 検索・フィルター */}
      <div className="flex gap-2 mb-4">
        <Input
          placeholder="タイトルで検索..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 bg-white"
        />
        {!activeStage && (
          <Select value={stageFilter} onValueChange={(v) => setStageFilter(v ?? 'all')}>
            <SelectTrigger className="w-44 bg-white"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべてのステージ</SelectItem>
              {STAGES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* リスト or 空状態 */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🎬</div>
          <p className="text-gray-600 font-semibold text-base mb-1">
            {videos.length === 0 ? 'まだ動画がありません' : '該当する動画がありません'}
          </p>
          <p className="text-gray-400 text-sm">
            {videos.length === 0
              ? '右上の「＋ 新規動画を追加」から最初の動画を登録しましょう'
              : '検索条件やフィルターを変えてみてください'}
          </p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={filtered.map((v) => v.id)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-2">
              {filtered.map((v) => (
                <VideoCard key={v.id} video={v} onClick={() => onVideoClick(v)} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}
