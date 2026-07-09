import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import * as db from '@/lib/db';
import { sendWelcomeEmail } from '@/lib/email';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const existingUser = await db.getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    // Auto-generate username from email
    const username = email.split('@')[0];

    const user = await db.createUser(email, username, password);
    const { sessionId, expiresAt } = await db.createSession(user.id);

    const cookieStore = await cookies();
    cookieStore.set('session_id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(expiresAt),
      path: '/',
    });

    // Send welcome email async (don't await so we don't block response)
    sendWelcomeEmail(email, username).catch(console.error);

    return NextResponse.json({ user });
  } catch (err) {
    console.error('[API /auth/register]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

