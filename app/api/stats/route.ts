import { NextResponse } from 'next/server'
import { DB } from '@/lib/db'

export async function GET() {
  return NextResponse.json({
    visitors: DB.getVisitors(50),
    visitorCount: DB.getVisitorCount(),
    topVideos: DB.getTopVideos(10),
    totalVideos: DB.getVideos().length,
  })
}