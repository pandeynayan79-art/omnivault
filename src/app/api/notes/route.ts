import { NextRequest, NextResponse } from 'next/server';
import { getNotesForUser, saveNote, getSessionUser } from '@/lib/storage';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tag = searchParams.get('tag');
    const isPublicOnly = searchParams.get('publicOnly') === 'true';
    const requestedScope = searchParams.get('scope');

    // Identify user from session cookie
    const token = request.cookies.get('omnivault_session')?.value;
    const currentUser = token ? await getSessionUser(token) : null;

    const scope: 'mine' | 'community' = currentUser
      ? (requestedScope === 'community' ? 'community' : 'mine')
      : 'community';

    let notes = await getNotesForUser(currentUser, scope);

    if (tag) {
      const cleanTag = tag.toLowerCase();
      notes = notes.filter(n => n.tags.some(t => t.toLowerCase() === cleanTag));
    }

    if (isPublicOnly) {
      notes = notes.filter(n => n.isPublic);
    }

    return NextResponse.json({ notes, scope });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch notes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.title && !body.content) {
      return NextResponse.json({ error: 'Title or content is required' }, { status: 400 });
    }

    const token = request.cookies.get('omnivault_session')?.value;
    const currentUser = token ? await getSessionUser(token) : null;

    const payload = {
      ...body,
      userId: currentUser ? currentUser.id : body.userId,
      authorName: currentUser ? currentUser.name : (body.authorName || 'Guest Contributor'),
    };

    const saved = await saveNote(payload);
    return NextResponse.json({ note: saved }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to save note' }, { status: 500 });
  }
}
