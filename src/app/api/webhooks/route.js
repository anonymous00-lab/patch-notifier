import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const db = require('@/lib/db');
    const { validateWebhookUrl } = require('@/lib/discord');

    const body = await request.json();
    const { url, guildName, channelName, webhookName, avatarUrl } = body;

    const { getCurrentUser } = require('@/lib/auth');
    const user = await getCurrentUser();

    if (!url) {
      return NextResponse.json(
        { error: 'Missing "url" in request body' },
        { status: 400 }
      );
    }

    if (!validateWebhookUrl(url)) {
      return NextResponse.json(
        { error: 'Invalid Discord webhook URL format' },
        { status: 400 }
      );
    }

    const webhook = db.registerWebhook(url, {
      userId: user?.id || null,
      guildName,
      channelName,
      webhookName,
      avatarUrl,
    });

    return NextResponse.json({ webhook });
  } catch (err) {
    console.error('[API /webhooks]', err);
    return NextResponse.json(
      { error: 'Failed to register webhook' },
      { status: 500 }
    );
  }
}
