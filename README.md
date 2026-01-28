# LagMusic

Bot de música para Discord con reproducción real de audio, sistema de niveles con rankcards, canales de voz temporales (Temp Voice) y más.

## Características

- **Música**: Reproduce audio desde YouTube, Spotify, YouTube Music y otros (vía yt-dlp).
- **Niveles y rankcards**: Experiencia por tiempo en voz y escuchando música; 3 estilos de tarjetas desbloqueables.
- **Temp Voice**: Canales de voz temporales creados al unirse a un canal configurado.
- **Comandos de administración**: Configuración de Temp Voice y canal de música.

## Requisitos

- **Node.js** 18 o superior
- **FFmpeg** instalado y en el PATH (para audio)
- **Python** (opcional, para que yt-dlp pueda actualizarse)

## Instalación

1. Clona el repositorio e instala dependencias:

```bash
git clone https://github.com/TU_USUARIO/LagMusic.git
cd LagMusic
npm install
```

2. Crea un archivo `.env` en la raíz:

```env
DISCORD_TOKEN=tu_token_del_bot
CLIENT_ID=id_de_la_aplicacion_del_bot
```

   - Obtén el token y el Client ID en [Discord Developer Portal](https://discord.com/developers/applications).
   - Para Spotify (playlists y búsquedas): crea una app en [Spotify for Developers](https://developer.spotify.com/) y añade:

```env
SPOTIFY_CLIENT_ID=tu_client_id
SPOTIFY_CLIENT_SECRET=tu_client_secret
```

3. Registra los comandos slash (solo la primera vez o al añadir comandos):

```bash
npm run deploy
```

4. Inicia el bot:

```bash
npm start
```

## Despliegue en Render

1. Crea un **Web Service** o **Background Worker** en [Render](https://render.com).
2. Conecta el repositorio de GitHub.
3. Configura:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (o superior si necesitas más tiempo de ejecución)
4. Añade las variables de entorno en **Environment**:
   - `DISCORD_TOKEN`
   - `CLIENT_ID`
   - (Opcional) `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`
5. Si Render no incluye FFmpeg por defecto, usa un **Dockerfile** o un buildpack que lo instale (por ejemplo, `apt-get install -y ffmpeg` en el build).

### Nota sobre FFmpeg y yt-dlp en Render

- En plan Free, el contenedor puede dormir; al despertar el bot se reconecta.
- Para que la música funcione, el entorno debe tener **FFmpeg** instalado. En Render puedes usar un Dockerfile como:

```dockerfile
FROM node:20-bookworm-slim
RUN apt-get update && apt-get install -y ffmpeg python3 && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
CMD ["npm", "start"]
```

- Crea un **Dockerfile** en la raíz y en Render elige "Docker" como entorno para que use este archivo.

## Comandos

### Música

| Comando | Descripción |
|---------|-------------|
| `/play <canción>` | Reproduce una canción o la añade a la cola. |
| `/play-playlist [plataforma] <playlist>` | Carga y reproduce una playlist (YouTube, Spotify, YT Music, etc.). |
| `/skip` | Salta la canción actual. |
| `/pause` | Pausa la reproducción. |
| `/resume` | Reanuda la reproducción. |
| `/stop` | Detiene y vacía la cola. |
| `/bucle` | Activa el bucle de la canción actual. |
| `/stop-bucle` | Desactiva el bucle. |
| `/any` | Reproduce una canción aleatoria de la cola. |
| `/random` | Mezcla la cola (shuffle). |
| `/vote-skip` | Abre votación para saltar; se salta si más de la mitad de los presentes en el canal votan. |
| `/add-permiss <usuario>` | (Canal temporal) Da permiso a un usuario para /skip, /stop, /pause, /resume. |
| `/clear` | (Solo creador del canal) Borra todas las canciones en cola. |
| `/karaoke <canción>` | Busca y reproduce una versión karaoke. |
| `/autoplay` | Añade música relacionada según tu historial. |
| `/queue` | Muestra la cola de reproducción. |

### Niveles

| Comando | Descripción |
|---------|-------------|
| `/level [usuario]` | Muestra el nivel y la rankcard del usuario. |
| `/leaderboard` | Tabla de clasificación (top 10) del servidor. |
| `/profile [usuario]` | Perfil con rankcard, XP, tiempo en voz y tiempo escuchando música. |
| `/rankcard-style <estilo>` | Cambia el estilo de la rankcard (según nivel desbloqueado). |

### Estilos de rankcard

- **Lo-fi Night** (nivel 0, predeterminado): Fondo oscuro con grano, tonos morado, azul y café.
- **Lo-fi Minimal** (nivel 25): Fondo beige/gris claro, diseño minimalista.
- **Lo-fi Anime Desk** (nivel 50): Estilo escritorio, colores pastel.

Las rankcards se generan como **imágenes** (no embeds).

### Temp Voice

- Un administrador configura con `/config temp-voice` el **canal de voz** al que los usuarios deben unirse.
- Al unirse, se crea un **canal temporal** cuyo dueño es ese usuario.
- El creador puede renombrar el canal, dar permisos con `/add-permiss` y, en canales temporales, usar `/clear` y tener control sobre skip/stop/pause/resume.
- Cuando el canal queda vacío, se elimina solo.

### Administración

| Comando | Descripción |
|---------|-------------|
| `/config temp-voice <canal> [categoría]` | Define el canal de voz que crea canales temporales y, opcionalmente, la categoría. |
| `/config music-channel [canal]` | Canal de texto donde el bot anuncia “Reproduciendo” (si no se pone, se usa el canal donde se ejecuta /play). |
| `/config ver` | Muestra la configuración actual. |

### Ayuda

| Comando | Descripción |
|---------|-------------|
| `/help` | Muestra un embed morado con todos los comandos y descripciones. |

## Sistema de niveles

- **XP**: Se gana por tiempo en canales de voz y por tiempo escuchando música con el bot.
- **Nivel**: Se calcula a partir del XP acumulado (fórmula progresiva por nivel).
- **Rankcards**: Imágenes generadas con el nivel, barra de progreso, puesto en el servidor y estilo desbloqueado.

## Estructura del proyecto

```
LagMusic/
├── src/
│   ├── index.js           # Entrada y registro de comandos/eventos
│   ├── config.js          # Variables de entorno y opciones
│   ├── database.js        # SQLite y funciones de datos
│   ├── deploy-commands.js # Registro global de comandos slash
│   ├── commands/
│   │   ├── help.js
│   │   ├── admin/         # config
│   │   ├── levels/        # level, leaderboard, profile, rankcard-style
│   │   └── music/         # play, skip, pause, resume, etc.
│   ├── events/
│   │   └── voiceStateUpdate.js  # Temp Voice + tiempo en voz para XP
│   ├── music/
│   │   └── player.js      # DisTube + yt-dlp + Spotify
│   └── utils/
│       └── rankcard.js     # Generación de imágenes de rankcard
├── data/                  # Base de datos SQLite (se crea al ejecutar)
├── package.json
├── .env.example
└── README.md
```

## Subir a GitHub

1. Crea un repositorio nuevo en [GitHub](https://github.com/new) (por ejemplo `LagMusic`).
2. En la carpeta del proyecto, ejecuta:

```bash
git init
git add .
git commit -m "LagMusic: bot de música para Discord"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/LagMusic.git
git push -u origin main
```

3. Sustituye `TU_USUARIO` por tu nombre de usuario de GitHub.
4. Si ya tenías un repositorio remoto, usa `git remote set-url origin ...` y luego `git push -u origin main`.

**Importante**: No subas tu archivo `.env`. Está en `.gitignore`. En Render (y en cualquier despliegue) configura las variables de entorno en el panel del servicio.

## Licencia

MIT.
