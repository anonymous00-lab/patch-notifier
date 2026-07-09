const { getDb, closeDb } = require('./src/lib/db');

const db = getDb();
const correctUrl = 'https://www.callofduty.com/patchnotes/2026/06/call-of-duty-black-ops-7-season-04-patch-notes#july2';

// Update game's source url
db.prepare("UPDATE games SET source_url = ? WHERE slug = 'call-of-duty-black-ops-7'").run(correctUrl);

// Update existing patch notes
const game = db.prepare("SELECT id FROM games WHERE slug = 'call-of-duty-black-ops-7'").get();
if (game) {
  db.prepare("UPDATE patch_notes SET url = ? WHERE game_id = ?").run(correctUrl, game.id);
  console.log("Updated BO7 successfully!");
}

closeDb();
