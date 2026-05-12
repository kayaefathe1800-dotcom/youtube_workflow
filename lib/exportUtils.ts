import type { Video } from '@/types/video'

export function exportToCSV(videos: Video[]): void {
  const headers = [
    'タイトル', 'ステージ', '公開予定日',
    '企画締切', '台本締切', '編集締切', 'サムネイル締切', '公開締切',
    '進捗%', 'タグ', 'メモ', 'YouTube URL', '合計作業時間(分)', '作成日',
  ]
  const rows = videos.map((v) => {
    const totalMin = Math.round(
      v.workSessions.reduce((s, ws) => s + ws.durationSeconds, 0) / 60
    )
    return [
      v.title,
      v.stage,
      v.publishDate ?? '',
      v.stageDueDates?.['企画'] ?? '',
      v.stageDueDates?.['台本'] ?? '',
      v.stageDueDates?.['編集'] ?? '',
      v.stageDueDates?.['サムネイル'] ?? '',
      v.stageDueDates?.['公開'] ?? '',
      v.stageProgress ?? 0,
      v.tags.join('|'),
      v.memo ?? '',
      v.youtubeUrl ?? '',
      totalMin,
      v.createdAt.slice(0, 10),
    ]
      .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
      .join(',')
  })
  const csv = [headers.map((h) => `"${h}"`).join(','), ...rows].join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `yt-progress-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function generateGoogleCalendarUrl(
  title: string,
  dateStr: string,
  description = ''
): string {
  const date = dateStr.replace(/-/g, '')
  const d = new Date(dateStr)
  d.setDate(d.getDate() + 1)
  const nextDate = d.toISOString().slice(0, 10).replace(/-/g, '')
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${date}/${nextDate}`,
    details: description,
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}
