/**
 * Database connection and initialization module for Bot Architecture.
 * Migrated to @libsql/client for Vercel/Turso compatibility.
 */
const { createClient } = require('@libsql/client');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const SCHEMA_PATH = path.join(process.cwd(), 'src', 'lib', 'db', 'schema.sql');

// Either use Turso Cloud DB if env variables are present, otherwise use a local file
const url = process.env.TURSO_DATABASE_URL || 'file:patch-notifier.db';
const authToken = process.env.TURSO_AUTH_TOKEN;

let dbInstance = null;

function getDb() {
  if (dbInstance) return dbInstance;
  
  const config = { url };
  if (authToken) config.authToken = authToken;
  
  dbInstance = createClient(config);
  return dbInstance;
}

async function initializeSchema() {
  const db = getDb();
  if (url.startsWith('file:')) {
    // Only automatically initialize schema for local databases to avoid accidental resets in production
    try {
      // Check if schema already exists (quick check for games table)
      await db.execute('SELECT 1 FROM games LIMIT 1');
    } catch (e) {
      console.log('[DB] New database detected. Initializing schema...');
      const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');
      
      // libsql executeMultiple is needed for multiple statements
      if (db.executeMultiple) {
        await db.executeMultiple(schema);
      } else {
        // Fallback for simple splitting if executeMultiple is not available
        const statements = schema.split(';').map(s => s.trim()).filter(s => s.length > 0);
        for (const stmt of statements) {
          await db.execute(stmt);
        }
      }
    }
  }
}

