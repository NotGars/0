import { SlashCommandBuilder, ChannelType } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('bucle')
  .setDescription('Activa repetición (loop) de la canción actual');

export async function execute(interaction, context) {
  const { distube } = context;
  const channel = interaction.member?.voice?.channel;
  if (!channel) return interaction.reply({ content: 'Tienes que estar en un canal de voz.', ephemeral: true });
  const queue = distube.getQueue(interaction.guildId);
  if (!queue) return interaction.reply({ content: 'No hay cola activa.', ephemeral: true });
  if (queue.voiceChannel?.id !== channel.id) {
    return interaction.reply({ content: 'Tienes que estar en el mismo canal que el bot.', ephemeral: true });
  }
  const mode = distube.setRepeatMode(interaction.guild, 1);
  const msg = mode === 1 ? '🔁 Bucle de la canción activado.' : '🔁 Bucle activado.';
  return interaction.reply({ content: msg });
}
