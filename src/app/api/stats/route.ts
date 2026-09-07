import { NextRequest, NextResponse } from 'next/server';
import { getAllMedia, getAllNotes } from '@/lib/storage';
import { calculateVaultStats } from '@/lib/stats';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get('year');
    const targetYear = yearParam ? parseInt(yearParam, 10) : new Date().getFullYear();

    const media = await getAllMedia();
    const notes = await getAllNotes();

    const stats = calculateVaultStats(media, notes, targetYear);
    return NextResponse.json({ stats });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to calculate stats' }, { status: 500 });
  }
}
