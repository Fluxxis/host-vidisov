import fs from 'fs'
import path from 'path'

const DB_FILE = path.join(process.cwd(), 'db.json')

export interface VideoRecord {
  id: string
  url: string
  filename: string
  createdAt: number
  expiresAt: number | null
  quality: string
  password: string | null
  views: number
  lastViewedAt: number | null
}

export interface VisitorRecord {
  id: string
  ip: string
  userAgent: string
  platform: string
  screen: string
  language: string
  timezone: string
  timestamp: number
  videoId: string | null
  page: string
}

export interface AdConfig {
  enabled: boolean
  text: string
  link: string
}

interface DB {
  videos: VideoRecord[]
  visitors: VisitorRecord[]
  ad: AdConfig
}

let db: DB = { videos: [], visitors: [], ad: { enabled: false, text: '', link: '' } }

function load() {
  try {
    if (fs.existsSync(DB_FILE)) {
      db = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'))
    }
  } catch { /* ignore */ }
}

function save() {
  try { fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2)) } catch { /* ignore */ }
}

load()

export const DB = {
  addVideo(v: VideoRecord) {
    db.videos.push(v)
    save()
    return v
  },
  getVideos() {
    const now = Date.now()
    db.videos = db.videos.filter(v => !v.expiresAt || v.expiresAt > now)
    return db.videos
  },
  getVideo(id: string) {
    const now = Date.now()
    const v = db.videos.find(x => x.id === id)
    if (!v) return null
    if (v.expiresAt && v.expiresAt <= now) return null
    return v
  },
  incrementViews(id: string) {
    const v = db.videos.find(x => x.id === id)
    if (v) { v.views++; v.lastViewedAt = Date.now(); save() }
  },
  deleteVideo(id: string) {
    db.videos = db.videos.filter(x => x.id !== id)
    save()
  },
  addVisitor(v: VisitorRecord) {
    db.visitors.push(v)
    save()
  },
  getVisitors(limit = 100) {
    return db.visitors.slice().reverse().slice(0, limit)
  },
  getVisitorCount() {
    return db.visitors.length
  },
  getTopVideos(limit = 10) {
    return [...db.videos].sort((a, b) => b.views - a.views).slice(0, limit)
  },
  getAd(): AdConfig {
    return db.ad
  },
  setAd(ad: AdConfig) {
    db.ad = ad
    save()
  },
}
