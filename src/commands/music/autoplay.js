import { SlashCommandBuilder, ChannelType } from 'discord.js';
import * as db from '../../database.js';

export const data = new SlashCommandBuilder()
  .setName('autoplay')
  .setDescription('Activa reproducción automática según tu historial');

export async function execute(interaction, context) {
  const { distube } = context;
  const channel = interaction.member?.voice?.channel;
  if (!channel) return interaction.reply({ content: 'Tienes que estar en un canal de voz.', ephemeral: true });
  const queue = distube.getQueue(interaction.guildId);
  if (!queue) return interaction.reply({ content: 'No hay cola activa. Reproduce algo primero con /play.', ephemeral: true });
  if (queue.voiceChannel?.id !== channel.id) {
    return interaction.reply({ content: 'Tienes que estar en el mismo canal que el bot.', ephemeral: true });
  }
  const history = db.getMusicHistory(interaction.user.id, interaction.guildId, 10);
  if (!history.length) {
    return interaction.reply({ content: 'No hay historial de canciones para sugerir. Escucha algo primero.', ephemeral: true });
  }
  const last = history[Math.floor(Math.random() * Math.min(3, history.length))];
  const query = last?.track_title || last?.track_url || queue.songs[0]?.name;
  try {
    await distube.play(channel, query, {
      member: interaction.member,
      textChannel: interaction.channel,
      skip: false,
    });
    return interaction.reply({ content: '🎵 Autoplay: añadiendo música relacionada a la cola.' });
  } catch (e) {
    return interaction.reply({ content: `❌ No se pudo añadir: ${e.message}`, ephemeral: true });
  }
}
