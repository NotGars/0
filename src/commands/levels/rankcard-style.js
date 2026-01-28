import { SlashCommandBuilder } from 'discord.js';
import * as db from '../../database.js';

export const data = new SlashCommandBuilder()
  .setName('rankcard-style')
  .setDescription('Cambiar estilo de la rankcard (según nivel desbloqueado)')
  .addIntegerOption(o =>
    o.setName('estilo')
      .setDescription('0: Lo-fi Night (gratis) | 1: Lo-fi Minimal (nivel 25) | 2: Lo-fi Anime Desk (nivel 50)')
      .setRequired(true)
      .addChoices(
        { name: 'Lo-fi Night (default)', value: 0 },
        { name: 'Lo-fi Minimal (nivel 25)', value: 1 },
        { name: 'Lo-fi Anime Desk (nivel 50)', value: 2 }
      )
  );

export async function execute(interaction) {
  const style = interaction.options.getInteger('estilo');
  const u = db.getUser(interaction.guildId, interaction.user.id);
  const { level } = db.getLevelFromXP(u.xp);
  const required = [0, 25, 50][style];
  if (level < required) {
    return interaction.reply({
      content: `Necesitas nivel **${required}** para usar este estilo. Ahora tienes nivel ${level}.`,
      ephemeral: true,
    });
  }
  db.setRankcardStyle(interaction.guildId, interaction.user.id, style);
  const names = ['Lo-fi Night', 'Lo-fi Minimal', 'Lo-fi Anime Desk'];
  return interaction.reply({ content: `✅ Estilo de rankcard cambiado a **${names[style]}**.` });
}
