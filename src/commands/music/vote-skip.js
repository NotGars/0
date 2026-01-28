import { SlashCommandBuilder, ChannelType } from 'discord.js';
import * as db from '../../database.js';
import { config } from '../../config.js';

export const data = new SlashCommandBuilder()
  .setName('vote-skip')
  .setDescription('Vota para saltar la canción actual (mayoría en el canal)');

export async function execute(interaction, context) {
  const { distube } = context;
  const channel = interaction.member?.voice?.channel;
  if (!channel) return interaction.reply({ content: 'Tienes que estar en un canal de voz.', ephemeral: true });
  const queue = distube.getQueue(interaction.guildId);
  if (!queue) return interaction.reply({ content: 'No hay cola activa.', ephemeral: true });
  if (queue.voiceChannel?.id !== channel.id) {
    return interaction.reply({ content: 'Tienes que estar en el mismo canal que el bot.', ephemeral: true });
  }
  const owner = db.getTempVoiceOwner(channel.id);
  if (owner?.owner_id === interaction.user.id || db.hasTempVoicePerm(channel.id, interaction.user.id)) {
    await distube.skip(interaction.guild);
    return interaction.reply({ content: '⏭️ Saltando (tienes permiso directo).' });
  }
  const membersInVoice = channel.members.filter(m => !m.user.bot).size;
  if (membersInVoice < 2) {
    await distube.skip(interaction.guild);
    return interaction.reply({ content: '⏭️ Solo tú en el canal, saltando.' });
  }
  db.addVoteSkip(interaction.guildId, interaction.user.id);
  const total = db.getVoteSkipCount(interaction.guildId);
  const needed = Math.ceil(membersInVoice * config.voteSkipRatio);
  if (total >= needed) {
    db.clearVoteSkip(interaction.guildId);
    await distube.skip(interaction.guild);
    return interaction.reply({ content: `⏭️ Votación superada (${total}/${needed}), saltando.` });
  }
  return interaction.reply({ content: `🗳️ Voto a favor de saltar: ${total}/${needed} necesarios.` });
}
