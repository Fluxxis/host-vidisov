import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'

// ═══════════════════════════════════════════════════════════════
// ЗАМЕНИ ЭТУ СТРОКУ НА СВОЙ BLOB_READ_WRITE_TOKEN из Vercel Dashboard
// Vercel → Storage → Blob → .env.local → скопируй значение
// ═══════════════════════════════════════════════════════════════
const BLOB_TOKEN = 'vercel_blob_rw_20ndb2ApQAqGqAG0_QjrgmbXLeKPCVpqyh8MXWcA7At79Vf'

export async function POST(request: Request) {
  try {
    if (!request.headers.get('cookie')?.includes('admin_session=ok')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const formData = await request.formData()
    const file = formData.get('file') as File
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })
    if (!file.type.startsWith('video/')) return NextResponse.json({ error: 'Not a video' }, { status: 400 })

    const blob = await put(file.name, file, { access: 'public', token: BLOB_TOKEN })
    return NextResponse.json({ success: true, url: blob.url, pathname: blob.pathname })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}