import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
const db = require('@/lib/db');

export async function GET(request, { params }) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;
    if (!sessionId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = db.getSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const server = db.getServerById(id);
    
    if (!server || server.user_id !== session.user_id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
    if (!DISCORD_BOT_TOKEN) {
      return NextResponse.json({ error: 'Bot token missing' }, { status: 500 });
    }

    const response = await fetch(`https://discord.com/api/v10/guilds/${server.guild_id}/roles`, {
      headers: {
        Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch roles from Discord API', await response.text());
      return NextResponse.json({ error: 'Failed to fetch roles' }, { status: 500 });
    }

    const roles = await response.json();
    
    // Filter out the @everyone role (usually has the same ID as the guild_id)
    // and sort by position descending
    const filteredRoles = roles
      .filter(r => r.name !== '@everyone')
      .sort((a, b) => b.position - a.position)
      .map(r => ({
        id: r.id,
        name: r.name,
        color: r.color,
      }));

    return NextResponse.json(filteredRoles);
  } catch (err) {
    console.error('Roles fetch error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
