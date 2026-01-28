import { SlashCommandBuilder, ChannelType } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('random')
  .setDescription('Activa el modo aleatorio (shuffle) para la playlist');

export async function execute(interaction, context) {
  const { distube } = context;
  const channel = interaction.member?.voice?.channel;
  if (!channel) return interaction.reply({ content: 'Tienes que estar en un canal de voz.', ephemeral: true });
  const queue = distube.getQueue(interaction.guildId);
  if (!queue) return interaction.reply({ content: 'No hay cola activa.', ephemeral: true });
  if (queue.voiceChannel?.id !== channel.id) {
    return interaction.reply({ content: 'Tienes que estar en el mismo canal que el bot.', ephemeral: true });
  }
  queue.shuffle();
  return interaction.reply({ content: '🔀 Cola mezclada (shuffle).' });
}
