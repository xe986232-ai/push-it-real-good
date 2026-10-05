import { Easing, interpolate, spring } from "remotion";
import { loadFont } from "@remotion/google-fonts/Nunito";

// REMOTION_NO_GFONT=1 -> pakai font Nunito dari sistem (render offline, tanpa download Google Fonts)
const offline = typeof process !== "undefined" && process.env?.REMOTION_NO_GFONT === "1";
const fontFamily = offline ? "Nunito" : loadFont("normal", { weights: ["700", "800", "900"], subsets: ["latin"] }).fontFamily;
export const FONT = `${fontFamily}, 'Arial Rounded MT Bold', 'Trebuchet MS', system-ui, sans-serif`;

export const C = {
  blue: "#5b8ff3",
  blue2: "#4a7de6",
  blue3: "#3f6fd8",
  deep: "#2c55b4",
  orange: "#f2b632",
  bg: "#070a18",
  bg2: "#0e1530",
  ink: "#14151c",
  glass: "rgba(10,13,28,0.74)",
};

export const FPS = 30;
export type KF = [number, number];

/** Keyframes dengan easing per segmen. Titik harus berurutan (frame naik). */
export function kf(frame: number, pts: KF[], ease: (t: number) => number = Easing.inOut(Easing.cubic)): number {
  if (frame <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) {
    const [f1, v1] = pts[i];
    const [f0, v0] = pts[i - 1];
    if (frame <= f1) {
      const t = f1 === f0 ? 1 : (frame - f0) / (f1 - f0);
      return v0 + (v1 - v0) * ease(t);
    }
  }
  return pts[pts.length - 1][1];
}

/** 0 -> 1 mulai dari frame `start` selama `dur` frame (ease out). */
export const rise = (frame: number, start: number, dur = 12): number =>
  interpolate(frame, [start, start + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

/** 1 -> 0 mulai dari frame `start` selama `dur` frame. */
export const fall = (frame: number, start: number, dur = 10): number => 1 - rise(frame, start, dur);

/** Spring aman untuk frame negatif. */
export const sp = (frame: number, start: number, damping = 14, stiffness = 140): number =>
  frame < start ? 0 : spring({ frame: frame - start, fps: FPS, config: { damping, stiffness, mass: 0.9 } });

/** Denyut per ketukan (120 bpm = 15 frame): 1 tepat di ketukan, lalu meluruh. */
export const beatPulse = (frame: number, period = 15, decay = 4): number => Math.exp(-(((frame % period) + period) % period) / decay);

/** Getar layar sesaat, meluruh. */
export const shake = (frame: number, at: number, amp = 10, dur = 14): [number, number] => {
  const t = frame - at;
  if (t < 0 || t > dur) return [0, 0];
  const k = (1 - t / dur) ** 2 * amp;
  return [Math.sin(t * 2.7) * k, Math.cos(t * 3.3) * k];
};

export const clamp = (v: number, a: number, b: number): number => Math.min(b, Math.max(a, v));
