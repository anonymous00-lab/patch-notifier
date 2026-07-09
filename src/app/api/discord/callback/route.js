import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN; // Required to fetch guild info
const db = require('@/lib/db');

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const guildId = url.searchParams.get('guild_id');
    const error = url.searchParams.get('error');

    if (error) {
      console.error('[Discord Bot Auth Error]', error);
      return NextResponse.redirect(new URL('/dashboard?error=discord_auth_failed', request.url));
    }

    if (!guildId) {
      // Maybe they didn't authorize a guild
      return NextResponse.redirect(new URL('/dashboard?error=missing_guild', request.url));
    }

    // Ensure user is logged in
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;
    if (!sessionId) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const session = await db.getSession(sessionId);
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    if (!DISCORD_BOT_TOKEN) {
      console.error('[Discord] DISCORD_BOT_TOKEN is missing in .env.local');
      return NextResponse.redirect(new URL('/dashboard?error=missing_bot_token', request.url));
    }

    // Fetch guild details using the Bot Token
    let guildName = `Discord Server (${guildId})`;
    let guildIcon = null;

    try {
      const guildRes = await fetch(`https://discord.com/api/v10/guilds/${guildId}`, {
        headers: {
          Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
        },
      });

      if (guildRes.ok) {
        const guildData = await guildRes.json();
        guildName = guildData.name;
        if (guildData.icon) {
          guildIcon = `https://cdn.discordapp.com/icons/${guildId}/${guildData.icon}.png`;
        }
      } else {
        const errData = await guildRes.json();
        console.error('[Discord] Failed to fetch guild info:', errData);
      }
    } catch (e) {
      console.error('[Discord] Fetch Guild Error:', e);
    }

    // Register the server in our DB
    await db.registerServer(guildId, guildName, guildIcon, session.user_id);

    // Success! Redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));

  } catch (err) {
    console.error('[Discord Callback Error]', err);
    return NextResponse.redirect(new URL('/dashboard?error=internal_error', request.url));
  }
}

