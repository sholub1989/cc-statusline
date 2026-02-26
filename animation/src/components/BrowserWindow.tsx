import React from "react";
import { COLORS } from "../styles/theme";

type BrowserWindowProps = {
  url?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
};

export const BrowserWindow: React.FC<BrowserWindowProps> = ({
  url = "chrome://extensions",
  children,
  style,
}) => {
  return (
    <div
      style={{
        backgroundColor: COLORS.browserBg,
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
          backgroundColor: COLORS.browserBar,
          borderBottom: `1px solid ${COLORS.terminalBorder}`,
          gap: 10,
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
        {/* Address bar */}
        <div
          style={{
            flex: 1,
            backgroundColor: "#1a1a2e",
            borderRadius: 6,
            padding: "6px 12px",
            color: COLORS.dimGray,
            fontSize: 13,
            fontFamily: "Inter, sans-serif",
          }}
        >
          {url}
        </div>
      </div>
      {/* Content */}
      <div
        style={{
          padding: 20,
          flex: 1,
          fontFamily: "Inter, sans-serif",
          color: COLORS.white,
        }}
      >
        {children}
      </div>
    </div>
  );
};
