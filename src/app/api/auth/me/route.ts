import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/storage';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('omnivault_session')?.value;
    if (!token) {
      return NextResponse.json({ user: null });
    }

    const user = await getSessionUser(token);
    return NextResponse.json({ user });
  } catch (err: any) {
    return NextResponse.json({ user: null, error: err.message }, { status: 500 });
  }
}
