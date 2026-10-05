// Waktu (frame @30fps, 120 bpm: 1 ketukan = 15 frame, 1 bar = 60 frame)
export const DURATION = 1080;

export const T = {
  introEnd: 100,
  reveal: 100,
  keys: 190,
  styles: 300,
  sound: 540,
  wave: 640,
  drag: 740,
  outro: 860,
};

export const WIPES = [100, 190, 300, 540, 740, 860];
export const CLICKS = [205, 232, 259, 286];            // frame tuts keyboard ditekan -> chord ke-i muncul
export const KEY_PRESSES = [
  { name: "C", at: CLICKS[0] },
  { name: "Ab", at: CLICKS[1] },
  { name: "Eb", at: CLICKS[2] },
  { name: "Bb", at: CLICKS[3] },
];
export const DRAG = { pick: 770, move: 780, drop: 830 };

// 12 style: 6 pertama 30 frame/style, 6 sisanya cepat (10 frame/style)
export const STYLE_NAMES = ["Block", "Stab", "Pluck", "Pad Run", "Turun", "Tangga", "Tresillo", "Dholak", "Tisra", "Pad Pluck", "Bell", "Roll"];
export const STYLE_START: number[] = STYLE_NAMES.map((_, i) => (i < 6 ? 300 + i * 30 : 480 + (i - 6) * 10));
export const styleAt = (frame: number): { idx: number; start: number } => {
  let idx = 0;
  for (let i = 0; i < STYLE_START.length; i++) if (frame >= STYLE_START[i]) idx = i;
  return { idx, start: frame >= STYLE_START[0] ? STYLE_START[idx] : 0 };   // sebelum fase Style: Block, nada muncul sesuai klik tuts
};

export const SOUNDS = ["Piano", "Pad", "Pluck"];
export const SOUND_START = [540, 573, 606];
export const soundAt = (frame: number): { idx: number; start: number } => {
  let idx = 0;
  for (let i = 0; i < SOUND_START.length; i++) if (frame >= SOUND_START[i]) idx = i;
  return { idx, start: SOUND_START[idx] };
};

// Layout (koordinat UI)
export const G = {
  uiW: 1500,
  uiH: 800,
  winW: 1220,
  kbX: 1240,
  kbW: 260,
  headH: 56,
  ctrlY: 62,
  waveY: 132,
  waveH: 76,
  rulerY: 218,
  blockY: 242,
  blockH: 44,
  rollY: 296,
  rollH: 390,
  rollX: 24,
  rollW: 1172,
  barY: 696,
  tlY: 870,
  tlLaneX: 230,
  tlBarW: 150,
};
export const ROLL = { MIN: 55, MAX: 84, PX_BEAT: G.rollW / 16, ROW_H: G.rollH / 30 };

export interface Chord { name: string; notes: number[] }
export const PROG: Chord[] = [
  { name: "Cm", notes: [60, 63, 67] },
  { name: "Ab", notes: [56, 60, 63] },
  { name: "Eb", notes: [63, 67, 70] },
  { name: "Bb", notes: [58, 62, 65] },
];

export interface PNote { m: number; s: number; l: number }
/** Susunan nada satu bar (4 ketukan) untuk satu style, mengikuti gaya MGCHORD. */
export function patternFor(style: string, n: number[]): PNote[] {
  const [r, t, f] = n;
  const o = (x: number): number => x + 12;
  switch (style) {
    case "Stab": return [0.5, 1.5, 2.5, 3.5].flatMap((s) => n.map((m) => ({ m, s, l: 0.25 })));
    case "Pluck": return [{ m: r, s: 0, l: 4 }, { m: f, s: 0.5, l: 3.5 }, { m: o(r), s: 1, l: 3 }, { m: o(t), s: 1.5, l: 2.5 }, { m: o(r), s: 3, l: 1 }];
    case "Pad Run": return [{ m: r, s: 0, l: 4 }, { m: f, s: 0, l: 4 }, { m: o(r), s: 2, l: 0.5 }, { m: o(t), s: 2.5, l: 0.5 }, { m: o(f), s: 3, l: 0.5 }, { m: o(t), s: 3.5, l: 0.5 }];
    case "Turun": return [{ m: o(f), s: 0, l: 0.5 }, { m: o(t), s: 0.5, l: 0.5 }, { m: o(r), s: 1, l: 0.5 }, { m: f, s: 1.5, l: 0.5 }, { m: r, s: 2, l: 2 }];
    case "Tangga": return [r, t, f, o(r), o(t), o(f)].map((m, i) => ({ m, s: i * 0.5, l: 4 - i * 0.5 }));
    case "Tresillo": return [0, 1.5, 3].flatMap((s) => n.map((m) => ({ m, s, l: s === 3 ? 1 : 1.5 })));
    case "Dholak": return [0, 0.75, 1.5, 2, 2.75, 3.5].map((s, i) => ({ m: n[i % 3], s, l: 0.5 }));
    case "Tisra": return Array.from({ length: 12 }, (_, i) => ({ m: [r, t, f, t][i % 4], s: i / 3, l: 1 / 3 }));
    case "Pad Pluck": return [{ m: r, s: 0, l: 4 }, { m: f, s: 0, l: 4 }, { m: o(t), s: 2, l: 0.5 }, { m: o(f), s: 2.5, l: 0.5 }, { m: o(r), s: 3, l: 0.5 }];
    case "Bell": return [{ m: r, s: 0, l: 4 }, ...[0.5, 1.5, 2.5, 3.5].map((s, i) => ({ m: o(n[i % 3]), s, l: 0.25 }))];
    case "Roll": return [{ m: r, s: 0, l: 2 }, ...[2, 2.25, 2.5, 2.75].map((s, i) => ({ m: [r, t, f, o(r)][i], s, l: 0.25 })), { m: o(t), s: 3, l: 1 }];
    default: return n.map((m) => ({ m, s: 0, l: 4 }));   // Block
  }
}
