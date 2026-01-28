import { SlashCommandBuilder, ChannelType } from 'discord.js';
import * as db from '../../database.js';

export const data = new SlashCommandBuilder()
  .setName('clear')
  .setDescription('Borra todas las canciones en cola (solo creador del canal)');

export async function execute(interaction, context) {
  const { distube } = context;
  const channel = interaction.member?.voice?.channel;
  if (!channel) return interaction.reply({ content: 'Tienes que estar en un canal de voz.', ephemeral: true });
  const owner = db.getTempVoiceOwner(channel.id);
  if (!owner || owner.owner_id !== interaction.user.id) {
    return interaction.reply({ content: 'Solo el creador del canal puede vaciar la cola.', ephemeral: true });
  }
  const queue = distube.getQueue(interaction.guildId);
  if (!queue) return interaction.reply({ content: 'No hay cola activa.', ephemeral: true });
  if (queue.voiceChannel?.id !== channel.id) {
    return interaction.reply({ content: 'El bot no está en tu canal.', ephemeral: true });
  }
  if (queue.songs.length > 1) queue.songs.splice(1, queue.songs.length - 1);
  return interaction.reply({ content: '🗑️ Cola vaciada (queda solo la que suena).' });
}
