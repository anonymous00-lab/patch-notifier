/**
 * Steam News fetcher and polling engine.
 *
 * - fetchSteamNews(appId)  – pulls news items from the Steam Web API.
 * - checkForUpdates()      – main polling loop: fetch → insert → deliver.
 */

const STEAM_NEWS_URL =
  'https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/';

/**
 * Fetch news items for a Steam app.
 * @param {string|number} appId  Steam application ID.
 * @param {number}        count  Number of items to retrieve (default 5).
 * @returns {Promise<Array<object>>} Normalized patch-note objects.
 */
async function fetchSteamNews(appId, count = 5) {
  const url = `${STEAM_NEWS_URL}?appid=${appId}&count=${count}&maxlength=2000&format=json`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Steam API returned ${res.status} for appId ${appId}`);
  }

  const data = await res.json();
  const items = data?.appnews?.newsitems || [];

  return items.map((item) => ({
    title: item.title,
    content: item.contents,
    summary: item.contents
      ? item.contents.length > 500
        ? item.contents.slice(0, 497) + '...'
        : item.contents
      : null,
    url: item.url,
    author: item.author || null,
    sourceUid: String(item.gid),
    sourceType: 'steam',
    publishedAt: item.date
      ? new Date(item.date * 1000).toISOString()
      : null,
  }));
}

/**
 * Main polling function.
 *
 * 1. Loads all active Steam games from the DB.
 * 2. For each game, fetches the latest news from Steam.
 * 3. Inserts new patch notes (skips duplicates).
 * 4. For every newly-inserted note, delivers a Discord embed to each
 *    subscribed webhook and logs the result.
 *
 * @returns {Promise<{checked:number, inserted:number, delivered:number}>}
 */
async function checkForUpdates() {
  // Require at call time so the module is loaded inside the serverless function
  const db = require('@/lib/db');
  const { sendEmbed, formatPatchNoteEmbed } = require('@/lib/discord');

  const games = db.getAllGames().filter((g) => g.source_type === 'steam');

  const stats = { checked: 0, inserted: 0, delivered: 0 };

  for (const game of games) {
    stats.checked++;

    let newsItems;
    try {
      newsItems = await fetchSteamNews(game.steam_app_id);
    } catch (err) {
      console.error(`[Steam] Failed to fetch news for ${game.name}:`, err.message);
      continue;
    }

    for (const item of newsItems) {
      const patchNote = db.insertPatchNote({
        ...item,
        gameId: game.id,
      });

      // null means duplicate → skip delivery
      if (!patchNote) continue;

      stats.inserted++;

      // Deliver to every subscribed webhook
      const webhooks = db.getWebhooksForGame(game.id);
      const embed = formatPatchNoteEmbed(patchNote, game);

      for (const wh of webhooks) {
        try {
          await sendEmbed(wh.webhook_url, embed);
          db.logDelivery(patchNote.id, wh.id, 'sent');
          stats.delivered++;
        } catch (err) {
          console.error(
            `[Delivery] Failed for webhook ${wh.id}:`,
            err.message
          );
          db.logDelivery(patchNote.id, wh.id, 'failed', err.message);
        }
      }
    }
  }

  console.log(
    `[Poll] Done – checked ${stats.checked} games, ` +
    `inserted ${stats.inserted} notes, ` +
    `delivered ${stats.delivered} embeds.`
  );

  return stats;
}

module.exports = {
  fetchSteamNews,
  checkForUpdates,
};
