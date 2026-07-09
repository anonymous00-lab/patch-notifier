import { NextResponse } from 'next/server';

/**
 * GET /api/patch-notes?game_id=X&limit=N
 * Returns recent patch notes for a given game.
 */
export async function GET(request) {
  try {
    const db = require('@/lib/db');

    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('game_id');
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    if (!gameId) {
      return NextResponse.json(
        { error: 'Missing "game_id" query parameter' },
        { status: 400 }
      );
    }

    const patchNotes = await db.getRecentPatchNotes(Number(gameId), limit);

    return NextResponse.json({ patch_notes: patchNotes });
  } catch (err) {
    console.error('[API /patch-notes]', err);
    return NextResponse.json(
      { error: 'Failed to fetch patch notes' },
      { status: 500 }
    );
  }
}

