// components/ReportCharts.tsx
'use client'

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'
import { STAGES } from '@/types/video'
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
              <Pie
                data={stageData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={70}
                label={({ name, value }: { name?: string; value?: number }) => (value ?? 0) > 0 ? `${name ?? ''} ${value}` : ''}
              >
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
