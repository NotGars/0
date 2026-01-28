FROM node:20-bookworm-slim

RUN apt-get update && apt-get install -y ffmpeg python3 ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
# --legacy-peer-deps: @distube/spotify@2 pide distube@5 pero usamos distube@4
RUN npm install --omit=dev --legacy-peer-deps

COPY . .
RUN mkdir -p data

ENV NODE_ENV=production
CMD ["npm", "start"]
