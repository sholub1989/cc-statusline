import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../styles/theme";

type StepBadgeProps = {
  step: number;
};

export const StepBadge: React.FC<StepBadgeProps> = ({ step }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 200 },
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 20,
        left: 20,
        zIndex: 10,
        width: 40,
        height: 40,
        borderRadius: "50%",
        backgroundColor: COLORS.cyan,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: `scale(${scale})`,
        boxShadow: `0 0 20px ${COLORS.cyan}44`,
      }}
    >
      <span
        style={{
          color: COLORS.bg,
          fontSize: 20,
          fontWeight: 700,
          fontFamily: "Inter, sans-serif",
        }}
      >
        {step}
      </span>
    </div>
  );
};
