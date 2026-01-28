import { ChannelType } from 'discord.js';
import * as db from '../database.js';
import { config } from '../config.js';

const voiceJoinTime = new Map();
const musicGuildChannels = new Map();

export function registerVoiceEvents(client) {
  client.on('voiceStateUpdate', async (oldState, newState) => {
    const guildId = newState.guild.id;
    const cfg = db.getGuildConfig(guildId);

    // Temp Voice: join trigger channel -> create personal channel
    if (cfg?.temp_voice_channel_id && newState.channelId === cfg.temp_voice_channel_id && !newState.member.user.bot) {
      const guild = newState.guild;
      const categoryId = cfg.temp_voice_category_id || newState.channel?.parentId;
      const channel = await guild.channels.create({
        name: `${newState.member.displayName}'s canal`,
        type: ChannelType.GuildVoice,
        parent: categoryId,
        permissionOverwrites: [
          { id: guildId, deny: ['Connect'] },
          { id: newState.member.id, allow: ['Connect', 'Speak', 'MoveMembers', 'ManageChannels'] },
        ],
      });
      db.addTempVoiceChannel(channel.id, guildId, newState.member.id);
      await newState.member.voice.setChannel(channel);
      return;
    }

    // Temp Voice: leave empty channel -> delete
    if (oldState.channelId) {
      const oldCh = oldState.channel;
      const owner = oldCh ? db.getTempVoiceOwner(oldCh.id) : null;
      if (owner && oldCh.members.size === 0) {
        db.removeTempVoiceChannel(oldCh.id);
        await oldCh.delete().catch(() => {});
      }
    }

    // XP: track voice time
    if (newState.channelId) {
      voiceJoinTime.set(`${guildId}:${newState.member.id}`, Date.now());
    } else if (oldState.channelId) {
      const key = `${guildId}:${oldState.member.id}`;
      const t = voiceJoinTime.get(key);
      voiceJoinTime.delete(key);
      if (t && !oldState.member?.user?.bot) {
        const mins = Math.floor((Date.now() - t) / 60000);
        if (mins > 0) {
          const wasMusic = musicGuildChannels.get(guildId) === oldState.channelId;
          const xp = Math.floor(mins * (wasMusic ? config.xpPerMinuteMusic : config.xpPerMinuteVoice));
          db.addXP(guildId, oldState.member.id, xp, mins, wasMusic ? mins : 0);
        }
      }
    }
  });
}

export function setMusicVoiceChannel(guildId, voiceChannelId) {
  if (voiceChannelId) musicGuildChannels.set(guildId, voiceChannelId);
  else musicGuildChannels.delete(guildId);
}
