import React from "react";
import { C, FONT, clamp, rise, sp, beatPulse } from "./util";
import { CLICKS, G, KEY_PRESSES, PROG, ROLL, SOUNDS, STYLE_NAMES, patternFor } from "./data";

const abs = (x: number, y: number, w: number, h: number, extra: React.CSSProperties = {}): React.CSSProperties => ({
  position: "absolute", left: x, top: y, width: w, height: h, ...extra,
});

const Chev: React.FC = () => (
  <span style={{ position: "absolute", right: 14, top: "50%", width: 8, height: 8, marginTop: -7, borderRight: "2.5px solid #dbe6ff", borderBottom: "2.5px solid #dbe6ff", transform: "rotate(45deg)" }} />
);

const Lamp: React.FC = () => (
  <svg viewBox="0 0 44 26" width={44} height={26} aria-hidden="true">
    <path d="M22 12c-4-4 4-6 0-10" fill="none" stroke="#9db9ff" strokeWidth={2.4} strokeLinecap="round" />
    <path d="M38 14c5-1 6-6 3-9" fill="none" stroke="#f2b632" strokeWidth={3} strokeLinecap="round" />
    <path d="M3 21c0-5 8-8 19-8h5c8 0 12 3 12 8z" fill="#f2b632" stroke="#c98a10" strokeWidth={1.5} />
  </svg>
);

export interface WinProps {
  frame: number;
  styleIdx: number;
  styleStart: number;
  soundIdx: number;
  soundStart: number;
  soundMenu: number;     // 0..1 popup dropdown Sound
  playhead: number;      // ketukan (0..16), -1 = berhenti
  waveAmp: number;       // 0..1
  handleGlow: number;    // 0..1 sorotan ikon drag & drop
  dropFlash: number;     // 0..1
}

/* ---------- Header ---------- */
const Header: React.FC = () => (
  <div style={abs(0, 0, G.winW, G.headH, { background: "#f4f6fb", display: "flex", alignItems: "center", padding: "0 16px", boxSizing: "border-box", gap: 14 })}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 32, fontWeight: 900, color: C.blue3, letterSpacing: ".01em" }}>
      <Lamp />MGCHORD
    </div>
    <div style={{ margin: "0 auto", display: "flex", alignItems: "center", gap: 8, fontSize: 15 }}>
      <div style={{ width: 230, height: 30, background: "#e6eaf4", color: "#8090b0", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 3, fontWeight: 700 }}>My Progression</div>
      <div style={{ height: 30, padding: "0 14px", background: C.blue3, color: "#fff", display: "flex", alignItems: "center", borderRadius: 4, fontWeight: 800 }}>SAVE</div>
    </div>
    <div style={{ fontSize: 17, fontWeight: 900, color: "#a3aec8", letterSpacing: ".03em" }}>WEB DAW</div>
  </div>
);

/* ---------- Controls: Style / Major-Minor / Sound / dice ---------- */
const Dropdown: React.FC<{ x: number; w: number; label: string; flash: number }> = ({ x, w, label, flash }) => (
  <div style={abs(x, G.ctrlY, w, 52, {
    background: flash > 0.02 ? `rgb(${74 + 60 * flash}, ${125 + 60 * flash}, ${230 + 25 * flash})` : C.blue2,
    color: "#fff", borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 22, fontWeight: 800, letterSpacing: ".02em", textTransform: "uppercase",
    transform: `scale(${1 + 0.07 * flash})`, boxShadow: flash > 0.05 ? `0 0 ${30 * flash}px rgba(255,255,255,.7)` : "none",
  })}>
    {label}<Chev />
  </div>
);

