import React from "react";
import { COLORS } from "../styles/theme";

type TerminalWindowProps = {
  title?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
};

export const TerminalWindow: React.FC<TerminalWindowProps> = ({
  title = "Terminal",
  children,
  style,
}) => {
  return (
    <div
      style={{
        backgroundColor: COLORS.terminalBg,
        borderRadius: 10,
        border: `1px solid ${COLORS.terminalBorder}`,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        ...style,
      }}
    >
      {/* Title bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "10px 14px",
          backgroundColor: "#161b22",
          borderBottom: `1px solid ${COLORS.terminalBorder}`,
          gap: 8,
        }}
      >
        {/* Traffic lights */}
        <div style={{ display: "flex", gap: 6 }}>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: COLORS.trafficRed,
            }}
          />
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: COLORS.trafficYellow,
            }}
          />
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: COLORS.trafficGreen,
            }}
          />
        </div>
        <div
          style={{
            flex: 1,
            textAlign: "center",
            color: COLORS.dimGray,
            fontSize: 13,
            fontFamily: "Inter, sans-serif",
          }}
        >
          {title}
        </div>
        {/* Spacer for centering */}
        <div style={{ width: 54 }} />
      </div>
      {/* Content */}
      <div
        style={{
          padding: 16,
          flex: 1,
          fontFamily: "JetBrains Mono, monospace",
          fontSize: 14,
          lineHeight: 1.6,
          color: COLORS.white,
        }}
      >
        {children}
      </div>
    </div>
  );
};
