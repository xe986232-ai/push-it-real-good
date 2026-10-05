import React from "react";
import { AbsoluteFill, Audio, Easing, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { C, FONT, beatPulse, clamp, fall, kf, rise, shake, sp, type KF } from "./util";
import { CLICKS, DRAG, DURATION, G, KEY_PRESSES, PROG, ROLL, STYLE_START, SOUND_START, WIPES, soundAt, styleAt } from "./data";
import { DROP, HANDLE, Keyboard, Timeline, Window, keyCenter } from "./ui";

/* Timing ditulis dalam frame 30fps (lihat data.ts); SCALE mengubahnya ke frame komposisi */
const SCALE = 60 / 30;

/* ================= Background ================= */
const GLYPHS = ["Cm", "Ab", "Eb", "Bb", "9", "maj7", "Fm", "Gm7", "sus4", "Dm"];
const Background: React.FC<{ frame: number }> = ({ frame }) => {
  const p = beatPulse(frame);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 40%, #ffffff 0%, ${C.bg2} 70%, #e8eefc 100%)` }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 50%, rgba(91,143,243,${0.05 + 0.07 * p}) 0%, transparent 55%)` }} />
      <svg width="100%" height="100%" style={{ position: "absolute", opacity: 0.1 }}>
        {Array.from({ length: 20 }, (_, i) => <line key={`v${i}`} x1={i * 100} y1={0} x2={i * 100} y2={1080} stroke="#9db6ee" />)}
        {Array.from({ length: 11 }, (_, i) => <line key={`h${i}`} x1={0} y1={i * 100} x2={1920} y2={i * 100} stroke="#9db6ee" />)}
      </svg>
      {GLYPHS.map((g, i) => {
        const x = (i * 211 + 90) % 1800;
        const y = 1180 - ((i * 173 + frame * (0.5 + (i % 3) * 0.25)) % 1300);
        return <div key={g + i} style={{ position: "absolute", left: x, top: y, fontFamily: FONT, fontSize: 52 + (i % 4) * 14, fontWeight: 900, color: C.blue, opacity: 0.08 + (i % 3) * 0.02 }}>{g}</div>;
      })}
      {Array.from({ length: 9 }, (_, i) => {
        const x = (i * 263 + 140) % 1900;
        const y = 100 + ((i * 197) % 880) + Math.sin(frame / 30 + i) * 26;
        const s = 20 + (i % 4) * 16;
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: s, height: s, borderRadius: "50%", background: i % 3 === 0 ? C.orange : C.blue, opacity: 0.16, filter: "blur(2px)" }} />;
      })}
    </AbsoluteFill>
  );
};

/* ================= Intro (logo) ================= */
const Logo: React.FC<{ size: number; frame: number; start: number }> = ({ size, frame, start }) => (
  <div style={{ display: "flex", fontFamily: FONT, fontSize: size, fontWeight: 900, lineHeight: 1 }}>
    {"MGCHORD".split("").map((ch, i) => {
      const k = sp(frame, start + i * 3, 11, 170);
      return (
        <span key={i} style={{ display: "inline-block", color: C.blue3, letterSpacing: "-0.01em", textShadow: `0 ${size / 20}px ${size / 8}px rgba(63,111,216,.22)`,
          opacity: clamp(k * 1.4, 0, 1), filter: `blur(${(1 - clamp(k, 0, 1)) * size / 14}px)`, transform: `perspective(${size * 4}px) translateY(${(1 - k) * size * 0.5}px) rotateX(${(1 - k) * -85}deg) rotate(${(1 - k) * (i % 2 ? 9 : -9)}deg) scale(${0.5 + 0.5 * k})` }}>{ch}</span>
      );
    })}
  </div>
);

