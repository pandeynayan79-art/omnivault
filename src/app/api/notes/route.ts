import { NextRequest, NextResponse } from 'next/server';
import { getAllNotes, saveNote } from '@/lib/storage';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tag = searchParams.get('tag');
    const isPublicOnly = searchParams.get('publicOnly') === 'true';

    let notes = await getAllNotes();

    if (tag) {
      const cleanTag = tag.toLowerCase();
      notes = notes.filter(n => n.tags.some(t => t.toLowerCase() === cleanTag));
    }

    if (isPublicOnly) {
      notes = notes.filter(n => n.isPublic);
    }

    return NextResponse.json({ notes });
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

    const saved = await saveNote(body);
    return NextResponse.json({ note: saved }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to save note' }, { status: 500 });
  }
}
