import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'
import { DB } from '@/lib/db'

// ═══════════════════════════════════════════════════════════════
// ЗАМЕНИ ЭТУ СТРОКУ НА СВОЙ BLOB_READ_WRITE_TOKEN
// ═══════════════════════════════════════════════════════════════
const BLOB_TOKEN = 'vercel_blob_rw_20ndb2apqaqgqag0_ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ'

export async function POST(request: Request) {
  try {
    if (!request.headers.get('cookie')?.includes('admin_session=ok')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const ttl = formData.get('ttl') as string || '0'
    const quality = formData.get('quality') as string || 'original'
    const password = (formData.get('password') as string) || ''

    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })
    if (!file.type.startsWith('video/')) return NextResponse.json({ error: 'Not a video' }, { status: 400 })

    const blob = await put(file.name, file, { access: 'public', token: BLOB_TOKEN })

    const now = Date.now()
    const expiresAt = ttl === '0' ? null : now + parseInt(ttl) * 24 * 60 * 60 * 1000

    const video = DB.addVideo({
      id: crypto.randomUUID(),
      url: blob.url,
      filename: file.name,
      createdAt: now,
      expiresAt,
      quality,
      password: password || null,
      views: 0,
      lastViewedAt: null,
    })

    return NextResponse.json({ success: true, video })
  } catch (e: any) {
    console.error('Upload error:', e)
    return NextResponse.json({ error: e.message || 'Upload failed' }, { status: 500 })
  }
}