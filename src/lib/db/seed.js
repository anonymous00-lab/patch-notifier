/**
 * Database seed script.
 * 
 * Populates the database with an initial catalog of popular games.
 * Includes Steam games (with AppIDs) and non-Steam games with
 * source_type set to 'scraper' or 'rss' for future extensibility.
 * 
 * Run with: node src/lib/db/seed.js
 */

const path = require('path');
// Set cwd to project root so getDb() finds the right path
process.chdir(path.join(__dirname, '..', '..', '..'));

const { getDb, closeDb } = require('./index');

const SEED_GAMES = [
  // ============================================================
  // Steam Games (source_type: 'steam', source_id: Steam AppID)
  // ============================================================
  {
    name: 'Counter-Strike 2',
    slug: 'counter-strike-2',
    source_type: 'steam',
    source_id: '730',
    source_url: 'https://www.counter-strike.net/news/updates',
    image_url: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/730/header.jpg',
    description: 'The next evolution of the world\'s #1 competitive shooter.',
    embed_color: '#DE9B35',
  },
  {
    name: 'Dota 2',
    slug: 'dota-2',
    source_type: 'steam',
    source_id: '570',
    source_url: 'https://www.dota2.com/patches',
    image_url: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/570/header.jpg',
    description: 'Every day, millions of players worldwide enter the battle as one of over a hundred Dota heroes.',
    embed_color: '#C23C2A',
  },
  {
    name: 'Apex Legends',
    slug: 'apex-legends',
    source_type: 'steam',
    source_id: '1172470',
    source_url: 'https://www.ea.com/games/apex-legends/news',
    image_url: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1172470/header.jpg',
    description: 'Apex Legends is the award-winning, free-to-play hero shooter.',
    embed_color: '#CD3333',
  },
  {
    name: 'Team Fortress 2',
    slug: 'team-fortress-2',
    source_type: 'steam',
    source_id: '440',
    source_url: 'https://www.teamfortress.com/?tab=updates',
    image_url: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/440/header.jpg',
    description: 'Nine distinct classes provide a broad range of tactical abilities and personalities.',
    embed_color: '#B8383B',
  },
  {
    name: 'Rust',
    slug: 'rust',
    source_type: 'steam',
    source_id: '252490',
    source_url: 'https://rust.facepunch.com/changes',
    image_url: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/252490/header.jpg',
    description: 'The only aim in Rust is to survive. Everything wants you to die.',
    embed_color: '#CD412B',
  },
  {
    name: 'PUBG: Battlegrounds',
    slug: 'pubg',
    source_type: 'steam',
    source_id: '578080',
    source_url: 'https://pubg.com/en/news',
    image_url: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/578080/header.jpg',
    description: 'Land, loot, and outwit your opponents to become the last player standing.',
    embed_color: '#F2A900',
  },
  {
    name: 'Terraria',
    slug: 'terraria',
    source_type: 'steam',
    source_id: '105600',
    source_url: 'https://terraria.org/news',
    image_url: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/105600/header.jpg',
    description: 'Dig, fight, explore, build! Nothing is impossible in this action-packed adventure game.',
    embed_color: '#3EB049',
  },
  {
    name: 'Dead by Daylight',
    slug: 'dead-by-daylight',
    source_type: 'steam',
    source_id: '381210',
    source_url: 'https://deadbydaylight.com/news',
    image_url: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/381210/header.jpg',
    description: 'A multiplayer (4vs1) horror game where one player takes on the role of the savage Killer.',
    embed_color: '#8B0000',
  },
  {
    name: 'Destiny 2',
    slug: 'destiny-2',
    source_type: 'steam',
    source_id: '1085660',
    source_url: 'https://www.bungie.net/7/en/News',
    image_url: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1085660/header.jpg',
    description: 'Dive into the world of Destiny 2 to explore the mysteries of the solar system.',
    embed_color: '#4169E1',
  },
  {
    name: 'Elden Ring',
    slug: 'elden-ring',
    source_type: 'steam',
    source_id: '1245620',
    source_url: 'https://www.eldenring.jp/en/news.html',
    image_url: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1245620/header.jpg',
    description: 'THE NEW FANTASY ACTION RPG. Rise, Tarnished, and be guided by grace.',
    embed_color: '#C5A53B',
  },
  {
    name: 'GTA V / GTA Online',
    slug: 'gta-v',
    source_type: 'steam',
    source_id: '271590',
    source_url: 'https://www.rockstargames.com/newswire',
    image_url: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/271590/header.jpg',
    description: 'Grand Theft Auto V and GTA Online.',
    embed_color: '#97CA00',
  },
  {
    name: 'Palworld',
    slug: 'palworld',
    source_type: 'steam',
    source_id: '1623730',
    source_url: 'https://store.steampowered.com/news/app/1623730',
    image_url: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1623730/header.jpg',
    description: 'Fight, farm, build and work alongside mysterious creatures called "Pals".',
    embed_color: '#4FC3F7',
  },
  {
    name: 'Helldivers 2',
    slug: 'helldivers-2',
    source_type: 'steam',
    source_id: '553850',
    source_url: 'https://store.steampowered.com/news/app/553850',
    image_url: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/553850/header.jpg',
    description: 'The Galaxy\'s Last Line of Offence. Enlist in the Helldivers and join the fight for freedom.',
    embed_color: '#FFD700',
  },

  // ============================================================
  // Non-Steam Games (source_type: 'scraper' — ready for future integration)
  // ============================================================
  {
    name: 'Call of Duty: Black Ops 7',
    slug: 'call-of-duty-black-ops-7',
    source_type: 'scraper',
    source_id: 'cod-bo7',
    source_url: 'https://www.callofduty.com/blog',
    image_url: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1938090/header.jpg',
    description: 'Call of Duty: Black Ops 7 — the latest entry in the legendary FPS franchise.',
    embed_color: '#F57C00',
  },
  {
    name: 'Call of Duty: Warzone',
    slug: 'call-of-duty-warzone',
    source_type: 'scraper',
    source_id: 'cod-warzone',
    source_url: 'https://www.callofduty.com/blog',
    image_url: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1962663/header.jpg',
    description: 'Call of Duty: Warzone — the free-to-play battle royale experience.',
    embed_color: '#4CAF50',
  },
  {
    name: 'Valorant',
    slug: 'valorant',
    source_type: 'scraper',
    source_id: 'valorant',
    source_url: 'https://playvalorant.com/en-us/news/game-updates/',
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Valorant_logo_-_pink_color_version.svg/512px-Valorant_logo_-_pink_color_version.svg.png',
    description: 'A 5v5 character-based tactical shooter by Riot Games.',
    embed_color: '#FF4655',
  },
  {
    name: 'League of Legends',
    slug: 'league-of-legends',
    source_type: 'scraper',
    source_id: 'league-of-legends',
    source_url: 'https://www.leagueoflegends.com/en-us/news/game-updates/',
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/League_of_Legends_2019_vector.svg/512px-League_of_Legends_2019_vector.svg.png',
    description: 'The world\'s most popular MOBA by Riot Games.',
    embed_color: '#C8AA6E',
  },
  {
    name: 'Fortnite',
    slug: 'fortnite',
    source_type: 'scraper',
    source_id: 'fortnite',
    source_url: 'https://www.fortnite.com/news',
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/FortniteLogo.svg/512px-FortniteLogo.svg.png',
    description: 'The action-building battle royale game by Epic Games.',
    embed_color: '#1DA1F2',
  },
  {
    name: 'Overwatch 2',
    slug: 'overwatch-2',
    source_type: 'scraper',
    source_id: 'overwatch-2',
    source_url: 'https://overwatch.blizzard.com/en-us/news/patch-notes/',
    image_url: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2357570/header.jpg',
    description: 'The hero shooter from Blizzard Entertainment.',
    embed_color: '#F99E1A',
  },
  {
    name: 'Minecraft',
    slug: 'minecraft',
    source_type: 'rss',
    source_id: 'https://www.minecraft.net/en-us/feeds/community-content/rss',
    source_url: 'https://www.minecraft.net/en-us/updates',
    image_url: 'https://www.minecraft.net/content/dam/games/minecraft/key-art/Games_Subnav_702x900_Java.jpg',
    description: 'Explore, build, survive, and create in infinite worlds.',
    embed_color: '#5B8731',
  },
  {
    name: 'Steam Free Games',
    slug: 'steam-free-games',
    source_type: 'rss',
    source_id: 'https://www.reddit.com/r/FreeGameFindings/new/.rss',
    source_url: 'https://www.reddit.com/r/FreeGameFindings/',
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Steam_icon_logo.svg/512px-Steam_icon_logo.svg.png',
    description: 'Get notified when premium Steam games become free to claim!',
    embed_color: '#1B2838',
  },
  {
    name: 'NVIDIA Drivers',
    slug: 'nvidia-drivers',
    source_type: 'rss',
    source_id: 'https://www.nvidia.com/en-us/geforce/news/feed/',
    source_url: 'https://www.nvidia.com/en-us/geforce/drivers/',
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/NVIDIA_logo.svg/512px-NVIDIA_logo.svg.png',
    description: 'Stay updated on the latest GeForce Game Ready Driver updates.',
    embed_color: '#76B900',
  },
  {
    name: 'AMD Drivers',
    slug: 'amd-drivers',
    source_type: 'rss',
    source_id: 'https://community.amd.com/t5/drivers-software/bg-p/driversandsoftware/page/1/rss/1',
    source_url: 'https://www.amd.com/en/support',
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/AMD_Logo.svg/512px-AMD_Logo.svg.png',
    description: 'Stay updated on the latest Radeon Adrenalin Driver updates.',
    embed_color: '#ED1C24',
  },
];

