import { renderHook, act } from '@testing-library/react'
import { useVideos } from '@/hooks/useVideos'

test('debug async act', async () => {
  let result2: any
  let callbackRan = false
  try {
    await act(async () => {
      callbackRan = true
      console.log('callback running')
      const r = renderHook(() => useVideos())
      console.log('r is:', typeof r, r !== undefined ? 'defined' : 'undefined')
      result2 = r
      console.log('result2 set inside callback:', result2 !== undefined)
    })
  } catch(e: any) {
    console.log('act threw:', e.message)
  }
  console.log('callbackRan:', callbackRan, 'result2:', result2 !== undefined ? 'defined' : 'undefined')
})
