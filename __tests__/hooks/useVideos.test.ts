// __tests__/hooks/useVideos.test.ts
import { renderHook, act } from '@testing-library/react'
import { useVideos } from '@/hooks/useVideos'

beforeEach(() => {
  localStorage.clear()
})

test('初期状態: 動画リストは空', () => {
  const { result } = renderHook(() => useVideos())
  expect(result.current.videos).toEqual([])
})

test('addVideo: 動画を追加するとリストに追加される', () => {
  const { result } = renderHook(() => useVideos())
  act(() => {
    result.current.addVideo({
      title: 'テスト動画',
      stage: '企画',
      tags: [],
    })
  })
  expect(result.current.videos).toHaveLength(1)
  expect(result.current.videos[0].title).toBe('テスト動画')
  expect(result.current.videos[0].id).toBeDefined()
})

test('updateVideo: 動画のステージを更新できる', () => {
  const { result } = renderHook(() => useVideos())
  act(() => {
    result.current.addVideo({ title: 'A', stage: '企画', tags: [] })
  })
  const id = result.current.videos[0].id
  act(() => {
    result.current.updateVideo(id, { stage: '台本' })
  })
  expect(result.current.videos[0].stage).toBe('台本')
})

test('updateVideo: stage=公開 に変更したとき publishedAt がセットされる', () => {
  const { result } = renderHook(() => useVideos())
  act(() => {
    result.current.addVideo({ title: 'A', stage: '企画', tags: [] })
  })
  const id = result.current.videos[0].id
  act(() => {
    result.current.updateVideo(id, { stage: '公開' })
  })
  expect(result.current.videos[0].publishedAt).toBeDefined()
})

test('deleteVideo: 動画を削除できる', () => {
  const { result } = renderHook(() => useVideos())
  act(() => {
    result.current.addVideo({ title: 'A', stage: '企画', tags: [] })
  })
  const id = result.current.videos[0].id
  act(() => {
    result.current.deleteVideo(id)
  })
  expect(result.current.videos).toHaveLength(0)
})

test('addWorkSession: 作業セッションを追加できる', () => {
  const { result } = renderHook(() => useVideos())
  act(() => {
    result.current.addVideo({ title: 'A', stage: '企画', tags: [] })
  })
  const id = result.current.videos[0].id
  act(() => {
    result.current.addWorkSession(id, { stage: '企画', startedAt: '2026-05-11T10:00:00.000Z', durationSeconds: 300 })
  })
  expect(result.current.videos[0].workSessions).toHaveLength(1)
  expect(result.current.videos[0].workSessions[0].durationSeconds).toBe(300)
})

test('データはlocalStorageに永続化される', () => {
  const { result, unmount } = renderHook(() => useVideos())
  act(() => {
    result.current.addVideo({ title: '永続テスト', stage: '企画', tags: [] })
  })
  unmount()
  const { result: result2 } = renderHook(() => useVideos())
  expect(result2.current.videos[0].title).toBe('永続テスト')
})
