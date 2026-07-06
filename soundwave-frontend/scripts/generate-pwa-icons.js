// ============================================================
// SOUNDWAVE — PWA PLACEHOLDER ICON GENERATOR
// Generates solid-brand-color square PNGs at the sizes required
// by public/manifest.json. No image deps needed (pure Node zlib).
// Swap these for real branded icons before shipping.
// Run: node scripts/generate-pwa-icons.js
// ============================================================

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const BG = [13, 13, 13, 255]; // #0D0D0D
const FG = [29, 185, 84, 255]; // #1DB954 (brand green)
const OUT_DIR = path.join(__dirname, '..', 'public', 'icons');

function crc32(buf) {
  let c;
  const table = crc32.table || (crc32.table = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c;
    }
    return t;
  })());
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

// Draws a simple centered rounded "note" glyph (a filled circle) in FG on a BG square.
function pixelAt(x, y, size) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.32;
  const dx = x - cx;
  const dy = y - cy;
  return dx * dx + dy * dy <= r * r ? FG : BG;
}

function generatePng(size) {
  const rowBytes = size * 4 + 1; // filter byte + RGBA per pixel
  const raw = Buffer.alloc(rowBytes * size);
  for (let y = 0; y < size; y++) {
    const rowStart = y * rowBytes;
    raw[rowStart] = 0; // filter: none
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = pixelAt(x, y, size);
      const px = rowStart + 1 + x * 4;
      raw[px] = r;
      raw[px + 1] = g;
      raw[px + 2] = b;
      raw[px + 3] = a;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const idat = zlib.deflateSync(raw);
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

fs.mkdirSync(OUT_DIR, { recursive: true });
for (const size of SIZES) {
  const png = generatePng(size);
  const filePath = path.join(OUT_DIR, `icon-${size}x${size}.png`);
  fs.writeFileSync(filePath, png);
  console.log(`wrote ${filePath}`);
}
