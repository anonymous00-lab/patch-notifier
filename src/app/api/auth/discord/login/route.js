import { NextResponse } from 'next/server';

export async function GET(request) {
  const clientId = process.env.DISCORD_CLIENT_ID || process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID;
  const url = new URL(request.url);
  const redirectUri = url.origin + '/api/auth/discord/callback';
  
  if (!clientId) {
    return NextResponse.json({ error: 'Discord Client ID not configured' }, { status: 500 });
  }

  const scopes = ['identify', 'email'];
  const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scopes.join(' '))}&prompt=consent`;

  return NextResponse.redirect(authUrl);
}

