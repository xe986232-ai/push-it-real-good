import { Composition } from "remotion";
import { MotionIntro } from "./MotionIntro";
import { MgchordPromo, MGCHORD_DURATION, MGCHORD_FPS } from "./mgchord/Promo";

export const Root = () => {
  return (
    <>
      <Composition
        id="MgchordPromo"
        component={MgchordPromo}
        durationInFrames={MGCHORD_DURATION} // 36 detik @ 60fps
        fps={MGCHORD_FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="MotionIntro"
        component={MotionIntro}
        durationInFrames={360} // 6 detik @ 60fps
        fps={60}
        width={1920}
        height={1080}
        defaultProps={{ title: "LHU STUDIO", subtitle: "Motion Graphics • Remotion" }}
      />
    </>
  );
};
