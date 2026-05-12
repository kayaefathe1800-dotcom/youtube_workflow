import { renderHook, act } from '@testing-library/react'
import { useVideos } from '@/hooks/useVideos'

beforeEach(() => {
  localStorage.clear()
})

test('debug persistence', async () => {
  const { result, unmount } = renderHook(() => useVideos())
  await act(async () => {
    result.current.addVideo({ title: '永続テスト', stage: '企画', tags: [] })
  })
  console.log('videos after add:', result.current.videos.length)
  console.log('localStorage:', localStorage.getItem('youtube-progress-videos'))
  unmount()
  
  let result2: any
  await act(async () => {
    result2 = renderHook(() => useVideos())
  })
  console.log('result2 defined:', result2 !== undefined)
  console.log('result2.current defined:', result2?.current !== undefined)
  console.log('result2.current.videos:', result2?.current?.videos)
})
