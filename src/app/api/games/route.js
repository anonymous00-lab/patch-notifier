import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const db = require('@/lib/db');
    let games = await db.getAllGames();

    // Optional search filter
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    if (search) {
      const query = search.toLowerCase();
      games = games.filter((g) =>
        g.name.toLowerCase().includes(query)
      );
    }

    return NextResponse.json({ games });
  } catch (err) {
    console.error('[API /games]', err);
    return NextResponse.json(
      { error: 'Failed to fetch games' },
      { status: 500 }
    );
  }
}

