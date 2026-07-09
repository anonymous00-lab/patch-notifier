/**
 * Database connection and initialization module for Bot Architecture.
 */
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(process.cwd(), 'patch-notifier.db');
const SCHEMA_PATH = path.join(process.cwd(), 'src', 'lib', 'db', 'schema.sql');

let dbInstance = null;

function getDb() {
  if (dbInstance) return dbInstance;
  const isNewDb = !fs.existsSync(DB_PATH);
  dbInstance = new Database(DB_PATH, {});
  dbInstance.pragma('journal_mode = WAL');
  dbInstance.pragma('foreign_keys = ON');
  dbInstance.pragma('busy_timeout = 5000');

  if (isNewDb) {
    console.log('[DB] New database detected. Initializing schema...');
    initializeSchema(dbInstance);
  } else {
    initializeSchema(dbInstance);
  }
  return dbInstance;
}

function initializeSchema(db) {
  const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');
  db.exec(schema);
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
function getAllGames() {
  return getDb().prepare('SELECT * FROM games WHERE is_active = 1 ORDER BY name ASC').all();
}
function getGameBySlug(slug) {
  return getDb().prepare('SELECT * FROM games WHERE slug = ?').get(slug);
}
function getGameById(id) {
  return getDb().prepare('SELECT * FROM games WHERE id = ?').get(id);
}

// ============================================================
// Servers (replaces webhooks)
// ============================================================
function registerServer(guildId, name, icon, userId) {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO servers (guild_id, name, icon, user_id)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(guild_id) DO UPDATE SET
      name       = excluded.name,
      icon       = excluded.icon,
      user_id    = excluded.user_id,
      is_active  = 1,
      updated_at = datetime('now')
  `);
  stmt.run(guildId, name, icon, userId);
  return db.prepare('SELECT * FROM servers WHERE guild_id = ?').get(guildId);
}

function getServersForUser(userId) {
  return getDb().prepare('SELECT * FROM servers WHERE user_id = ? AND is_active = 1 ORDER BY created_at DESC').all(userId);
}

function getServerById(serverId) {
  return getDb().prepare('SELECT * FROM servers WHERE id = ?').get(serverId);
}

function deleteServer(serverId, userId) {
  return getDb().prepare('UPDATE servers SET is_active = 0 WHERE id = ? AND user_id = ?').run(serverId, userId);
}

// ============================================================
// Subscriptions
// ============================================================
function subscribe(serverId, channelId, gameId) {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO subscriptions (server_id, channel_id, game_id)
    VALUES (?, ?, ?)
    ON CONFLICT(server_id, channel_id, game_id) DO UPDATE SET
      is_active  = 1,
      created_at = datetime('now')
  `);
  return stmt.run(serverId, channelId, gameId);
}

function unsubscribe(serverId, channelId, gameId) {
  return getDb().prepare(
    'UPDATE subscriptions SET is_active = 0 WHERE server_id = ? AND channel_id = ? AND game_id = ?'
  ).run(serverId, channelId, gameId);
}

function updateSubscriptionSettings(serverId, channelId, gameId, pin, threads, roles) {
  return getDb().prepare(`
    UPDATE subscriptions 
    SET pin_messages = ?, use_threads = ?, mention_roles = ?
    WHERE server_id = ? AND channel_id = ? AND game_id = ?
  `).run(pin ? 1 : 0, threads ? 1 : 0, roles || null, serverId, channelId, gameId);
}

function getSubscriptionsForServer(serverId) {
  return getDb().prepare(`
    SELECT s.*, g.name as game_name, g.slug as game_slug
    FROM subscriptions s
    JOIN games g ON g.id = s.game_id
    WHERE s.server_id = ? AND s.is_active = 1 AND g.is_active = 1
  `).all(serverId);
}

function getSubscriptionsForGame(gameId) {
  return getDb().prepare(`
    SELECT s.channel_id, s.server_id
    FROM subscriptions s
    JOIN servers srv ON srv.id = s.server_id
    WHERE s.game_id = ? AND s.is_active = 1 AND srv.is_active = 1
  `).all(gameId);
}

