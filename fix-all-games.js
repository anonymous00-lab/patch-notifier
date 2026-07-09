const { getDb, closeDb } = require('./src/lib/db');

const db = getDb();

const GAME_MOCKS = {
  'amd-drivers': {
    title: 'AMD Software: Adrenalin Edition 26.6.4 Driver Release Notes',
    summary: 'Aggiornamento ufficiale dei driver con supporto per nuovi giochi e fix per la stabilità su schede grafiche della serie RX 7000.',
    content: `**Highlights**
- **Fixed Issues:**
  - Intermittent install issue seen when installing AMD Software: Adrenalin Edition 26.6.2 on Windows 10 systems for Radeon RX 7000 series and above graphics products.
  - Intermittent application crash may be observed in some games with AMD FSR Upscaling 4.1 enabled on Radeon RX 7000 series graphics products.
- **Known Issues:**
  - Audio and video may intermittently become out of sync while recording using the AV1 codec.
  - Performance metrics overlay may report N/A for FPS on select games.`,
    url: 'https://www.amd.com/en/resources/support-articles/release-notes/RN-RAD-WIN-24-7-1.html',
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/AMD_Logo.svg/512px-AMD_Logo.svg.png' // Use logo, it will render as thumbnail now
  },
  'nvidia-drivers': {
    title: 'GeForce Game Ready Driver 560.81 WHQL',
    summary: 'Nuovo Game Ready Driver con supporto per NVIDIA DLSS 3.5 e NVIDIA Reflex per i titoli più recenti.',
    content: `**Game Ready For New Releases:**
- Support for **Black Myth: Wukong** featuring DLSS 3.5 Full Ray Tracing.
- Support for **Star Wars Outlaws** with NVIDIA Reflex integration.

**Fixed Issues in Version 560.81 WHQL:**
- Fixed an issue where Adobe Premiere Pro could hang during export.
- Resolved random flickering observed on select G-SYNC monitors when using Dual Monitor setups.
- General performance improvements and bug fixes for the GeForce RTX 40 series.`,
    url: 'https://www.nvidia.com/en-us/geforce/news/geforce-game-ready-driver-555-99-whql/',
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/NVIDIA_logo.svg/512px-NVIDIA_logo.svg.png'
  },
  'league-of-legends': {
    title: 'League of Legends Patch 16.12 Notes',
    summary: 'Bilanciamenti per tantissimi campioni e aggiornamenti per le ranked in vista della chiusura della stagione estiva.',
    content: `**Patch Highlights**
- **Champion Adjustments:**
  - *Ahri*: Q damage slightly reduced, W mana cost increased.
  - *Lee Sin*: Base health increased, W shield duration adjusted.
  - *Jinx*: Late-game scaling buffed, R cooldown reduced by 10s at all ranks.
- **System Changes:**
  - Baron Nashor health scaling reduced slightly past 30 minutes.
  - adjustments to tier 2 tower gold rewards.
- **Skins:**
  - Nuove Skin *Star Guardian* disponibili nello store a partire dal 18 Luglio.`,
    url: 'https://www.leagueoflegends.com/en-us/news/game-updates/patch-14-14-notes/',
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/League_of_Legends_2019_vector.svg/512px-League_of_Legends_2019_vector.svg.png'
  },
  'valorant': {
    title: 'VALORANT Patch Notes 9.03',
    summary: 'Cambiamenti importanti per Neon e Chamber, più nuovi strumenti per personalizzare il mirino e fix per le mappe.',
    content: `**Agent Updates**
- **Neon:**
  - High Gear (E) movement speed bonus increased by 5%.
  - Relay Bolt (Q) concuss duration increased from 3.0s -> 3.2s.
- **Chamber:**
  - Rendezvous (E) equip time after teleport reduced.

**Map Updates**
- **Pearl:**
  - Adjusted cover on B-site to make it easier for attackers to plant the spike.
- **Fracture:**
  - Minor geometry tweaks around A-Dish to prevent unintended pixel peeks.

**Bug Fixes**
- Fixed an issue where Omen's ultimate could place him inside unintended geometry.`,
    url: 'https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-9-02/',
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Valorant_logo_-_pink_color_version.svg/512px-Valorant_logo_-_pink_color_version.svg.png'
  },
  'fortnite': {
    title: 'Fortnite Battle Royale v31.00 Update',
    summary: 'L\'aggiornamento Absolute Doom introduce la nuova isola Marvel, armi mitiche inedite e un Pass Battaglia stellare.',
    content: `**Absolute Doom has arrived!**
- The island is taken over by Marvel's greatest villains.
- **New Mythic Items:**
  - Wield *Captain America's Shield* for devastating melee attacks and block incoming fire.
  - Harness *Doctor Doom's Arcane Gauntlets* to unleash mystical energy blasts.
- **Map Changes:**
  - *Doom's Domain* has replaced Pleasant Park.
  - *Stark Industries* makes a triumphant return.
- **Bug Fixes:**
  - Fixed an issue causing vehicles to randomly launch into the air.
  - Vaulted the Heavy Sniper Rifle for competitive playlists.`,
    url: 'https://www.fortnite.com/news/fortnite-battle-royale-v30-20-update',
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/FortniteLogo.svg/512px-FortniteLogo.svg.png'
  },
  'overwatch-2': {
    title: 'Overwatch 2 Season 12: New Frontiers',
    summary: 'Benvenuta Juno! Prova il nuovo eroe Support, gioca nella nuova modalità Clash e sblocca la Skin Mitica di Reaper.',
    content: `**New Hero: Juno (Support)**
- Juno joins the support roster! Armed with her Mediblaster and Glide Boosters, she provides unparalleled mobility and healing to her team.

**New Game Mode: Clash**
- Dive into the new Clash game mode featuring dynamic capture points and fast-paced tug-of-war gameplay.
- **New Maps:** Hanaoka and Throne of Anubis.

**Hero Balance**
- *Reinhardt*: Fire Strike damage increased.
- *Mercy*: Valkyrie healing beam width expanded.
- *Tracer*: Pulse Bomb charge requirement increased by 10%.`,
    url: 'https://overwatch.blizzard.com/en-us/news/patch-notes/pc-2024-07-09/',
    image_url: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2357570/header.jpg'
  },
  'minecraft': {
    title: 'Minecraft Java Edition 1.21.1',
    summary: 'Rilascio ufficiale del Tricky Trials Update con Trial Chambers, la nuova arma Mace e mob pericolosi come il Breeze.',
    content: `**The Tricky Trials Update is here!**
- **Trial Chambers:**
  - Explore procedurally generated underground structures filled with traps, loot, and enemies.
- **New Mob: The Breeze:**
  - A mischievous hostile mob that utilizes wind attacks.
- **New Weapon: The Mace:**
  - Craft the Mace using a Heavy Core and a Breeze Rod. Deals devastating damage when falling!
- **Bug Fixes:**
  - Resolved several rendering issues related to transparent blocks.
  - Fixed a crash occurring when loading legacy worlds.`,
    url: 'https://www.minecraft.net/en-us/article/minecraft-java-edition-1-21',
    image_url: 'https://www.minecraft.net/content/dam/games/minecraft/key-art/Games_Subnav_702x900_Java.jpg'
  }
};

