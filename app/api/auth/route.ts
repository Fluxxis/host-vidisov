import { NextResponse } from 'next/server'
const ADMIN_USER = 'admin'
const ADMIN_PASS = 'JsJuwbuawu71Jw(-$'

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      const res = NextResponse.json({ success: true })
      res.cookies.set('admin_session', 'ok', { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 86400, path: '/' })
      return res
    }
    return NextResponse.json({ success: false }, { status: 401 })
  } catch { return NextResponse.json({ success: false }, { status: 400 }) }
}

export async function DELETE() {
  const res = NextResponse.json({ success: true })
  res.cookies.set('admin_session', '', { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 0, path: '/' })
  return res
}