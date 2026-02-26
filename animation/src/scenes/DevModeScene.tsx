import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FinderWindow } from "../components/FinderWindow";
import { BrowserWindow } from "../components/BrowserWindow";
import { StepBadge } from "../components/StepBadge";
import { COLORS } from "../styles/theme";

export const DevModeScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Toggle animates at 1.5s mark
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

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, padding: 30 }}>
      <StepBadge step={2} />

      <div
        style={{
          display: "flex",
          gap: 20,
          marginTop: 30,
          height: 340,
        }}
      >
        {/* Finder window (left) — same as scene 3 for visual continuity */}
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

        {/* Browser window (right) with developer mode toggle */}
        <BrowserWindow url="chrome://extensions" style={{ flex: 1.2 }}>
          {/* Extensions page header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 600, color: COLORS.white }}>
              Extensions
            </div>
            {/* Developer mode toggle */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span style={{ fontSize: 12, color: COLORS.dimGray }}>
                Developer mode
              </span>
              {/* Toggle track */}
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
                {/* Toggle thumb */}
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

          {/* Placeholder extension cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {["uBlock Origin", "Dark Reader"].map((name) => (
              <div
                key={name}
                style={{
                  backgroundColor: "#1e1e2e",
                  borderRadius: 8,
                  padding: "10px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    backgroundColor: COLORS.dimGray,
                  }}
                />
                <div>
                  <div style={{ fontSize: 13, color: COLORS.white }}>
                    {name}
                  </div>
                  <div style={{ fontSize: 10, color: COLORS.dimGray }}>
                    Enabled
                  </div>
                </div>
              </div>
            ))}
          </div>
        </BrowserWindow>
      </div>
    </AbsoluteFill>
  );
};
