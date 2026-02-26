import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { TerminalWindow } from "../components/TerminalWindow";
import { COLORS } from "../styles/theme";

type Segment = {
  text: string;
  color: string;
  delay: number; // frames before this segment highlights
};

const LINE1_SEGMENTS: Segment[] = [
  { text: "Opus 4.6", color: COLORS.cyan, delay: 30 },
  { text: " | ", color: COLORS.dimGray, delay: 30 },
  { text: "/myapp", color: COLORS.white, delay: 45 },
  { text: " | ", color: COLORS.dimGray, delay: 45 },
  { text: "main", color: COLORS.magenta, delay: 60 },
  { text: " | ", color: COLORS.dimGray, delay: 60 },
  { text: "+12", color: COLORS.green, delay: 75 },
  { text: " ", color: COLORS.dimGray, delay: 75 },
  { text: "-5", color: COLORS.red, delay: 75 },
  { text: " | ", color: COLORS.dimGray, delay: 75 },
  { text: "Ctx: ", color: COLORS.white, delay: 90 },
  { text: "22.5%", color: COLORS.cyan, delay: 90 },
  { text: " (45 000)", color: COLORS.dimGray, delay: 90 },
  { text: " | ", color: COLORS.dimGray, delay: 90 },
  { text: "Cost: ", color: COLORS.white, delay: 105 },
  { text: "$0.42", color: COLORS.cyan, delay: 105 },
];

const LINE2_SEGMENTS: Segment[] = [
  { text: "19%", color: COLORS.cyan, delay: 120 },
  { text: " 3h 46m", color: COLORS.dimGray, delay: 120 },
  { text: " | ", color: COLORS.dimGray, delay: 120 },
  { text: "16%", color: COLORS.cyan, delay: 135 },
  { text: " Sat 10:00 PM", color: COLORS.dimGray, delay: 135 },
];

export const ResultScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Statusline springs in from bottom
  const barEntrance = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 80 },
  });
  const barY = interpolate(barEntrance, [0, 1], [40, 0]);

  // Annotation appears after line 2 segments are visible
  const annotationDelay = 150;
  const annotationProgress = spring({
    frame: Math.max(0, frame - annotationDelay),
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  // Arrow line draws after label appears
  const lineDelay = 158;
  const lineProgress = interpolate(
    frame,
    [lineDelay, lineDelay + 35],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, padding: 30 }}>
      <TerminalWindow
        title="Claude Code — myapp"
        style={{ height: 370 }}
      >
        {/* Simulated terminal content */}
        <div style={{ color: COLORS.dimGray, marginBottom: 4 }}>
          $ claude
        </div>
        <div style={{ color: COLORS.dimGray, marginBottom: 4 }}>
          Welcome to Claude Code v1.0.27
        </div>
        <div style={{ color: COLORS.dimGray, marginBottom: 4 }}>
          <span style={{ color: COLORS.cyan }}>?</span> What would you like to
          do?
        </div>
        <div style={{ color: COLORS.white, marginBottom: 8 }}>
          &gt; Help me refactor the auth module
        </div>
        <div style={{ color: COLORS.dimGray, fontSize: 12 }}>
          I'll analyze the authentication module and suggest improvements...
        </div>

        {/* Spacer to push statusline to bottom */}
        <div style={{ flex: 1 }} />

        {/* Statusline at bottom */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            transform: `translateY(${barY}px)`,
            opacity: barEntrance,
            borderTop: `1px solid ${COLORS.terminalBorder}`,
          }}
        >
          {/* Line 1 */}
          <div
            style={{
              padding: "6px 16px",
              fontSize: 13,
              fontFamily: "JetBrains Mono, monospace",
              display: "flex",
              flexWrap: "wrap",
              backgroundColor: "#0a0e14",
            }}
          >
            {LINE1_SEGMENTS.map((seg, i) => (
              <SegmentSpan key={i} segment={seg} />
            ))}
          </div>
          {/* Line 2 */}
          <div
            style={{
              padding: "4px 16px 6px",
              fontSize: 12,
              fontFamily: "JetBrains Mono, monospace",
              display: "flex",
              flexWrap: "wrap",
              backgroundColor: "#0a0e14",
            }}
          >
            {LINE2_SEGMENTS.map((seg, i) => (
              <SegmentSpan key={i} segment={seg} />
            ))}
          </div>
        </div>
      </TerminalWindow>

      {/* Big annotation label — centered in the terminal body area */}
      <div
        style={{
          position: "absolute",
          top: 140,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          opacity: annotationProgress,
          transform: `scale(${interpolate(annotationProgress, [0, 1], [0.85, 1])})`,
        }}
      >
        <div
          style={{
            backgroundColor: COLORS.bg,
            border: `2px solid ${COLORS.cyan}`,
            color: COLORS.cyan,
            fontSize: 22,
            fontWeight: 700,
            fontFamily: "Inter, sans-serif",
            padding: "12px 28px",
            borderRadius: 10,
            whiteSpace: "nowrap",
          }}
        >
          Claude Code subscription usage
        </div>
      </div>

      {/*
        Animated L-shaped arrow:
        Down from label center (400, 200) to (400, 416),
        then left to line 2 start (56, 416).
        Total path length ≈ 216 + 344 = 560.
      */}
      <svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 800,
          height: 450,
          pointerEvents: "none",
        }}
      >
        {/* L-shaped line with rounded corner, animated draw */}
        <path
          d="M 400 200 L 400 425 Q 400 433 392 433 L 320 433"
          fill="none"
          stroke={COLORS.cyan}
          strokeWidth={2}
          strokeDasharray={320}
          strokeDashoffset={320 * (1 - lineProgress)}
          opacity={0.7}
        />
        {/* Arrowhead at left end, pointing left */}
        <path
          d="M 328 427 L 314 433 L 328 439"
          stroke={COLORS.cyan}
          strokeWidth={2.5}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={lineProgress > 0.95 ? 1 : 0}
        />
      </svg>
    </AbsoluteFill>
  );
};

const SegmentSpan: React.FC<{ segment: Segment }> = ({ segment }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame: Math.max(0, frame - segment.delay),
    fps,
    config: { damping: 20, stiffness: 150 },
  });

  const opacity = interpolate(entrance, [0, 1], [0.2, 1]);
  const y = interpolate(entrance, [0, 1], [4, 0]);

  return (
    <span
      style={{
        color: segment.color,
        opacity,
        transform: `translateY(${y}px)`,
        display: "inline-block",
        whiteSpace: "pre",
      }}
    >
      {segment.text}
    </span>
  );
};
