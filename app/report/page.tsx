'use client'

import { ReportCharts } from '@/components/ReportCharts'
import { useVideos } from '@/hooks/useVideos'
import { exportToCSV } from '@/lib/exportUtils'

export default function ReportPage() {
  const { videos } = useVideos()

  return (
    <div>
      {/* Header with export buttons */}
      <div className="flex items-center justify-between mb-6 no-print">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">レポート</h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5">制作実績の分析</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => exportToCSV(videos)}
            className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors font-medium shadow-sm"
          >
            <span>📊</span>
            <span className="hidden sm:inline">CSV出力</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition-colors font-medium shadow-sm"
          >
            <span>📄</span>
            <span className="hidden sm:inline">PDF出力</span>
          </button>
        </div>
      </div>

      {/* Print header - only shown when printing */}
      <div className="hidden print-only mb-6">
        <h1 className="text-2xl font-bold text-gray-900">YouTube進捗管理 レポート</h1>
        <p className="text-sm text-gray-500">{new Date().toLocaleDateString('ja-JP')} 時点</p>
      </div>

      <div id="report-content">
        <ReportCharts videos={videos} />
      </div>
    </div>
  )
}
