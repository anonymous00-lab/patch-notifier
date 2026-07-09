import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { validateWebhookUrl, fetchWebhookInfo } = require('@/lib/discord');

    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { valid: false, error: 'Missing "url" in request body' },
        { status: 400 }
      );
    }

    if (!validateWebhookUrl(url)) {
      return NextResponse.json(
        {
          valid: false,
          error:
            'Invalid webhook URL. Must match https://discord.com/api/webhooks/... or https://discordapp.com/api/webhooks/...',
        },
        { status: 400 }
      );
    }

    const info = await fetchWebhookInfo(url);

    return NextResponse.json({ valid: true, info });
  } catch (err) {
    console.error('[API /webhook-info]', err);
    return NextResponse.json(
      { valid: false, error: err.message || 'Failed to fetch webhook info' },
      { status: 500 }
    );
  }
}