const Controls: React.FC<WinProps> = (p) => {
  const sFlash = Math.exp(-(p.frame - p.styleStart) / 5) * (p.frame >= p.styleStart ? 1 : 0);
  const oFlash = Math.exp(-(p.frame - p.soundStart) / 6) * (p.frame >= p.soundStart ? 1 : 0);
  return (
    <>
      <Dropdown x={24} w={262} label={`Style: ${STYLE_NAMES[p.styleIdx]}`} flash={sFlash} />
      <div style={abs(300, G.ctrlY, 178, 52, { display: "grid", gridTemplateColumns: "1fr 1fr", borderRadius: 5, overflow: "hidden", fontSize: 20, fontWeight: 800 })}>
        <div style={{ background: "#5d8cf0", color: "rgba(255,255,255,.45)", display: "grid", placeItems: "center" }}>Major</div>
        <div style={{ background: "#fff", color: "#2f5fcf", display: "grid", placeItems: "center" }}>Minor</div>
      </div>
      <Dropdown x={492} w={262} label={`Sound: ${SOUNDS[p.soundIdx]}`} flash={oFlash} />
      <div style={abs(768, G.ctrlY, 150, 52, { background: C.blue2, color: "#fff", borderRadius: 5, display: "grid", placeItems: "center", fontSize: 22, fontWeight: 800 })}>4 Bars</div>
      <div style={abs(G.winW - 100, G.ctrlY - 6, 76, 64, { background: "#fff", borderRadius: 14, display: "grid", placeItems: "center", boxShadow: "0 8px 18px -6px rgba(20,40,110,.35)" })}>
        <svg viewBox="0 0 24 24" width={42} height={42} fill="none" stroke={C.blue3} strokeWidth={2} strokeLinecap="round">
          <rect x="4" y="4" width="16" height="16" rx="3.5" />
          {[[9, 9], [15, 15], [15, 9], [9, 15]].map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r={1.5} fill={C.blue3} stroke="none" />)}
        </svg>
      </div>
      {/* popup Sound */}
      {p.soundMenu > 0.01 && (
        <div style={abs(492, G.ctrlY + 58, 262, 150, {
          background: C.blue3, borderRadius: 6, padding: 6, boxSizing: "border-box", opacity: p.soundMenu, transform: `translateY(${(1 - p.soundMenu) * -10}px)`,
          boxShadow: "0 18px 40px -8px rgba(20,40,110,.45)", zIndex: 5,
        })}>
          {SOUNDS.map((s, i) => (
            <div key={s} style={{ height: 42, display: "grid", placeItems: "center", borderRadius: 4, fontSize: 20, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".02em",
              background: i === p.soundIdx ? "#fff" : "transparent", color: i === p.soundIdx ? "#2f5fcf" : "rgba(255,255,255,.75)" }}>{s}</div>
          ))}
        </div>
      )}
    </>
  );
};

/* ---------- Waveform (min/max per kolom, menggulung) ---------- */
const Wave: React.FC<WinProps> = ({ frame, waveAmp }) => {
  const W = G.rollW, H = G.waveH, cols = 160, mid = H / 2;
  let d = "";
  for (let i = 0; i < cols; i++) {
    const x = G.rollX + (i / cols) * W;
    const ph = i + frame * 2.2;
    const env = 0.55 + 0.45 * Math.sin(i * 0.045 + frame * 0.04);
    const a = Math.abs(Math.sin(ph * 0.31) * 0.5 + Math.sin(ph * 0.13 + 1.2) * 0.35 + Math.sin(ph * 0.77) * 0.15);
    const amp = clamp((0.12 + a * env * 0.88 * waveAmp) * (0.8 + 0.2 * beatPulse(frame)), 0.04, 1) * (mid - 6);
    d += `M${x.toFixed(1)} ${(mid - amp).toFixed(1)}V${(mid + amp).toFixed(1)}`;
  }
  return (
    <div style={abs(0, G.waveY, G.winW, G.waveH, { })}>
      <div style={abs(G.rollX, 0, W, H, { background: "#2f58c4", borderRadius: 6, overflow: "hidden" })}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", left: -G.rollX, top: 0 }}>
          <path d={d} stroke="#bcd2ff" strokeWidth={4} strokeLinecap="round" style={{ filter: "drop-shadow(0 0 8px rgba(190,215,255,.9))" }} />
        </svg>
      </div>
    </div>
  );
};

/* ---------- Chord blocks + penggaris ---------- */
const ChordRow: React.FC<WinProps> = ({ frame }) => (
  <>
    {[0, 1, 2, 3].map((b) => (
      <div key={b} style={abs(G.rollX + b * 4 * ROLL.PX_BEAT, G.rulerY, 4 * ROLL.PX_BEAT, 22, { color: "rgba(255,255,255,.75)", fontSize: 16, fontWeight: 800, paddingLeft: 6, boxSizing: "border-box", borderLeft: "2px solid rgba(255,255,255,.3)" })}>{b + 1}</div>
    ))}
    {PROG.map((c, i) => {
      const k = sp(frame, CLICKS[i], 11, 200);
      if (k <= 0.001) return null;
      const w = 4 * ROLL.PX_BEAT - 6;
      const glow = Math.exp(-(frame - CLICKS[i]) / 8) * (frame >= CLICKS[i] ? 1 : 0);
      return (
        <div key={c.name} style={abs(G.rollX + i * 4 * ROLL.PX_BEAT + 2, G.blockY, w, G.blockH, {
          background: glow > 0.05 ? "#fff" : C.blue3, color: glow > 0.05 ? C.blue3 : "#fff", borderRadius: 6, display: "grid", placeItems: "center",
          fontSize: 28, fontWeight: 900, transform: `scaleY(${k}) scaleX(${0.7 + 0.3 * k})`, transformOrigin: "50% 100%", boxShadow: `0 0 ${24 * glow}px rgba(255,255,255,.9), inset 0 -2px 0 rgba(0,0,0,.12)`,
        })}>{c.name}</div>
      );
    })}
  </>
);

