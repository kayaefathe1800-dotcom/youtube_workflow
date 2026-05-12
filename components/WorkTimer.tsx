'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import type { Stage } from '@/types/video'

type Props = {
  currentStage: Stage
  onSessionComplete: (durationSeconds: number) => void
}

export function WorkTimer({ currentStage, onSessionComplete }: Props) {
  const [running, setRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const startRef = useRef<number | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  function start() {
    startRef.current = Date.now() - elapsed * 1000
    intervalRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current!) / 1000))
    }, 1000)
    setRunning(true)
  }

  function stop() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setRunning(false)
    if (elapsed > 0) {
      onSessionComplete(elapsed)
      setElapsed(0)
    }
  }

  const h = Math.floor(elapsed / 3600)
  const m = Math.floor((elapsed % 3600) / 60)
  const s = elapsed % 60
  const display = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
      <div className="font-mono text-lg font-semibold tabular-nums w-24">{display}</div>
      <div className="text-xs text-gray-500">{currentStage}の作業時間</div>
      <div className="ml-auto">
        {running ? (
          <Button size="sm" variant="destructive" onClick={stop}>停止・保存</Button>
        ) : (
          <Button size="sm" onClick={start}>タイマー開始</Button>
        )}
      </div>
    </div>
  )
}
