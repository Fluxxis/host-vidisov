import { NextResponse } from 'next/server'
import { DB } from '@/lib/db'

export async function GET() {
  return NextResponse.json(DB.getAd())
}

export async function POST(request: Request) {
  if (!request.headers.get('cookie')?.includes('admin_session=ok')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const body = await request.json()
    DB.setAd(body)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
}