const Intro: React.FC<{ frame: number }> = ({ frame }) => {
  if (frame > 108) return null;
  const ex = interpolate(frame, [78, 104], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });
  const flash = frame >= 30 ? Math.exp(-(frame - 30) / 4) * 0.35 : 0;
  const lsp = interpolate(frame, [48, 80], [0.7, 0.32], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", transform: `scale(${1 + 1.5 * ex})`, opacity: 1 - ex, filter: `blur(${ex * 16}px)` }}>
      <div style={{ display: "flex", gap: 16, marginBottom: 60 }}>
        {PROG.map((c, i) => {
          const k = rise(frame, 4 + i * 5, 12);
          return <div key={c.name} style={{ width: 270, height: 74, borderRadius: 12, background: i % 2 ? C.blue2 : C.blue3, color: "#fff", display: "grid", placeItems: "center", fontFamily: FONT, fontSize: 38, fontWeight: 900, opacity: k, filter: `blur(${(1 - k) * 8}px)`, transform: `perspective(700px) rotateX(${(1 - k) * 75}deg) translateY(${(1 - k) * 50}px) scaleX(${0.6 + 0.4 * k})`, boxShadow: "0 14px 28px -10px rgba(63,111,216,.55)" }}>{c.name}</div>;
        })}
      </div>
      <Logo size={250} frame={frame} start={14} />
      <div style={{ marginTop: 52, fontFamily: FONT, fontSize: 38, fontWeight: 800, color: C.muted, letterSpacing: `${lsp}em`, opacity: rise(frame, 48, 14), filter: `blur(${(1 - rise(frame, 48, 20)) * 14}px)` }}>CHORD PROGRESSION GENERATOR</div>
      <AbsoluteFill style={{ background: "#cfdcff", opacity: flash }} />
    </AbsoluteFill>
  );
};

/* ================= Wipe transisi ================= */
const Wipe: React.FC<{ frame: number; at: number }> = ({ frame, at }) => {
  const t = (frame - (at - 9)) / 18;
  if (t < 0 || t > 1) return null;
  const e = Easing.inOut(Easing.cubic)(t);
  const x = interpolate(e, [0, 1], [-3100, 2300]);
  return (
    <AbsoluteFill style={{ overflow: "hidden", pointerEvents: "none" }}>
      <div style={{ position: "absolute", top: -200, left: x, width: 2500, height: 1500, background: `linear-gradient(90deg, ${C.deep}, ${C.blue3} 45%, ${C.blue} 90%, #fff)`, transform: "skewX(-16deg)", boxShadow: "0 0 80px rgba(91,143,243,.35)" }} />
    </AbsoluteFill>
  );
};

/* ================= Caption ================= */
interface Cap { s: number; e: number; kicker: string; title: string; sub: string; top?: boolean }
const CAPS: Cap[] = [
  { s: 108, e: 184, kicker: "PLUGIN BARU  •  WEB DAW", title: "Bikin chord progression", sub: "langsung di browser, tanpa ribet" },
  { s: 198, e: 294, kicker: "01  •  KEYBOARD", title: "Klik tuts, chord jadi", sub: "masuk otomatis ke piano roll" },
  { s: 308, e: 534, kicker: "02  •  STYLE", title: "12 Style Permainan", sub: "Block, Stab, Pluck, Tresillo, Dholak, Roll, dan lainnya" },
  { s: 548, e: 634, kicker: "03  •  SOUND", title: "Piano • Pad • Pluck", sub: "satu chord, tiga karakter suara" },
  { s: 648, e: 734, kicker: "04  •  WAVEFORM", title: "Waveform real-time", sub: "lihat getaran chord-mu langsung" },
  { s: 748, e: 854, kicker: "05  •  DRAG & DROP", title: "Seret ke timeline", sub: "jadi pattern baru, atau ekspor MIDI", top: true },
];
const Caption: React.FC<{ frame: number; c: Cap }> = ({ frame, c }) => {
  if (frame < c.s || frame > c.e + 10) return null;
  const out = fall(frame, c.e, 9);
  const words = c.title.split(" ");
  return (
    <AbsoluteFill style={{ justifyContent: c.top ? "flex-start" : "flex-end", alignItems: "center", paddingBottom: 56, paddingTop: c.top ? 36 : 0, opacity: out, transform: `translateY(${(1 - out) * (c.top ? -24 : 24)}px)` }}>
      <div style={{ fontFamily: FONT, padding: "20px 52px 24px", background: C.glass, transform: `perspective(1400px) rotateX(${(1 - rise(frame, c.s, 14)) * 24}deg) scale(${0.93 + 0.07 * rise(frame, c.s, 14)})`, backdropFilter: "blur(16px)", border: "1px solid rgba(63,111,216,.14)", borderRadius: 30, textAlign: "center", boxShadow: "0 28px 70px -28px rgba(44,85,180,.4)" }}>
        <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: `${0.3 + 0.4 * (1 - rise(frame, c.s, 16))}em`, color: C.blue3, opacity: rise(frame, c.s, 10), filter: `blur(${(1 - rise(frame, c.s, 12)) * 8}px)` }}>{c.kicker}</div>
        <div style={{ fontSize: 76, fontWeight: 900, color: C.text, lineHeight: 1.1, margin: "6px 0 4px", whiteSpace: "pre" }}>
          {words.map((w, i) => {
            const k = sp(frame, c.s + 4 + i * 3, 13, 170);
            return <span key={i} style={{ display: "inline-block", marginRight: i < words.length - 1 ? 22 : 0, opacity: clamp(k * 1.3, 0, 1), filter: `blur(${(1 - clamp(k * 1.1, 0, 1)) * 18}px)`, transform: `perspective(600px) rotateX(${(1 - k) * -65}deg) translateY(${(1 - k) * 46}px)`, color: i === words.length - 1 ? C.blue3 : C.text }}>{w}</span>;
          })}
        </div>
        <div style={{ fontSize: 31, fontWeight: 700, color: C.muted, opacity: rise(frame, c.s + 14, 12), filter: `blur(${(1 - rise(frame, c.s + 14, 16)) * 10}px)` }}>{c.sub}</div>
      </div>
    </AbsoluteFill>
  );
};

