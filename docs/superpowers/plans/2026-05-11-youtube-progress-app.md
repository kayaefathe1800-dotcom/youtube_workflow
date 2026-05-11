# YouTube進捗管理アプリ 実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** YouTubeチャンネルを一人で運営するクリエイター向けに、動画の企画〜公開までの進捗をブラウザで管理するNext.jsアプリを構築し、Vercelにデプロイできる状態にする。

**Architecture:** Next.js 14 App RouterのクライアントコンポーネントでUIを構築し、全データをlocalStorageに保存する。YouTubeとの通信は一切行わない。状態管理はカスタムフック `useVideos` に集約し、各ページコンポーネントはそのフックを呼び出すだけにする。

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Recharts, Jest, React Testing Library

---

## ファイル構成

```
youtube-progress-app/
├── app/
│   ├── layout.tsx              # ルートレイアウト・ナビゲーション
│   ├── page.tsx                # ダッシュボード画面
│   ├── calendar/
│   │   └── page.tsx            # カレンダービュー画面
│   └── report/
│       └── page.tsx            # レポート画面
├── components/
│   ├── StageSummary.tsx        # ステージ別本数カード
│   ├── VideoList.tsx           # 検索・フィルター + 動画リスト
│   ├── VideoCard.tsx           # 動画1行カード
│   ├── VideoModal.tsx          # 動画作成・編集モーダル
│   ├── WorkTimer.tsx           # 作業タイマー
│   ├── CalendarView.tsx        # 月表示カレンダー
│   └── ReportCharts.tsx        # グラフ群
├── hooks/
│   └── useVideos.ts            # localStorageCRUD + 状態管理
├── lib/
│   ├── storage.ts              # localStorage 読み書きヘルパー
│   └── utils.ts                # 日付計算・画像リサイズ・UUID生成
├── types/
│   └── video.ts                # Video・Stage・WorkSession型
├── __tests__/
│   ├── lib/storage.test.ts
│   ├── lib/utils.test.ts
│   └── hooks/useVideos.test.ts
├── jest.config.ts
├── jest.setup.ts
└── next.config.js
```

---

## Task 1: プロジェクトセットアップ

**Files:**
- Create: `youtube-progress-app/` (Next.jsプロジェクト一式)
- Create: `jest.config.ts`
- Create: `jest.setup.ts`

- [ ] **Step 1: Next.jsプロジェクトを作成する**

作業ディレクトリ `C:\ClaudeTest` で実行:

```bash
npx create-next-app@14 youtube-progress-app \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir \
  --import-alias "@/*" \
  --eslint
cd youtube-progress-app
```

プロンプトが出た場合はすべてデフォルト（Enter）で進む。

- [ ] **Step 2: shadcn/ui を初期化する**

```bash
npx shadcn@latest init
```

対話プロンプトへの回答:
- Style: `Default`
- Base color: `Slate`
- CSS variables: `Yes`

- [ ] **Step 3: 必要なshadcn/uiコンポーネントを追加する**

```bash
npx shadcn@latest add button dialog input label select badge textarea
```

- [ ] **Step 4: Rechartsをインストールする**

```bash
npm install recharts
npm install --save-dev @types/recharts
```

- [ ] **Step 5: テスト環境をインストールする**

```bash
npm install --save-dev jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event ts-jest
```

- [ ] **Step 6: jest.config.ts を作成する**

```typescript
// jest.config.ts
import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({ dir: './' })

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
}

export default createJestConfig(config)
```

- [ ] **Step 7: jest.setup.ts を作成する**

```typescript
// jest.setup.ts
import '@testing-library/jest-dom'
```

- [ ] **Step 8: package.json にテストスクリプトを追加する**

`package.json` の `"scripts"` に以下を追加:

```json
"test": "jest",
"test:watch": "jest --watch"
```

- [ ] **Step 9: テストが動くか確認する**

```bash
npm test -- --passWithNoTests
```

Expected output: `Test Suites: 0 skipped` のような出力（エラーなし）

- [ ] **Step 10: 不要なデフォルトファイルを削除する**

