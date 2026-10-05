import React, { useState } from "react";
import { Player } from "@remotion/player";
import { MotionIntro } from "../MotionIntro";
import { MgchordPromo, MGCHORD_DURATION } from "../mgchord/Promo";

const box: React.CSSProperties = {
  background: "#14142a",
  border: "1px solid #2a2a4a",
  borderRadius: 10,
  color: "#fff",
  padding: "10px 14px",
  fontSize: 16,
  width: "100%",
  boxSizing: "border-box",
};

const tab = (on: boolean): React.CSSProperties => ({
  padding: "10px 18px",
  borderRadius: 999,
  border: "1px solid #2a2a4a",
  background: on ? "#3f6fd8" : "#14142a",
  color: "#fff",
  fontWeight: 700,
  cursor: "pointer",
});

export const App: React.FC = () => {
  const [which, setWhich] = useState<"mgchord" | "intro">("mgchord");
  const [title, setTitle] = useState("LHU STUDIO");
  const [subtitle, setSubtitle] = useState("Motion Graphics • Remotion");

  return (
    <div style={{ minHeight: "100vh", background: "#07070f", color: "#fff", fontFamily: "Helvetica, Arial, sans-serif", padding: 24, boxSizing: "border-box" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h2 style={{ margin: "0 0 14px" }}>Remotion Motion Preview</h2>
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          <button style={tab(which === "mgchord")} onClick={() => setWhich("mgchord")}>MGCHORD Promo (36 dtk, ada suara)</button>
          <button style={tab(which === "intro")} onClick={() => setWhich("intro")}>Motion Intro</button>
        </div>

        {which === "mgchord" ? (
          <Player
            key="mgchord"
            component={MgchordPromo}
            durationInFrames={MGCHORD_DURATION}
            fps={30}
            compositionWidth={1920}
            compositionHeight={1080}
            controls
            loop
            numberOfSharedAudioTags={16}
            style={{ width: "100%", aspectRatio: "16/9", borderRadius: 12, overflow: "hidden" }}
          />
        ) : (
          <>
            <Player
              key="intro"
              component={MotionIntro}
              inputProps={{ title, subtitle }}
              durationInFrames={180}
              fps={30}
              compositionWidth={1920}
              compositionHeight={1080}
              controls
              loop
              autoPlay
              style={{ width: "100%", aspectRatio: "16/9", borderRadius: 12, overflow: "hidden" }}
            />
            <div style={{ display: "grid", gap: 12, marginTop: 20 }}>
              <label>Judul<input style={box} value={title} onChange={(e) => setTitle(e.target.value)} /></label>
              <label>Subtitle<input style={box} value={subtitle} onChange={(e) => setSubtitle(e.target.value)} /></label>
            </div>
          </>
        )}
        {which === "mgchord" && <p style={{ color: "#9aa7d6", marginTop: 12 }}>Tekan play untuk dengar suaranya (browser butuh klik dulu buat nyalain audio).</p>}
      </div>
    </div>
  );
};
