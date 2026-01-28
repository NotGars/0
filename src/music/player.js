import { DisTube } from 'distube';
import { YtDlpPlugin } from '@distube/yt-dlp';
import { SpotifyPlugin } from '@distube/spotify';
import { config } from '../config.js';
import * as db from '../database.js';

/** @param {import('discord.js').Client} client */
export function createPlayer(client) {
  const plugins = [];
  if (config.spotify?.clientId && config.spotify?.clientSecret) {
    plugins.push(new SpotifyPlugin({ api: { clientId: config.spotify.clientId, clientSecret: config.spotify.clientSecret } }));
  }
  plugins.push(new YtDlpPlugin({ update: true }));

  const player = new DisTube(client, {
    plugins,
    emitNewSongOnly: true,
    emitAddSongWhenCreatingQueue: false,
    emitAddListWhenCreatingQueue: false,
    nsfw: false,
    emptyCooldown: 300,
    savePreviousSongs: true,
    ytdlOptions: {
      highWaterMark: 1 << 24,
      dlChunkSize: 0,
    },
  });

  player.on('playSong', (queue, song) => {
    const guild = queue.textChannel?.guild;
    const cfg = guild ? db.getGuildConfig(guild.id) : null;
    const ch = (cfg?.music_channel_id && guild?.channels.cache.get(cfg.music_channel_id)) || queue.textChannel;
    if (ch) {
      ch.send({
        embeds: [{
          color: config.embedColor,
          title: '▶️ Reproduciendo',
          description: `**[${song.name}](${song.url})**\nDuración: \`${song.formattedDuration}\``,
          thumbnail: { url: song.thumbnail },
        }],
      }).catch(() => {});
    }
    if (song.user?.id) {
      db.addMusicHistory(song.user.id, queue.id, song.name, song.url);
    }
  });

  player.on('addSong', (queue, song) => {
    if (queue.textChannel && song.user) {
      queue.textChannel.send({
        embeds: [{
          color: 0x2ecc71,
          description: `✅ Añadido a la cola: **[${song.name}](${song.url})** (${song.formattedDuration})`,
        }],
      }).catch(() => {});
    }
  });

  player.on('addList', (queue, playlist) => {
    if (queue.textChannel) {
      queue.textChannel.send({
        embeds: [{
          color: config.embedColor,
          title: '📋 Playlist añadida',
          description: `**${playlist.name}** — ${playlist.songs.length} canciones`,
        }],
      }).catch(() => {});
    }
  });

  player.on('finish', (queue) => {
    if (queue.textChannel) {
      queue.textChannel.send({
        embeds: [{ color: config.embedColor, description: '🎵 Cola terminada.' }],
      }).catch(() => {});
    }
  });

  player.on('error', (channel, error) => {
    if (channel) {
      channel.send({
        embeds: [{ color: 0xe74c3c, description: `❌ Error: ${error.message}` }],
      }).catch(() => {});
    }
    console.error('[DisTube]', error);
  });

  return player;
}
