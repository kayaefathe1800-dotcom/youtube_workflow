import { loadVideos, saveVideos } from '@/lib/storage'
import type { Video } from '@/types/video'

const mockVideo: Video = {
  id: '1',
  title: 'テスト動画',
  stage: '企画',
  tags: [],
  workSessions: [],
  createdAt: '2026-05-11T00:00:00.000Z',
  updatedAt: '2026-05-11T00:00:00.000Z',
}

beforeEach(() => {
  localStorage.clear()
})

test('loadVideos: localStorageが空のとき空配列を返す', () => {
  expect(loadVideos()).toEqual([])
})

test('saveVideos / loadVideos: 保存したデータを復元できる', () => {
  saveVideos([mockVideo])
  expect(loadVideos()).toEqual([mockVideo])
})

test('saveVideos: 空配列を保存できる', () => {
  saveVideos([mockVideo])
  saveVideos([])
  expect(loadVideos()).toEqual([])
})