/* ================= Outro ================= */
const CARDS = [{ big: "12", small: "STYLE" }, { big: "3", small: "SOUND" }, { big: "DRAG", small: "& DROP" }, { big: "MIDI", small: "EXPORT" }];
const Outro: React.FC<{ frame: number }> = ({ frame }) => {
  if (frame < 866) return null;
  const cardsOut = rise(frame, 950, 14);
  const fin = rise(frame, 960, 16);
  const pulse = 1 + 0.04 * beatPulse(frame);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", gap: 36, opacity: 1 - cardsOut, transform: `translateY(${-90 * cardsOut}px)` }}>
        {CARDS.map((c, i) => {
          const k = sp(frame, 876 + i * 8, 12, 150);
          return (
            <div key={c.big} style={{ width: 360, height: 250, borderRadius: 30, background: `linear-gradient(160deg, ${C.blue} 0%, ${C.blue3} 55%, ${C.deep} 100%)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: FONT, color: "#fff", opacity: clamp(k * 1.4, 0, 1), filter: `blur(${(1 - clamp(k, 0, 1)) * 10}px)`, transform: `perspective(1000px) rotateY(${(1 - k) * -85 + Math.sin(frame / 40 + i) * 5}deg) translateY(${(1 - k) * 80 + Math.sin(frame / 28 + i * 1.3) * 8}px) scale(${0.6 + 0.4 * k})`, boxShadow: "0 30px 60px -24px rgba(44,85,180,.55)" }}>
              <div style={{ fontSize: c.big.length > 2 ? 92 : 112, fontWeight: 900, lineHeight: 1 }}>{c.big}</div>
              <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: ".22em", marginTop: 8, color: "#dbe6ff" }}>{c.small}</div>
            </div>
          );
        })}
      </div>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: fin, transform: `scale(${0.85 + 0.15 * fin})` }}>
        <Logo size={210} frame={frame} start={962} />
        <div style={{ marginTop: 36, fontFamily: FONT, fontSize: 38, fontWeight: 800, color: C.muted, letterSpacing: ".28em" }}>CHORD PROGRESSION GENERATOR</div>
        <div style={{ marginTop: 56, fontFamily: FONT, fontSize: 52, fontWeight: 900, color: "#fff", padding: "20px 56px", borderRadius: 999, background: `linear-gradient(90deg, ${C.blue3}, ${C.blue})`, transform: `scale(${pulse})`, boxShadow: "0 18px 44px -12px rgba(63,111,216,.6)" }}>derizmp3.vercel.app</div>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "#fff", opacity: rise(frame, 1052, 26) }} />
    </AbsoluteFill>
  );
};

/* ================= Audio cues ================= */
const Sfx: React.FC<{ file: string; at: number; dur: number; vol?: number }> = ({ file, at, dur, vol = 1 }) => (
  <Sequence from={Math.round(Math.max(0, at) * SCALE)} durationInFrames={Math.round(dur * SCALE)} layout="none">
    <Audio src={staticFile(`sfx/${file}.mp3`)} volume={vol} />
  </Sequence>
);
const Cues: React.FC = () => (
  <>
    <Audio src={staticFile("sfx/bed.mp3")} volume={(f) => interpolate(f / SCALE, [0, 15, 1050, 1079], [0, 0.55, 0.55, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
    <Sfx file="riser" at={0} dur={30} vol={0.6} />
    <Sfx file="impact" at={30} dur={48} vol={0.9} />
    {WIPES.map((w) => <Sfx key={`w${w}`} file="whoosh" at={w - 10} dur={24} vol={0.7} />)}
    {CLICKS.map((c) => <Sfx key={`c${c}`} file="click" at={c} dur={4} vol={0.9} />)}
    {CLICKS.map((c) => <Sfx key={`p${c}`} file="stab_piano" at={c} dur={34} vol={0.5} />)}
    {STYLE_START.map((s, i) => <Sfx key={`t${i}`} file="tick" at={s} dur={4} vol={0.55} />)}
    {SOUND_START.map((s, i) => <Sfx key={`s${i}`} file={["stab_piano", "stab_pad", "stab_pluck"][i]} at={s} dur={40} vol={0.8} />)}
    <Sfx file="shimmer" at={640} dur={48} vol={0.45} />
    <Sfx file="pop" at={DRAG.pick} dur={5} vol={0.8} />
    <Sfx file="thud" at={DRAG.drop} dur={14} vol={1} />
    <Sfx file="ping" at={DRAG.drop + 3} dur={36} vol={0.7} />
    {CARD_AT.map((a) => <Sfx key={`k${a}`} file="pop_hi" at={a} dur={5} vol={0.7} />)}
    <Sfx file="shimmer" at={962} dur={48} vol={0.8} />
  </>
);
const CARD_AT = [876, 884, 892, 900];

/* ================= Komposisi utama ================= */
export const MgchordPromo: React.FC = () => {
  // Semua timing di file ini ditulis dalam "frame 30fps"; dibagi SCALE supaya jalan mulus di 60fps
  const frame = useCurrentFrame() / SCALE;

  // kamera (koordinat UI -> layar 1920x1080)
  const cxK: KF[] = [[100, 750], [190, 750], [205, 760], [290, 760], [305, 640], [540, 640], [560, 520], [640, 520], [660, 610], [740, 610], [760, 750], [860, 750], [900, 750]];
  const cyK: KF[] = [[100, 400], [190, 400], [205, 380], [290, 380], [305, 400], [540, 400], [560, 170], [640, 170], [660, 190], [740, 190], [760, 403], [860, 403], [900, 403]];
  const sK: KF[] = [[100, 0.72], [190, 0.95], [205, 1.1], [290, 1.12], [305, 1.1], [540, 1.15], [560, 1.9], [640, 1.9], [660, 1.6], [740, 1.6], [760, 0.72], [860, 0.72], [900, 0.6]];
  const playing = frame >= 300 && frame < 860;
  const punch = CLICKS.reduce((a, c) => a + (frame >= c ? Math.exp(-(frame - c) / 6) : 0), 0);
  const s = kf(frame, sK) * (1 + (playing ? 0.012 * beatPulse(frame) : 0) + 0.035 * punch);
  const cx = kf(frame, cxK), cy = kf(frame, cyK);
  const [sx, sy] = shake(frame, DRAG.drop, 12);
  const tx = 960 - cx * s + sx, ty = 540 - cy * s + sy;

  // tilt kamera 3D per fase + melayang pelan + hentakan saat klik / drop
  const rxK: KF[] = [[100, 20], [150, 7], [190, 5], [290, 5], [305, 2], [540, 4], [560, 9], [640, 7], [660, 3], [740, 4], [760, 11], [800, 6], [860, 4], [880, 12]];
  const ryK: KF[] = [[100, -32], [150, -9], [190, -6], [290, -9], [305, 7], [540, 9], [560, -13], [640, -15], [660, 10], [740, 10], [760, -9], [860, -6], [880, -22]];
  const rzK: KF[] = [[100, -5], [150, 0], [540, 0], [560, 1.5], [640, 1.5], [660, -1], [760, 0], [880, 3]];
  const kick = CLICKS.reduce((a2, c) => a2 + (frame >= c ? Math.exp(-(frame - c) / 9) * Math.cos((frame - c) * 0.5) : 0), 0);
  const dropKick = frame >= DRAG.drop ? Math.exp(-(frame - DRAG.drop) / 8) * Math.sin((frame - DRAG.drop) * 0.6) * 4 : 0;
  const rx = kf(frame, rxK) + Math.cos(frame / 52) * 1.2 + kick * 2.5 + dropKick + (playing ? 0.5 * beatPulse(frame) : 0);
  const ry = kf(frame, ryK) + Math.sin(frame / 44) * 1.8 - kick * 3;
  const rz = kf(frame, rzK) + Math.sin(frame / 60) * 0.4 + kick * 0.6;
  const kbZ = 70 + (playing ? 16 * beatPulse(frame) : 0);
  const introBlur = (1 - rise(frame, 100, 14)) * 12;

  // gelombang kejut saat drop ke timeline
  const rings = [0, 0.2].map((d, i) => {
    const t = clamp((frame - DRAG.drop) / 24 - d, 0, 1);
    if (t <= 0 || t >= 1) return null;
    const e = Easing.out(Easing.cubic)(t), r = 24 + 300 * e;
    return <div key={i} style={{ position: "absolute", left: DROP.x - r, top: DROP.y - r, width: r * 2, height: r * 2, borderRadius: "50%", border: `${7 * (1 - t)}px solid rgba(91,143,243,${0.85 * (1 - t)})`, boxSizing: "border-box" }} />;
  });

  const st = styleAt(frame), so = soundAt(frame);
  const uiOpacity = rise(frame, 100, 10) * fall(frame, 872, 14);
  const dragGlow = rise(frame, DRAG.pick - 8, 8) * fall(frame, DRAG.drop, 6);
  const waveAmp = frame < 300 ? 0.05 : kf(frame, [[300, 0.3], [640, 0.3], [660, 1], [740, 1], [760, 0.5]]);
  const menu = rise(frame, 545, 6) * fall(frame, 632, 6);

  // chip chord terbang dari tuts ke blok
  const chips = KEY_PRESSES.map((k, i) => {
    const t = (frame - k.at) / 14;
    if (t < 0 || t > 1) return null;
    const e = Easing.inOut(Easing.cubic)(t);
    const [x0, y0] = keyCenter(k.name);
    const x1 = G.rollX + i * 4 * ROLL.PX_BEAT + 2 * ROLL.PX_BEAT, y1 = G.blockY + G.blockH / 2;
    return (
      <div key={k.name} style={{ position: "absolute", left: x0 + (x1 - x0) * e - 40, top: y0 + (y1 - y0) * e - 26 - Math.sin(Math.PI * e) * 90, width: 80, height: 52, borderRadius: 10, background: "#fff", color: C.blue3, display: "grid", placeItems: "center", fontFamily: FONT, fontSize: 28, fontWeight: 900, boxShadow: "0 10px 28px rgba(20,40,110,.35)", opacity: 1 - 0.4 * e, zIndex: 20 }}>{PROG[i].name}</div>
    );
  });

  // bola drag & drop
  const ghostPos = (f: number): [number, number] => {
    const t = Easing.inOut(Easing.cubic)(clamp((f - DRAG.move) / (DRAG.drop - DRAG.move), 0, 1));
    const cxp = HANDLE.x + 160, cyp = G.tlY + 120;
    const x = (1 - t) * (1 - t) * HANDLE.x + 2 * (1 - t) * t * cxp + t * t * DROP.x;
    const y = (1 - t) * (1 - t) * HANDLE.y + 2 * (1 - t) * t * cyp + t * t * DROP.y;
    return [x, y];
  };
  const ghostOn = frame >= DRAG.pick && frame <= DRAG.drop + 6;
  const ghostScale = (kf(frame, [[DRAG.pick, 1], [DRAG.pick + 10, 1.25], [DRAG.drop - 1, 1.25], [DRAG.drop + 6, 0.01]], Easing.out(Easing.cubic)));
  const ghost = ghostOn ? [0, 1, 2, 3, 4, 5, 6].map((k) => {
    const [gx, gy] = ghostPos(frame - k * 1.6);
    const a = k === 0 ? 1 : 0.4 / k;
    return <div key={k} style={{ position: "absolute", left: gx - 36, top: gy - 36, width: 72, height: 72, borderRadius: "50%", background: C.blue3, border: "3px solid #fff", opacity: a, transform: `scale(${ghostScale * (1 - k * 0.08)})`, zIndex: 30, boxShadow: k === 0 ? "0 18px 36px rgba(44,85,180,.45)" : "none", display: "grid", placeItems: "center" }}>
      {k === 0 && <svg viewBox="0 0 24 24" width={34} height={34} fill="#fff">{[[9, 6], [15, 6], [9, 12], [15, 12], [9, 18], [15, 18]].map(([a2, b2], i) => <circle key={i} cx={a2} cy={b2} r={1.8} />)}</svg>}
    </div>;
  }) : null;

  const playhead = playing ? ((frame - 300) / 15) % 16 : -1;

  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: FONT }}>
      <Background frame={frame} />

      <AbsoluteFill style={{ opacity: uiOpacity, filter: introBlur > 0.01 ? `blur(${introBlur}px)` : "none" }}>
        <AbsoluteFill style={{ perspective: 2400, perspectiveOrigin: "50% 50%" }}>
          <AbsoluteFill style={{ transformStyle: "preserve-3d", transform: `rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg)` }}>
            <div style={{ position: "absolute", left: 0, top: 0, width: G.uiW, height: G.uiH, transformOrigin: "0 0", transformStyle: "preserve-3d", transform: `translate(${tx}px, ${ty}px) scale(${s})` }}>
              <Window frame={frame} styleIdx={st.idx} styleStart={st.start} soundIdx={so.idx} soundStart={so.start} soundMenu={menu} playhead={playhead} waveAmp={waveAmp} handleGlow={dragGlow} dropFlash={0} />
              <div style={{ position: "absolute", left: 0, top: 0, transformStyle: "preserve-3d", transform: `translateZ(${kbZ}px)` }}><Keyboard frame={frame} /></div>
              <div style={{ position: "absolute", left: 0, top: 0, transformStyle: "preserve-3d", transform: "translateZ(-50px)" }}><Timeline frame={frame} dropAt={DRAG.drop} opacity={rise(frame, 735, 12)} /></div>
              <div style={{ position: "absolute", left: 0, top: 0, transformStyle: "preserve-3d", transform: "translateZ(150px)" }}>{chips}{ghost}</div>
              <div style={{ position: "absolute", left: 0, top: 0 }}>{rings}</div>
            </div>
          </AbsoluteFill>
        </AbsoluteFill>
      </AbsoluteFill>

      <Intro frame={frame} />
      <Outro frame={frame} />
      {CAPS.map((c) => <Caption key={c.s} frame={frame} c={c} />)}
      {WIPES.map((w) => <Wipe key={w} frame={frame} at={w} />)}
      <Cues />
    </AbsoluteFill>
  );
};

export const MGCHORD_FPS = 60;
export const MGCHORD_DURATION = DURATION * SCALE;   // 36 detik @ 60fps = 2160 frame
