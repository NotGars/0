import { SlashCommandBuilder, ChannelType } from 'discord.js';
import * as db from '../../database.js';

export const data = new SlashCommandBuilder()
  .setName('stop')
  .setDescription('Detiene la reproducción y vacía la cola');

export async function execute(interaction, context) {
  const { distube } = context;
  const channel = interaction.member?.voice?.channel;
  if (!channel) return interaction.reply({ content: 'Tienes que estar en un canal de voz.', ephemeral: true });
  const queue = distube.getQueue(interaction.guildId);
  if (!queue) return interaction.reply({ content: 'No hay cola activa.', ephemeral: true });
  const owner = db.getTempVoiceOwner(channel.id);
  const hasPerm = owner?.owner_id === interaction.user.id || db.hasTempVoicePerm(channel.id, interaction.user.id);
  if (queue.voiceChannel?.id !== channel.id) {
    return interaction.reply({ content: 'Tienes que estar en el mismo canal que el bot.', ephemeral: true });
  }
  if (owner && !hasPerm) {
    return interaction.reply({ content: 'No tienes permiso para detener en este canal.', ephemeral: true });
  }
  distube.stop(interaction.guild);
  return interaction.reply({ content: '⏹️ Reproducción detenida.' });
}
