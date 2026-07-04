import '@/styles/globals.css'
import { AuthProvider } from '@/hooks/useAuth'
import { ToastProvider } from '@/components/ui/Toast'
import AIChatFloat from '@/components/layout/AIChatFloat'

export const metadata = {
  title: '🎬 电影APP',
  description: '发现好电影',
}

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <head>
        <meta name="referrer" content="no-referrer" />
      </head>
      <body className="bg-[#0F0F0F] text-white font-sans antialiased">
        <AuthProvider>
          <ToastProvider>
            {children}
            <AIChatFloat />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
