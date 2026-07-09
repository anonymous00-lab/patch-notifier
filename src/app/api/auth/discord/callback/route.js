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

    const clientId = process.env.DISCORD_CLIENT_ID || process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID;
    const clientSecret = process.env.DISCORD_CLIENT_SECRET;
    const redirectUri = url.origin + '/api/auth/discord/callback';

    // Exchange code for token
    const tokenParams = new URLSearchParams();
    tokenParams.append('client_id', clientId);
    tokenParams.append('client_secret', clientSecret);
    tokenParams.append('grant_type', 'authorization_code');
    tokenParams.append('code', code);
    tokenParams.append('redirect_uri', redirectUri);

    const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: tokenParams.toString()
    });

    if (!tokenRes.ok) {
      console.error('Discord Token Error:', await tokenRes.text());
      return NextResponse.redirect(new URL('/login?error=discord_token_failed', request.url));
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // Get user info
    const userRes = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!userRes.ok) {
      return NextResponse.redirect(new URL('/login?error=discord_user_failed', request.url));
    }

    const discordUser = await userRes.json();
    
    // Check if user exists by Discord ID
    let user = await db.getUserByProviderId('discord', discordUser.id);
    
    if (!user) {
      // Check if user exists by email
      const email = discordUser.email;
      if (!email) {
        return NextResponse.redirect(new URL('/login?error=discord_no_email', request.url));
      }
      
      const existingUser = await db.getUserByEmail(email);
      if (existingUser) {
        // Link discord account to existing email
        // For simplicity we could just fail, or we can update the user.
        // Let's just create a new one for now or fail if email exists.
        return NextResponse.redirect(new URL('/login?error=email_already_used', request.url));
      }

      // Create new OAuth user
      const avatarUrl = discordUser.avatar ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png` : null;
      user = await db.createUserOAuth(email, discordUser.username, 'discord', discordUser.id, avatarUrl);
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
    console.error('Discord Auth Error:', err);
    return NextResponse.redirect(new URL('/login?error=internal_error', request.url));
  }
}

