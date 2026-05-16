/**
 * generate-sound.js
 * Run once:  node generate-sound.js
 *
 * Creates  frontend/public/sounds/order-notification.wav
 * To change the sound: replace that file with any WAV/MP3 of your choice
 * and update the path in src/hooks/useOrderSound.js (the SOUND_PATH constant).
 */

const fs   = require('fs');
const path = require('path');

const SAMPLE_RATE    = 44100;
const NUM_CHANNELS   = 1;
const BITS_PER_SAMPLE = 16;

/**
 * Generate a single sine-wave tone with an exponential decay envelope.
 * @param {number} frequency  Hz
 * @param {number} duration   seconds
 * @param {number} amplitude  0–1
 */
function sineWithDecay(frequency, duration, amplitude = 0.55) {
  const n = Math.floor(SAMPLE_RATE * duration);
  const buf = new Int16Array(n);
  const attackSamples = Math.floor(SAMPLE_RATE * 0.012); // 12 ms attack

  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    // Envelope
    let env;
    if (i < attackSamples) {
      env = i / attackSamples;                       // linear attack
    } else {
      env = Math.exp(-4.5 * (t - 0.012) / (duration - 0.012)); // exp decay
    }
    buf[i] = Math.round(amplitude * env * 32767 * Math.sin(2 * Math.PI * frequency * t));
  }
  return buf;
}

/** Silence block (milliseconds) */
function silence(ms) {
  return new Int16Array(Math.floor(SAMPLE_RATE * ms / 1000));
}

/** Concatenate Int16Arrays */
function concat(...arrays) {
  const total = arrays.reduce((s, a) => s + a.length, 0);
  const out   = new Int16Array(total);
  let offset  = 0;
  for (const a of arrays) { out.set(a, offset); offset += a.length; }
  return out;
}

/** Wrap PCM samples in a minimal WAV container */
function toWAV(samples) {
  const dataLen = samples.length * 2;           // 16-bit = 2 bytes/sample
  const buf     = Buffer.alloc(44 + dataLen);

  buf.write('RIFF',                              0);
  buf.writeUInt32LE(36 + dataLen,                4);
  buf.write('WAVE',                              8);
  buf.write('fmt ',                             12);
  buf.writeUInt32LE(16,                         16); // PCM chunk size
  buf.writeUInt16LE(1,                          20); // PCM format
  buf.writeUInt16LE(NUM_CHANNELS,               22);
  buf.writeUInt32LE(SAMPLE_RATE,                24);
  buf.writeUInt32LE(SAMPLE_RATE * NUM_CHANNELS * BITS_PER_SAMPLE / 8, 28);
  buf.writeUInt16LE(NUM_CHANNELS * BITS_PER_SAMPLE / 8,               32);
  buf.writeUInt16LE(BITS_PER_SAMPLE,            34);
  buf.write('data',                             36);
  buf.writeUInt32LE(dataLen,                    40);

  for (let i = 0; i < samples.length; i++) {
    buf.writeInt16LE(samples[i], 44 + i * 2);
  }
  return buf;
}

// ── Build the ding-dong ──────────────────────────────────────────────────────
// E5 (659 Hz) → 60 ms gap → C5 (523 Hz)
const pcm = concat(
  sineWithDecay(659.25, 0.70, 0.55),   // first chime  (E5)
  silence(60),                          // gap
  sineWithDecay(523.25, 0.85, 0.50),   // second chime (C5, softer)
);

const outDir  = path.join(__dirname, 'public', 'sounds');
const outFile = path.join(outDir, 'order-notification.wav');

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outFile, toWAV(pcm));

console.log(`✅  Sound written to:  ${outFile}`);
console.log('    Replace this file with any WAV/MP3 to change the kitchen alert sound.');
