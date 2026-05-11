import type { Video } from '@/types/video'

const STORAGE_KEY = 'yt-progress-videos'

export function loadVideos(): Video[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Video[]) : []
  } catch {
    return []
  }
}

export function saveVideos(videos: Video[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(videos))
}
