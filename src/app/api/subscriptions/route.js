import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
const db = require('@/lib/db');
import { formatPatchNoteEmbed, sendToDiscord } from '@/lib/discord';

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const serverId = url.searchParams.get('server_id');
    const gameId = url.searchParams.get('game_id');
    
    // Auth check
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;
    if (!sessionId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const session = db.getSession(sessionId);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (serverId) {
      const subs = db.getSubscriptionsForServer(serverId);
      return NextResponse.json(subs);
    } else if (gameId) {
      const subs = db.getSubscriptionsForGame(gameId);
      return NextResponse.json(subs);
    }

    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  } catch (err) {
    console.error('[API] Get Subscriptions Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;
    if (!sessionId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const session = db.getSession(sessionId);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { serverId, channelId, gameId, action } = body; // action: 'subscribe' or 'unsubscribe'

    if (!serverId || !channelId || !gameId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const server = db.getServerById(serverId);
    if (!server || server.user_id !== session.user_id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (action === 'subscribe') {
      db.subscribe(serverId, channelId, gameId);
      
      // Send a DEMO patch note to show it works!
      const game = db.getGameById(gameId);
      if (game) {
        const demoNote = {
          title: `🛠️ ${game.name} - DEMO Update`,
          summary: `You successfully subscribed to **${game.name}** updates in this channel! This is a test message to verify the bot has correct permissions.`,
          url: 'https://patchnotifier.com',
          image_url: game.image_url,
          published_at: new Date().toISOString()
        };
        const payload = formatPatchNoteEmbed(demoNote, game);
        // Fire and forget
        sendToDiscord(channelId, payload).catch(console.error);
      }
      
    } else if (action === 'unsubscribe') {
      db.unsubscribe(serverId, channelId, gameId);
    } else if (action === 'updateSettings') {
      const { pin_messages, use_threads, mention_roles } = body;
      db.updateSubscriptionSettings(serverId, channelId, gameId, pin_messages, use_threads, mention_roles);
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[API] Subscription Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