```bash
rm app/page.tsx app/globals.css
```

`app/globals.css` はshadcn/ui initで上書きされているので残す場合もある。確認してから削除。

- [ ] **Step 11: コミット**

```bash
git add -A
git commit -m "chore: initial Next.js project with shadcn/ui, Recharts, Jest"
```

---

## Task 2: 型定義

**Files:**
- Create: `types/video.ts`

- [ ] **Step 1: types/video.ts を作成する**

```typescript
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
```

- [ ] **Step 2: コミット**

```bash
git add types/video.ts
git commit -m "feat: add Video, Stage, WorkSession type definitions"
```

---

## Task 3: ストレージユーティリティ + テスト

**Files:**
- Create: `lib/storage.ts`
- Create: `__tests__/lib/storage.test.ts`

- [ ] **Step 1: テストを書く**

```typescript
// __tests__/lib/storage.test.ts
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
```

- [ ] **Step 2: テストが失敗することを確認する**

```bash
npm test -- __tests__/lib/storage.test.ts
```

Expected: FAIL（`Cannot find module '@/lib/storage'`）

- [ ] **Step 3: lib/storage.ts を実装する**

```typescript
// lib/storage.ts
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
```

- [ ] **Step 4: テストを通す**

```bash
npm test -- __tests__/lib/storage.test.ts
```

Expected: PASS（3 tests passed）

- [ ] **Step 5: コミット**

```bash
git add lib/storage.ts __tests__/lib/storage.test.ts
git commit -m "feat: add localStorage read/write helpers"
```

---

## Task 4: ユーティリティ関数 + テスト

**Files:**
- Create: `lib/utils.ts`（next.js init済みのものを置き換え）
- Create: `__tests__/lib/utils.test.ts`

- [ ] **Step 1: テストを書く**

```typescript
// __tests__/lib/utils.test.ts
import { generateId, getDaysUntil, resizeImageToBase64 } from '@/lib/utils'

test('generateId: ユニークなIDを生成する', () => {
  const id1 = generateId()
  const id2 = generateId()
  expect(id1).not.toBe(id2)
  expect(typeof id1).toBe('string')
  expect(id1.length).toBeGreaterThan(0)
})

test('getDaysUntil: 今日の日付を渡すと0を返す', () => {
  const today = new Date().toISOString().slice(0, 10)
  expect(getDaysUntil(today)).toBe(0)
})

test('getDaysUntil: 7日後の日付を渡すと7を返す', () => {
  const future = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10)
  expect(getDaysUntil(future)).toBe(7)
})

test('getDaysUntil: undefinedを渡すとnullを返す', () => {
  expect(getDaysUntil(undefined)).toBeNull()
})

test('getDaysUntil: 過去の日付を渡すと負の値を返す', () => {
  const past = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10)
  expect(getDaysUntil(past)).toBeLessThan(0)
})
```

- [ ] **Step 2: テストが失敗することを確認する**

```bash
npm test -- __tests__/lib/utils.test.ts
```

Expected: FAIL

- [ ] **Step 3: lib/utils.ts を実装する**

```typescript
// lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// shadcn/uiが使うcn関数（既存のものをそのまま残す）
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateId(): string {
  return crypto.randomUUID()
}

export function getDaysUntil(dateStr: string | undefined): number | null {
  if (!dateStr) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr)
  target.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export async function resizeImageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const MAX = 400
      const ratio = Math.min(MAX / img.width, MAX / img.height, 1)
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * ratio)
      canvas.height = Math.round(img.height * ratio)
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.8))
    }
    img.onerror = reject
    img.src = url
  })
}
```

- [ ] **Step 4: テストを通す**

```bash
npm test -- __tests__/lib/utils.test.ts
```

Expected: PASS（5 tests passed）

- [ ] **Step 5: コミット**

```bash
git add lib/utils.ts __tests__/lib/utils.test.ts
git commit -m "feat: add generateId, getDaysUntil, resizeImageToBase64 utilities"
```

---

## Task 5: useVideos フック + テスト

