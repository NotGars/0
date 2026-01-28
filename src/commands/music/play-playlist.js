import { SlashCommandBuilder, ChannelType } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('play-playlist')
  .setDescription('Carga y reproduce una playlist desde YouTube, Spotify, etc.')
  .addStringOption(o => o.setName('plataforma').setDescription('YouTube, Spotify, YT Music, etc.').setRequired(false))
  .addStringOption(o => o.setName('playlist').setDescription('Nombre o enlace de la playlist').setRequired(true));

export async function execute(interaction, context) {
  const { distube } = context;
  const channel = interaction.member?.voice?.channel;
  if (!channel || channel.type !== ChannelType.GuildVoice) {
    return interaction.reply({ content: 'Tienes que estar en un canal de voz.', ephemeral: true });
  }
  const platform = interaction.options.getString('plataforma') || '';
  const playlistQuery = interaction.options.getString('playlist');
  const query = playlistQuery.startsWith('http') ? playlistQuery : `${platform} playlist:${playlistQuery}`.trim();
  await interaction.deferReply();
  try {
    await distube.play(channel, query, {
      member: interaction.member,
      textChannel: interaction.channel,
    });
    await interaction.editReply({ content: '🔍 Cargando playlist...' });
  } catch (e) {
    await interaction.editReply({ content: `❌ Error: ${e.message}` }).catch(() => {});
  }
}
