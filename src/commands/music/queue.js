import { SlashCommandBuilder, ChannelType } from 'discord.js';
import { config } from '../../config.js';

export const data = new SlashCommandBuilder()
  .setName('queue')
  .setDescription('Muestra la cola de reproducción');

export async function execute(interaction, context) {
  const { distube } = context;
  const queue = distube.getQueue(interaction.guildId);
  if (!queue) return interaction.reply({ content: 'No hay cola activa.', ephemeral: true });
  const songs = queue.songs || [];
  const current = songs[0];
  const list = songs.slice(1, 11).map((s, i) => `${i + 2}. **${s.name}** — \`${s.formattedDuration}\``).join('\n');
  await interaction.reply({
    embeds: [{
      color: config.embedColor,
      title: '📋 Cola de reproducción',
      description: (current ? `▶️ **Ahora:** ${current.name} — \`${current.formattedDuration}\`\n\n` : '') + (list || '—') + (songs.length > 11 ? `\n\n... y ${songs.length - 11} más` : ''),
    }],
  });
}
