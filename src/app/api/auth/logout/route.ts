import { NextRequest, NextResponse } from 'next/server';
import { deleteSession } from '@/lib/storage';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('omnivault_session')?.value;
    if (token) {
      await deleteSession(token);
    }

    const response = NextResponse.json({ success: true, message: 'Logged out successfully.' });
    response.cookies.set('omnivault_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Logout failed' }, { status: 500 });
  }
}
