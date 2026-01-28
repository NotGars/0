import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import { readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID || token?.split('.')[0];

if (!token || !clientId) {
  console.error('Falta DISCORD_TOKEN o CLIENT_ID en .env');
  process.exit(1);
}

const commands = [];
const dir = join(__dirname, 'commands');
const subdirs = readdirSync(dir, { withFileTypes: true }).filter(d => d.isDirectory());

for (const sub of subdirs) {
  const cmdDir = join(dir, sub.name);
  for (const f of readdirSync(cmdDir).filter(f => f.endsWith('.js'))) {
    const mod = await import(pathToFileURL(join(cmdDir, f)).href);
    if (mod.data?.toJSON) commands.push(mod.data.toJSON());
  }
}

for (const f of readdirSync(dir).filter(f => f.endsWith('.js'))) {
  const mod = await import(pathToFileURL(join(dir, f)).href);
  if (mod.data?.toJSON) commands.push(mod.data.toJSON());
}

const rest = new REST().setToken(token);
try {
  console.log(`Registrando ${commands.length} comandos...`);
  await rest.put(Routes.applicationCommands(clientId), { body: commands });
  console.log('Comandos registrados correctamente.');
} catch (e) {
  console.error(e);
  process.exit(1);
}
