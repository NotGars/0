import { SlashCommandBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';
import * as db from '../../database.js';
import { config } from '../../config.js';

export const data = new SlashCommandBuilder()
  .setName('config')
  .setDescription('Configuración del bot (solo administradores)')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addSubcommand(s => s
    .setName('temp-voice')
    .setDescription('Canal de voz al que unirse para crear canal temporal')
    .addChannelOption(o => o.setName('canal').setDescription('Canal de voz').setRequired(true).addChannelTypes(ChannelType.GuildVoice))
    .addChannelOption(o => o.setName('categoria').setDescription('Categoría donde crear canales').setRequired(false).addChannelTypes(ChannelType.GuildCategory))
  )
  .addSubcommand(s => s
    .setName('music-channel')
    .setDescription('Canal de texto donde el bot anuncia la música (opcional)')
    .addChannelOption(o => o.setName('canal').setDescription('Canal de texto').setRequired(false).addChannelTypes(ChannelType.GuildText))
  )
  .addSubcommand(s => s
    .setName('ver')
    .setDescription('Ver configuración actual')
  );

export async function execute(interaction) {
  const sub = interaction.options.getSubcommand();
  const guildId = interaction.guildId;
  const cfg = db.getGuildConfig(guildId) || {};

  if (sub === 'ver') {
    const ch = interaction.guild.channels.cache.get(cfg.temp_voice_channel_id);
    const cat = interaction.guild.channels.cache.get(cfg.temp_voice_category_id);
    const musicCh = interaction.guild.channels.cache.get(cfg.music_channel_id);
    return interaction.reply({
      embeds: [{
        color: config.embedColor,
        title: '⚙️ Configuración',
        fields: [
          { name: 'Temp Voice — Canal de unión', value: ch ? `<#${ch.id}>` : 'No configurado', inline: false },
          { name: 'Temp Voice — Categoría', value: cat ? `<#${cat.id}>` : 'Misma que el canal', inline: false },
          { name: 'Canal de música', value: musicCh ? `<#${musicCh.id}>` : 'Por defecto (donde se usa /play)', inline: false },
        ],
      }],
      ephemeral: true,
    });
  }

  if (sub === 'temp-voice') {
    const channel = interaction.options.getChannel('canal');
    const category = interaction.options.getChannel('categoria');
    db.setGuildConfig(guildId, 'temp_voice_channel_id', channel.id);
    if (category) db.setGuildConfig(guildId, 'temp_voice_category_id', category.id);
    return interaction.reply({
      content: `✅ Temp Voice: al unirse a **${channel.name}** se creará un canal temporal${category ? ` en **${category.name}**` : ''}.`,
      ephemeral: true,
    });
  }

  if (sub === 'music-channel') {
    const channel = interaction.options.getChannel('canal');
    db.setGuildConfig(guildId, 'music_channel_id', channel?.id ?? null);
    return interaction.reply({
      content: channel ? `✅ Canal de música: **${channel.name}**` : '✅ Canal de música desactivado (se usará el canal donde se ejecute /play).',
      ephemeral: true,
    });
  }
}
