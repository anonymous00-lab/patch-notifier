import { NextResponse } from 'next/server';

/**
 * POST /api/test-poll
 * Manually triggers checkForUpdates() for testing.
 */
export async function POST() {
  try {
    const { checkForUpdates } = require('@/lib/steam');

    const stats = await checkForUpdates();

    return NextResponse.json({
      success: true,
      message: 'Poll completed',
      stats,
    });
  } catch (err) {
    console.error('[API /test-poll]', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Poll failed' },
      { status: 500 }
    );
  }
}

