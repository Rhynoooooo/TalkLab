import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read logo-blue.png
const pngBuffer = fs.readFileSync(path.join(__dirname, '../public/assets/logo-blue.png'));

// Construct ICO header with embedded PNG
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // Reserved
header.writeUInt16LE(1, 2); // Type 1 = ICO
header.writeUInt16LE(1, 4); // Number of images

const dirEntry = Buffer.alloc(16);
dirEntry.writeUInt8(0, 0); // 0 means 256 or custom width
dirEntry.writeUInt8(0, 1); // 0 means 256 or custom height
dirEntry.writeUInt8(0, 2); // Color palette
dirEntry.writeUInt8(0, 3); // Reserved
dirEntry.writeUInt16LE(1, 4); // Color planes
dirEntry.writeUInt16LE(32, 6); // Bits per pixel
dirEntry.writeUInt32LE(pngBuffer.length, 8); // Image size in bytes
dirEntry.writeUInt32LE(22, 12); // Offset to image data (6 + 16 = 22)

const icoBuffer = Buffer.concat([header, dirEntry, pngBuffer]);

// Write to src/app/favicon.ico and public/favicon.ico
fs.writeFileSync(path.join(__dirname, '../src/app/favicon.ico'), icoBuffer);
fs.writeFileSync(path.join(__dirname, '../public/favicon.ico'), icoBuffer);

// Also copy logo-blue.png to src/app/icon.png and src/app/apple-icon.png
fs.copyFileSync(path.join(__dirname, '../public/assets/logo-blue.png'), path.join(__dirname, '../src/app/icon.png'));
fs.copyFileSync(path.join(__dirname, '../public/assets/logo-blue.png'), path.join(__dirname, '../src/app/apple-icon.png'));

console.log('✔ Favicon & App Icons generated successfully for TalkLab 2.0!');