const insertPatch = db.prepare(`
  INSERT INTO patch_notes (game_id, title, url, summary, content, image_url, published_at, source_uid, source_type)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const games = db.prepare('SELECT id, slug, name, source_url, image_url FROM games').all();

db.transaction(() => {
  for (const game of games) {
    // Delete any existing patch notes for this game
    db.prepare('DELETE FROM patch_notes WHERE game_id = ?').run(game.id);

    const mock = GAME_MOCKS[game.slug];
    if (mock) {
      insertPatch.run(
        game.id,
        mock.title,
        mock.url,
        mock.summary,
        mock.content, // FULL RICH MARKDOWN CONTENT
        mock.image_url,
        new Date('2026-06-29T10:00:00Z').toISOString(),
        'mock-' + game.slug,
        'test'
      );
      console.log(`Inserted RICH mock for ${game.name}`);
    } else {
      // Fallback for games not in GAME_MOCKS (mostly steam games)
      // Provide a highly detailed Markdown format so it looks professional everywhere!
      insertPatch.run(
        game.id,
        `${game.name} - Official Patch Notes`,
        game.source_url,
        `Nuovo aggiornamento rilasciato per ${game.name}. Include miglioramenti prestazionali e bug fix.`,
        `**Highlights dell'Aggiornamento**\n- Migliorata la stabilità generale del client.\n- Ottimizzazioni per ridurre l'utilizzo della memoria RAM.\n- Risolti alcuni glitch grafici in scenari complessi.\n\n**Cambiamenti al Gameplay**\n- Bilanciamento generale e fix per vari bug segnalati dalla community.\n\n*Assicurati di riavviare il client per scaricare l'ultima versione.*`,
        game.image_url, // Steam header or transparent logo
        new Date('2026-06-28T14:30:00Z').toISOString(),
        'mock-' + game.slug,
        'test'
      );
      console.log(`Inserted GENERIC RICH mock for ${game.name}`);
    }
  }
})();

console.log('All games now have a beautiful, rich markdown mock patch note!');
closeDb();
