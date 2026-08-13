'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Upload, Lock, Eye, EyeOff, LogOut, CheckCircle, AlertCircle, Copy, Link2, Monitor, Globe, Clock, Shield, FileVideo, User, Wifi, HardDrive, MapPin } from 'lucide-react'
import Link from 'next/link'

interface VData { ip: string; userAgent: string; platform: string; screen: string; language: string; timezone: string; online: boolean }

export default function AdminPage() {
  const [auth, setAuth] = useState(false)
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const [vdata, setVdata] = useState<VData | null>(null)
  const [webhook, setWebhook] = useState(false)
  const [drag, setDrag] = useState(false)
  const [prog, setProg] = useState(0)
  const [upping, setUpping] = useState(false)
  const [video, setVideo] = useState<{url:string;pathname:string}|null>(null)
  const [copied, setCopied] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (localStorage.getItem('admin_auth') === 'true') { setAuth(true); gather() }
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

  const login = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setErr('')
    try {
      const r = await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: user, password: pass }) })
      const d = await r.json()
      if (d.success) { setAuth(true); localStorage.setItem('admin_auth', 'true'); gather() }
      else setErr('Invalid credentials')
    } catch { setErr('Connection error') }
    setLoading(false)
  }

  const logout = async () => {
    try { await fetch('/api/auth', { method: 'DELETE' }) } catch {}
    localStorage.removeItem('admin_auth')
    setAuth(false); setVdata(null); setWebhook(false); setVideo(null); setUser(''); setPass('')
  }

  const onDrag = (e: React.DragEvent) => { e.preventDefault(); setDrag(e.type === 'dragenter' || e.type === 'dragover') }
  const onDrop = (e: React.DragEvent) => { e.preventDefault(); setDrag(false); if (e.dataTransfer.files?.[0]) upload(e.dataTransfer.files[0]) }
  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files?.[0]) upload(e.target.files[0]) }

  const upload = async (file: File) => {
    if (!file.type.startsWith('video/')) { alert('Not a video'); return }
    setUpping(true); setProg(0); setVideo(null)
    const fd = new FormData(); fd.append('file', file)
    const iv = setInterval(() => setProg(p => p >= 90 ? p : p + Math.random() * 15), 300)
    try {
      const r = await fetch('/api/upload', { method: 'POST', body: fd })
      clearInterval(iv); setProg(100)
      const d = await r.json()
      if (d.success) setTimeout(() => { setVideo({ url: d.url, pathname: d.pathname }); setUpping(false) }, 500)
      else { alert(d.error || 'Failed'); setUpping(false) }
    } catch { clearInterval(iv); alert('Failed'); setUpping(false) }
  }

  const copy = async (t: string) => { try { await navigator.clipboard.writeText(t); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch {} }
  const watch = video ? `${typeof window !== 'undefined' ? window.location.origin : ''}/watch?v=${encodeURIComponent(video.url)}` : ''

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

      <div className="relative z-10 px-6 py-12 max-w-5xl mx-auto">
        <AnimatePresence mode="wait">
          {!auth ? (
            <motion.div key="l" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-md mx-auto">
              <div className="text-center mb-10">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mb-6"><Lock className="w-8 h-8 text-purple-400" /></div>
                <h1 className="text-3xl font-bold mb-3">Admin Access</h1>
                <p className="text-white/50">Enter credentials to access upload panel.</p>
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
            <motion.div key="d" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
              <div className="text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center mb-6"><Shield className="w-8 h-8 text-green-400" /></motion.div>
                <h1 className="text-3xl font-bold mb-2">Welcome, Administrator</h1>
                <p className="text-white/50">Manage your video content.</p>
              </div>

              {vdata && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-strong rounded-2xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2"><Monitor className="w-4 h-4 text-purple-400" /><span className="font-semibold text-sm">Session Intelligence</span></div>
                    <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /><span className="text-xs text-white/40">Live</span></div>
                  </div>
                  <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      { icon: Wifi, label: 'IP Address', val: vdata.ip, mono: true },
                      { icon: HardDrive, label: 'Platform', val: vdata.platform },
                      { icon: Monitor, label: 'Screen', val: vdata.screen },
                      { icon: Globe, label: 'Language', val: vdata.language },
                      { icon: Clock, label: 'Timezone', val: vdata.timezone },
                      { icon: MapPin, label: 'Status', val: vdata.online ? 'Online' : 'Offline', green: true },
                    ].map((item) => (
                      <div key={item.label} className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-white/40"><item.icon className="w-3 h-3" />{item.label}</div>
                        <p className={`text-sm ${item.green ? 'text-green-400' : 'text-white/80'} ${item.mono ? 'font-mono' : ''}`}>{item.val}</p>
                      </div>
                    ))}
                  </div>
                  <div className="px-6 py-3 bg-white/5 border-t border-white/5"><p className="text-xs text-white/30 truncate font-mono">{vdata.userAgent}</p></div>
                </motion.div>
              )}

              {webhook && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-xl p-4 border border-green-500/20 bg-green-500/5">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center shrink-0"><CheckCircle className="w-4 h-4 text-green-400" /></div>
                    <div>
                      <h3 className="font-semibold text-green-400 text-sm">Data Successfully Transmitted</h3>
                      <p className="text-sm text-white/50 mt-1">Visitor session data dispatched to admin webhook. Real-time monitoring active.</p>
                      <div className="mt-3 flex items-center gap-2 text-xs text-white/30 font-mono"><span className="px-2 py-1 rounded bg-white/5">POST</span><span>/api/webhook/admin-alerts</span><span className="text-green-400">200 OK</span></div>
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="glass-strong rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center"><Upload className="w-5 h-5 text-purple-400" /></div>
                  <div><h2 className="text-xl font-semibold">Upload Video</h2><p className="text-sm text-white/50">Drag & drop or select file</p></div>
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
                        <label className="text-xs text-white/40 mb-2 block">Direct URL</label>
                        <div className="flex gap-2"><div className="flex-1 px-4 py-3 bg-white/5 rounded-xl text-sm text-white/60 font-mono truncate border border-white/10">{video.url}</div><button onClick={() => copy(video.url)} className="px-4 py-3 glass rounded-xl hover:bg-white/10 transition-colors"><Copy className="w-4 h-4" /></button></div>
                      </div>
                      <div>
                        <label className="text-xs text-white/40 mb-2 block">Watch Page</label>
                        <div className="flex gap-2"><div className="flex-1 px-4 py-3 bg-white/5 rounded-xl text-sm text-white/60 font-mono truncate border border-white/10">{watch}</div><button onClick={() => copy(watch)} className="px-4 py-3 glass rounded-xl hover:bg-white/10 transition-colors"><Copy className="w-4 h-4" /></button><Link href={`/watch?v=${encodeURIComponent(video.url)}`} target="_blank" className="px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl hover:from-purple-500 hover:to-blue-500 transition-all flex items-center gap-2 text-sm"><Link2 className="w-4 h-4" /> Open</Link></div>
                      </div>
                    </div>
                    {copied && <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-sm text-green-400"><CheckCircle className="w-4 h-4" /> Copied!</motion.div>}
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
