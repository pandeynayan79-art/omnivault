import { NextRequest, NextResponse } from 'next/server';
import { getMediaById, saveMediaItem, deleteMediaItem } from '@/lib/storage';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const item = await getMediaById(params.id);
    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    return NextResponse.json({ media: item });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to get media item' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const updated = await saveMediaItem({ ...body, id: params.id });
    return NextResponse.json({ media: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update media item' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = await deleteMediaItem(params.id);
    if (!success) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete media item' }, { status: 500 });
  }
}