// ============================================================
// Patch Notes & Delivery
// ============================================================
function insertPatchNote(patchNote) {
  const db = getDb();
  try {
    const stmt = db.prepare(`
      INSERT INTO patch_notes (game_id, title, content, summary, url, image_url, author, source_uid, source_type, published_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      patchNote.gameId, patchNote.title, patchNote.content || null, patchNote.summary || null,
      patchNote.url || null, patchNote.imageUrl || null, patchNote.author || null,
      patchNote.sourceUid, patchNote.sourceType, patchNote.publishedAt || null
    );
    return db.prepare('SELECT * FROM patch_notes WHERE id = ?').get(result.lastInsertRowid);
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') return null;
    throw err;
  }
}

function getRecentPatchNotes(gameId, limit = 10) {
  return getDb().prepare(`
    SELECT * FROM patch_notes WHERE game_id = ? ORDER BY published_at DESC, fetched_at DESC LIMIT ?
  `).all(gameId, limit);
}

function logDelivery(patchNoteId, channelId, status, errorMessage = null) {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO delivery_log (patch_note_id, channel_id, status, error_message, attempts, sent_at)
    VALUES (?, ?, ?, ?, 1, CASE WHEN ? = 'sent' THEN datetime('now') ELSE NULL END)
    ON CONFLICT(patch_note_id, channel_id) DO UPDATE SET
      status        = excluded.status,
      error_message = excluded.error_message,
      attempts      = delivery_log.attempts + 1,
      sent_at       = CASE WHEN excluded.status = 'sent' THEN datetime('now') ELSE delivery_log.sent_at END
  `);
  return stmt.run(patchNoteId, channelId, status, errorMessage, status);
}

// ============================================================
// Auth & Users
// ============================================================
const crypto = require('crypto');

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
function createUser(email, username, password) {
  const db = getDb();
  const passwordHash = hashPassword(password);
  const result = db.prepare('INSERT INTO users (email, username, password_hash) VALUES (?, ?, ?)').run(email, username, passwordHash);
  return db.prepare('SELECT id, email, username, avatar_url, created_at FROM users WHERE id = ?').get(result.lastInsertRowid);
}
function getUserByEmail(email) {
  return getDb().prepare('SELECT * FROM users WHERE email = ?').get(email);
}
function getUserByProviderId(provider, providerId) {
  if (provider === 'discord') {
    return getDb().prepare('SELECT * FROM users WHERE discord_id = ?').get(providerId);
  } else if (provider === 'google') {
    return getDb().prepare('SELECT * FROM users WHERE google_id = ?').get(providerId);
  }
  return null;
}
function getUserById(id) {
  return getDb().prepare('SELECT id, email, username, avatar_url, created_at FROM users WHERE id = ?').get(id);
}
function updateUserProfile(id, email, username) {
  const db = getDb();
  db.prepare('UPDATE users SET email = ?, username = ?, updated_at = datetime("now") WHERE id = ?').run(email, username, id);
  return getUserById(id);
}
function createUserOAuth(email, username, provider, providerId, avatarUrl) {
  const db = getDb();
  const column = provider === 'discord' ? 'discord_id' : 'google_id';
  const result = db.prepare(`INSERT INTO users (email, username, ${column}, avatar_url) VALUES (?, ?, ?, ?)`).run(email, username, providerId, avatarUrl || null);
  return db.prepare('SELECT id, email, username, avatar_url, created_at FROM users WHERE id = ?').get(result.lastInsertRowid);
}
function createSession(userId) {
  const db = getDb();
  const sessionId = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  db.prepare('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)').run(sessionId, userId, expiresAt);
  return { sessionId, expiresAt };
}
function getSession(sessionId) {
  return getDb().prepare(`
    SELECT s.*, u.id as uid, u.email, u.username, u.avatar_url
    FROM sessions s JOIN users u ON u.id = s.user_id
    WHERE s.id = ? AND s.expires_at > datetime('now')
  `).get(sessionId) || null;
}
function deleteSession(sessionId) {
  return getDb().prepare('DELETE FROM sessions WHERE id = ?').run(sessionId);
}

module.exports = {
  getDb, closeDb,
  getAllGames, getGameBySlug, getGameById,
  registerServer, getServersForUser, getServerById, deleteServer,
  subscribe, unsubscribe, updateSubscriptionSettings, getSubscriptionsForServer, getSubscriptionsForGame,
  insertPatchNote, getRecentPatchNotes, logDelivery,
  verifyPassword, createUser, getUserByEmail, getUserByProviderId, getUserById, updateUserProfile, createUserOAuth,
  createSession, getSession, deleteSession
};