**Files:**
- Create: `hooks/useVideos.ts`
- Create: `__tests__/hooks/useVideos.test.ts`

- [ ] **Step 1: テストを書く**

```typescript
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
```

- [ ] **Step 2: テストが失敗することを確認する**

```bash
npm test -- __tests__/hooks/useVideos.test.ts
```

Expected: FAIL

- [ ] **Step 3: hooks/useVideos.ts を実装する**

```typescript
// hooks/useVideos.ts
'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Video, WorkSession } from '@/types/video'
import type { VideoFormData } from '@/types/video'
import { loadVideos, saveVideos } from '@/lib/storage'
import { generateId } from '@/lib/utils'

export function useVideos() {
  const [videos, setVideos] = useState<Video[]>([])

  useEffect(() => {
    setVideos(loadVideos())
  }, [])

  const persist = useCallback((next: Video[]) => {
    setVideos(next)
    saveVideos(next)
  }, [])

  const addVideo = useCallback((data: VideoFormData) => {
    const now = new Date().toISOString()
    const video: Video = {
      id: generateId(),
      ...data,
      workSessions: [],
      createdAt: now,
      updatedAt: now,
    }
    persist([...videos, video])
  }, [videos, persist])

  const updateVideo = useCallback((id: string, data: Partial<VideoFormData>) => {
    const now = new Date().toISOString()
    const next = videos.map((v) => {
      if (v.id !== id) return v
      const updated: Video = { ...v, ...data, updatedAt: now }
      if (data.stage === '公開' && v.stage !== '公開') {
        updated.publishedAt = now
      }
      return updated
    })
    persist(next)
  }, [videos, persist])

  const deleteVideo = useCallback((id: string) => {
    persist(videos.filter((v) => v.id !== id))
  }, [videos, persist])

  const addWorkSession = useCallback((id: string, session: WorkSession) => {
    const now = new Date().toISOString()
    const next = videos.map((v) =>
      v.id === id
        ? { ...v, workSessions: [...v.workSessions, session], updatedAt: now }
        : v
    )
    persist(next)
  }, [videos, persist])

  return { videos, addVideo, updateVideo, deleteVideo, addWorkSession }
}
```

- [ ] **Step 4: テストを通す**

```bash
npm test -- __tests__/hooks/useVideos.test.ts
```

Expected: PASS（7 tests passed）

- [ ] **Step 5: コミット**

```bash
git add hooks/useVideos.ts __tests__/hooks/useVideos.test.ts
git commit -m "feat: add useVideos hook with localStorage persistence"
```

---

## Task 6: StageSummary コンポーネント

**Files:**
- Create: `components/StageSummary.tsx`

- [ ] **Step 1: StageSummary.tsx を作成する**

