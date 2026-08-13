import { NextResponse } from 'next/server'
import { DB } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : '127.0.0.1'

    DB.addVisitor({
      id: crypto.randomUUID(),
      ip,
      userAgent: body.userAgent || '',
      platform: body.platform || '',
      screen: body.screen || '',
      language: body.language || '',
      timezone: body.timezone || '',
      timestamp: Date.now(),
      videoId: body.videoId || null,
      page: body.page || 'unknown',
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false }, { status: 400 })
  }
}