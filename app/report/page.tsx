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
