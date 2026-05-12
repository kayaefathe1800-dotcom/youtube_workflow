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
import { CountdownTimer } from '@/components/CountdownTimer'
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
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [stageDueDates, setStageDueDates] = useState<Partial<Record<Stage, string>>>(
    video?.stageDueDates ?? {}
  )
  const [stageProgress, setStageProgress] = useState<number>(video?.stageProgress ?? 0)

  async function handleThumbnail(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadError(null)
    try {
      const base64 = await resizeImageToBase64(file)
      setThumbnailBase64(base64)
    } catch {
      setUploadError('画像の処理に失敗しました。別のファイルをお試しください。')
    } finally {
      setUploading(false)
    }
  }

  function handleSave() {
    if (!title.trim()) return
    const tags = Array.from(new Set(tagsInput.split(',').map((t) => t.trim()).filter(Boolean)))
    onSave({
      title: title.trim(),
      stage,
      publishDate: publishDate || undefined,
      memo: memo || undefined,
      youtubeUrl: youtubeUrl || undefined,
      tags,
      thumbnailBase64,
      stageDueDates: Object.keys(stageDueDates).length > 0 ? stageDueDates : undefined,
      stageProgress,
    })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-white">
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
            <Label>現在ステージの進捗</Label>
            <div className="flex gap-1.5 mt-2">
              {[0, 25, 50, 75, 100].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setStageProgress(p)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${
                    stageProgress === p
                      ? 'bg-gray-800 text-white border-gray-800'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {p}%
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="publishDate">公開予定日</Label>
            <Input id="publishDate" type="date" value={publishDate} onChange={(e) => setPublishDate(e.target.value)} />
          </div>

          <div>
            <Label>ステージ別締切日</Label>
            <div className="space-y-2 mt-2">
              {STAGES.map((s) => (
                <div key={s} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-16 shrink-0 text-right">{s}</span>
                  <Input
                    type="date"
                    value={stageDueDates[s] ?? ''}
                    onChange={(e) => {
                      const val = e.target.value
                      setStageDueDates((prev) => {
                        const next = { ...prev }
                        if (val) next[s] = val
                        else delete next[s]
                        return next
                      })
                    }}
                    className="flex-1 text-sm"
                  />
                </div>
              ))}
            </div>
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
            {uploadError && <p className="text-xs text-red-500 mt-1">{uploadError}</p>}
            {thumbnailBase64 && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={thumbnailBase64} alt="サムネイルプレビュー" className="mt-2 h-24 rounded object-cover" />
            )}
          </div>

          <div>
            <Label htmlFor="youtubeUrl">YouTube URL</Label>
            <Input id="youtubeUrl" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="https://youtu.be/..." />
          </div>

          <div>
            <Label>制限時間タイマー</Label>
            <div className="mt-1">
              <CountdownTimer />
            </div>
          </div>
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
