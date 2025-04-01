import './globals.css'
import type { Metadata } from 'next'

// Add Computer Modern fonts
import '@/styles/fonts.css'

export const metadata: Metadata = {
  title: 'ML Paper Rankings',
  description: 'Compare and rank machine learning papers using ELO ratings',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link href="https://cdn.jsdelivr.net/gh/vsalvino/computer-modern@main/fonts/serif.css" rel="stylesheet" />
        <link href="https://cdn.jsdelivr.net/gh/vsalvino/computer-modern@main/fonts/sans.css" rel="stylesheet" />
      </head>
      <body className="font-cm-sans">{children}</body>
    </html>
  )
}
