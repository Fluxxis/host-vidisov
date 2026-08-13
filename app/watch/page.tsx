'use client'
import { useState, useEffect, Suspense } from 'react'
import { motion } from 'framer-motion'
import { Play, ArrowLeft, Copy, CheckCircle, Link2, Download } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

function Content() {
  const sp = useSearchParams()
  const url = sp.get('v') || sp.get('url')
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => { if (url) setLoading(false); else { setError('No URL'); setLoading(false) } }, [url])

  const copy = async (t: string) => { try { await navigator.clipboard.writeText(t); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch {} }

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-8 h-8 border-2 border-white/20 border-t-purple-500 rounded-full" />
    </div>
  )

  if (error || !url) return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/10 flex items-center justify-center mb-6"><Play className="w-8 h-8 text-red-400" /></div>
        <h1 className="text-2xl font-bold mb-3">Video Not Found</h1>
        <p className="text-white/50 mb-8">Invalid or expired link.</p>
        <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 glass rounded-full hover:bg-white/10 transition-colors"><ArrowLeft className="w-4 h-4" /> Back</Link>
      </div>
    </div>
  )

  const name = decodeURIComponent(url.split('/').pop() || 'video.mp4')

  return (
    <main className="relative min-h-screen bg-black">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full mix-blend-screen filter blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full mix-blend-screen filter blur-[150px]" />
      </div>
      <nav className="relative z-10 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center"><Play className="w-4 h-4 text-white fill-white" /></div>
          <span className="text-xl font-bold tracking-tight">StreamVault</span>
        </Link>
        <Link href="/admin" className="px-4 py-2 text-sm glass rounded-full hover:bg-white/10 transition-colors">Admin</Link>
      </nav>
      <div className="relative z-10 px-6 py-8 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="glass-strong rounded-2xl overflow-hidden">
            <div className="aspect-video bg-black"><video src={url} controls autoPlay className="w-full h-full" onError={() => setError('Failed')} /></div>
          </div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-2xl p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div><h1 className="text-xl font-semibold mb-1">{name}</h1><p className="text-sm text-white/40">Hosted on StreamVault CDN</p></div>
              <div className="flex items-center gap-3">
                <button onClick={() => copy(window.location.href)} className="flex items-center gap-2 px-4 py-2 glass rounded-xl hover:bg-white/10 transition-colors text-sm">
                  {copied ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Link2 className="w-4 h-4" />}{copied ? 'Copied!' : 'Copy Link'}
                </button>
                <a href={url} download={name} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl hover:from-purple-500 hover:to-blue-500 transition-all text-sm"><Download className="w-4 h-4" /> Download</a>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-white/5">
              <label className="text-xs text-white/40 mb-2 block">Video URL</label>
              <div className="flex gap-2">
                <div className="flex-1 px-4 py-3 bg-white/5 rounded-xl text-sm text-white/50 font-mono truncate border border-white/10">{url}</div>
                <button onClick={() => copy(url)} className="px-4 py-3 glass rounded-xl hover:bg-white/10 transition-colors"><Copy className="w-4 h-4" /></button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </main>
  )
}

export default function Watch() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-8 h-8 border-2 border-white/20 border-t-purple-500 rounded-full" />
      </div>
    }>
      <Content />
    </Suspense>
  )
}
