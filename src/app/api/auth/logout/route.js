import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import * as db from '@/lib/db';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;

    if (sessionId) {
      await db.deleteSession(sessionId);
    }

    cookieStore.delete('session_id');

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[API /auth/logout]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

