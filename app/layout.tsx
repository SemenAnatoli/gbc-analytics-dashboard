import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'GBC Analytics Dashboard',
  description: 'Аналитика заказов — GBC',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="bg-app-bg min-h-screen">{children}</body>
    </html>
  )
}
