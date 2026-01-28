import { SlashCommandBuilder, ChannelType } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('karaoke')
  .setDescription('Busca y reproduce la versión karaoke de una canción')
  .addStringOption(o => o.setName('cancion').setDescription('Nombre de la canción').setRequired(true));

export async function execute(interaction, context) {
  const { distube } = context;
  const channel = interaction.member?.voice?.channel;
  if (!channel || channel.type !== ChannelType.GuildVoice) {
    return interaction.reply({ content: 'Tienes que estar en un canal de voz.', ephemeral: true });
  }
  const query = interaction.options.getString('cancion') + ' karaoke';
  await interaction.deferReply();
  try {
    await distube.play(channel, query, {
      member: interaction.member,
      textChannel: interaction.channel,
    });
    await interaction.editReply({ content: '🎤 Buscando versión karaoke...' });
  } catch (e) {
    await interaction.editReply({ content: `❌ Error: ${e.message}` }).catch(() => {});
  }
}
