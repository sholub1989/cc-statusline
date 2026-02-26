import React from "react";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { TerminalWindow } from "../components/TerminalWindow";
import { StepBadge } from "../components/StepBadge";
import { TypewriterText } from "../components/TypewriterText";
import { COLORS } from "../styles/theme";

const CURL_CMD = "curl -fsSL https://raw.githubusercontent.com/.../install.sh | bash";

const OUTPUT_LINES = [
  { text: "✓ Downloading cc-statusline...", color: COLORS.green },
  { text: "✓ Installing statusline hook...", color: COLORS.green },
  { text: "✓ Building Chrome extension...", color: COLORS.green },
  { text: "✓ Installation complete!", color: COLORS.cyan },
];

export const InstallScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Cursor prompt
  const promptColor = COLORS.green;

  // Output lines appear after typing finishes (~60 frames for typing)
  const typingDone = 70;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, padding: 40 }}>
      <StepBadge step={1} />
      <div style={{ marginTop: 30 }}>
        <TerminalWindow title="Terminal" style={{ height: 320 }}>
          {/* Prompt + command */}
          <div style={{ display: "flex" }}>
            <span style={{ color: promptColor, marginRight: 8 }}>$</span>
            <TypewriterText
              text={CURL_CMD}
              charsPerFrame={0.8}
              showCursor={frame < typingDone}
            />
          </div>

          {/* Output lines */}
          {OUTPUT_LINES.map((line, i) => {
            const lineStart = typingDone + i * 15;
            return (
              <Sequence key={i} from={lineStart} layout="none">
                <OutputLine text={line.text} color={line.color} />
              </Sequence>
            );
          })}
        </TerminalWindow>
      </div>
    </AbsoluteFill>
  );
};

const OutputLine: React.FC<{ text: string; color: string }> = ({
  text,
  color,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(frame, [0, 0.3 * fps], [0, 1], {
    extrapolateRight: "clamp",
  });
  const translateY = interpolate(frame, [0, 0.3 * fps], [5, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        color,
        marginTop: 4,
      }}
    >
      {text}
    </div>
  );
};
