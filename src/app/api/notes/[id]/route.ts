import { NextRequest, NextResponse } from 'next/server';
import { getNoteById, saveNote, deleteNote } from '@/lib/storage';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const note = await getNoteById(params.id);
    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }
    return NextResponse.json({ note });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to get note' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const updated = await saveNote({ ...body, id: params.id });
    return NextResponse.json({ note: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update note' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = await deleteNote(params.id);
    if (!success) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete note' }, { status: 500 });
  }
}
