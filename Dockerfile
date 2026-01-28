FROM node:20-bookworm-slim

RUN apt-get update && apt-get install -y ffmpeg python3 ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .
RUN mkdir -p data

ENV NODE_ENV=production
CMD ["npm", "start"]
