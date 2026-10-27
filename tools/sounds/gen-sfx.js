// Synthesizes soft, cute UI sound effects as 16-bit mono WAV files.
const fs = require('fs');
const path = require('path');

const SR = 22050;
const outDir = process.argv[2];
const TAU = Math.PI * 2;

// deterministic noise so re-runs give identical files
let seed = 12345;
const rand = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);

const note = (n) => 440 * Math.pow(2, (n - 69) / 12); // midi -> Hz

function buffer(sec) { return new Float32Array(Math.ceil(sec * SR)); }

// add a tone with exponential decay envelope
function tone(buf, { start = 0, dur, freq, freqEnd, type = 'sine', vol = 0.5, attack = 0.005, decay = 6, vib = 0, vibRate = 6 }) {
    const s0 = Math.floor(start * SR), n = Math.floor(dur * SR);
    let phase = 0;
    for (let i = 0; i < n && s0 + i < buf.length; i++) {
        const t = i / SR, p = i / n;
        let f = freqEnd ? freq * Math.pow(freqEnd / freq, p) : freq;
        f *= 1 + vib * Math.sin(TAU * vibRate * t);
        phase += TAU * f / SR;
        let w = Math.sin(phase);
        if (type === 'triangle') w = (2 / Math.PI) * Math.asin(Math.sin(phase));
        if (type === 'square') w = Math.sin(phase) >= 0 ? 0.5 : -0.5;
        const env = Math.min(1, t / attack) * Math.exp(-decay * t) * (1 - p) ** 0.5;
        buf[s0 + i] += w * env * vol;
    }
}

// band-limited-ish noise via one-pole filters
function noise(buf, { start = 0, dur, vol = 0.3, lp = 0.1, attack = 0.15 }) {
    const s0 = Math.floor(start * SR), n = Math.floor(dur * SR);
    let y = 0, hp = 0;
    for (let i = 0; i < n && s0 + i < buf.length; i++) {
        const t = i / SR, p = i / n;
        const cutoff = lp * (0.5 + Math.sin(Math.PI * p)); // swells like a breeze
        y += cutoff * ((rand() * 2 - 1) - y);
        hp = 0.98 * hp + y; // gentle low cut
        const env = Math.sin(Math.PI * Math.min(1, t / attack) / 2) * (1 - p) ** 1.5;
        buf[s0 + i] += (y - hp * 0.02) * env * vol;
    }
}

function writeWav(name, buf) {
    // normalize to a consistent peak, then fade the tail to avoid clicks
    let peak = 0;
    for (const v of buf) peak = Math.max(peak, Math.abs(v));
    const gain = peak ? 0.7 / peak : 1;
    const fade = Math.floor(0.01 * SR);
    const data = Buffer.alloc(buf.length * 2);
    for (let i = 0; i < buf.length; i++) {
        let v = buf[i] * gain;
        if (i > buf.length - fade) v *= (buf.length - i) / fade;
        data.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(v * 32767))), i * 2);
    }
    const h = Buffer.alloc(44);
    h.write('RIFF', 0); h.writeUInt32LE(36 + data.length, 4); h.write('WAVE', 8);
    h.write('fmt ', 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22);
    h.writeUInt32LE(SR, 24); h.writeUInt32LE(SR * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34);
    h.write('data', 36); h.writeUInt32LE(data.length, 40);
    fs.writeFileSync(path.join(outDir, name + '.wav'), Buffer.concat([h, data]));
}

// short decaying noise hit (clicks, taps, swishes); lp = brightness (0..1)
function burst(buf, { start = 0, dur = 0.03, vol = 0.5, lp = 0.5, attack = 0.001 }) {
    const s0 = Math.floor(start * SR), n = Math.floor(dur * SR);
    let y = 0;
    for (let i = 0; i < n && s0 + i < buf.length; i++) {
        const t = i / SR, p = i / n;
        y += lp * ((rand() * 2 - 1) - y);
        buf[s0 + i] += y * Math.min(1, t / attack) * Math.pow(1 - p, 2) * vol;
    }
}

