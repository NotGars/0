import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { config } from '../config.js';

export const data = new SlashCommandBuilder()
  .setName('help')
  .setDescription('Muestra todos los comandos y descripciones');

const COMMANDS = [
  { name: '🎵 Música', value: [
    '`/play <canción>` — Reproduce una canción o añade a la cola',
    '`/play-playlist [plataforma] <playlist>` — Carga playlist (YouTube, Spotify, etc.)',
    '`/skip` — Salta la canción actual',
    '`/pause` — Pausa',
    '`/resume` — Reanuda',
    '`/stop` — Detiene y vacía la cola',
    '`/bucle` — Activa loop de la canción',
    '`/stop-bucle` — Desactiva el bucle',
    '`/any` — Reproduce una canción aleatoria de la cola',
    '`/random` — Mezcla la cola (shuffle)',
    '`/vote-skip` — Vota para saltar (mayoría en el canal)',
    '`/add-permiss <usuario>` — Da permisos en tu canal de voz',
    '`/clear` — Vacía la cola (solo creador del canal)',
    '`/karaoke <canción>` — Busca versión karaoke',
    '`/autoplay` — Añade música relacionada según historial',
    '`/queue` — Ver cola',
  ].join('\n') },
  { name: '📊 Niveles', value: [
    '`/level` — Ver tu nivel',
    '`/leaderboard` — Top 10 del servidor',
    '`/profile [usuario]` — Perfil y rankcard',
    '`/rankcard-style <estilo>` — Cambiar estilo (0/1/2 según nivel)',
  ].join('\n') },
  { name: '🔊 Temp Voice', value: [
    'Los canales temporales se crean al unirte al canal de “Crear canal”.',
    'El creador puede renombrar, dar permisos y gestionar su canal.',
  ].join('\n') },
  { name: '⚙️ Admin', value: [
    '`/config temp-voice` — Configurar canal de creación de Temp Voice',
    '`/config music-channel` — Canal donde el bot anuncia la música',
  ].join('\n') },
];

export async function execute(interaction) {
  const embed = new EmbedBuilder()
    .setColor(config.embedColor)
    .setTitle('📖 LagMusic — Ayuda')
    .setDescription('Comandos disponibles del bot.')
    .setTimestamp();
  for (const { name, value } of COMMANDS) {
    embed.addFields({ name, value, inline: false });
  }
  return interaction.reply({ embeds: [embed] });
}
