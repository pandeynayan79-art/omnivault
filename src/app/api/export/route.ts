import { NextRequest, NextResponse } from 'next/server';
import { getFullVaultDump, restoreVaultDump } from '@/lib/storage';

export async function GET() {
  try {
    const dump = await getFullVaultDump();
    return new NextResponse(JSON.stringify(dump, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="omnivault-backup-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Export failed' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const success = await restoreVaultDump(body);
    if (!success) {
      return NextResponse.json({ error: 'Invalid backup file format' }, { status: 400 });
    }
    return NextResponse.json({ success: true, message: 'Vault restored successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Import failed' }, { status: 500 });
  }
}
