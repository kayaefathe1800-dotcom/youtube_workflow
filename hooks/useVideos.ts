'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Video, VideoFormData, WorkSession } from '@/types/video'
import { loadVideos, saveVideos } from '@/lib/storage'
import { generateId } from '@/lib/utils'

export function useVideos() {
  const [videos, setVideos] = useState<Video[]>([])

  useEffect(() => {
    setVideos(loadVideos())
  }, [])

  const addVideo = useCallback((data: VideoFormData) => {
    setVideos((prev) => {
      const now = new Date().toISOString()
      const video: Video = {
        id: generateId(),
        ...data,
        workSessions: [],
        createdAt: now,
        updatedAt: now,
      }
      const next = [...prev, video]
      saveVideos(next)
      return next
    })
  }, [])

  const updateVideo = useCallback((id: string, data: Partial<VideoFormData>) => {
    const now = new Date().toISOString()
    setVideos((prev) => {
      const next = prev.map((v) => {
        if (v.id !== id) return v
        const updated: Video = { ...v, ...data, updatedAt: now }
        if (data.stage === '公開' && v.stage !== '公開') {
          updated.publishedAt = now
        }
        return updated
      })
      saveVideos(next)
      return next
    })
  }, [])

  const deleteVideo = useCallback((id: string) => {
    setVideos((prev) => {
      const next = prev.filter((v) => v.id !== id)
      saveVideos(next)
      return next
    })
  }, [])

  const addWorkSession = useCallback((id: string, session: WorkSession) => {
    const now = new Date().toISOString()
    setVideos((prev) => {
      const next = prev.map((v) =>
        v.id === id
          ? { ...v, workSessions: [...v.workSessions, session], updatedAt: now }
          : v
      )
      saveVideos(next)
      return next
    })
  }, [])

  return { videos, addVideo, updateVideo, deleteVideo, addWorkSession }
}
