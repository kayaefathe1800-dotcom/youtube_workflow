'use client'

import { useEffect } from 'react'
import type { Video } from '@/types/video'
import { getDaysUntil } from '@/lib/utils'

export function useDeadlineNotifications(videos: Video[]) {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('Notification' in window)) return

    // Only check once per day (store in sessionStorage)
    const today = new Date().toISOString().slice(0, 10)
    const checked = sessionStorage.getItem('notif-checked')
    if (checked === today) return

    async function check() {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') return

      sessionStorage.setItem('notif-checked', today)

      videos.forEach((v) => {
        // Check current stage deadline
        const stageDue = v.stageDueDates?.[v.stage]
        if (stageDue) {
          const days = getDaysUntil(stageDue)
          if (days === 0) {
            new Notification(`🚨 今日が締切！`, {
              body: `「${v.title}」の ${v.stage} は今日が締切です`,
            })
          } else if (days === 1) {
            new Notification(`⚠️ 明日が締切`, {
              body: `「${v.title}」の ${v.stage} は明日が締切です`,
            })
          } else if (days !== null && days < 0) {
            new Notification(`🔴 期限切れ`, {
              body: `「${v.title}」の ${v.stage} の締切が ${Math.abs(days)} 日過ぎています`,
            })
          }
        }

        // Check publish date
        if (v.publishDate) {
          const days = getDaysUntil(v.publishDate)
          if (days === 0) {
            new Notification(`📹 今日公開予定`, {
              body: `「${v.title}」を今日公開する予定です`,
            })
          } else if (days === 1) {
            new Notification(`📅 明日公開予定`, {
              body: `「${v.title}」は明日公開予定です`,
            })
          }
        }
      })
    }

    check()
  }, [videos])
}