/* ---------- Piano roll ---------- */
const BLACK = new Set([1, 3, 6, 8, 10]);
const Roll: React.FC<WinProps> = (p) => {
  const { frame } = p;
  const rows = ROLL.MAX - ROLL.MIN + 1;
  const style = STYLE_NAMES[p.styleIdx];
  const notes: React.ReactNode[] = [];
  PROG.forEach((c, ci) => {
    const clickAt = CLICKS[ci];
    const t0 = Math.max(clickAt + 4, p.styleStart);
    patternFor(style, c.notes).forEach((n, ni) => {
      const k = rise(frame, t0 + ni * 0.7, 8);
      if (k <= 0.001 || frame < clickAt + 4) return;
      const x = ci * 4 * ROLL.PX_BEAT + n.s * ROLL.PX_BEAT;
      const y = (ROLL.MAX - n.m) * ROLL.ROW_H;
      notes.push(
        <div key={`${ci}-${ni}`} style={{ position: "absolute", left: x + 2, top: y + 1, width: Math.max(5, n.l * ROLL.PX_BEAT - 4), height: ROLL.ROW_H - 2.5, borderRadius: 3,
          background: "linear-gradient(180deg,#6f9cf5,#3f6fd8)", opacity: 0.55 + 0.45 * k, transform: `scaleX(${k})`, transformOrigin: "0 50%", boxShadow: "0 2px 6px rgba(63,111,216,.3)" }} />
      );
    });
  });
  const head = p.playhead >= 0 ? p.playhead * ROLL.PX_BEAT : -1;
  return (
    <div style={abs(G.rollX, G.rollY, G.rollW, G.rollH, { background: "#f6f9ff", borderRadius: 8, overflow: "hidden" })}>
      {Array.from({ length: rows }, (_, i) => {
        const m = ROLL.MAX - i;
        return <div key={i} style={{ position: "absolute", left: 0, top: i * ROLL.ROW_H, width: "100%", height: ROLL.ROW_H, background: BLACK.has(m % 12) ? "rgba(63,111,216,.06)" : "transparent", borderBottom: m % 12 === 0 ? "1px solid rgba(63,111,216,.2)" : "none" }} />;
      })}
      {Array.from({ length: 17 }, (_, i) => (
        <div key={i} style={{ position: "absolute", left: i * ROLL.PX_BEAT, top: 0, width: i % 4 === 0 ? 2 : 1, height: "100%", background: i % 4 === 0 ? "rgba(63,111,216,.22)" : "rgba(63,111,216,.08)" }} />
      ))}
      {notes}
      {[1, 2, 3].map((b) => (
        <div key={b} style={{ position: "absolute", left: b * 4 * ROLL.PX_BEAT - 6, top: 0, width: 12, height: 26, background: C.orange, borderRadius: "0 0 6px 6px", opacity: rise(frame, CLICKS[b] ?? 0, 8) }} />
      ))}
      {head >= 0 && <div style={{ position: "absolute", left: head, top: 0, width: 3, height: "100%", background: C.blue3, boxShadow: "0 0 12px rgba(63,111,216,.6)" }} />}
    </div>
  );
};

