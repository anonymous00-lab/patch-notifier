const path = require('path');
const { getDb, closeDb } = require('./src/lib/db');

function migrateImages() {
  const db = getDb();
  
  const updates = [
    { slug: 'epic-games', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Epic_Games_logo.svg/512px-Epic_Games_logo.svg.png' },
    { slug: 'gog', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/GOG.com_logo.svg/512px-GOG.com_logo.svg.png' },
    { slug: 'intel-arc', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Intel_Arc_logo.svg/512px-Intel_Arc_logo.svg.png' },
    { slug: 'chatgpt', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/512px-ChatGPT_logo.svg.png' },
    { slug: 'gemini', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Google_Gemini_logo.svg/512px-Google_Gemini_logo.svg.png' },
    { slug: 'claude', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Anthropic_logo.svg/512px-Anthropic_logo.svg.png' },
    { slug: 'github-copilot', url: 'https://github.githubassets.com/assets/copilot-icon-33bf59f6323c.svg' },
    { slug: 'nvidia-drivers', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/NVIDIA_logo.svg/512px-NVIDIA_logo.svg.png' },
    { slug: 'amd-drivers', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/AMD_Logo.svg/512px-AMD_Logo.svg.png' },
    { slug: 'steam-free-games', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Steam_icon_logo.svg/512px-Steam_icon_logo.svg.png' },
    { slug: 'league-of-legends', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/League_of_Legends_2019_vector.svg/512px-League_of_Legends_2019_vector.svg.png' },
    { slug: 'valorant', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Valorant_logo_-_pink_color_version.svg/512px-Valorant_logo_-_pink_color_version.svg.png' },
    { slug: 'fortnite', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/FortniteLogo.svg/512px-FortniteLogo.svg.png' }
  ];

  const stmt = db.prepare('UPDATE games SET image_url = ? WHERE slug = ?');
  
  db.transaction(() => {
    for (const update of updates) {
      stmt.run(update.url, update.slug);
    }
  })();

  console.log("Images updated to original logos.");
  closeDb();
}
migrateImages();
