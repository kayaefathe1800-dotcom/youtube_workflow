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
      <body className={`${inter.className} bg-gray-50 min-h-screen`}>
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-6 flex items-center h-14">
            <Link href="/" className="flex items-center gap-2 font-bold text-gray-900 mr-8 shrink-0">
              <span className="w-7 h-7 bg-red-500 rounded-lg flex items-center justify-center text-white text-xs font-black">▶</span>
              YT進捗管理
            </Link>
            <div className="hidden sm:flex gap-0.5">
              <Link href="/" className="text-sm px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors font-medium">
                ダッシュボード
              </Link>
              <Link href="/calendar" className="text-sm px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors font-medium">
                カレンダー
              </Link>
              <Link href="/report" className="text-sm px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors font-medium">
                レポート
              </Link>
            </div>
          </div>
        </nav>
        <main className="max-w-5xl mx-auto px-4 py-4 pb-24 sm:px-6 sm:py-8 sm:pb-8">{children}</main>

        {/* Mobile bottom tab bar */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 sm:hidden bg-white border-t border-gray-200">
          <div className="flex">
            <Link href="/" className="flex-1 flex flex-col items-center py-3 gap-0.5 text-gray-500 hover:text-red-500 transition-colors">
              <span className="text-xl">🏠</span>
              <span className="text-[10px] font-medium">ダッシュボード</span>
            </Link>
            <Link href="/calendar" className="flex-1 flex flex-col items-center py-3 gap-0.5 text-gray-500 hover:text-red-500 transition-colors">
              <span className="text-xl">📅</span>
              <span className="text-[10px] font-medium">カレンダー</span>
            </Link>
            <Link href="/report" className="flex-1 flex flex-col items-center py-3 gap-0.5 text-gray-500 hover:text-red-500 transition-colors">
              <span className="text-xl">📊</span>
              <span className="text-[10px] font-medium">レポート</span>
            </Link>
          </div>
        </nav>
      </body>
    </html>
  )
}
