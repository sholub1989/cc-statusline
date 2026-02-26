import { Composition } from "remotion";
import { InstallGuide } from "./InstallGuide";
import { DataFlow } from "./DataFlow";
import { COMP } from "./styles/theme";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="InstallGuide"
        component={InstallGuide}
        durationInFrames={COMP.totalFrames}
        fps={COMP.fps}
        width={COMP.width}
        height={COMP.height}
      />
      <Composition
        id="DataFlow"
        component={DataFlow}
        durationInFrames={390}
        fps={30}
        width={800}
        height={450}
      />
    </>
  );
};
