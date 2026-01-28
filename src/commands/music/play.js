import { SlashCommandBuilder, ChannelType } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('play')
  .setDescription('Reproduce una canción o añade a la cola')
  .addStringOption(o => o.setName('cancion').setDescription('Nombre de la canción o URL').setRequired(true));

export async function execute(interaction, context) {
  const { client, distube } = context;
  const channel = interaction.member?.voice?.channel;
  if (!channel || channel.type !== ChannelType.GuildVoice) {
    return interaction.reply({ content: 'Tienes que estar en un canal de voz.', ephemeral: true });
  }
  const query = interaction.options.getString('cancion');
  await interaction.deferReply();
  try {
    await distube.play(channel, query, {
      member: interaction.member,
      textChannel: interaction.channel,
    });
    await interaction.editReply({ content: '🔍 Buscando y reproduciendo...' });
  } catch (e) {
    await interaction.editReply({ content: `❌ Error: ${e.message}` }).catch(() => {});
  }
}
