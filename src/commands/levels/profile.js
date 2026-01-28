import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import * as db from '../../database.js';
import { generateRankcard } from '../../utils/rankcard.js';
import { config } from '../../config.js';

export const data = new SlashCommandBuilder()
  .setName('profile')
  .setDescription('Ver perfil del usuario (información y rankcard)')
  .addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(false));

export async function execute(interaction) {
  const user = interaction.options.getUser('usuario') || interaction.user;
  const u = db.getUser(interaction.guildId, user.id);
  const { level, currentXP, needed } = db.getLevelFromXP(u.xp);
  const leaderboard = db.getLeaderboard(interaction.guildId, 100);
  const rank = leaderboard.findIndex(r => r.id === user.id) + 1;
  const progress = Math.min(100, Math.round((currentXP / (needed || 1)) * 100));
  const buffer = await generateRankcard({
    username: user.username,
    avatarURL: user.displayAvatarURL({ size: 128, extension: 'png' }),
    level,
    currentXP,
    needed,
    rank: rank || null,
    style: u.rankcard_style ?? 0,
    voiceMinutes: u.voice_minutes,
    musicMinutes: u.music_minutes,
  });
  const embed = new EmbedBuilder()
    .setColor(config.embedColor)
    .setAuthor({ name: user.username, iconURL: user.displayAvatarURL() })
    .setDescription(
      `**Nivel** ${level} (${u.xp} XP total)\n` +
      `**Progreso** ${currentXP}/${needed} (${progress}%)\n` +
      `**Puesto** ${rank ? `#${rank}` : '—'}\n` +
      `**Tiempo en voz** ${Math.floor((u.voice_minutes || 0) / 60)}h ${(u.voice_minutes || 0) % 60}min\n` +
      `**Tiempo escuchando música** ${Math.floor((u.music_minutes || 0) / 60)}h ${(u.music_minutes || 0) % 60}min`
    )
    .setImage('attachment://rankcard.png')
    .setTimestamp();
  await interaction.reply({
    embeds: [embed],
    files: [{ attachment: buffer, name: 'rankcard.png' }],
  });
}
