import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
const db = require('@/lib/db');

export async function GET(request) {
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

    const servers = await db.getServersForUser(session.user_id);
    return NextResponse.json(servers);
  } catch (err) {
    console.error('[API] Get Servers Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

