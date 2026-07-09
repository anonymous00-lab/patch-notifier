require('dotenv').config({ path: '.env.local' });
const { getDb } = require('./src/lib/db');
const { formatPatchNoteEmbed, sendToDiscord } = require('./src/lib/discord');

// Simulated scraper function - in reality this would fetch from RSS/APIs
async function fetchLatestUpdates(game) {
  // For this demonstration, we are not building 10 different actual scrapers.
  // This function simulates finding a new update with a small chance.
  // In a real production app, you'd use "rss-parser" or "puppeteer" here based on game.source_type.
  
  // Here we just return null unless we want to simulate an update.
  return null; 
}

async function runWorker() {
  console.log('[Worker] Starting autonomous background check...');
  const db = getDb();
  
  try {
    // 1. Get all active games
    const games = db.prepare('SELECT * FROM games WHERE is_active = 1').all();
    
    for (const game of games) {
      // 2. Fetch updates
      const newUpdate = await fetchLatestUpdates(game);
      
      if (newUpdate) {
        // 3. Save to DB
        // ... (insert into patch_notes)
        
        // 4. Notify all subscribed channels
        const subs = db.prepare('SELECT channel_id, pin_messages, use_threads, mention_roles FROM subscriptions WHERE game_id = ?').all(game.id);
        if (subs.length > 0) {
          console.log(`[Worker] Found ${subs.length} subscriptions for ${game.name}. Sending...`);
          const payload = formatPatchNoteEmbed(newUpdate, game);
          
          for (const sub of subs) {
            const options = {
              pin_messages: !!sub.pin_messages,
              use_threads: !!sub.use_threads,
              mention_roles: sub.mention_roles,
              thread_name: newUpdate.title
            };
            await sendToDiscord(sub.channel_id, payload, options);
            // Small delay to avoid Discord rate limits
            await new Promise(r => setTimeout(r, 500)); 
          }
        }
      }
    }
  } catch (err) {
    console.error('[Worker] Error:', err);
  }
  
  console.log('[Worker] Check complete. Waiting for next cycle...');
}

// Run every 2 minutes (120000 ms) for minimal delay
setInterval(runWorker, 120000);

// Run once on startup
runWorker();
