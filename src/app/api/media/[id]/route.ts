import { NextRequest, NextResponse } from 'next/server';
import { getMediaById, saveMediaItem, deleteMediaItem, getSessionUser, canUserModifyMedia } from '@/lib/storage';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const item = await getMediaById(params.id);
    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // If private, ensure requesting user owns it
    if (!item.isPublic) {
      const token = request.cookies.get('omnivault_session')?.value;
      const currentUser = token ? await getSessionUser(token) : null;
      if (!canUserModifyMedia(currentUser, item)) {
        return NextResponse.json({ error: 'Unauthorized to view this private item' }, { status: 403 });
      }
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
    const item = await getMediaById(params.id);
    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const token = request.cookies.get('omnivault_session')?.value;
    const currentUser = token ? await getSessionUser(token) : null;
    if (!canUserModifyMedia(currentUser, item)) {
      return NextResponse.json({ error: 'You do not have permission to modify this item' }, { status: 403 });
    }

    const body = await request.json();
    const updated = await saveMediaItem({ ...body, id: params.id, userId: item.userId });
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
    const item = await getMediaById(params.id);
    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const token = request.cookies.get('omnivault_session')?.value;
    const currentUser = token ? await getSessionUser(token) : null;
    if (!canUserModifyMedia(currentUser, item)) {
      return NextResponse.json({ error: 'You do not have permission to delete this item' }, { status: 403 });
    }

    const success = await deleteMediaItem(params.id);
    if (!success) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete media item' }, { status: 500 });
  }
}
