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

export const ExtensionSetupScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // --- Phase 1: Toggle (step 2) at 1.5s ---
  const toggleDelay = Math.round(1.5 * fps);
  const toggleProgress = spring({
    frame: Math.max(0, frame - toggleDelay),
    fps,
    config: { damping: 15, stiffness: 120 },
  });

  const trackWidth = 44;
  const thumbSize = 20;
  const thumbTravel = trackWidth - thumbSize - 4;
  const thumbX = interpolate(toggleProgress, [0, 1], [2, thumbTravel + 2]);
  const trackBg = toggleProgress > 0.5 ? COLORS.cyan : COLORS.dimGray;

  // --- Phase 2: Drag arrow (step 3) starts at 3.5s ---
  const arrowDelay = Math.round(3.5 * fps);
  const arrowDuration = Math.round(1.2 * fps);
  const arrowProgress = interpolate(
    frame,
    [arrowDelay, arrowDelay + arrowDuration],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.quad),
    },
  );

  // Extension card appears after arrow completes
  const cardDelay = arrowDelay + arrowDuration + 5;
  const cardScale = spring({
    frame: Math.max(0, frame - cardDelay),
    fps,
    config: { damping: 15, stiffness: 120 },
  });

  // Step badge transitions from 2 → 3
  const showStep3 = frame > arrowDelay - 15;

  // Arrow bezier path: from folder area to chrome area
  const arrowStartX = 180;
  const arrowStartY = 230;
  const arrowEndX = 540;
  const arrowEndY = 190;
  const arrowMidX = (arrowStartX + arrowEndX) / 2;
  const arrowMidY = arrowStartY - 80;

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
      <StepBadge step={showStep3 ? 3 : 2} />

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
        <BrowserWindow url="chrome://extensions" style={{ flex: 1.2 }}>
          {/* Header with toggle */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <div
              style={{ fontSize: 18, fontWeight: 600, color: COLORS.white }}
            >
              Extensions
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, color: COLORS.dimGray }}>
                Developer mode
              </span>
              <div
                style={{
                  width: trackWidth,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: trackBg,
                  position: "relative",
                  boxShadow:
                    toggleProgress > 0.5
                      ? `0 0 12px ${COLORS.cyan}66`
                      : "none",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 2,
                    left: thumbX,
                    width: thumbSize,
                    height: thumbSize,
                    borderRadius: "50%",
                    backgroundColor: COLORS.white,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Existing extensions */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: 8 }}
          >
            {["uBlock Origin", "Dark Reader"].map((name) => (
              <div
                key={name}
                style={{
                  backgroundColor: "#1e1e2e",
                  borderRadius: 8,
                  padding: "8px 12px",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 5,
                    backgroundColor: COLORS.dimGray,
                  }}
                />
                <div>
                  <div style={{ fontSize: 12, color: COLORS.white }}>
                    {name}
                  </div>
                  <div style={{ fontSize: 9, color: COLORS.dimGray }}>
                    Enabled
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Extension card appears after drag */}
          {cardScale > 0.01 && (
            <div
              style={{
                marginTop: 8,
                transform: `scale(${cardScale})`,
                opacity: cardScale,
                backgroundColor: "#1e1e2e",
                borderRadius: 8,
                padding: "8px 12px",
                display: "flex",
                alignItems: "center",
                gap: 10,
                border: `1px solid ${COLORS.cyan}44`,
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 5,
                  backgroundColor: "#2d2d2d",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                }}
              >
                <div
                  style={{
                    width: 4,
                    height: 14,
                    borderRadius: 1,
                    backgroundColor: "#c4756a",
                  }}
                />
                <div
                  style={{
                    width: 4,
                    height: 14,
                    borderRadius: 1,
                    backgroundColor: "#a0604e",
                  }}
                />
                <div
                  style={{
                    width: 4,
                    height: 14,
                    borderRadius: 1,
                    backgroundColor: "#8b5347",
                  }}
                />
              </div>
              <div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: COLORS.white,
                  }}
                >
                  Claude Usage Monitor
                </div>
                <div style={{ fontSize: 9, color: COLORS.dimGray }}>
                  cc-statusline extension
                </div>
              </div>
            </div>
          )}
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
          <path
            d={`M ${arrowStartX} ${arrowStartY} Q ${arrowMidX} ${arrowMidY} ${arrowX} ${arrowY}`}
            fill="none"
            stroke={COLORS.cyan}
            strokeWidth={2.5}
            strokeDasharray="8 4"
            opacity={0.6}
          />
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
