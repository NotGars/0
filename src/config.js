import 'dotenv/config';

export const config = {
  token: process.env.DISCORD_TOKEN,
  clientId: process.env.CLIENT_ID || process.env.DISCORD_TOKEN?.split('.')[0],
  spotify: {
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  },
  embedColor: 0x6b4c9a, // Morado para ayuda
  voteSkipRatio: 0.5, // Más de la mitad para saltar
  xpPerMinuteVoice: 2,
  xpPerMinuteMusic: 3,
  xpForLevel: (level) => Math.floor(100 * Math.pow(1.5, level - 1)),
};
