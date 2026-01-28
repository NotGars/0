import { createCanvas, loadImage, GlobalFonts } from 'canvas';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Colores y estilos por tipo (0=Lo-fi Night, 1=Lo-fi Minimal, 2=Lo-fi Anime Desk)
const STYLES = {
  0: {
    bg: '#1a1625',
    barBg: '#2d2640',
    barFill: ['#6b4c9a', '#4a7c9e'],
    text: '#e8e4ef',
    subtext: '#9d8fb5',
    accent: '#c4a777',
    grain: true,
    width: 400,
    height: 140,
  },
  1: {
    bg: '#f5f0e8',
    barBg: '#e0dcd4',
    barFill: ['#8b7355', '#a89f91'],
    text: '#2c2825',
    subtext: '#6b6560',
    accent: '#5c5348',
    grain: false,
    width: 400,
    height: 140,
  },
  2: {
    bg: '#faf5ef',
    barBg: '#e8e0d5',
    barFill: ['#c9b8a8', '#b5a090'],
    text: '#4a4540',
    subtext: '#8a8580',
    accent: '#a68b6b',
    grain: false,
    width: 400,
    height: 140,
  },
};

function drawGrain(ctx, w, h) {
  const imageData = ctx.getImageData(0, 0, w, h);
  const d = imageData.data;
  for (let i = 0; i < d.length; i += 4) {
    const g = (Math.random() - 0.5) * 15;
    d[i] = Math.max(0, Math.min(255, d[i] + g));
    d[i + 1] = Math.max(0, Math.min(255, d[i + 1] + g));
    d[i + 2] = Math.max(0, Math.min(255, d[i + 2] + g));
  }
  ctx.putImageData(imageData, 0, 0);
}

/**
 * Genera un buffer PNG de la rankcard
 * @param {Object} opts
 * @param {string} opts.username
 * @param {string} [opts.avatarURL]
 * @param {number} opts.level
 * @param {number} opts.currentXP
 * @param {number} opts.needed
 * @param {number} opts.rank
 * @param {number} opts.style 0 | 1 | 2
 * @param {number} [opts.voiceMinutes]
 * @param {number} [opts.musicMinutes]
 */
export async function generateRankcard(opts) {
  const style = STYLES[opts.style in STYLES ? opts.style : 0];
  const { width, height } = style;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = style.bg;
  ctx.fillRect(0, 0, width, height);

  if (style.grain) {
    drawGrain(ctx, width, height);
  }

  const progress = Math.min(1, opts.currentXP / (opts.needed || 1));
  const barW = width - 48;
  const barH = 12;
  const barX = 24;
  const barY = height - 32;

  ctx.fillStyle = style.barBg;
  ctx.beginPath();
  const r = 6;
  ctx.moveTo(barX + r, barY);
  ctx.lineTo(barX + barW - r, barY);
  ctx.quadraticCurveTo(barX + barW, barY, barX + barW, barY + r);
  ctx.lineTo(barX + barW, barY + barH - r);
  ctx.quadraticCurveTo(barX + barW, barY + barH, barX + barW - r, barY + barH);
  ctx.lineTo(barX + r, barY + barH);
  ctx.quadraticCurveTo(barX, barY + barH, barX, barY + barH - r);
  ctx.lineTo(barX, barY + r);
  ctx.quadraticCurveTo(barX, barY, barX + r, barY);
  ctx.closePath();
  ctx.fill();

  const gradient = ctx.createLinearGradient(barX, 0, barX + barW, 0);
  gradient.addColorStop(0, style.barFill[0]);
  gradient.addColorStop(1, style.barFill[1] || style.barFill[0]);
  ctx.fillStyle = gradient;
  ctx.fillRect(barX, barY, barW * progress, barH);

  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth = 1;
  ctx.strokeRect(barX, barY, barW, barH);

  ctx.fillStyle = style.text;
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText(String(opts.username).slice(0, 25), 24, 28);

  ctx.fillStyle = style.subtext;
  ctx.font = '12px sans-serif';
  ctx.fillText(`Nivel ${opts.level}  •  ${opts.currentXP} / ${opts.needed} XP`, 24, 50);

  if (opts.rank != null) {
    ctx.fillStyle = style.accent;
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(`#${opts.rank}`, width - 50, 28);
  }

  if (opts.avatarURL) {
    try {
      const img = await loadImage(opts.avatarURL);
      ctx.save();
      ctx.beginPath();
      ctx.arc(56, height - 70, 24, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, 32, height - 94, 48, 48);
      ctx.restore();
      ctx.strokeStyle = style.accent;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(56, height - 70, 24, 0, Math.PI * 2);
      ctx.stroke();
    } catch (_) {}
  }

  return canvas.toBuffer('image/png');
}

export const RANKCARD_STYLES = STYLES;
