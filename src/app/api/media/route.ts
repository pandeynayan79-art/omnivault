import { NextRequest, NextResponse } from 'next/server';
import { getMediaForUser, saveMediaItem, getSessionUser } from '@/lib/storage';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const isPublicOnly = searchParams.get('publicOnly') === 'true';
    const requestedScope = searchParams.get('scope');

    // Identify user from session cookie
    const token = request.cookies.get('omnivault_session')?.value;
    const currentUser = token ? await getSessionUser(token) : null;

    // Visitors always see community view. Logged-in users default to 'mine' unless 'community' is requested.
    const scope: 'mine' | 'community' = currentUser
      ? (requestedScope === 'community' ? 'community' : 'mine')
      : 'community';

    let media = await getMediaForUser(currentUser, scope);

    if (type && type !== 'all') {
      media = media.filter(m => m.type === type);
    }
    if (status && status !== 'all') {
      media = media.filter(m => m.status === status);
    }
    if (isPublicOnly) {
      media = media.filter(m => m.isPublic);
    }

    return NextResponse.json({ media, scope });
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

    const token = request.cookies.get('omnivault_session')?.value;
    const currentUser = token ? await getSessionUser(token) : null;

    const payload = {
      ...body,
      userId: currentUser ? currentUser.id : body.userId,
      addedBy: currentUser ? currentUser.name : (body.addedBy || 'Guest Contributor'),
    };

    const saved = await saveMediaItem(payload);
    return NextResponse.json({ media: saved }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to save media item' }, { status: 500 });
  }
}