function seed() {
  const db = getDb();
  
  const insertGame = db.prepare(`
    INSERT INTO games (name, slug, source_type, source_id, source_url, image_url, description, embed_color)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(slug) DO UPDATE SET
      name        = excluded.name,
      source_type = excluded.source_type,
      source_id   = excluded.source_id,
      source_url  = excluded.source_url,
      image_url   = excluded.image_url,
      description = excluded.description,
      embed_color = excluded.embed_color,
      updated_at  = datetime('now')
  `);

  const insertMany = db.transaction((games) => {
    for (const game of games) {
      insertGame.run(
        game.name,
        game.slug,
        game.source_type,
        game.source_id,
        game.source_url,
        game.image_url || null,
        game.description || null,
        game.embed_color || '#5865F2'
      );
    }
  });

  console.log(`[SEED] Inserting ${SEED_GAMES.length} games...`);
  insertMany(SEED_GAMES);
  
  // Verify
  const count = db.prepare('SELECT COUNT(*) as count FROM games').get();
  console.log(`[SEED] Done! Total games in database: ${count.count}`);
  
  // Print them
  const games = db.prepare('SELECT id, name, source_type, source_id FROM games ORDER BY name').all();
  console.log('\n[SEED] Game Catalog:');
  console.log('─'.repeat(70));
  games.forEach(g => {
    const sourceInfo = g.source_id ? `${g.source_type}:${g.source_id}` : g.source_type;
    console.log(`  [${String(g.id).padStart(2)}] ${g.name.padEnd(35)} (${sourceInfo})`);
  });
  console.log('─'.repeat(70));

  closeDb();
}

seed();
