import type { Metadata } from 'next'
import Providers from './providers'
import './globals.css'
import React from "react"

export const metadata: Metadata = {
  title: 'Журнал работ',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
