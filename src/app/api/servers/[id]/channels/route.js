import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
const db = require('@/lib/db');

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const serverId = id;
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = db.getSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const server = db.getServerById(serverId);
    if (!server || server.user_id !== session.user_id) {
      return NextResponse.json({ error: 'Server not found' }, { status: 404 });
    }

    const botToken = process.env.DISCORD_BOT_TOKEN;
    if (!botToken) {
      return NextResponse.json({ error: 'Bot token missing' }, { status: 500 });
    }

    // Fetch channels from Discord
    const res = await fetch(`https://discord.com/api/v10/guilds/${server.guild_id}/channels`, {
      headers: {
        Authorization: `Bot ${botToken}`,
      }
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch channels from Discord' }, { status: res.status });
    }

    const channels = await res.json();
    
    // Filter out voice channels, category channels, etc. 
    // Type 0 is GUILD_TEXT, Type 5 is GUILD_ANNOUNCEMENT
    const textChannels = channels
      .filter(c => c.type === 0 || c.type === 5)
      .sort((a, b) => a.position - b.position)
      .map(c => ({
        id: c.id,
        name: c.name,
        type: c.type
      }));

    return NextResponse.json(textChannels);
  } catch (err) {
    console.error('[API] Get Channels Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
