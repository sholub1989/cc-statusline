import { AbsoluteFill } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { fade } from "@remotion/transitions/fade";
import { loadFont as loadJetBrainsMono } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { InstallScene } from "./scenes/InstallScene";
import { ExtensionSetupScene } from "./scenes/ExtensionSetupScene";
import { ResultScene } from "./scenes/ResultScene";
import { EndCard } from "./scenes/EndCard";
import { SCENE, TRANSITION_FRAMES, COLORS } from "./styles/theme";

// Load fonts
loadJetBrainsMono("normal", { weights: ["400", "700"], subsets: ["latin"] });
loadInter("normal", { weights: ["400", "600", "700"], subsets: ["latin"] });

export const InstallGuide: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <TransitionSeries>
        {/* Scene 1: Install */}
        <TransitionSeries.Sequence durationInFrames={SCENE.install}>
          <InstallScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
        />

        {/* Scene 2+3: Extension setup (toggle + drag) */}
        <TransitionSeries.Sequence durationInFrames={SCENE.extensionSetup}>
          <ExtensionSetupScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
        />

        {/* Scene 4: Result */}
        <TransitionSeries.Sequence durationInFrames={SCENE.result}>
          <ResultScene />
        </TransitionSeries.Sequence>

        {/* Fade to end card */}
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
        />

        {/* End Card */}
        <TransitionSeries.Sequence durationInFrames={SCENE.endCard}>
          <EndCard />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
