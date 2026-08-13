import { NextResponse } from 'next/server'
import { DB } from '@/lib/db'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (id) {
    const v = DB.getVideo(id)
    if (!v) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(v)
  }
  return NextResponse.json({ videos: DB.getVideos() })
}

export async function DELETE(request: Request) {
  if (!request.headers.get('cookie')?.includes('admin_session=ok')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { id } = await request.json()
    DB.deleteVideo(id)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
}