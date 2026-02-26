import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { COLORS } from "../styles/theme";

type TypewriterTextProps = {
  text: string;
  startFrame?: number;
  charsPerFrame?: number;
  showCursor?: boolean;
  style?: React.CSSProperties;
};

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  startFrame = 0,
  charsPerFrame = 0.5,
  showCursor = true,
  style,
}) => {
  const frame = useCurrentFrame();
  const elapsed = Math.max(0, frame - startFrame);
  const charCount = Math.min(text.length, Math.floor(elapsed * charsPerFrame));
  const typed = text.slice(0, charCount);
  const isDone = charCount >= text.length;

  const cursorOpacity = isDone
    ? interpolate(frame % 16, [0, 8, 16], [1, 0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1;

  return (
    <span style={style}>
      {typed}
      {showCursor && (
        <span style={{ opacity: cursorOpacity, color: COLORS.cyan }}>▌</span>
      )}
    </span>
  );
};
