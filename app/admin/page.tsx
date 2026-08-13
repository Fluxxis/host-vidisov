'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Upload, Lock, Eye, EyeOff, LogOut, CheckCircle, AlertCircle, Copy, Link2, Monitor, Globe, Clock, Shield, FileVideo, User, Wifi, HardDrive, MapPin, Trash2, ExternalLink, BarChart3, Users, Film, Settings, X, TrendingUp, Calendar, Lock as LockIcon } from 'lucide-react'
import Link from 'next/link'

interface VideoRec { id: string; url: string; filename: string; createdAt: number; expiresAt: number | null; quality: string; password: string | null; views: number; lastViewedAt: number | null }
interface VisitorRec { id: string; ip: string; userAgent: string; platform: string; screen: string; language: string; timezone: string; timestamp: number; videoId: string | null; page: string }
interface AdRec { enabled: boolean; text: string; link: string }
interface Stats { visitors: VisitorRec[]; visitorCount: number; topVideos: VideoRec[]; totalVideos: number }

export default function AdminPage() {
  const [auth, setAuth] = useState(false)
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const [vdata, setVdata] = useState<any>(null)
  const [webhook, setWebhook] = useState(false)

  // Upload
  const [drag, setDrag] = useState(false)
  const [prog, setProg] = useState(0)
  const [upping, setUpping] = useState(false)
  const [video, setVideo] = useState<VideoRec | null>(null)
  const [ttl, setTtl] = useState('0')
  const [quality, setQuality] = useState('original')
  const [vidPass, setVidPass] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  // Data
  const [myVideos, setMyVideos] = useState<VideoRec[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [ad, setAd] = useState<AdRec>({ enabled: false, text: '', link: '' })
  const [adSaving, setAdSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<'upload' | 'videos' | 'visitors' | 'settings'>('upload')

  useEffect(() => {
    if (localStorage.getItem('admin_auth') === 'true') { setAuth(true); gather(); loadData() }
  }, [])

  const gather = useCallback(async () => {
    let ip = 'Private'
    try { const r = await fetch('https://api.ipify.org?format=json',{cache:'no-store'}); const d = await r.json(); ip = d.ip } catch {}
    const ua = navigator.userAgent
    let p = 'Unknown'
    if (ua.includes('Win')) p = 'Windows'
    else if (ua.includes('Mac')) p = 'macOS'
    else if (ua.includes('Linux')) p = 'Linux'
    else if (ua.includes('Android')) p = 'Android'
    else if (ua.includes('iPhone') || ua.includes('iPad')) p = 'iOS'
    setVdata({ ip, userAgent: ua, platform: p, screen: `${window.screen.width}x${window.screen.height}`, language: navigator.language, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, online: navigator.onLine })
    setTimeout(() => setWebhook(true), 800)
  }, [])

  const loadData = async () => {
    try {
      const [vRes, sRes, aRes] = await Promise.all([
        fetch('/api/video').then(r => r.json()),
        fetch('/api/stats').then(r => r.json()),
        fetch('/api/ad').then(r => r.json()),
      ])
      setMyVideos(vRes.videos || [])
      setStats(sRes)
      setAd(aRes)
    } catch {}
  }

  const login = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setErr('')
    try {
      const r = await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: user, password: pass }) })
      const d = await r.json()
      if (d.success) { setAuth(true); localStorage.setItem('admin_auth', 'true'); gather(); loadData() }
      else setErr('Invalid credentials')
    } catch { setErr('Connection error') }
    setLoading(false)
  }

  const logout = async () => {
    try { await fetch('/api/auth', { method: 'DELETE' }) } catch {}
    localStorage.removeItem('admin_auth')
    setAuth(false); setVdata(null); setWebhook(false); setVideo(null); setMyVideos([]); setStats(null)
  }

  const onDrag = (e: React.DragEvent) => { e.preventDefault(); setDrag(e.type === 'dragenter' || e.type === 'dragover') }
  const onDrop = (e: React.DragEvent) => { e.preventDefault(); setDrag(false); if (e.dataTransfer.files?.[0]) uploadFile(e.dataTransfer.files[0]) }
  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files?.[0]) uploadFile(e.target.files[0]) }

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith('video/')) { alert('Not a video'); return }
    setUpping(true); setProg(0); setVideo(null)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('ttl', ttl)
    fd.append('quality', quality)
    fd.append('password', vidPass)
    const iv = setInterval(() => setProg(p => p >= 90 ? p : p + Math.random() * 15), 300)
    try {
      const r = await fetch('/api/upload', { method: 'POST', body: fd })
      clearInterval(iv); setProg(100)
      const d = await r.json()
      if (d.success) {
        setTimeout(() => { setVideo(d.video); setUpping(false); loadData() }, 500)
      } else { alert(d.error || 'Failed'); setUpping(false) }
    } catch { clearInterval(iv); alert('Upload failed'); setUpping(false) }
  }

  const deleteVideo = async (id: string) => {
    if (!confirm('Delete this video?')) return
    try {
      await fetch('/api/video', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
      loadData()
    } catch {}
  }

  const saveAd = async () => {
    setAdSaving(true)
    try {
      await fetch('/api/ad', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(ad) })
    } catch {}
    setAdSaving(false)
  }

  const copy = async (t: string) => { try { await navigator.clipboard.writeText(t); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch {} }
  const watchLink = (id: string) => `${typeof window !== 'undefined' ? window.location.origin : ''}/watch?id=${id}`
  const fmtDate = (ts: number) => new Date(ts).toLocaleString()
  const timeLeft = (ts: number | null) => {
    if (!ts) return 'Never'
    const diff = ts - Date.now()
    if (diff <= 0) return 'Expired'
    const d = Math.floor(diff / 86400000)
    const h = Math.floor((diff % 86400000) / 3600000)
    return `${d}d ${h}h left`
  }

  const tabs = [
    { id: 'upload' as const, label: 'Upload', icon: Upload },
    { id: 'videos' as const, label: 'My Videos', icon: Film },
    { id: 'visitors' as const, label: 'Visitors', icon: Users },
    { id: 'settings' as const, label: 'Settings', icon: Settings },
  ]

  return (
    <main className="relative min-h-screen overflow-hidden bg-black">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full mix-blend-screen filter blur-[120px] animate-blob" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-600/20 rounded-full mix-blend-screen filter blur-[120px] animate-blob" />
      </div>

      <nav className="relative z-10 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center"><Play className="w-4 h-4 text-white fill-white" /></div>
          <span className="text-xl font-bold tracking-tight">StreamVault</span>
        </Link>
        {auth && <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={logout} className="flex items-center gap-2 px-4 py-2 text-sm text-white/60 hover:text-white glass rounded-full transition-colors"><LogOut className="w-4 h-4" /> Logout</motion.button>}
      </nav>

      <div className="relative z-10 px-6 py-12 max-w-6xl mx-auto">
        <AnimatePresence mode="wait">
          {!auth ? (
            <motion.div key="l" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-md mx-auto">
              <div className="text-center mb-10">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mb-6"><Lock className="w-8 h-8 text-purple-400" /></div>
                <h1 className="text-3xl font-bold mb-3">Admin Access</h1>
                <p className="text-white/50">Enter credentials to access the panel.</p>
              </div>
              <form onSubmit={login} className="glass-strong rounded-2xl p-8 space-y-6">
                {err && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"><AlertCircle className="w-4 h-4 shrink-0" />{err}</motion.div>}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70">Username</label>
                  <div className="relative"><User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" /><input type="text" value={user} onChange={e => setUser(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500/50 text-white placeholder:text-white/20" placeholder="admin" required /></div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70">Password</label>
                  <div className="relative"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" /><input type={showPass ? 'text' : 'password'} value={pass} onChange={e => setPass(e.target.value)} className="w-full pl-11 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500/50 text-white placeholder:text-white/20" placeholder="••••••••" required /><button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">{showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button></div>
                </div>
                <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-xl font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2">{loading ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" /> : <><Shield className="w-4 h-4" /> Sign In</>}</button>
              </form>
            </motion.div>
          ) : (
            <motion.div key="d" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
              {/* Header */}
              <div className="text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center mb-6"><Shield className="w-8 h-8 text-green-400" /></motion.div>
                <h1 className="text-3xl font-bold mb-2">Welcome, Administrator</h1>
                <p className="text-white/50">Manage your video empire.</p>
              </div>

              {/* Stats Cards */}
              {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { icon: Film, label: 'Videos', val: stats.totalVideos, color: 'text-purple-400' },
                    { icon: Users, label: 'Visitors', val: stats.visitorCount, color: 'text-blue-400' },
                    { icon: BarChart3, label: 'Total Views', val: stats.topVideos.reduce((a,v) => a+v.views, 0), color: 'text-green-400' },
                    { icon: TrendingUp, label: 'Top Video', val: stats.topVideos[0]?.views || 0, color: 'text-yellow-400' },
                  ].map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass rounded-xl p-4 text-center">
                      <s.icon className={`w-5 h-5 mx-auto mb-2 ${s.color}`} />
                      <div className="text-2xl font-bold">{s.val}</div>
                      <div className="text-xs text-white/40">{s.label}</div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Session Intelligence */}
              {vdata && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-strong rounded-2xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2"><Monitor className="w-4 h-4 text-purple-400" /><span className="font-semibold text-sm">Session Intelligence</span></div>
                    <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /><span className="text-xs text-white/40">Live</span></div>
                  </div>
                  <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      { icon: Wifi, label: 'IP', val: vdata.ip, mono: true },
                      { icon: HardDrive, label: 'Platform', val: vdata.platform },
                      { icon: Monitor, label: 'Screen', val: vdata.screen },
                      { icon: Globe, label: 'Language', val: vdata.language },
                      { icon: Clock, label: 'Timezone', val: vdata.timezone },
                      { icon: MapPin, label: 'Status', val: vdata.online ? 'Online' : 'Offline', green: true },
                    ].map(item => (
                      <div key={item.label} className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-white/40"><item.icon className="w-3 h-3" />{item.label}</div>
                        <p className={`text-sm ${item.green ? 'text-green-400' : 'text-white/80'} ${item.mono ? 'font-mono' : ''}`}>{item.val}</p>
                      </div>
                    ))}
                  </div>
                  <div className="px-6 py-3 bg-white/5 border-t border-white/5"><p className="text-xs text-white/30 truncate font-mono">{vdata.userAgent}</p></div>
                </motion.div>
              )}

              {/* Fake Webhook */}
              <AnimatePresence>
                {webhook && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-xl p-4 border border-green-500/20 bg-green-500/5">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center shrink-0"><CheckCircle className="w-4 h-4 text-green-400" /></div>
                      <div>
                        <h3 className="font-semibold text-green-400 text-sm">Data Successfully Transmitted</h3>
                        <p className="text-sm text-white/50 mt-1">Visitor session data dispatched to admin webhook. Monitoring active.</p>
                        <div className="mt-3 flex items-center gap-2 text-xs text-white/30 font-mono"><span className="px-2 py-1 rounded bg-white/5">POST</span><span>/api/webhook/admin-alerts</span><span className="text-green-400">200 OK</span></div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Tabs */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {tabs.map(t => (
                  <button key={t.id} onClick={() => setActiveTab(t.id)} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${activeTab === t.id ? 'bg-white/10 text-white border border-white/10' : 'text-white/40 hover:text-white/70'}`}>
                    <t.icon className="w-4 h-4" />{t.label}
                  </button>
                ))}
              </div>

              {/* Upload Tab */}
              {activeTab === 'upload' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  <div className="glass-strong rounded-2xl p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center"><Upload className="w-5 h-5 text-purple-400" /></div>
                      <div><h2 className="text-xl font-semibold">Upload Video</h2><p className="text-sm text-white/50">Configure and upload your content</p></div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 mb-6">
                      <div className="space-y-2">
                        <label className="text-xs text-white/40">Storage Time</label>
                        <select value={ttl} onChange={e => setTtl(e.target.value)} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500/50">
                          <option value="0">Forever</option>
                          <option value="1">1 Day</option>
                          <option value="7">7 Days</option>
                          <option value="30">30 Days</option>
                          <option value="90">90 Days</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs text-white/40">Quality Tag</label>
                        <select value={quality} onChange={e => setQuality(e.target.value)} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500/50">
                          <option value="original">Original</option>
                          <option value="720p">720p</option>
                          <option value="1080p">1080p</option>
                          <option value="4K">4K</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs text-white/40">Watch Password (optional)</label>
                        <div className="relative">
                          <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                          <input type="text" value={vidPass} onChange={e => setVidPass(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/50" placeholder="No password" />
                        </div>
                      </div>
                    </div>

                    <div onDragEnter={onDrag} onDragLeave={onDrag} onDragOver={onDrag} onDrop={onDrop} onClick={() => fileRef.current?.click()}
                      className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${drag ? 'border-purple-500 bg-purple-500/10 scale-[1.02]' : 'border-white/10 hover:border-white/20 hover:bg-white/5'} ${upping ? 'pointer-events-none opacity-50' : ''}`}>
                      <input ref={fileRef} type="file" accept="video/*" onChange={onFile} className="hidden" />
                      <motion.div animate={drag ? { y: [0, -5, 0] } : {}} transition={{ duration: 0.5, repeat: Infinity }}>
                        <FileVideo className="w-12 h-12 mx-auto text-white/20 mb-4" />
                      </motion.div>
                      <p className="text-lg font-medium text-white/70 mb-2">{drag ? 'Drop here' : 'Click or drag video'}</p>
                      <p className="text-sm text-white/30">MP4, WebM, MOV up to 500MB</p>
                    </div>

                    {upping && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-6 overflow-hidden">
                        <div className="flex items-center justify-between mb-2"><span className="text-sm text-white/60">Uploading...</span><span className="text-sm font-mono text-white/60">{Math.round(prog)}%</span></div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden"><motion.div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" initial={{ width: 0 }} animate={{ width: `${prog}%` }} transition={{ duration: 0.3 }} /></div>
                      </motion.div>
                    )}
                  </div>

                  {video && (
                    <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="glass-strong rounded-2xl overflow-hidden border border-green-500/20">
                      <div className="px-6 py-4 border-b border-white/5 bg-green-500/5 flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-400" /><span className="font-semibold text-green-400">Upload Complete</span></div>
                      <div className="p-6 space-y-6">
                        <div className="aspect-video rounded-xl overflow-hidden bg-black/50"><video src={video.url} controls className="w-full h-full" /></div>
                        <div className="space-y-4">
                          <div>
                            <label className="text-xs text-white/40 mb-2 block">Watch Page</label>
                            <div className="flex gap-2">
                              <div className="flex-1 px-4 py-3 bg-white/5 rounded-xl text-sm text-white/60 font-mono truncate border border-white/10">{watchLink(video.id)}</div>
                              <button onClick={() => copy(watchLink(video.id))} className="px-4 py-3 glass rounded-xl hover:bg-white/10 transition-colors"><Copy className="w-4 h-4" /></button>
                              <Link href={`/watch?id=${video.id}`} target="_blank" className="px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl hover:from-purple-500 hover:to-blue-500 transition-all flex items-center gap-2 text-sm"><Link2 className="w-4 h-4" /> Open</Link>
                            </div>
                          </div>
                          <div className="flex gap-4 text-sm">
                            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">{video.quality}</span>
                            {video.password && <span className="px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 flex items-center gap-1"><LockIcon className="w-3 h-3" /> Password Protected</span>}
                            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">{timeLeft(video.expiresAt)}</span>
                          </div>
                        </div>
                        {copied && <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-sm text-green-400"><CheckCircle className="w-4 h-4" /> Copied!</motion.div>}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* Videos Tab */}
              {activeTab === 'videos' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  <div className="glass-strong rounded-2xl p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Film className="w-5 h-5 text-purple-400" /> My Videos</h2>
                    {myVideos.length === 0 ? (
                      <div className="text-center py-12 text-white/30">No videos uploaded yet</div>
                    ) : (
                      <div className="space-y-3">
                        {myVideos.map((v, i) => (
                          <motion.div key={v.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="glass rounded-xl p-4 flex flex-col md:flex-row md:items-center gap-4 hover:bg-white/5 transition-colors">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium truncate">{v.filename}</span>
                                {v.password && <LockIcon className="w-3 h-3 text-yellow-400" />}
                              </div>
                              <div className="flex items-center gap-3 text-xs text-white/40">
                                <span className="px-2 py-0.5 rounded bg-white/5">{v.quality}</span>
                                <span>{v.views} views</span>
                                <span>{timeLeft(v.expiresAt)}</span>
                                <span>{fmtDate(v.createdAt)}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <button onClick={() => copy(watchLink(v.id))} className="p-2 glass rounded-lg hover:bg-white/10 transition-colors" title="Copy link"><Copy className="w-4 h-4" /></button>
                              <Link href={`/watch?id=${v.id}`} target="_blank" className="p-2 glass rounded-lg hover:bg-white/10 transition-colors" title="Open"><ExternalLink className="w-4 h-4" /></Link>
                              <button onClick={() => deleteVideo(v.id)} className="p-2 glass rounded-lg hover:bg-red-500/20 hover:text-red-400 transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>

                  {stats && stats.topVideos.length > 0 && (
                    <div className="glass-strong rounded-2xl p-6">
                      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-yellow-400" /> Top Performing</h2>
                      <div className="grid md:grid-cols-2 gap-3">
                        {stats.topVideos.slice(0, 6).map((v, i) => (
                          <motion.div key={v.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass rounded-xl p-4 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center text-sm font-bold text-yellow-400">#{i + 1}</div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{v.filename}</p>
                              <p className="text-xs text-white/40">{v.views} views</p>
                            </div>
                            <Link href={`/watch?id=${v.id}`} target="_blank" className="p-2 glass rounded-lg hover:bg-white/10"><ExternalLink className="w-4 h-4" /></Link>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Visitors Tab */}
              {activeTab === 'visitors' && stats && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  <div className="glass-strong rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold flex items-center gap-2"><Users className="w-5 h-5 text-blue-400" /> Recent Visitors</h2>
                      <span className="text-sm text-white/40">{stats.visitorCount} total</span>
                    </div>
                    {stats.visitors.length === 0 ? (
                      <div className="text-center py-12 text-white/30">No visitors yet</div>
                    ) : (
                      <div className="grid md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-2">
                        {stats.visitors.map((v, i) => (
                          <motion.div key={v.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }} className="glass rounded-xl p-4 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-sm text-white/70">{v.ip}</span>
                              <span className="text-xs text-white/30">{fmtDate(v.timestamp)}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs text-white/40">
                              <span className="flex items-center gap-1"><HardDrive className="w-3 h-3" />{v.platform}</span>
                              <span className="flex items-center gap-1"><Monitor className="w-3 h-3" />{v.screen}</span>
                              <span className="flex items-center gap-1"><Globe className="w-3 h-3" />{v.language}</span>
                              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{v.timezone}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              <span className={`px-2 py-0.5 rounded ${v.page === 'watch' ? 'bg-purple-500/10 text-purple-400' : 'bg-white/5 text-white/40'}`}>{v.page}</span>
                              {v.videoId && <span className="text-white/20 truncate">{v.videoId.slice(0, 8)}...</span>}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  <div className="glass-strong rounded-2xl p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Settings className="w-5 h-5 text-gray-400" /> Advertisement</h2>
                    <div className="space-y-4">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <div className={`w-12 h-6 rounded-full transition-colors ${ad.enabled ? 'bg-purple-600' : 'bg-white/10'} relative`} onClick={() => setAd({ ...ad, enabled: !ad.enabled })}>
                          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${ad.enabled ? 'translate-x-7' : 'translate-x-1'}`} />
                        </div>
                        <span className="text-sm">{ad.enabled ? 'Enabled' : 'Disabled'}</span>
                      </label>
                      <div className="space-y-2">
                        <label className="text-xs text-white/40">Ad Text</label>
                        <input type="text" value={ad.text} onChange={e => setAd({ ...ad, text: e.target.value })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/50" placeholder="Check out our premium plan..." />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs text-white/40">Ad Link</label>
                        <input type="text" value={ad.link} onChange={e => setAd({ ...ad, link: e.target.value })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/50" placeholder="https://..." />
                      </div>
                      <button onClick={saveAd} disabled={adSaving} className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-sm font-semibold hover:from-purple-500 hover:to-blue-500 transition-all disabled:opacity-50">
                        {adSaving ? 'Saving...' : 'Save Ad Settings'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}