function closeDb() {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

// ============================================================
// Games
// ============================================================
async function getAllGames() {
  const rs = await getDb().execute('SELECT * FROM games WHERE is_active = 1 ORDER BY name ASC');
  return rs.rows;
}
async function getGameBySlug(slug) {
  const rs = await getDb().execute({ sql: 'SELECT * FROM games WHERE slug = ?', args: [slug] });
  return rs.rows[0] || null;
}
async function getGameById(id) {
  const rs = await getDb().execute({ sql: 'SELECT * FROM games WHERE id = ?', args: [id] });
  return rs.rows[0] || null;
}

// ============================================================
// Servers
// ============================================================
async function registerServer(guildId, name, icon, userId) {
  const db = getDb();
  await db.execute({
    sql: `
      INSERT INTO servers (guild_id, name, icon, user_id)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(guild_id) DO UPDATE SET
        name       = excluded.name,
        icon       = excluded.icon,
        user_id    = excluded.user_id,
        is_active  = 1,
        updated_at = datetime('now')
    `,
    args: [guildId, name, icon, userId]
  });
  const rs = await db.execute({ sql: 'SELECT * FROM servers WHERE guild_id = ?', args: [guildId] });
  return rs.rows[0];
}

async function getServersForUser(userId) {
  const rs = await getDb().execute({ sql: 'SELECT * FROM servers WHERE user_id = ? AND is_active = 1 ORDER BY created_at DESC', args: [userId] });
  return rs.rows;
}

async function getServerById(serverId) {
  const rs = await getDb().execute({ sql: 'SELECT * FROM servers WHERE id = ?', args: [serverId] });
  return rs.rows[0] || null;
}

async function deleteServer(serverId, userId) {
  await getDb().execute({ sql: 'UPDATE servers SET is_active = 0 WHERE id = ? AND user_id = ?', args: [serverId, userId] });
}

// ============================================================
// Subscriptions
// ============================================================
async function subscribe(serverId, channelId, gameId) {
  await getDb().execute({
    sql: `
      INSERT INTO subscriptions (server_id, channel_id, game_id)
      VALUES (?, ?, ?)
      ON CONFLICT(server_id, channel_id, game_id) DO UPDATE SET
        is_active  = 1,
        created_at = datetime('now')
    `,
    args: [serverId, channelId, gameId]
  });
}

async function unsubscribe(serverId, channelId, gameId) {
  await getDb().execute({
    sql: 'UPDATE subscriptions SET is_active = 0 WHERE server_id = ? AND channel_id = ? AND game_id = ?',
    args: [serverId, channelId, gameId]
  });
}

async function updateSubscriptionSettings(serverId, channelId, gameId, pin, threads, roles) {
  await getDb().execute({
    sql: `
      UPDATE subscriptions 
      SET pin_messages = ?, use_threads = ?, mention_roles = ?
      WHERE server_id = ? AND channel_id = ? AND game_id = ?
    `,
    args: [pin ? 1 : 0, threads ? 1 : 0, roles || null, serverId, channelId, gameId]
  });
}

async function getSubscriptionsForServer(serverId) {
  const rs = await getDb().execute({
    sql: `
      SELECT s.*, g.name as game_name, g.slug as game_slug
      FROM subscriptions s
      JOIN games g ON g.id = s.game_id
      WHERE s.server_id = ? AND s.is_active = 1 AND g.is_active = 1
    `,
    args: [serverId]
  });
  return rs.rows;
}

async function getSubscriptionsForGame(gameId) {
  const rs = await getDb().execute({
    sql: `
      SELECT s.channel_id, s.server_id
      FROM subscriptions s
      JOIN servers srv ON srv.id = s.server_id
      WHERE s.game_id = ? AND s.is_active = 1 AND srv.is_active = 1
    `,
    args: [gameId]
  });
  return rs.rows;
}

// ============================================================
// Patch Notes & Delivery
// ============================================================
async function insertPatchNote(patchNote) {
  const db = getDb();
  try {
    const rs = await db.execute({
      sql: `
        INSERT INTO patch_notes (game_id, title, content, summary, url, image_url, author, source_uid, source_type, published_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        patchNote.gameId, patchNote.title, patchNote.content || null, patchNote.summary || null,
        patchNote.url || null, patchNote.imageUrl || null, patchNote.author || null,
        patchNote.sourceUid, patchNote.sourceType, patchNote.publishedAt || null
      ]
    });
    const result = await db.execute({ sql: 'SELECT * FROM patch_notes WHERE id = ?', args: [rs.lastInsertRowid.toString()] });
    return result.rows[0];
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE constraint')) return null;
    throw err;
  }
}

async function getRecentPatchNotes(gameId, limit = 10) {
  const rs = await getDb().execute({
    sql: 'SELECT * FROM patch_notes WHERE game_id = ? ORDER BY published_at DESC, fetched_at DESC LIMIT ?',
    args: [gameId, limit]
  });
  return rs.rows;
}

async function logDelivery(patchNoteId, channelId, status, errorMessage = null) {
  await getDb().execute({
    sql: `
      INSERT INTO delivery_log (patch_note_id, channel_id, status, error_message, attempts, sent_at)
      VALUES (?, ?, ?, ?, 1, CASE WHEN ? = 'sent' THEN datetime('now') ELSE NULL END)
      ON CONFLICT(patch_note_id, channel_id) DO UPDATE SET
        status        = excluded.status,
        error_message = excluded.error_message,
        attempts      = delivery_log.attempts + 1,
        sent_at       = CASE WHEN excluded.status = 'sent' THEN datetime('now') ELSE delivery_log.sent_at END
    `,
    args: [patchNoteId, channelId, status, errorMessage, status]
  });
}

// ============================================================
// Auth & Users
// ============================================================
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}
function verifyPassword(password, storedHash) {
  const [salt, hash] = storedHash.split(':');
  const computedHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === computedHash;
}
async function createUser(email, username, password) {
  const db = getDb();
  const passwordHash = hashPassword(password);
  const rs = await db.execute({ sql: 'INSERT INTO users (email, username, password_hash) VALUES (?, ?, ?)', args: [email, username, passwordHash] });
  const userRs = await db.execute({ sql: 'SELECT id, email, username, avatar_url, created_at FROM users WHERE id = ?', args: [rs.lastInsertRowid.toString()] });
  return userRs.rows[0];
}
async function getUserByEmail(email) {
  const rs = await getDb().execute({ sql: 'SELECT * FROM users WHERE email = ?', args: [email] });
  return rs.rows[0] || null;
}
async function getUserByProviderId(provider, providerId) {
  let rs;
  if (provider === 'discord') {
    rs = await getDb().execute({ sql: 'SELECT * FROM users WHERE discord_id = ?', args: [providerId] });
  } else if (provider === 'google') {
    rs = await getDb().execute({ sql: 'SELECT * FROM users WHERE google_id = ?', args: [providerId] });
  }
  return rs ? (rs.rows[0] || null) : null;
}
async function getUserById(id) {
  const rs = await getDb().execute({ sql: 'SELECT id, email, username, avatar_url, created_at FROM users WHERE id = ?', args: [id] });
  return rs.rows[0] || null;
}
async function updateUserProfile(id, email, username) {
  const db = getDb();
  await db.execute({ sql: 'UPDATE users SET email = ?, username = ?, updated_at = datetime("now") WHERE id = ?', args: [email, username, id] });
  return await getUserById(id);
}
async function createUserOAuth(email, username, provider, providerId, avatarUrl) {
  const db = getDb();
  const column = provider === 'discord' ? 'discord_id' : 'google_id';
  const rs = await db.execute({ sql: `INSERT INTO users (email, username, ${column}, avatar_url) VALUES (?, ?, ?, ?)`, args: [email, username, providerId, avatarUrl || null] });
  const userRs = await db.execute({ sql: 'SELECT id, email, username, avatar_url, created_at FROM users WHERE id = ?', args: [rs.lastInsertRowid.toString()] });
  return userRs.rows[0];
}
async function createSession(userId) {
  const db = getDb();
  const sessionId = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  await db.execute({ sql: 'INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)', args: [sessionId, userId, expiresAt] });
  return { sessionId, expiresAt };
}
async function getSession(sessionId) {
  const rs = await getDb().execute({
    sql: `
      SELECT s.*, u.id as uid, u.email, u.username, u.avatar_url
      FROM sessions s JOIN users u ON u.id = s.user_id
      WHERE s.id = ? AND s.expires_at > datetime('now')
    `,
    args: [sessionId]
  });
  return rs.rows[0] || null;
}
async function deleteSession(sessionId) {
  await getDb().execute({ sql: 'DELETE FROM sessions WHERE id = ?', args: [sessionId] });
}

module.exports = {
  getDb, closeDb, initializeSchema,
  getAllGames, getGameBySlug, getGameById,
  registerServer, getServersForUser, getServerById, deleteServer,
  subscribe, unsubscribe, updateSubscriptionSettings, getSubscriptionsForServer, getSubscriptionsForGame,
  insertPatchNote, getRecentPatchNotes, logDelivery,
  verifyPassword, createUser, getUserByEmail, getUserByProviderId, getUserById, updateUserProfile, createUserOAuth,
  createSession, getSession, deleteSession
};
