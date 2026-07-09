import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
const db = require('@/lib/db');

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');

    if (error) {
      return NextResponse.redirect(new URL('/login?error=' + encodeURIComponent(error), request.url));
    }

    if (!code) {
      return NextResponse.redirect(new URL('/login?error=missing_code', request.url));
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = 'http://localhost:3000/api/auth/google/callback';

    // Exchange code for token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      })
    });

    if (!tokenRes.ok) {
      console.error('Google Token Error:', await tokenRes.text());
      return NextResponse.redirect(new URL('/login?error=google_token_failed', request.url));
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // Get user info
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!userRes.ok) {
      return NextResponse.redirect(new URL('/login?error=google_user_failed', request.url));
    }

    const googleUser = await userRes.json();
    
    // Check if user exists by Google ID
    let user = await db.getUserByProviderId('google', googleUser.id);
    
    if (!user) {
      // Check if user exists by email
      const email = googleUser.email;
      if (!email) {
        return NextResponse.redirect(new URL('/login?error=google_no_email', request.url));
      }
      
      const existingUser = await db.getUserByEmail(email);
      if (existingUser) {
        return NextResponse.redirect(new URL('/login?error=email_already_used', request.url));
      }

      // Create new OAuth user
      user = await db.createUserOAuth(email, googleUser.name || googleUser.given_name, 'google', googleUser.id, googleUser.picture);
    }

    // Create session
    const { sessionId, expiresAt } = await db.createSession(user.id);
    const cookieStore = await cookies();
    cookieStore.set('session_id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: new Date(expiresAt)
    });

    return NextResponse.redirect(new URL('/dashboard', request.url));

  } catch (err) {
    console.error('Google Auth Error:', err);
    return NextResponse.redirect(new URL('/login?error=internal_error', request.url));
  }
}

