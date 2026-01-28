import { SlashCommandBuilder, ChannelType } from 'discord.js';
import * as db from '../../database.js';

export const data = new SlashCommandBuilder()
  .setName('add-permiss')
  .setDescription('Da permisos a un usuario para skip/stop/pause/resume en tu canal de voz')
  .addUserOption(o => o.setName('usuario').setDescription('Usuario al que dar permiso').setRequired(true));

export async function execute(interaction, context) {
  const channel = interaction.member?.voice?.channel;
  if (!channel || channel.type !== ChannelType.GuildVoice) {
    return interaction.reply({ content: 'Tienes que estar en tu canal de voz temporal.', ephemeral: true });
  }
  const owner = db.getTempVoiceOwner(channel.id);
  if (!owner || owner.owner_id !== interaction.user.id) {
    return interaction.reply({ content: 'Solo el creador del canal puede dar permisos.', ephemeral: true });
  }
  const user = interaction.options.getUser('usuario');
  if (user.bot) return interaction.reply({ content: 'No puedes dar permisos a un bot.', ephemeral: true });
  db.addTempVoicePerm(channel.id, user.id);
  return interaction.reply({ content: `✅ **${user.username}** ahora puede usar /skip, /stop, /pause y /resume en este canal.` });
}
