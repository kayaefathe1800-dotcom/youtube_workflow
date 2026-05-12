// types/video.ts

export type Stage = '企画' | '台本' | '編集' | 'サムネイル' | '公開'

export const STAGES: Stage[] = ['企画', '台本', '編集', 'サムネイル', '公開']

export const STAGE_COLORS: Record<Stage, { bg: string; text: string; badge: string }> = {
  企画: { bg: 'bg-blue-100', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700' },
  台本: { bg: 'bg-yellow-100', text: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-700' },
  編集: { bg: 'bg-purple-100', text: 'text-purple-700', badge: 'bg-purple-100 text-purple-700' },
  サムネイル: { bg: 'bg-pink-100', text: 'text-pink-700', badge: 'bg-pink-100 text-pink-700' },
  公開: { bg: 'bg-green-100', text: 'text-green-700', badge: 'bg-green-100 text-green-700' },
}

export type WorkSession = {
  stage: Stage
  startedAt: string   // ISO8601
  durationSeconds: number
}

export type Video = {
  id: string
  title: string
  stage: Stage
  publishDate?: string      // YYYY-MM-DD
  publishedAt?: string      // ISO8601：「公開」ステージに移行した日時
  memo?: string
  thumbnailBase64?: string
  youtubeUrl?: string
  tags: string[]
  workSessions: WorkSession[]
  createdAt: string         // ISO8601
  updatedAt: string         // ISO8601
}

export type VideoFormData = Omit<Video, 'id' | 'createdAt' | 'updatedAt' | 'workSessions' | 'publishedAt'>
