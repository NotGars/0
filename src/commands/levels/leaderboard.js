import { SlashCommandBuilder, AttachmentBuilder } from 'discord.js';
import * as db from '../../database.js';
import { createCanvas } from 'canvas';

export const data = new SlashCommandBuilder()
  .setName('leaderboard')
  .setDescription('Top 10 usuarios por nivel (tabla de clasificación)');

export async function execute(interaction) {
  const list = db.getLeaderboard(interaction.guildId, 10);
  if (!list.length) {
    return interaction.reply({ content: 'Aún no hay datos de niveles en este servidor.', ephemeral: true });
  }
  const canvas = createCanvas(400, 50 + list.length * 36);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#1a1625';
  ctx.fillRect(0, 0, 400, canvas.height);
  ctx.fillStyle = '#e8e4ef';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('🏆 Clasificación — Top 10', 16, 28);
  ctx.font = '14px sans-serif';
  for (let i = 0; i < list.length; i++) {
    const u = list[i];
    const { level } = db.getLevelFromXP(u.xp);
    const y = 50 + i * 36;
    ctx.fillStyle = i < 3 ? '#c4a777' : '#9d8fb5';
    ctx.fillText(`#${i + 1}`, 16, y);
    ctx.fillStyle = '#e8e4ef';
    try {
      const member = await interaction.guild.members.fetch(u.id).catch(() => null);
      const name = member?.user?.username ?? u.id;
      ctx.fillText(String(name).slice(0, 20), 50, y);
    } catch {
      ctx.fillText(u.id.slice(0, 18), 50, y);
    }
    ctx.fillStyle = '#6b4c9a';
    ctx.fillText(`Nvl ${level} • ${u.xp} XP`, 280, y);
  }
  const buf = canvas.toBuffer('image/png');
  await interaction.reply({
    content: '**Tabla de clasificación**',
    files: [new AttachmentBuilder(buf, { name: 'leaderboard.png' })],
  });
}
