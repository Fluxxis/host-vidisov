'use client'
import { useState, useEffect, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, ArrowLeft, Copy, CheckCircle, Link2, Download, Lock, Eye, EyeOff, ExternalLink, X } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

interface VideoData {
  id: string
  url: string
  filename: string
  quality: string
  password: string | null
  views: number
}

interface AdData {
  enabled: boolean
  text: string
  link: string
}

function WatchInner() {
  const sp = useSearchParams()
  const id = sp.get('id')
  const [video, setVideo] = useState<VideoData | null>(null)
  const [ad, setAd] = useState<AdData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pwdInput, setPwdInput] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [pwdError, setPwdError] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [copied, setCopied] = useState(false)
  const [adClosed, setAdClosed] = useState(false)

  useEffect(() => {
    if (!id) { setError('No video ID'); setLoading(false); return }
    fetch(`/api/video?id=${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setError(data.error); setLoading(false); return }
        setVideo(data)
        setLoading(false)
        if (!data.password) setUnlocked(true)
        // log visit
        const ua = navigator.userAgent
        let p = 'Unknown'
        if (ua.includes('Win')) p = 'Windows'
        else if (ua.includes('Mac')) p = 'macOS'
        else if (ua.includes('Linux')) p = 'Linux'
        else if (ua.includes('Android')) p = 'Android'
        else if (ua.includes('iPhone') || ua.includes('iPad')) p = 'iOS'
        fetch('/api/visit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userAgent: ua, platform: p,
            screen: `${window.screen.width}x${window.screen.height}`,
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            videoId: id,
            page: 'watch',
          })
        })
        // increment view
        fetch(`/api/video?id=${id}`, { method: 'POST' }) // hmm no POST on video
        // Actually we need a separate endpoint for incrementing views, or do it via visit
        // Let's just increment in visit API if videoId provided
      })
      .catch(() => { setError('Failed to load'); setLoading(false) })

    fetch('/api/ad')
      .then(r => r.json())
      .then(setAd)
      .catch(() => {})
  }, [id])

  const checkPwd = (e: React.FormEvent) => {
    e.preventDefault()
    if (video && video.password === pwdInput) {
      setUnlocked(true)
      setPwdError('')
    } else {
      setPwdError('Incorrect password')
    }
  }

  const copy = async (t: string) => {
    try { await navigator.clipboard.writeText(t); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch {}
  }

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-8 h-8 border-2 border-white/20 border-t-purple-500 rounded-full" />
    </div>
  )

  if (error || !video) return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/10 flex items-center justify-center mb-6"><Play className="w-8 h-8 text-red-400" /></div>
        <h1 className="text-2xl font-bold mb-3">Video Not Found</h1>
        <p className="text-white/50 mb-8">{error || 'Invalid link.'}</p>
        <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 glass rounded-full hover:bg-white/10 transition-colors"><ArrowLeft className="w-4 h-4" /> Back</Link>
      </div>
    </div>
  )

  const name = video.filename
  const watchUrl = typeof window !== 'undefined' ? window.location.href : ''

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
          {/* Ad Banner */}
          <AnimatePresence>
            {ad?.enabled && !adClosed && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} className="glass rounded-xl p-4 border border-yellow-500/20 bg-yellow-500/5 relative">
                <button onClick={() => setAdClosed(true)} className="absolute top-2 right-2 text-white/30 hover:text-white/60"><X className="w-4 h-4" /></button>
                <div className="flex items-center gap-3 pr-6">
                  <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0"><ExternalLink className="w-4 h-4 text-yellow-400" /></div>
                  <div>
                    <p className="text-sm text-yellow-200/80 font-medium">{ad.text}</p>
                    {ad.link && <a href={ad.link} target="_blank" rel="noopener noreferrer" className="text-xs text-yellow-400/60 hover:text-yellow-400 underline">{ad.link}</a>}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Video Player or Password */}
          <div className="glass-strong rounded-2xl overflow-hidden">
            {!unlocked ? (
              <div className="aspect-video flex items-center justify-center bg-black/50">
                <motion.form initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} onSubmit={checkPwd} className="w-full max-w-sm px-6">
                  <div className="text-center mb-6">
                    <div className="w-12 h-12 mx-auto rounded-xl bg-purple-500/20 flex items-center justify-center mb-3"><Lock className="w-6 h-6 text-purple-400" /></div>
                    <h3 className="text-lg font-semibold">Password Protected</h3>
                    <p className="text-sm text-white/40">Enter password to watch this video</p>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input type={showPwd ? 'text' : 'password'} value={pwdInput} onChange={e => setPwdInput(e.target.value)} className="w-full pl-11 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500/50 text-white placeholder:text-white/20" placeholder="Password" required />
                    <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">{showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                  </div>
                  {pwdError && <p className="text-red-400 text-sm mt-2">{pwdError}</p>}
                  <button type="submit" className="w-full mt-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl font-semibold hover:from-purple-500 hover:to-blue-500 transition-all">Unlock</button>
                </motion.form>
              </div>
            ) : (
              <div className="aspect-video bg-black"><video src={video.url} controls autoPlay className="w-full h-full" onError={() => setError('Failed to load video')} /></div>
            )}
          </div>

          {/* Info */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-2xl p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-semibold mb-1">{name}</h1>
                <div className="flex items-center gap-3 text-sm text-white/40">
                  <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">{video.quality}</span>
                  <span>{video.views} views</span>
                  {video.password && <span className="flex items-center gap-1 text-yellow-400/60"><Lock className="w-3 h-3" /> Protected</span>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => copy(watchUrl)} className="flex items-center gap-2 px-4 py-2 glass rounded-xl hover:bg-white/10 transition-colors text-sm">
                  {copied ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Link2 className="w-4 h-4" />}{copied ? 'Copied!' : 'Copy Link'}
                </button>
                <a href={video.url} download={name} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl hover:from-purple-500 hover:to-blue-500 transition-all text-sm"><Download className="w-4 h-4" /> Download</a>
              </div>
            </div>

          </motion.div>
        </motion.div>
      </div>
    </main>
  )
}

export default function WatchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-8 h-8 border-2 border-white/20 border-t-purple-500 rounded-full" />
      </div>
    }>
      <WatchInner />
    </Suspense>
  )
}
