const path = require('path');
const { getDb, closeDb } = require('./src/lib/db');

function migrate() {
  const db = getDb();
  
  // Update all current ones to 'pc' (which is the default anyway, but just in case)
  db.prepare("UPDATE games SET category = 'pc'").run();
  
  // Specific category updates
  db.prepare("UPDATE games SET category = 'free' WHERE slug = 'steam-free-games'").run();
  db.prepare("UPDATE games SET category = 'hardware' WHERE slug = 'nvidia-drivers' OR slug = 'amd-drivers'").run();

  const insertGame = db.prepare(`
    INSERT INTO games (name, slug, source_type, source_id, source_url, image_url, description, embed_color, category)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(slug) DO UPDATE SET
      name        = excluded.name,
      source_type = excluded.source_type,
      source_id   = excluded.source_id,
      source_url  = excluded.source_url,
      image_url   = excluded.image_url,
      description = excluded.description,
      embed_color = excluded.embed_color,
      category    = excluded.category,
      updated_at  = datetime('now')
  `);

  const NEW_ITEMS = [
    {
      name: 'Epic Games Store', slug: 'epic-games', source_type: 'rss', source_id: 'epic-rss',
      source_url: 'https://store.epicgames.com', image_url: '/banners/epic.jpg', description: 'Free games from Epic Games Store.', embed_color: '#FFFFFF', category: 'free'
    },
    {
      name: 'GOG.com', slug: 'gog', source_type: 'rss', source_id: 'gog-rss',
      source_url: 'https://www.gog.com', image_url: '/banners/gog.jpg', description: 'Free games and giveaways from GOG.', embed_color: '#8A2BE2', category: 'free'
    },
    {
      name: 'Intel ARC', slug: 'intel-arc', source_type: 'rss', source_id: 'intel-rss',
      source_url: 'https://www.intel.com', image_url: '/banners/intel.jpg', description: 'Intel ARC Game On Drivers updates.', embed_color: '#0071C5', category: 'hardware'
    },
    {
      name: 'ChatGPT', slug: 'chatgpt', source_type: 'rss', source_id: 'chatgpt-rss',
      source_url: 'https://openai.com/blog', image_url: '/banners/chatgpt.jpg', description: 'Updates and new features for ChatGPT.', embed_color: '#10A37F', category: 'ai'
    },
    {
      name: 'Gemini', slug: 'gemini', source_type: 'rss', source_id: 'gemini-rss',
      source_url: 'https://blog.google/technology/ai/', image_url: '/banners/gemini.jpg', description: 'Updates and new models for Google Gemini.', embed_color: '#4285F4', category: 'ai'
    },
    {
      name: 'Claude', slug: 'claude', source_type: 'rss', source_id: 'claude-rss',
      source_url: 'https://www.anthropic.com/news', image_url: '/banners/claude.jpg', description: 'Updates and research for Claude AI.', embed_color: '#D97757', category: 'ai'
    },
    {
      name: 'GitHub Copilot', slug: 'github-copilot', source_type: 'rss', source_id: 'copilot-rss',
      source_url: 'https://github.blog/category/ai/', image_url: '/banners/copilot.jpg', description: 'Updates for GitHub Copilot.', embed_color: '#24292E', category: 'ai'
    }
  ];

  const insertMany = db.transaction((items) => {
    for (const item of items) {
      insertGame.run(item.name, item.slug, item.source_type, item.source_id, item.source_url, item.image_url, item.description, item.embed_color, item.category);
    }
  });

  insertMany(NEW_ITEMS);
  console.log("Migration complete.");
  closeDb();
}
migrate();