const sfx = {
    // bouncy "boing"
    mushroom() {
        const b = buffer(0.35);
        tone(b, { dur: 0.35, freq: 220, freqEnd: 660, vol: 0.6, decay: 7, vib: 0.04, vibRate: 18 });
        tone(b, { dur: 0.3, freq: 440, freqEnd: 1320, vol: 0.15, decay: 9 });
        return b;
    },
    // bright twinkle arpeggio
    star() {
        const b = buffer(0.6);
        [84, 88, 91, 96].forEach((n, i) => tone(b, { start: i * 0.06, dur: 0.4, freq: note(n), type: 'triangle', vol: 0.4, decay: 9 }));
        return b;
    },
    // gentle, ethereal chord with slow swell
    moon() {
        const b = buffer(1.0);
        [69, 72, 76, 81].forEach((n, i) => tone(b, { start: i * 0.04, dur: 0.95, freq: note(n), vol: 0.3, attack: 0.18, decay: 2.5, vib: 0.004, vibRate: 5 }));
        return b;
    },
    // soft airy whoosh
    cloud() {
        const b = buffer(0.7);
        noise(b, { dur: 0.7, vol: 0.9, lp: 0.08, attack: 0.25 });
        tone(b, { dur: 0.6, freq: note(79), vol: 0.06, attack: 0.2, decay: 3 });
        return b;
    },
    // light flutter: quick alternating high notes
    butterfly() {
        const b = buffer(0.5);
        for (let i = 0; i < 6; i++) {
            tone(b, { start: i * 0.055, dur: 0.12, freq: note(i % 2 ? 86 : 91), vol: 0.35 * (1 - i * 0.1), decay: 20, attack: 0.008 });
        }
        return b;
    },
    // crisp magical shimmer
    sparkle() {
        const b = buffer(0.6);
        const scale = [88, 91, 93, 96, 98, 100, 103];
        for (let i = 0; i < 9; i++) {
            const n = scale[Math.floor(rand() * scale.length)];
            tone(b, { start: i * 0.035 + rand() * 0.02, dur: 0.3, freq: note(n), vol: 0.25, decay: 14, attack: 0.002 });
        }
        return b;
    },
    // sweet two-note "aww" chime
    heart() {
        const b = buffer(0.55);
        tone(b, { dur: 0.3, freq: note(76), vol: 0.45, decay: 7 });
        tone(b, { start: 0.11, dur: 0.44, freq: note(81), vol: 0.5, decay: 5, vib: 0.006 });
        tone(b, { start: 0.11, dur: 0.44, freq: note(93), vol: 0.08, decay: 8 });
        return b;
    },
    // soft blooming rise
    flower() {
        const b = buffer(0.65);
        [79, 83, 86, 91].forEach((n, i) => tone(b, { start: i * 0.08, dur: 0.45, freq: note(n), vol: 0.35, attack: 0.02, decay: 6 }));
        return b;
    },
    // small cat "mew": pitch rises then falls, harmonics open up ("ee") then close ("ow")
    meow() {
        const dur = 0.55, b = buffer(dur);
        let phase = 0;
        for (let i = 0; i < b.length; i++) {
            const t = i / SR, p = t / dur;
            const f = 700 + 450 * Math.sin(Math.PI * Math.min(1, p * 1.3)) * (1 - 0.4 * p) + 12 * Math.sin(TAU * 7 * t);
            phase += TAU * f / SR;
            const bright = 0.35 + 0.45 * Math.sin(Math.PI * Math.min(1, p * 1.6));
            let w = 0;
            for (let k = 1; k <= 8; k++) w += Math.sin(k * phase) * Math.pow(bright, k - 1) / k;
            const env = Math.min(1, t / 0.04) * Math.pow(1 - p, 0.8);
            b[i] = w * env;
        }
        return b;
    },
    // soft purr: low rumble pulsing ~26 times a second, two breaths; starts/ends silent so it loops
    purr() {
        const dur = 1.6, b = buffer(dur);
        let y = 0;
        for (let i = 0; i < b.length; i++) {
            const t = i / SR;
            y += 0.04 * ((rand() * 2 - 1) - y);
            const pulse = Math.pow(0.5 + 0.5 * Math.sin(TAU * 26 * t), 2);
            const breath = Math.pow(Math.sin(Math.PI * ((t / dur * 2) % 1)), 0.6) * ((t / dur * 2) % 2 < 1 ? 1 : 0.8);
            b[i] = (y * 4 + 0.3 * Math.sin(TAU * 52 * t)) * pulse * breath;
        }
        return b;
    },

    // ─── customizer ───
    // option picked: quick blip up
    select() {
        const b = buffer(0.16);
        tone(b, { dur: 0.08, freq: note(88), type: 'triangle', vol: 0.5, decay: 20 });
        tone(b, { start: 0.06, dur: 0.1, freq: note(93), type: 'triangle', vol: 0.5, decay: 18 });
        return b;
    },
    // option removed: quick blip down
    deselect() {
        const b = buffer(0.16);
        tone(b, { dur: 0.08, freq: note(86), type: 'triangle', vol: 0.45, decay: 20 });
        tone(b, { start: 0.06, dur: 0.1, freq: note(79), type: 'triangle', vol: 0.45, decay: 18 });
        return b;
    },
    // ▶ START: little rpg "game start" jingle
    start() {
        const b = buffer(0.75);
        [72, 76, 79].forEach((n, i) => tone(b, { start: i * 0.07, dur: 0.12, freq: note(n), type: 'square', vol: 0.3, decay: 10 }));
        tone(b, { start: 0.21, dur: 0.5, freq: note(84), type: 'square', vol: 0.3, decay: 4, vib: 0.01 });
        tone(b, { start: 0.21, dur: 0.5, freq: note(72), type: 'triangle', vol: 0.25, decay: 4 });
        return b;
    },
    // ■ STOP: short falling jingle
    stop() {
        const b = buffer(0.4);
        [79, 76, 72].forEach((n, i) => tone(b, { start: i * 0.08, dur: 0.14, freq: note(n), type: 'square', vol: 0.25, decay: 12 }));
        return b;
    },

    // ─── scene actions ───
    // gym: soft thud at the bottom of a squat
    thud() {
        const b = buffer(0.22);
        tone(b, { dur: 0.2, freq: 130, freqEnd: 55, vol: 0.8, decay: 18 });
        burst(b, { dur: 0.04, vol: 0.25, lp: 0.15 });
        return b;
    },
    // hoodie: a quick run of keyboard clicks
    typing() {
        const b = buffer(0.9);
        let t = 0;
        while (t < 0.82) {
            burst(b, { start: t, dur: 0.018, vol: 0.5, lp: 0.9 });
            tone(b, { start: t, dur: 0.02, freq: 1800 + rand() * 600, vol: 0.08, decay: 80 });
            t += 0.07 + rand() * 0.09;
        }
        return b;
    },
    // dress: one brush stroke "swish"
    brush() {
        const b = buffer(0.35);
        noise(b, { dur: 0.35, vol: 0.7, lp: 0.35, attack: 0.08 });
        return b;
    },
    // casual: 8-bit game bleeps
    game() {
        const b = buffer(0.62);
        [84, 88, 91, 96, 91, 88, 93, 89].forEach((n, i) => tone(b, { start: i * 0.075, dur: 0.07, freq: note(n), type: 'square', vol: 0.22, decay: 6 }));
        return b;
    },
    // pajamas: soft snore (in through the nose, out with a little "pff")
    snore() {
        const b = buffer(1.7);
        noise(b, { dur: 1.0, vol: 0.5, lp: 0.05, attack: 0.5 });
        tone(b, { dur: 1.0, freq: 70, vol: 0.12, attack: 0.5, decay: 0.5, vib: 0.08, vibRate: 30 });
        noise(b, { start: 1.05, dur: 0.6, vol: 0.35, lp: 0.2, attack: 0.05 });
        return b;
    },

    // ─── stormi ───
    // little paw steps while she walks in
    steps() {
        const b = buffer(0.6);
        [0, 0.15, 0.3, 0.45].forEach((t, i) => {
            tone(b, { start: t, dur: 0.05, freq: 260 + (i % 2) * 40, vol: 0.4, decay: 60 });
            burst(b, { start: t, dur: 0.025, vol: 0.15, lp: 0.3 });
        });
        return b;
    },
};

for (const [name, make] of Object.entries(sfx)) writeWav(name, make());
console.log('wrote', Object.keys(sfx).join(', '));