```typescript
// components/StageSummary.tsx
'use client'

import { STAGES, STAGE_COLORS } from '@/types/video'
import type { Video } from '@/types/video'

type Props = {
  videos: Video[]
  activeStage: string | null
  onStageClick: (stage: string | null) => void
}

export function StageSummary({ videos, activeStage, onStageClick }: Props) {
  return (
    <div className="grid grid-cols-5 gap-3 mb-6">
      {STAGES.map((stage) => {
        const count = videos.filter((v) => v.stage === stage).length
        const colors = STAGE_COLORS[stage]
        const isActive = activeStage === stage
        return (
          <button
            key={stage}
            onClick={() => onStageClick(isActive ? null : stage)}
            className={`rounded-lg p-3 text-center border transition-all ${
              isActive
                ? `${colors.bg} border-current ${colors.text} ring-2 ring-offset-1`
                : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className={`text-xs font-medium mb-1 ${isActive ? colors.text : 'text-gray-500'}`}>
              {stage}
            </div>
            <div className={`text-2xl font-bold ${isActive ? colors.text : 'text-gray-800'}`}>
              {count}
            </div>
          </button>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: 開発サーバーで動作確認できるよう一時的にpage.tsxを作成する**

```typescript
// app/page.tsx (一時的)
export default function Page() {
  return <div>確認用</div>
}
```

- [ ] **Step 3: コミット**

```bash
git add components/StageSummary.tsx app/page.tsx
git commit -m "feat: add StageSummary component"
```

---

## Task 7: VideoCard コンポーネント

**Files:**
- Create: `components/VideoCard.tsx`

- [ ] **Step 1: VideoCard.tsx を作成する**

```typescript
// components/VideoCard.tsx
'use client'

import { getDaysUntil } from '@/lib/utils'
import { STAGE_COLORS } from '@/types/video'
import type { Video } from '@/types/video'

type Props = {
  video: Video
  onClick: () => void
}

function DaysUntilBadge({ publishDate }: { publishDate?: string }) {
  const days = getDaysUntil(publishDate)
  if (days === null) return null
  const color =
    days < 0
      ? 'bg-gray-100 text-gray-500'
      : days <= 7
      ? 'bg-red-100 text-red-700'
      : days <= 14
      ? 'bg-orange-100 text-orange-700'
      : 'bg-gray-100 text-gray-500'
  const label = days < 0 ? `${Math.abs(days)}日経過` : days === 0 ? '今日' : `あと${days}日`
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>
      {label}
    </span>
  )
}

export function VideoCard({ video, onClick }: Props) {
  const colors = STAGE_COLORS[video.stage]
  const totalSeconds = video.workSessions.reduce((sum, s) => sum + s.durationSeconds, 0)
  const totalHours = Math.floor(totalSeconds / 3600)
  const totalMinutes = Math.floor((totalSeconds % 3600) / 60)

  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex items-center gap-3 cursor-pointer hover:border-gray-300 hover:shadow-sm transition-all"
    >
      {/* サムネイル or アイコン */}
      <div className={`w-12 h-12 rounded-lg flex-shrink-0 flex items-center justify-center text-xl ${colors.bg}`}>
        {video.thumbnailBase64 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={video.thumbnailBase64} alt="" className="w-full h-full object-cover rounded-lg" />
        ) : (
          '🎬'
        )}
      </div>

      {/* 本文 */}
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm truncate mb-1">{video.title}</div>
        <div className="flex items-center gap-2 flex-wrap">
          {video.publishDate && (
            <span className="text-xs text-gray-500">
              公開予定: {video.publishDate.replace(/-/g, '/')}
            </span>
          )}
          <DaysUntilBadge publishDate={video.publishDate} />
          {video.tags.map((tag) => (
            <span key={tag} className="text-xs text-gray-400">#{tag}</span>
          ))}
          {totalSeconds > 0 && (
            <span className="text-xs text-gray-400">
              作業: {totalHours > 0 ? `${totalHours}h ` : ''}{totalMinutes}m
            </span>
          )}
        </div>
      </div>

      {/* ステージバッジ */}
      <span className={`text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0 ${colors.badge}`}>
        {video.stage}
      </span>
    </div>
  )
}
```

- [ ] **Step 2: コミット**

```bash
git add components/VideoCard.tsx
git commit -m "feat: add VideoCard component with days-until badge"
```

---

## Task 8: WorkTimer コンポーネント

**Files:**
- Create: `components/WorkTimer.tsx`

- [ ] **Step 1: WorkTimer.tsx を作成する**

```typescript
// components/WorkTimer.tsx
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
```

- [ ] **Step 2: コミット**

```bash
git add components/WorkTimer.tsx
git commit -m "feat: add WorkTimer component"
```

---

## Task 9: VideoModal コンポーネント

**Files:**
- Create: `components/VideoModal.tsx`

- [ ] **Step 1: VideoModal.tsx を作成する**

```typescript
// components/VideoModal.tsx
'use client'

import { useState } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { WorkTimer } from '@/components/WorkTimer'
import { STAGES } from '@/types/video'
import type { Video, Stage, WorkSession } from '@/types/video'
import { resizeImageToBase64 } from '@/lib/utils'

type Props = {
  video?: Video
  open: boolean
  onClose: () => void
  onSave: (data: Partial<Video>) => void
  onDelete?: () => void
  onWorkSession?: (session: WorkSession) => void
}

export function VideoModal({ video, open, onClose, onSave, onDelete, onWorkSession }: Props) {
  const [title, setTitle] = useState(video?.title ?? '')
  const [stage, setStage] = useState<Stage>(video?.stage ?? '企画')
  const [publishDate, setPublishDate] = useState(video?.publishDate ?? '')
  const [memo, setMemo] = useState(video?.memo ?? '')
  const [youtubeUrl, setYoutubeUrl] = useState(video?.youtubeUrl ?? '')
  const [tagsInput, setTagsInput] = useState(video?.tags.join(', ') ?? '')
  const [thumbnailBase64, setThumbnailBase64] = useState(video?.thumbnailBase64)
  const [uploading, setUploading] = useState(false)

  async function handleThumbnail(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const base64 = await resizeImageToBase64(file)
      setThumbnailBase64(base64)
    } finally {
      setUploading(false)
    }
  }

  function handleSave() {
    if (!title.trim()) return
    const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean)
    onSave({ title: title.trim(), stage, publishDate: publishDate || undefined, memo: memo || undefined, youtubeUrl: youtubeUrl || undefined, tags, thumbnailBase64 })
    onClose()
  }

  function handleWorkSession(durationSeconds: number) {
    if (onWorkSession) {
      onWorkSession({ stage, startedAt: new Date().toISOString(), durationSeconds })
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{video ? '動画を編集' : '新規動画を追加'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="title">タイトル *</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="動画タイトル（仮）" />
          </div>

          <div>
            <Label htmlFor="stage">ステージ</Label>
            <Select value={stage} onValueChange={(v) => setStage(v as Stage)}>
              <SelectTrigger id="stage"><SelectValue /></SelectTrigger>
              <SelectContent>
                {STAGES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="publishDate">公開予定日</Label>
            <Input id="publishDate" type="date" value={publishDate} onChange={(e) => setPublishDate(e.target.value)} />
          </div>

          <div>
            <Label htmlFor="tags">タグ（カンマ区切り）</Label>
            <Input id="tags" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="解説, プログラミング" />
          </div>

          <div>
            <Label htmlFor="memo">メモ・備考</Label>
            <Textarea id="memo" value={memo} onChange={(e) => setMemo(e.target.value)} rows={3} placeholder="企画の方向性、参考URLなど" />
          </div>

          <div>
            <Label htmlFor="thumbnail">サムネイル画像</Label>
            <Input id="thumbnail" type="file" accept="image/*" onChange={handleThumbnail} disabled={uploading} />
            {uploading && <p className="text-xs text-gray-500 mt-1">処理中...</p>}
            {thumbnailBase64 && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={thumbnailBase64} alt="サムネイルプレビュー" className="mt-2 h-24 rounded object-cover" />
            )}
          </div>

          <div>
            <Label htmlFor="youtubeUrl">YouTube URL</Label>
            <Input id="youtubeUrl" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="https://youtu.be/..." />
          </div>

          {video && onWorkSession && (
            <div>
              <Label>作業タイマー</Label>
              <div className="mt-1">
                <WorkTimer currentStage={stage} onSessionComplete={handleWorkSession} />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 pt-2">
          {video && onDelete && (
            <Button variant="destructive" onClick={() => { onDelete(); onClose() }} className="sm:mr-auto">
              削除
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>キャンセル</Button>
          <Button onClick={handleSave} disabled={!title.trim()}>保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: コミット**

```bash
git add components/VideoModal.tsx
git commit -m "feat: add VideoModal with form fields and timer integration"
```

---

## Task 10: VideoList コンポーネント

**Files:**
- Create: `components/VideoList.tsx`

- [ ] **Step 1: VideoList.tsx を作成する**

```typescript
// components/VideoList.tsx
'use client'

import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { VideoCard } from '@/components/VideoCard'
import type { Video } from '@/types/video'
import { STAGES } from '@/types/video'

type Props = {
  videos: Video[]
  activeStage: string | null
  onVideoClick: (video: Video) => void
}

export function VideoList({ videos, activeStage, onVideoClick }: Props) {
  const [query, setQuery] = useState('')
  const [stageFilter, setStageFilter] = useState<string>('all')

  const filtered = useMemo(() => {
    return videos.filter((v) => {
      const matchStage = activeStage
        ? v.stage === activeStage
        : stageFilter === 'all' || v.stage === stageFilter
      const matchQuery = v.title.toLowerCase().includes(query.toLowerCase())
      return matchStage && matchQuery
    })
  }, [videos, activeStage, stageFilter, query])

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <Input
          placeholder="タイトルで検索..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1"
        />
        {!activeStage && (
          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべてのステージ</SelectItem>
              {STAGES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          動画がありません
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((v) => (
            <VideoCard key={v.id} video={v} onClick={() => onVideoClick(v)} />
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: コミット**

```bash
git add components/VideoList.tsx
git commit -m "feat: add VideoList component with search and filter"
```

---

## Task 11: ダッシュボードページ

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/layout.tsx`
- Create: `app/globals.css` (既存ファイルの調整)

- [ ] **Step 1: app/layout.tsx を作成する（ナビゲーション付き）**

```typescript
// app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'YouTube進捗管理',
  description: 'YouTube動画制作の進捗を管理するアプリ',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <nav className="bg-zinc-900 text-white px-6 py-3 flex items-center gap-6">
            <Link href="/" className="font-bold text-base flex items-center gap-2">
              📹 YT進捗管理
            </Link>
            <div className="flex gap-4 text-sm">
              <Link href="/" className="text-gray-300 hover:text-white transition-colors">ダッシュボード</Link>
              <Link href="/calendar" className="text-gray-300 hover:text-white transition-colors">カレンダー</Link>
              <Link href="/report" className="text-gray-300 hover:text-white transition-colors">レポート</Link>
            </div>
          </nav>
          <main className="max-w-4xl mx-auto px-4 py-6">{children}</main>
        </div>
      </body>
    </html>
  )
}
```

- [ ] **Step 2: app/page.tsx を実装する**

```typescript
// app/page.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { StageSummary } from '@/components/StageSummary'
import { VideoList } from '@/components/VideoList'
import { VideoModal } from '@/components/VideoModal'
import { useVideos } from '@/hooks/useVideos'
import type { Video, WorkSession } from '@/types/video'

export default function DashboardPage() {
  const { videos, addVideo, updateVideo, deleteVideo, addWorkSession } = useVideos()
  const [activeStage, setActiveStage] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)

  function openCreate() {
    setSelectedVideo(null)
    setModalOpen(true)
  }

  function openEdit(video: Video) {
    setSelectedVideo(video)
    setModalOpen(true)
  }

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
    } else {
      addVideo({
        title: data.title ?? '',
        stage: data.stage ?? '企画',
        publishDate: data.publishDate,
        memo: data.memo,
        youtubeUrl: data.youtubeUrl,
        tags: data.tags ?? [],
        thumbnailBase64: data.thumbnailBase64,
      })
    }
  }

  function handleWorkSession(session: WorkSession) {
    if (selectedVideo) addWorkSession(selectedVideo.id, session)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">ダッシュボード</h1>
        <Button onClick={openCreate}>＋ 新規動画を追加</Button>
      </div>

      <StageSummary videos={videos} activeStage={activeStage} onStageClick={setActiveStage} />
      <VideoList videos={videos} activeStage={activeStage} onVideoClick={openEdit} />

      <VideoModal
        open={modalOpen}
        video={selectedVideo ?? undefined}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        onDelete={selectedVideo ? () => deleteVideo(selectedVideo.id) : undefined}
        onWorkSession={handleWorkSession}
      />
    </div>
  )
}
```

- [ ] **Step 3: 開発サーバーで動作確認する**

```bash
npm run dev
```

ブラウザで `http://localhost:3000` を開いて確認:
- ナビゲーションが表示される
- ステージサマリー（5カード）が表示される
- 「＋ 新規動画を追加」ボタンをクリックするとモーダルが開く
- 動画を保存するとリストに表示される
- ステージカードをクリックするとフィルターが効く

- [ ] **Step 4: コミット**

```bash
git add app/layout.tsx app/page.tsx app/globals.css
git commit -m "feat: implement dashboard page with video CRUD"
```

---

## Task 12: カレンダービュー

**Files:**
- Create: `components/CalendarView.tsx`
- Create: `app/calendar/page.tsx`

- [ ] **Step 1: CalendarView.tsx を作成する**

```typescript
// components/CalendarView.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { STAGE_COLORS } from '@/types/video'
import type { Video } from '@/types/video'

type Props = {
  videos: Video[]
  onVideoClick: (video: Video) => void
}

function buildCalendar(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

export function CalendarView({ videos, onVideoClick }: Props) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

  const cells = buildCalendar(year, month)

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  function videosOnDay(day: number) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return videos.filter((v) => v.publishDate === dateStr)
  }

  const todayStr = today.toISOString().slice(0, 10)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" size="sm" onClick={prevMonth}>‹ 前月</Button>
        <h2 className="font-bold text-lg">{year}年{month + 1}月</h2>
        <Button variant="outline" size="sm" onClick={nextMonth}>翌月 ›</Button>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {['日', '月', '火', '水', '木', '金', '土'].map((d) => (
          <div key={d} className="text-center text-xs text-gray-400 py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />
          const dayVideos = videosOnDay(day)
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const isToday = dateStr === todayStr
          return (
            <div key={i} className={`min-h-16 rounded-lg p-1 border ${isToday ? 'border-blue-400 bg-blue-50' : 'border-gray-100 bg-white'}`}>
              <div className={`text-xs font-medium mb-1 ${isToday ? 'text-blue-600' : 'text-gray-600'}`}>{day}</div>
              {dayVideos.map((v) => (
                <div
                  key={v.id}
                  onClick={() => onVideoClick(v)}
                  className={`text-xs rounded px-1 py-0.5 mb-0.5 truncate cursor-pointer ${STAGE_COLORS[v.stage].badge}`}
                  title={v.title}
                >
                  {v.title}
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: app/calendar/page.tsx を作成する**

```typescript
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
    if (selectedVideo) updateVideo(selectedVideo.id, data)
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
          open={!!selectedVideo}
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
          onSave={handleSave}
          onDelete={() => deleteVideo(selectedVideo.id)}
          onWorkSession={handleWorkSession}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 3: 動作確認する**

ブラウザで `http://localhost:3000/calendar` を開いて確認:
- 月表示カレンダーが表示される
- 前月・翌月ボタンで月が切り替わる
- 公開予定日を設定した動画のタイトルが対応する日付セルに表示される

- [ ] **Step 4: コミット**

```bash
git add components/CalendarView.tsx app/calendar/page.tsx
git commit -m "feat: add calendar view with monthly layout"
```

---

## Task 13: レポート画面

**Files:**
- Create: `components/ReportCharts.tsx`
- Create: `app/report/page.tsx`

- [ ] **Step 1: ReportCharts.tsx を作成する**

```typescript
// components/ReportCharts.tsx
'use client'

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { STAGES, STAGE_COLORS } from '@/types/video'
import type { Video } from '@/types/video'

type Props = { videos: Video[] }

const PIE_COLORS = ['#3b82f6', '#eab308', '#8b5cf6', '#ec4899', '#10b981']

export function ReportCharts({ videos }: Props) {
  // 月別公開本数（過去12ヶ月）
  const monthlyData = (() => {
    const today = new Date()
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date(today.getFullYear(), today.getMonth() - (11 - i), 1)
      const label = `${d.getMonth() + 1}月`
      const count = videos.filter((v) => {
        if (!v.publishedAt) return false
        const pub = new Date(v.publishedAt)
        return pub.getFullYear() === d.getFullYear() && pub.getMonth() === d.getMonth()
      }).length
      return { label, count }
    })
  })()

  // ステージ別本数
  const stageData = STAGES.map((s) => ({
    name: s,
    value: videos.filter((v) => v.stage === s).length,
  }))

  // 合計作業時間
  const totalSeconds = videos.reduce(
    (sum, v) => sum + v.workSessions.reduce((s, ws) => s + ws.durationSeconds, 0),
    0
  )
  const totalH = Math.floor(totalSeconds / 3600)
  const totalM = Math.floor((totalSeconds % 3600) / 60)

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-bold text-sm text-gray-700 mb-4">月別公開本数（過去12ヶ月）</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={monthlyData}>
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" name="公開本数" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-bold text-sm text-gray-700 mb-4">現在のステージ別本数</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={stageData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => value > 0 ? `${name} ${value}` : ''}>
                {stageData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col items-center justify-center">
          <h2 className="font-bold text-sm text-gray-700 mb-3">合計作業時間</h2>
          <div className="text-4xl font-bold text-gray-900">
            {totalH}<span className="text-xl font-normal text-gray-500">h </span>
            {totalM}<span className="text-xl font-normal text-gray-500">m</span>
          </div>
          <div className="text-xs text-gray-400 mt-2">全動画の累積タイマー時間</div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: app/report/page.tsx を作成する**

```typescript
// app/report/page.tsx
'use client'

import { ReportCharts } from '@/components/ReportCharts'
import { useVideos } from '@/hooks/useVideos'

export default function ReportPage() {
  const { videos } = useVideos()
  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">レポート</h1>
      <ReportCharts videos={videos} />
    </div>
  )
}
```

- [ ] **Step 3: 動作確認する**

ブラウザで `http://localhost:3000/report` を開いて確認:
- 月別公開本数の棒グラフが表示される
- ステージ別円グラフが表示される
- 合計作業時間が表示される

- [ ] **Step 4: コミット**

```bash
git add components/ReportCharts.tsx app/report/page.tsx
git commit -m "feat: add report page with monthly bar chart and stage pie chart"
```

---

## Task 14: 全テスト実行 + Vercelデプロイ準備

**Files:**
- Create: `vercel.json`（必要に応じて）

- [ ] **Step 1: 全テストを実行する**

```bash
npm test
```

Expected: PASS（storage 3件・utils 5件・useVideos 7件 = 15件すべてグリーン）

失敗があれば修正してから次へ進む。

- [ ] **Step 2: ビルドが通ることを確認する**

```bash
npm run build
```

Expected: `✓ Compiled successfully` が表示され、エラーなし。

TypeScriptエラーや未使用importが出た場合はその場で修正する。

- [ ] **Step 3: .gitignore に .superpowers を追加する**

`.gitignore` を開き、末尾に追記:

```
.superpowers/
```

- [ ] **Step 4: 最終コミット**

```bash
git add -A
git commit -m "chore: verify tests pass and build succeeds, add .superpowers to .gitignore"
```

- [ ] **Step 5: Vercelにデプロイする**

[Vercel](https://vercel.com) にアクセスし:
1. 「Add New Project」→「Import Git Repository」
2. GitHubにpushしている場合はリポジトリを選択
3. ローカルからデプロイする場合は Vercel CLI を使用:

```bash
npm install -g vercel
vercel login
vercel --prod
```

Expected: デプロイURLが発行される（例: `https://youtube-progress-xxxx.vercel.app`）

- [ ] **Step 6: デプロイ後の動作確認**

発行されたURLをブラウザで開き、以下を確認:
- ダッシュボード・カレンダー・レポートの3画面が表示される
- 動画の追加・編集・削除が動作する
- ページリロード後もデータが保持されている（localStorage）

---

## 完了チェックリスト

- [ ] `npm test` がすべてグリーン（15テスト）
- [ ] `npm run build` がエラーなし
- [ ] ダッシュボード: サマリー・リスト・検索・フィルター・CRUD動作
- [ ] カレンダー: 月表示・動画タイトル表示・月切り替え
- [ ] レポート: 月別グラフ・ステージ別グラフ・作業時間合計
- [ ] 作業タイマー: 開始・停止・保存
- [ ] サムネイル: アップロード・リサイズ・プレビュー
- [ ] Vercelデプロイ完了
