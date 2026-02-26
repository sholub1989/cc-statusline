import { AbsoluteFill } from "remotion";
import { loadFont } from "@remotion/google-fonts/Caveat";
import { DataFlowScene } from "./scenes/DataFlowScene";

// Load Excalidraw-style handwriting font (self-contained, no shared theme)
loadFont("normal", { weights: ["400", "600", "700"], subsets: ["latin"] });

export const DataFlow: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#ffffff" }}>
      <DataFlowScene />
    </AbsoluteFill>
  );
};
