-- ============================================================
-- Patch Notifier - Database Schema (Bot Architecture)
-- ============================================================

-- Games catalog: all trackable games
CREATE TABLE IF NOT EXISTS games (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT    NOT NULL,
  slug          TEXT    NOT NULL UNIQUE,
  source_type   TEXT    NOT NULL DEFAULT 'steam',
  source_id     TEXT,
  source_url    TEXT,
  image_url     TEXT,
  banner_url    TEXT,
  category      TEXT    NOT NULL DEFAULT 'pc',
  description   TEXT,
  embed_color   TEXT    DEFAULT '#5865F2',
  is_active     INTEGER NOT NULL DEFAULT 1,
  created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Registered Discord Servers (Guilds) where the bot is present
CREATE TABLE IF NOT EXISTS servers (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  guild_id      TEXT    NOT NULL UNIQUE,
  user_id       INTEGER NOT NULL,                     -- The user who added the bot
  name          TEXT    NOT NULL,
  icon          TEXT,
  is_active     INTEGER NOT NULL DEFAULT 1,         -- 1 = active, 0 = bot kicked
  created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Subscriptions: links servers, channels, and games
CREATE TABLE IF NOT EXISTS subscriptions (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  server_id     INTEGER NOT NULL,
  channel_id    TEXT    NOT NULL,                     -- Discord Channel ID
  game_id       INTEGER NOT NULL,
  is_active     INTEGER NOT NULL DEFAULT 1,
  created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (server_id) REFERENCES servers(id) ON DELETE CASCADE,
  FOREIGN KEY (game_id)    REFERENCES games(id)    ON DELETE CASCADE,
  UNIQUE(server_id, channel_id, game_id)              -- No duplicate subscriptions per channel
);

-- Patch notes: history of all detected updates
CREATE TABLE IF NOT EXISTS patch_notes (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  game_id       INTEGER NOT NULL,
  title         TEXT    NOT NULL,
  content       TEXT,
  summary       TEXT,
  url           TEXT,
  image_url     TEXT,
  author        TEXT,
  source_uid    TEXT,
  source_type   TEXT    NOT NULL,
  published_at  TEXT,
  fetched_at    TEXT    NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
  UNIQUE(game_id, source_uid)
);

-- Delivery log: tracks which patch notes were sent to which channels
CREATE TABLE IF NOT EXISTS delivery_log (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  patch_note_id INTEGER NOT NULL,
  channel_id    TEXT    NOT NULL,
  status        TEXT    NOT NULL DEFAULT 'pending',  -- 'pending', 'sent', 'failed'
  error_message TEXT,
  attempts      INTEGER NOT NULL DEFAULT 0,
  sent_at       TEXT,
  created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (patch_note_id) REFERENCES patch_notes(id) ON DELETE CASCADE,
  UNIQUE(patch_note_id, channel_id)                  -- One delivery per patch note per channel
);

-- ============================================================
-- Auth & Users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  email         TEXT    NOT NULL UNIQUE,
  username      TEXT    NOT NULL,
  password_hash TEXT,
  discord_id    TEXT    UNIQUE,
  google_id     TEXT    UNIQUE,
  avatar_url    TEXT,
  is_active     INTEGER NOT NULL DEFAULT 1,
  created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  id            TEXT    PRIMARY KEY,
  user_id       INTEGER NOT NULL,
  expires_at    TEXT    NOT NULL,
  created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS password_resets (
  id            TEXT    PRIMARY KEY,
  user_id       INTEGER NOT NULL,
  expires_at    TEXT    NOT NULL,
  created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email            ON users(email);
CREATE INDEX IF NOT EXISTS idx_sessions_user          ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_games_slug             ON games(slug);
CREATE INDEX IF NOT EXISTS idx_games_is_active        ON games(is_active);
CREATE INDEX IF NOT EXISTS idx_subscriptions_server   ON subscriptions(server_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_game     ON subscriptions(game_id);
CREATE INDEX IF NOT EXISTS idx_patch_notes_game       ON patch_notes(game_id);
CREATE INDEX IF NOT EXISTS idx_delivery_log_status    ON delivery_log(status);
