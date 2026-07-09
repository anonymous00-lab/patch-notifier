import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import * as db from '@/lib/db';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const webhooks = db.getWebhooksForUser(user.id);
    return NextResponse.json({ webhooks });
  } catch (err) {
    console.error('[API /user/webhooks]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { webhook_id } = await request.json();
    if (!webhook_id) {
      return NextResponse.json({ error: 'Missing webhook_id' }, { status: 400 });
    }

    db.deleteWebhook(webhook_id, user.id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[API DELETE /user/webhooks]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
