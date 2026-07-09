const fs = require('fs');
const path = require('path');
const https = require('https');
const { getDb, closeDb } = require('./src/lib/db');

const logosToDownload = [
  { slug: 'chatgpt', url: 'https://icon.horse/icon/openai.com' },
  { slug: 'claude', url: 'https://icon.horse/icon/anthropic.com' },
  { slug: 'gemini', url: 'https://icon.horse/icon/gemini.google.com' },
  { slug: 'github-copilot', url: 'https://icon.horse/icon/github.com' },
  { slug: 'epic-games', url: 'https://icon.horse/icon/epicgames.com' },
  { slug: 'gog', url: 'https://icon.horse/icon/gog.com' },
  { slug: 'intel-arc', url: 'https://icon.horse/icon/intel.com' },
  { slug: 'nvidia-drivers', url: 'https://icon.horse/icon/nvidia.com' },
  { slug: 'amd-drivers', url: 'https://icon.horse/icon/amd.com' },
  { slug: 'steam-free-games', url: 'https://icon.horse/icon/steampowered.com' }
];

const logosDir = path.join(__dirname, 'public', 'logos');
if (!fs.existsSync(logosDir)) {
  fs.mkdirSync(logosDir, { recursive: true });
}

async function downloadLogo(url, slug) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(logosDir, `${slug}.png`);
    
    https.get(url, (res) => {
      // Handle redirects if any
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        https.get(res.headers.location, (redirectRes) => {
          if (redirectRes.statusCode !== 200) {
            console.error(`Failed to download ${slug}: ${redirectRes.statusCode}`);
            resolve(null);
            return;
          }
          const stream = fs.createWriteStream(filePath);
          redirectRes.pipe(stream);
          stream.on('finish', () => resolve(`/logos/${slug}.png`));
          stream.on('error', reject);
        }).on('error', reject);
        return;
      }

      if (res.statusCode !== 200) {
        console.error(`Failed to download ${slug}: ${res.statusCode}`);
        resolve(null);
        return;
      }
      
      const stream = fs.createWriteStream(filePath);
      res.pipe(stream);
      stream.on('finish', () => resolve(`/logos/${slug}.png`));
      stream.on('error', reject);
    }).on('error', reject);
  });
}

async function run() {
  const db = getDb();
  for (const item of logosToDownload) {
    console.log(`Downloading ${item.slug}...`);
    const localPath = await downloadLogo(item.url, item.slug);
    if (localPath) {
      db.prepare('UPDATE games SET image_url = ? WHERE slug = ?').run(localPath, item.slug);
      console.log(`Updated ${item.slug} to ${localPath}`);
    }
  }
  closeDb();
  console.log('All logos downloaded and DB updated!');
}

run();
