import { SlashCommandBuilder, ChannelType } from 'discord.js';
import * as db from '../../database.js';

export const data = new SlashCommandBuilder()
  .setName('skip')
  .setDescription('Salta la canción actual');

export async function execute(interaction, context) {
  const { distube } = context;
  const channel = interaction.member?.voice?.channel;
  if (!channel || channel.type !== ChannelType.GuildVoice) {
    return interaction.reply({ content: 'Tienes que estar en un canal de voz.', ephemeral: true });
  }
  const queue = distube.getQueue(interaction.guildId);
  if (!queue) return interaction.reply({ content: 'No hay cola activa.', ephemeral: true });
  const voiceChannel = interaction.guild.channels.cache.get(queue.voiceChannel?.id);
  const owner = db.getTempVoiceOwner(channel.id);
  const hasPerm = owner?.owner_id === interaction.user.id || db.hasTempVoicePerm(channel.id, interaction.user.id);
  if (voiceChannel && owner && channel.id === voiceChannel.id && hasPerm) {
    // Tiene permiso de temp voice: puede saltar directo
  } else if (voiceChannel && interaction.member.voice.channelId !== queue.voiceChannel?.id) {
    return interaction.reply({ content: 'Tienes que estar en el mismo canal de voz que el bot.', ephemeral: true });
  }
  try {
    await distube.skip(interaction.guild);
    return interaction.reply({ content: '⏭️ Saltando...' });
  } catch (e) {
    return interaction.reply({ content: `❌ ${e.message}`, ephemeral: true });
  }
}
