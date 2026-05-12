'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'

const PRESETS = [
  { label: '15分', seconds: 15 * 60 },
  { label: '30分', seconds: 30 * 60 },
  { label: '45分', seconds: 45 * 60 },
  { label: '1時間', seconds: 60 * 60 },
  { label: '1.5h', seconds: 90 * 60 },
  { label: '2時間', seconds: 120 * 60 },
]

type Props = {
  onComplete?: (durationSeconds: number) => void
}

export function CountdownTimer({ onComplete }: Props) {
  const [selectedSeconds, setSelectedSeconds] = useState(PRESETS[1].seconds) // default 30min
  const [remaining, setRemaining] = useState(PRESETS[1].seconds)
  const [running, setRunning] = useState(false)
  const [finished, setFinished] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startedAtRef = useRef<number | null>(null)
  const durationRef = useRef(selectedSeconds)

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  function selectPreset(seconds: number) {
    if (running) return
    setSelectedSeconds(seconds)
    setRemaining(seconds)
    setFinished(false)
    durationRef.current = seconds
  }

  function start() {
    if (running) return
    setFinished(false)
    startedAtRef.current = Date.now()
    intervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAtRef.current!) / 1000)
      const rem = durationRef.current - elapsed
      if (rem <= 0) {
        clearInterval(intervalRef.current!)
        intervalRef.current = null
        setRemaining(0)
        setRunning(false)
        setFinished(true)
        // Browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('⏰ 制限時間です！', {
            body: `${Math.floor(durationRef.current / 60)}分の作業時間が終了しました`,
          })
        }
        onComplete?.(durationRef.current)
      } else {
        setRemaining(rem)
      }
    }, 500)
    setRunning(true)
  }

  function stop() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = null
    setRunning(false)
    // Don't reset — let user see how much is left
  }

  function reset() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = null
    setRunning(false)
    setFinished(false)
    setRemaining(selectedSeconds)
    durationRef.current = selectedSeconds
    startedAtRef.current = null
  }

  const h = Math.floor(remaining / 3600)
  const m = Math.floor((remaining % 3600) / 60)
  const s = remaining % 60
  const display = h > 0
    ? `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`

  const pct = selectedSeconds > 0 ? (remaining / selectedSeconds) * 100 : 0
  const progressColor = pct > 50 ? 'bg-blue-400' : pct > 20 ? 'bg-orange-400' : 'bg-red-500'

  return (
    <div className="p-4 bg-gray-50 rounded-xl space-y-3">
      {/* Preset buttons */}
      <div className="flex gap-1.5 flex-wrap">
        {PRESETS.map((p) => (
          <button
            key={p.seconds}
            type="button"
            onClick={() => selectPreset(p.seconds)}
            disabled={running}
            className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-all ${
              selectedSeconds === p.seconds
                ? 'bg-gray-800 text-white border-gray-800'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400 disabled:opacity-50'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Timer display */}
      <div className="flex items-center gap-4">
        <div className={`font-mono text-2xl font-bold tabular-nums ${finished ? 'text-red-500 animate-pulse' : 'text-gray-800'}`}>
          {finished ? '⏰ 終了！' : display}
        </div>
        <div className="flex gap-2 ml-auto">
          {!running && !finished && (
            <Button size="sm" onClick={start}>
              ▶ 開始
            </Button>
          )}
          {running && (
            <Button size="sm" variant="outline" onClick={stop}>
              ⏸ 一時停止
            </Button>
          )}
          {(running || finished || remaining !== selectedSeconds) && (
            <Button size="sm" variant="outline" onClick={reset}>
              ↺
            </Button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {!finished && (
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  )
}