/* ---------- Bottom bar: play, drag & drop, download ---------- */
export const HANDLE = { x: 150, y: G.barY + 52 };   // pusat ikon drag & drop (koordinat UI)
const Bar: React.FC<WinProps> = (p) => {
  const pl = 1 + 0.06 * beatPulse(p.frame) * (p.playhead >= 0 ? 1 : 0);
  return (
    <>
      <div style={abs(24, G.barY + 14, 76, 76, { background: "#fff", borderRadius: "50%", display: "grid", placeItems: "center", transform: `scale(${pl})`, boxShadow: "0 8px 18px -6px rgba(20,40,110,.35)" })}>
        <svg viewBox="0 0 24 24" width={38} height={38}><path d="M7 4l13 8-13 8z" fill={C.blue3} /></svg>
      </div>
      <div style={abs(HANDLE.x - 36, HANDLE.y - 36, 72, 72, { background: C.blue3, borderRadius: "50%", display: "grid", placeItems: "center", boxShadow: `0 0 ${34 * p.handleGlow}px ${6 * p.handleGlow}px rgba(255,255,255,.85), inset 0 -2px 0 rgba(0,0,0,.12)`, transform: `scale(${1 + 0.18 * p.handleGlow})`, border: p.handleGlow > 0.1 ? "3px solid #fff" : "3px solid transparent" })}>
        <svg viewBox="0 0 24 24" width={34} height={34} fill="#fff">{[[9, 6], [15, 6], [9, 12], [15, 12], [9, 18], [15, 18]].map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r={1.8} />)}</svg>
      </div>
      <div style={abs(204, G.barY + 16, 72, 72, { background: "rgba(255,255,255,.18)", borderRadius: "50%", display: "grid", placeItems: "center" })}>
        <svg viewBox="0 0 24 24" width={34} height={34} fill="none" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"><path d="M12 4v12M6.5 11l5.5 5.5 5.5-5.5M5 20h14" /></svg>
      </div>
      <div style={abs(300, G.barY + 28, 560, 48, { color: "rgba(255,255,255,.85)", fontSize: 24, fontWeight: 800, display: "flex", alignItems: "center" })}>Drag &amp; Drop MIDI&nbsp;&nbsp;/&nbsp;&nbsp;Download .mid</div>
      <div style={abs(G.winW - 330, G.barY + 28, 306, 48, { whiteSpace: "nowrap", color: "rgba(255,255,255,.8)", fontSize: 22, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "flex-end" })}>120 BPM • C Minor</div>
    </>
  );
};

export const Window: React.FC<WinProps> = (p) => (
  <div style={abs(0, 0, G.winW, G.uiH, { background: C.blue, borderRadius: 14, overflow: "hidden", fontFamily: FONT, boxShadow: "0 40px 90px -28px rgba(44,85,180,.5), 0 0 0 1px rgba(63,111,216,.1)" })}>
    <Header />
    <Wave {...p} />
    <ChordRow {...p} />
    <Roll {...p} />
    <Bar {...p} />
    <Controls {...p} />
  </div>
);

/* ---------- Keyboard vertikal (kanan) ---------- */
const WHITES = ["C", "D", "E", "F", "G", "A", "B", "C"];
const BLACKS = [{ b: 1, n: "Db" }, { b: 2, n: "Eb" }, { b: 4, n: "Gb" }, { b: 5, n: "Ab" }, { b: 6, n: "Bb" }];
const KB = { top: 84, h: 696, x: 22, w: 216 };
const KH = KB.h / 8;
/** Pusat tuts (koordinat UI) untuk animasi chip yang terbang ke blok chord. */
export const keyCenter = (name: string): [number, number] => {
  const bi = BLACKS.find((b) => b.n === name);
  if (bi) return [G.kbX + KB.x + KB.w * 0.7, KB.top + KB.h - bi.b * KH];
  const wi = WHITES.indexOf(name);
  return [G.kbX + KB.x + KB.w * 0.5, KB.top + KB.h - (wi + 0.5) * KH];
};

export const Keyboard: React.FC<{ frame: number }> = ({ frame }) => {
  const press = (name: string): number => {
    const p = KEY_PRESSES.find((k) => k.name === name);
    if (!p || frame < p.at) return 0;
    return Math.exp(-(frame - p.at) / 10);
  };
  return (
    <div style={abs(G.kbX, 0, G.kbW, G.uiH, { background: C.blue, borderRadius: 14, overflow: "hidden", fontFamily: FONT, boxShadow: "0 40px 90px -28px rgba(44,85,180,.5), 0 0 0 1px rgba(63,111,216,.1)" })}>
      <div style={abs(14, 14, G.kbW - 28, 50, { background: C.blue2, borderRadius: 5, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800, letterSpacing: ".03em" })}>KEYS C5 – C6</div>
      {WHITES.map((n, i) => {
        const pr = n === "C" && i === 0 ? press("C") : 0;
        return (
          <div key={i} style={abs(KB.x, KB.top + KB.h - (i + 1) * KH + 2, KB.w, KH - 4, {
            background: pr > 0.05 ? `linear-gradient(90deg,#9db9ff,#e3ecff)` : "linear-gradient(90deg,#e4e4ec,#fbfbfd)", borderRadius: "0 12px 12px 0",
            boxShadow: `inset -6px 0 0 rgba(0,0,0,.12)${pr > 0.05 ? `, 0 0 ${28 * pr}px rgba(255,255,255,.9)` : ""}`, color: "#7a7a88", fontSize: 18, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 16, boxSizing: "border-box",
          })}>{n}</div>
        );
      })}
      {BLACKS.map((b) => {
        const pr = press(b.n);
        return (
          <div key={b.n} style={abs(KB.x, KB.top + KB.h - b.b * KH - KH * 0.31, KB.w * 0.62, KH * 0.62, {
            zIndex: 2, borderRadius: "0 9px 9px 0", background: pr > 0.05 ? "linear-gradient(90deg,#3b5fc4,#7aa0ff)" : "linear-gradient(90deg,#0e0e13,#2c2c38)",
            boxShadow: `inset -5px 0 0 rgba(255,255,255,.08), 3px 0 8px rgba(0,0,0,.5)${pr > 0.05 ? `, 0 0 ${28 * pr}px rgba(130,170,255,.95)` : ""}`, color: "#9a9ab0", fontSize: 16, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 12, boxSizing: "border-box",
          })}>{b.n}</div>
        );
      })}
    </div>
  );
};

