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
