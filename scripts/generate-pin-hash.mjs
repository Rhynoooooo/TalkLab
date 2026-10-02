#!/usr/bin/env node
/**
 * TalkLab 2.0 - Passcode Hash Generator
 * Usage: node scripts/generate-pin-hash.mjs <your-passcode>
 */
import bcrypt from 'bcryptjs';

const pin = process.argv[2];

if (!pin) {
  console.error('\x1b[31m[Error] Please provide a passcode to hash.\x1b[0m');
  console.log('Example: node scripts/generate-pin-hash.mjs "TalkLab#Admin2026"');
  process.exit(1);
}

const SALT_ROUNDS = 12;
const hash = bcrypt.hashSync(pin, SALT_ROUNDS);
const b64 = Buffer.from(hash, 'utf-8').toString('base64');

console.log('\n\x1b[32m=== TalkLab 2.0 Secure Passcode Hash ===\x1b[0m');
console.log(`Passcode: "${pin}"`);
console.log(`Salt Rounds: ${SALT_ROUNDS}`);
console.log(`Raw Hash: ${hash}`);
console.log(`Base64 Encoded (Recommended for .env to prevent $ interpolation): base64:${b64}`);
console.log('\n\x1b[33mAdd this to your .env.local or production environment:\x1b[0m');
console.log(`ADMIN_PIN_HASH="base64:${b64}"\n`);
