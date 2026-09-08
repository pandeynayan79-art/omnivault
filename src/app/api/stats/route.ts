import { NextRequest, NextResponse } from 'next/server';
import { getMediaForUser, getNotesForUser, getSessionUser } from '@/lib/storage';
import { calculateVaultStats } from '@/lib/stats';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get('year');
    const targetYear = yearParam ? parseInt(yearParam, 10) : new Date().getFullYear();
    const requestedScope = searchParams.get('scope');

    // Identify user from session cookie
    const token = request.cookies.get('omnivault_session')?.value;
    const currentUser = token ? await getSessionUser(token) : null;

    const scope: 'mine' | 'community' = currentUser
      ? (requestedScope === 'community' ? 'community' : 'mine')
      : 'community';

    const media = await getMediaForUser(currentUser, scope);
    const notes = await getNotesForUser(currentUser, scope);

    const stats = calculateVaultStats(media, notes, targetYear);
    return NextResponse.json({ stats, scope });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to calculate stats' }, { status: 500 });
  }
}
