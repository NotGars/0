import 'dotenv/config';
import { Client, Events, GatewayIntentBits, Collection } from 'discord.js';
import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { readdirSync } from 'fs';
import { createPlayer } from './music/player.js';
import { initDatabase } from './database.js';
import { registerVoiceEvents, setMusicVoiceChannel } from './events/voiceStateUpdate.js';
import { config } from './config.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
  ],
});

client.commands = new Collection();

async function loadCommands() {
  const commandsDir = join(__dirname, 'commands');
  const subdirs = readdirSync(commandsDir, { withFileTypes: true }).filter(d => d.isDirectory());
  for (const sub of subdirs) {
    const cmdDir = join(commandsDir, sub.name);
    for (const f of readdirSync(cmdDir).filter(f => f.endsWith('.js'))) {
      const mod = await import(pathToFileURL(join(cmdDir, f)).href);
      if (mod.data) client.commands.set(mod.data.name, mod);
    }
  }
  for (const f of readdirSync(commandsDir).filter(f => f.endsWith('.js'))) {
    const mod = await import(pathToFileURL(join(commandsDir, f)).href);
    if (mod.data) client.commands.set(mod.data.name, mod);
  }
}

async function main() {
  initDatabase();
  await loadCommands();

  const distube = createPlayer(client);
  client.distube = distube;

  distube.on('playSong', (queue) => {
    if (queue?.id && queue.voiceChannel?.id) setMusicVoiceChannel(queue.id, queue.voiceChannel.id);
  });
  distube.on('finish', (queue) => {
    if (queue?.id) setMusicVoiceChannel(queue.id, null);
  });

  registerVoiceEvents(client);

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    const cmd = client.commands.get(interaction.commandName);
    if (!cmd) return;
    const context = { client, distube };
    try {
      await cmd.execute(interaction, context);
    } catch (err) {
      console.error(err);
      const msg = { content: `Error: ${err.message}`, ephemeral: true };
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(msg).catch(() => {});
      } else {
        await interaction.reply(msg).catch(() => {});
      }
    }
  });

  client.once(Events.ClientReady, () => {
    console.log(`Conectado como ${client.user.tag}`);
  });

  await client.login(config.token);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
