import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
const db = require('@/lib/db');
import { formatPatchNoteEmbed, sendToDiscord } from '@/lib/discord';

export async function POST(request) {
  try {
    // Auth check
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;
    if (!sessionId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const session = await db.getSession(sessionId);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { serverId, channelId, gameId } = await request.json();

    if (!serverId || !channelId || !gameId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const server = await db.getServerById(serverId);
    if (!server || server.user_id !== session.user_id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const game = await db.getGameById(gameId);
    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    const subscriptions = await db.getSubscriptionsForServer(serverId);
    const sub = subscriptions.find(s => s.channel_id === channelId && s.game_id === gameId);
    
    if (!sub) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    // Try to get the latest actual patch note for this game
    const patchNotes = await db.getRecentPatchNotes(game.id, 1);
    
    let noteToSend;
    if (patchNotes && patchNotes.length > 0) {
      noteToSend = patchNotes[0];
    } else {
      // If no actual patch note exists yet, send a realistic mock one
      noteToSend = {
        title: `Nuovo Aggiornamento: ${game.name}`,
        summary: `È disponibile un nuovo aggiornamento (Test) per **${game.name}**! Questo è un messaggio inviato manualmente dalla Dashboard per verificare che la connessione sia configurata correttamente. Tutte le notifiche future arriveranno qui in automatico e senza delay.`,
        url: game.source_url || 'https://patchnotifier.com',
        image_url: game.image_url,
        published_at: new Date().toISOString(),
        source_uid: 'test-123',
        source_type: 'test'
      };
    }

    const payload = formatPatchNoteEmbed(noteToSend, game);
    
    const options = {
      pin_messages: !!sub.pin_messages,
      use_threads: !!sub.use_threads,
      mention_roles: sub.mention_roles,
      thread_name: noteToSend.title
    };

    await sendToDiscord(channelId, payload, options);
    return NextResponse.json({ success: true });

  } catch (err) {
    console.error('[API] Test Webhook Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

