const { getDb, closeDb } = require('./src/lib/db');
const db = getDb();

const updates = [
  { slug: 'valorant', url: 'https://playvalorant.com/it-it/news/game-updates/valorant-patch-notes-9-02/' },
  { slug: 'call-of-duty-warzone', url: 'https://www.callofduty.com/patchnotes/2026/06/call-of-duty-warzone-season-04-patch-notes' },
  { slug: 'apex-legends', url: 'https://www.ea.com/it-it/games/apex-legends/news/upheaval-patch-notes' },
  { slug: 'fortnite', url: 'https://www.fortnite.com/news/fortnite-battle-royale-v30-10-update' },
  { slug: 'league-of-legends', url: 'https://www.leagueoflegends.com/it-it/news/game-updates/patch-14-14-notes/' },
  { slug: 'overwatch-2', url: 'https://overwatch.blizzard.com/it-it/news/patch-notes/' },
  { slug: 'rainbow-six-siege', url: 'https://www.ubisoft.com/it-it/game/rainbow-six/siege/news-updates/2P4dM9Q5Jd9fQ7F6Z4W1Q6' },
  { slug: 'gta-v', url: 'https://www.rockstargames.com/it/newswire/article/7558/gta-online-bottom-dollar-bounties-out-now' },
  { slug: 'counter-strike-2', url: 'https://store.steampowered.com/news/app/730/view/4240784260341772646' },
  { slug: 'helldivers-2', url: 'https://store.steampowered.com/news/app/553850/view/4196868581454559281' },
  { slug: 'palworld', url: 'https://store.steampowered.com/news/app/1623730/view/4249791444199180775' }
];

updates.forEach(u => {
  const game = db.prepare("SELECT id FROM games WHERE slug = ?").get(u.slug);
  if (game) {
    db.prepare("UPDATE patch_notes SET url = ? WHERE game_id = ?").run(u.url, game.id);
    db.prepare("UPDATE games SET source_url = ? WHERE id = ?").run(u.url, game.id);
  }
});
console.log("All URLs updated to specific patch notes!");
closeDb();
