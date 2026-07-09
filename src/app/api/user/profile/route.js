import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import * as db from '@/lib/db';

export async function PUT(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email, username } = await request.json();
    if (!email || !username) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Check if new email is already taken by someone else
    const existing = db.getUserByEmail(email);
    if (existing && existing.id !== user.id) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
    }

    const updatedUser = db.updateUserProfile(user.id, email, username);

    return NextResponse.json({ user: updatedUser });
  } catch (err) {
    console.error('[API /user/profile]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
