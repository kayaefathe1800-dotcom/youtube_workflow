// app/calendar/page.tsx
'use client'

import { useState } from 'react'
import { CalendarView } from '@/components/CalendarView'
import { VideoModal } from '@/components/VideoModal'
import { useVideos } from '@/hooks/useVideos'
import type { Video, WorkSession } from '@/types/video'

export default function CalendarPage() {
  const { videos, updateVideo, deleteVideo, addWorkSession } = useVideos()
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)

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
    }
  }

  function handleWorkSession(session: WorkSession) {
    if (selectedVideo) addWorkSession(selectedVideo.id, session)
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">カレンダー</h1>
      <CalendarView videos={videos} onVideoClick={setSelectedVideo} />
      {selectedVideo && (
        <VideoModal
          key={selectedVideo.id}
          open={!!selectedVideo}
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
          onSave={handleSave}
          onDelete={() => { deleteVideo(selectedVideo.id); setSelectedVideo(null) }}
          onWorkSession={handleWorkSession}
        />
      )}
    </div>
  )
}
