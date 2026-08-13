import './globals.css'

export const metadata = {
  title: 'StreamVault — Video Hosting',
  description: 'Premium video hosting platform'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="antialiased overflow-x-hidden">{children}</body>
    </html>
  )
}
