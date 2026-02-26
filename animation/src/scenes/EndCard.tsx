import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS } from "../styles/theme";

export const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleScale = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          transform: `scale(${titleScale})`,
          fontSize: 48,
          fontWeight: 700,
          fontFamily: "JetBrains Mono, monospace",
          color: COLORS.white,
        }}
      >
        <span style={{ color: "#E07A5F" }}>cc</span>-statusline
      </div>
    </AbsoluteFill>
  );
};
