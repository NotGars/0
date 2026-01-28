import Database from 'better-sqlite3';
import { mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataPath = join(__dirname, '..', 'data');
try { mkdirSync(dataPath, { recursive: true }); } catch (_) {}
const db = new Database(join(dataPath, 'lagmusic.db'));

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT NOT NULL,
      guild_id TEXT NOT NULL,
      xp INTEGER DEFAULT 0,
      voice_minutes INTEGER DEFAULT 0,
      music_minutes INTEGER DEFAULT 0,
      rankcard_style INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (strftime('%s','now')),
      PRIMARY KEY(id, guild_id)
    );
    CREATE TABLE IF NOT EXISTS temp_voice_channels (
      channel_id TEXT PRIMARY KEY,
      guild_id TEXT NOT NULL,
      owner_id TEXT NOT NULL,
      created_at INTEGER DEFAULT (strftime('%s','now'))
    );
    CREATE TABLE IF NOT EXISTS temp_voice_permissions (
      channel_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      PRIMARY KEY(channel_id, user_id)
    );
    CREATE TABLE IF NOT EXISTS vote_skip (
      guild_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      PRIMARY KEY(guild_id, user_id)
    );
    CREATE TABLE IF NOT EXISTS music_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      guild_id TEXT NOT NULL,
      track_title TEXT,
      track_url TEXT,
      played_at INTEGER DEFAULT (strftime('%s','now'))
    );
    CREATE TABLE IF NOT EXISTS guild_config (
      guild_id TEXT PRIMARY KEY,
      temp_voice_category_id TEXT,
      temp_voice_channel_id TEXT,
      music_channel_id TEXT,
      prefix TEXT DEFAULT '!'
    );
    CREATE INDEX IF NOT EXISTS idx_users_guild ON users(guild_id);
    CREATE INDEX IF NOT EXISTS idx_temp_owner ON temp_voice_channels(owner_id);
    CREATE INDEX IF NOT EXISTS idx_music_history_user ON music_history(user_id, guild_id);
  `);
}

export function getUser(guildId, userId) {
  const row = db.prepare('SELECT * FROM users WHERE guild_id = ? AND id = ?').get(guildId, userId);
  if (row) return row;
  db.prepare('INSERT INTO users (id, guild_id) VALUES (?, ?)').run(userId, guildId);
  return db.prepare('SELECT * FROM users WHERE guild_id = ? AND id = ?').get(guildId, userId);
}

export function addXP(guildId, userId, xp, voiceMinutes = 0, musicMinutes = 0) {
  getUser(guildId, userId);
  db.prepare(`
    UPDATE users SET xp = xp + ?, voice_minutes = voice_minutes + ?, music_minutes = music_minutes + ?
    WHERE guild_id = ? AND id = ?
  `).run(xp, voiceMinutes, musicMinutes, guildId, userId);
}

export function setRankcardStyle(guildId, userId, style) {
  getUser(guildId, userId);
  db.prepare('UPDATE users SET rankcard_style = ? WHERE guild_id = ? AND id = ?').run(style, guildId, userId);
}

export function getLeaderboard(guildId, limit = 10) {
  return db.prepare(
    'SELECT * FROM users WHERE guild_id = ? ORDER BY xp DESC LIMIT ?'
  ).all(guildId, limit);
}

export function getLevelFromXP(xp) {
  let level = 1;
  let needed = 100;
  while (xp >= needed) {
    xp -= needed;
    level++;
    needed = Math.floor(100 * Math.pow(1.5, level - 1));
  }
  return { level, currentXP: xp, needed };
}

export function getTempVoiceOwner(channelId) {
  return db.prepare('SELECT owner_id FROM temp_voice_channels WHERE channel_id = ?').get(channelId);
}

export function addTempVoiceChannel(channelId, guildId, ownerId) {
  db.prepare('INSERT INTO temp_voice_channels (channel_id, guild_id, owner_id) VALUES (?, ?, ?)')
    .run(channelId, guildId, ownerId);
}

export function removeTempVoiceChannel(channelId) {
  db.prepare('DELETE FROM temp_voice_channels WHERE channel_id = ?').run(channelId);
  db.prepare('DELETE FROM temp_voice_permissions WHERE channel_id = ?').run(channelId);
}

export function addTempVoicePerm(channelId, userId) {
  db.prepare('INSERT OR IGNORE INTO temp_voice_permissions (channel_id, user_id) VALUES (?, ?)')
    .run(channelId, userId);
}

export function hasTempVoicePerm(channelId, userId) {
  const owner = getTempVoiceOwner(channelId);
  if (owner && owner.owner_id === userId) return true;
  return db.prepare('SELECT 1 FROM temp_voice_permissions WHERE channel_id = ? AND user_id = ?')
    .get(channelId, userId);
}

export function addVoteSkip(guildId, userId) {
  db.prepare('INSERT OR IGNORE INTO vote_skip (guild_id, user_id) VALUES (?, ?)').run(guildId, userId);
}

export function clearVoteSkip(guildId) {
  db.prepare('DELETE FROM vote_skip WHERE guild_id = ?').run(guildId);
}

export function getVoteSkipCount(guildId) {
  return db.prepare('SELECT COUNT(*) as c FROM vote_skip WHERE guild_id = ?').get(guildId).c;
}

export function addMusicHistory(userId, guildId, title, url) {
  db.prepare('INSERT INTO music_history (user_id, guild_id, track_title, track_url) VALUES (?, ?, ?, ?)')
    .run(userId, guildId, title || '', url || '');
}

export function getMusicHistory(userId, guildId, limit = 20) {
  return db.prepare(
    'SELECT track_title, track_url FROM music_history WHERE user_id = ? AND guild_id = ? ORDER BY played_at DESC LIMIT ?'
  ).all(userId, guildId, limit);
}

export function getGuildConfig(guildId) {
  return db.prepare('SELECT * FROM guild_config WHERE guild_id = ?').get(guildId);
}

export function setGuildConfig(guildId, key, value) {
  const row = db.prepare('SELECT guild_id FROM guild_config WHERE guild_id = ?').get(guildId);
  if (!row) {
    db.prepare('INSERT INTO guild_config (guild_id) VALUES (?)').run(guildId);
  }
  const col = key;
  if (['temp_voice_category_id', 'temp_voice_channel_id', 'music_channel_id', 'prefix'].includes(col)) {
    db.prepare(`UPDATE guild_config SET ${col} = ? WHERE guild_id = ?`).run(value, guildId);
  }
}

export default db;
