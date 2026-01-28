import { SlashCommandBuilder, ChannelType } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('any')
  .setDescription('Reproduce una canción aleatoria de la playlist activa');

export async function execute(interaction, context) {
  const { distube } = context;
  const channel = interaction.member?.voice?.channel;
  if (!channel) return interaction.reply({ content: 'Tienes que estar en un canal de voz.', ephemeral: true });
  const queue = distube.getQueue(interaction.guildId);
  if (!queue) return interaction.reply({ content: 'No hay cola activa.', ephemeral: true });
  if (queue.voiceChannel?.id !== channel.id) {
    return interaction.reply({ content: 'Tienes que estar en el mismo canal que el bot.', ephemeral: true });
  }
  const songs = (queue.songs || []).slice(1);
  if (songs.length < 1) return interaction.reply({ content: 'No hay más canciones en la cola para elegir una al azar.', ephemeral: true });
  const idx = Math.floor(Math.random() * songs.length);
  const chosen = songs[idx];
  queue.songs.splice(1 + idx, 1);
  queue.songs.splice(1, 0, chosen);
  await distube.skip(interaction.guild);
  return interaction.reply({ content: `🎲 Reproduciendo al azar: **${chosen.name}**` });
}
