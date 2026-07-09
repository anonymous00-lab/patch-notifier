import { NextResponse } from 'next/server';
import * as db from '@/lib/db';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(request) {
  try {
    const { action, email, token, newPassword } = await request.json();

    if (action === 'request') {
      if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 });
      const user = db.getUserByEmail(email);
      if (user) {
        const resetToken = db.createPasswordResetToken(user.id);
        sendPasswordResetEmail(email, resetToken).catch(console.error);
      }
      // Always return success even if email not found to prevent user enumeration
      return NextResponse.json({ success: true, message: 'If that email exists, we have sent a reset link.' });
    }
    
    if (action === 'reset') {
      if (!token || !newPassword) return NextResponse.json({ error: 'Missing token or password' }, { status: 400 });
      if (newPassword.length < 6) return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
      
      const success = db.resetPassword(token, newPassword);
      if (!success) {
        return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    console.error('[API /auth/reset-password]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
