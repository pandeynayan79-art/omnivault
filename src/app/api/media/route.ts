import { NextRequest, NextResponse } from 'next/server';
import { getAllMedia, saveMediaItem } from '@/lib/storage';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const isPublicOnly = searchParams.get('publicOnly') === 'true';

    let media = await getAllMedia();

    if (type && type !== 'all') {
      media = media.filter(m => m.type === type);
    }
    if (status && status !== 'all') {
      media = media.filter(m => m.status === status);
    }
    if (isPublicOnly) {
      media = media.filter(m => m.isPublic);
    }

    return NextResponse.json({ media });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch media' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const saved = await saveMediaItem(body);
    return NextResponse.json({ media: saved }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to save media item' }, { status: 500 });
  }
}
