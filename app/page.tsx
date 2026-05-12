'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { StageSummary } from '@/components/StageSummary'
import { VideoList } from '@/components/VideoList'
import { VideoModal } from '@/components/VideoModal'
import { useVideos } from '@/hooks/useVideos'
import type { Video, WorkSession } from '@/types/video'

export default function DashboardPage() {
  const { videos, addVideo, updateVideo, deleteVideo, addWorkSession, reorderVideos } = useVideos()
  const [activeStage, setActiveStage] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)

  function openCreate() {
    setSelectedVideo(null)
    setModalOpen(true)
  }

  function openEdit(video: Video) {
    setSelectedVideo(video)
    setModalOpen(true)
  }

  function handleSave(data: Partial<Video>) {
    if (selectedVideo) {
      updateVideo(selectedVideo.id, {
        title: data.title,
        stage: data.stage,
        publishDate: data.publishDate,
        memo: data.memo,
        youtubeUrl: data.youtubeUrl,
        tags: data.tags,
        thumbnailBase64: data.thumbnailBase64,
      })
    } else {
      addVideo({
        title: data.title ?? '',
        stage: data.stage ?? '企画',
        publishDate: data.publishDate,
        memo: data.memo,
        youtubeUrl: data.youtubeUrl,
        tags: data.tags ?? [],
        thumbnailBase64: data.thumbnailBase64,
      })
    }
  }

  function handleWorkSession(session: WorkSession) {
    if (selectedVideo) addWorkSession(selectedVideo.id, session)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">ダッシュボード</h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5">動画制作の進捗を管理する</p>
        </div>
        <Button onClick={openCreate} className="bg-red-500 hover:bg-red-600 text-white rounded-lg px-3 py-2 sm:px-4 text-sm font-semibold shadow-sm">
          ＋ <span className="hidden sm:inline">新規動画を追加</span><span className="sm:hidden">追加</span>
        </Button>
      </div>

      <StageSummary videos={videos} activeStage={activeStage} onStageClick={setActiveStage} />
      <VideoList videos={videos} activeStage={activeStage} onVideoClick={openEdit} onReorder={reorderVideos} />

      <VideoModal
        key={selectedVideo?.id ?? 'new'}
        open={modalOpen}
        video={selectedVideo ?? undefined}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        onDelete={selectedVideo ? () => deleteVideo(selectedVideo.id) : undefined}
        onWorkSession={handleWorkSession}
      />
    </div>
  )
}
