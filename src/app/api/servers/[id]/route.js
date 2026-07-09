import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
const db = require('@/lib/db');

export async function DELETE(request, { params }) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;
    if (!sessionId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await db.getSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    
    await db.deleteServer(id, session.user_id);
    
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Delete server error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
