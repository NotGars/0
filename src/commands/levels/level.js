import { SlashCommandBuilder } from 'discord.js';
import * as db from '../../database.js';
import { generateRankcard } from '../../utils/rankcard.js';

export const data = new SlashCommandBuilder()
  .setName('level')
  .setDescription('Ver tu nivel y XP')
  .addUserOption(o => o.setName('usuario').setDescription('Usuario (por defecto tú)').setRequired(false));

export async function execute(interaction, context) {
  const user = interaction.options.getUser('usuario') || interaction.user;
  const u = db.getUser(interaction.guildId, user.id);
  const { level, currentXP, needed } = db.getLevelFromXP(u.xp);
  const leaderboard = db.getLeaderboard(interaction.guildId, 100);
  const rank = leaderboard.findIndex(r => r.id === user.id) + 1;
  const buffer = await generateRankcard({
    username: user.username,
    avatarURL: user.displayAvatarURL({ size: 128, extension: 'png' }),
    level,
    currentXP,
    needed,
    rank: rank || null,
    style: u.rankcard_style ?? 0,
  });
  await interaction.reply({
    files: [{ attachment: buffer, name: 'rankcard.png' }],
    content: `**${user.username}** — Nivel ${level} (${u.xp} XP total)`,
  });
}