/* ---------- Timeline DAW (target drag & drop) ---------- */
export const DROP = { x: G.tlLaneX + 70, y: G.tlY + 30 + 28 };
export const Timeline: React.FC<{ frame: number; dropAt: number; opacity: number }> = ({ frame, dropAt, opacity }) => {
  const k = sp(frame, dropAt, 12, 160);
  const flash = Math.exp(-(frame - dropAt) / 10) * (frame >= dropAt ? 1 : 0);
  const tracks = [{ n: "PIANO", c: "#7aa0ff" }, { n: "BASS", c: "#b58cff" }, { n: "DRUMS", c: "#ffb36b" }];
  return (
    <div style={abs(0, G.tlY, G.uiW, 230, { opacity, background: "#ffffff", borderRadius: 14, fontFamily: FONT, overflow: "hidden", boxShadow: "0 30px 70px -24px rgba(44,85,180,.45), 0 0 0 1px rgba(63,111,216,.12)" })}>
      <div style={abs(0, 0, G.uiW, 30, { background: "#eef2fb" })}>
        {Array.from({ length: 8 }, (_, i) => <div key={i} style={{ position: "absolute", left: G.tlLaneX + i * G.tlBarW + 8, top: 5, color: "#8b97b5", fontSize: 16, fontWeight: 800 }}>{i + 1}</div>)}
      </div>
      {tracks.map((t, i) => (
        <div key={t.n} style={abs(0, 30 + i * 66, G.uiW, 62, { borderBottom: "1px solid rgba(63,111,216,.08)" })}>
          <div style={abs(0, 0, G.tlLaneX - 10, 62, { color: "#5b6b90", fontSize: 20, fontWeight: 800, display: "flex", alignItems: "center", paddingLeft: 24 })}>{t.n}</div>
          {i === 0 && <div style={abs(G.tlLaneX, 6, 4 * G.tlBarW, 50, { border: `2px dashed rgba(63,111,216,${0.2 + 0.25 * (1 - k)})`, borderRadius: 8 })} />}
          {i === 0 && k > 0.01 && (
            <div style={abs(G.tlLaneX, 6, 4 * G.tlBarW, 50, { background: t.c, borderRadius: 8, transform: `scaleX(${k})`, transformOrigin: "0 50%", boxShadow: `0 0 ${40 * flash}px rgba(63,111,216,${0.55 * flash})`, overflow: "hidden" })}>
              {PROG.flatMap((c, ci) => c.notes.map((m, ni) => (
                <div key={`${ci}-${ni}`} style={{ position: "absolute", left: ci * G.tlBarW + 8, top: 8 + (ni * 11), width: G.tlBarW - 16, height: 7, borderRadius: 3, background: "rgba(255,255,255,.75)" }} />
              )))}
              <div style={{ position: "absolute", left: 10, top: 2, fontSize: 14, fontWeight: 900, color: "rgba(255,255,255,.95)" }}>MGCHORD</div>
            </div>
          )}
          {i === 1 && <div style={abs(G.tlLaneX + 2 * G.tlBarW, 6, 4 * G.tlBarW, 50, { background: t.c, opacity: 0.55, borderRadius: 8 })} />}
          {i === 2 && <div style={abs(G.tlLaneX, 6, 8 * G.tlBarW, 50, { background: t.c, opacity: 0.4, borderRadius: 8 })} />}
        </div>
      ))}
    </div>
  );
};
