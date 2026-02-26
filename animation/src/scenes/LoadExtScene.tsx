import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";
import { FinderWindow } from "../components/FinderWindow";
import { BrowserWindow } from "../components/BrowserWindow";
import { StepBadge } from "../components/StepBadge";
import { COLORS } from "../styles/theme";

export const LoadExtScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Arrow animation starts at 1s
  const arrowDelay = fps;
  const arrowDuration = Math.round(1.5 * fps);
  const arrowProgress = interpolate(
    frame,
    [arrowDelay, arrowDelay + arrowDuration],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.quad) },
  );

  // Extension card appears after arrow completes
  const cardDelay = arrowDelay + arrowDuration + 5;
  const cardScale = spring({
    frame: Math.max(0, frame - cardDelay),
    fps,
    config: { damping: 15, stiffness: 120 },
  });

  // Arrow path: starts from folder icon area, curves to chrome area
  const arrowStartX = 180;
  const arrowStartY = 220;
  const arrowEndX = 560;
  const arrowEndY = 180;
  const arrowMidX = (arrowStartX + arrowEndX) / 2;
  const arrowMidY = arrowStartY - 80;

  // Quadratic bezier point
  const t = arrowProgress;
  const arrowX =
    (1 - t) * (1 - t) * arrowStartX +
    2 * (1 - t) * t * arrowMidX +
    t * t * arrowEndX;
  const arrowY =
    (1 - t) * (1 - t) * arrowStartY +
    2 * (1 - t) * t * arrowMidY +
    t * t * arrowEndY;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, padding: 30 }}>
      <StepBadge step={3} />

      <div
        style={{
          display: "flex",
          gap: 20,
          marginTop: 30,
          height: 340,
        }}
      >
        {/* Finder window (left) */}
        <FinderWindow style={{ flex: 1 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              gap: 8,
            }}
          >
            {/* Folder icon */}
            <div
              style={{
                width: 64,
                height: 52,
                backgroundColor: COLORS.cyan,
                borderRadius: "4px 4px 8px 8px",
                position: "relative",
                opacity: 0.9,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: -8,
                  left: 0,
                  width: 28,
                  height: 10,
                  backgroundColor: COLORS.cyan,
                  borderRadius: "4px 4px 0 0",
                }}
              />
            </div>
            <div
              style={{
                fontSize: 13,
                color: COLORS.white,
                fontFamily: "Inter, sans-serif",
              }}
            >
              cc-statusline
            </div>
          </div>
        </FinderWindow>

        {/* Browser window (right) */}
        <BrowserWindow
          url="chrome://extensions"
          style={{ flex: 1.2 }}
        >
          <div
            style={{
              fontSize: 16,
              fontWeight: 600,
              marginBottom: 16,
              color: COLORS.white,
            }}
          >
            Extensions
          </div>

          {/* Extension card appears after drag */}
          <div
            style={{
              transform: `scale(${cardScale})`,
              opacity: cardScale,
              backgroundColor: "#1e1e2e",
              borderRadius: 10,
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              border: `1px solid ${COLORS.cyan}44`,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                backgroundColor: "#2d2d2d",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
              }}
            >
              {/* 3 vertical bars matching the actual extension icon */}
              <div style={{ width: 6, height: 22, borderRadius: 2, backgroundColor: "#c4756a" }} />
              <div style={{ width: 6, height: 22, borderRadius: 2, backgroundColor: "#a0604e" }} />
              <div style={{ width: 6, height: 22, borderRadius: 2, backgroundColor: "#8b5347" }} />
            </div>
            <div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: COLORS.white,
                }}
              >
                Claude Usage Monitor
              </div>
              <div style={{ fontSize: 11, color: COLORS.dimGray }}>
                cc-statusline extension
              </div>
            </div>
          </div>
        </BrowserWindow>
      </div>

      {/* Animated drag arrow (SVG overlay) */}
      {arrowProgress > 0 && arrowProgress < 1 && (
        <svg
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
          }}
        >
          {/* Arrow trail */}
          <path
            d={`M ${arrowStartX} ${arrowStartY} Q ${arrowMidX} ${arrowMidY} ${arrowX} ${arrowY}`}
            fill="none"
            stroke={COLORS.cyan}
            strokeWidth={2.5}
            strokeDasharray="8 4"
            opacity={0.6}
          />
          {/* Arrow head circle */}
          <circle
            cx={arrowX}
            cy={arrowY}
            r={8}
            fill={COLORS.cyan}
            opacity={0.9}
          />
        </svg>
      )}
    </AbsoluteFill>
  );
};
