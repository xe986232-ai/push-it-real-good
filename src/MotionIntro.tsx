import React from "react";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Easing,
} from "remotion";

type Props = { title: string; subtitle: string };

const COLORS = ["#7c5cff", "#00d4ff", "#ff4d8d", "#ffc857"];

/** Background: gradient yang pelan-pelan muter + grid garis */
const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const angle = interpolate(frame, [0, 180], [120, 240]);
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${angle}deg, #0b0b1a 0%, #1a1038 50%, #07121f 100%)`,
      }}
    >
      <svg width="100%" height="100%" style={{ opacity: 0.12 }}>
        {Array.from({ length: 20 }).map((_, i) => (
          <line
            key={i}
            x1={i * 100}
            y1={0}
            x2={i * 100}
            y2={1080}
            stroke="#fff"
            strokeWidth={1}
          />
        ))}
        {Array.from({ length: 11 }).map((_, i) => (
          <line
            key={i}
            x1={0}
            y1={i * 100}
            x2={1920}
            y2={i * 100}
            stroke="#fff"
            strokeWidth={1}
          />
        ))}
      </svg>
    </AbsoluteFill>
  );
};

/** Bola-bola yang melayang, cukup satu .map() */
const FloatingOrbs: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      {Array.from({ length: 24 }).map((_, i) => {
        const delay = i * 2;
        const pop = spring({ frame: frame - delay, fps, config: { damping: 10 } });
        const x = 160 + ((i * 197) % 1600);
        const baseY = 140 + ((i * 131) % 800);
        const y = baseY + Math.sin((frame + i * 12) / 18) * 30;
        const size = 24 + (i % 5) * 18;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: size,
              height: size,
              borderRadius: "50%",
              background: COLORS[i % COLORS.length],
              opacity: 0.35,
              filter: "blur(2px)",
              transform: `scale(${pop})`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** Cincin yang menggambar dirinya sendiri (stroke-dashoffset) */
const Ring: React.FC = () => {
  const frame = useCurrentFrame();
  const r = 300;
  const circ = 2 * Math.PI * r;
  const progress = interpolate(frame, [10, 70], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rotate = interpolate(frame, [0, 180], [0, 120]);
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <svg width={700} height={700} style={{ transform: `rotate(${rotate}deg)` }}>
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7c5cff" />
            <stop offset="100%" stopColor="#00d4ff" />
          </linearGradient>
        </defs>
        <circle
          cx={350}
          cy={350}
          r={r}
          fill="none"
          stroke="url(#g)"
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - progress)}
        />
      </svg>
    </AbsoluteFill>
  );
};

/** Judul: tiap huruf muncul satu-satu dengan spring */
const Title: React.FC<Props> = ({ title, subtitle }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const subOpacity = interpolate(frame, [50, 75], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const subY = interpolate(frame, [50, 75], [20, 0], {
    easing: Easing.out(Easing.quad),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const lineWidth = interpolate(frame, [40, 80], [0, 520], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Helvetica, Arial, sans-serif",
      }}
    >
      <div style={{ display: "flex" }}>
        {title.split("").map((ch, i) => {
          const s = spring({ frame: frame - 20 - i * 3, fps, config: { damping: 11 } });
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                fontSize: 150,
                fontWeight: 800,
                color: "#fff",
                letterSpacing: 6,
                whiteSpace: "pre",
                opacity: s,
                transform: `translateY(${(1 - s) * 80}px) scale(${0.6 + 0.4 * s})`,
              }}
            >
              {ch}
            </span>
          );
        })}
      </div>
      <div
        style={{
          height: 4,
          width: lineWidth,
          background: "linear-gradient(90deg,#7c5cff,#00d4ff)",
          borderRadius: 2,
          margin: "18px 0",
        }}
      />
      <div
        style={{
          fontSize: 38,
          color: "#b9c2ff",
          letterSpacing: 8,
          textTransform: "uppercase",
          opacity: subOpacity,
          transform: `translateY(${subY}px)`,
        }}
      >
        {subtitle}
      </div>
    </AbsoluteFill>
  );
};

/** Fade out di akhir */
const FadeOut: React.FC = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 25], [0, 1], { extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ background: "#000", opacity: o }} />;
};

export const MotionIntro: React.FC<Props> = (props) => {
  return (
    <AbsoluteFill>
      <Background />
      <FloatingOrbs />
      <Ring />
      <Title {...props} />
      <Sequence from={155}>
        <FadeOut />
      </Sequence>
    </AbsoluteFill>
  );
};
