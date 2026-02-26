import React from "react";
import { COLORS } from "../styles/theme";

type FinderWindowProps = {
  children: React.ReactNode;
  style?: React.CSSProperties;
};

export const FinderWindow: React.FC<FinderWindowProps> = ({
  children,
  style,
}) => {
  return (
    <div
      style={{
        backgroundColor: COLORS.finderBg,
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
          backgroundColor: COLORS.finderSidebar,
          borderBottom: `1px solid ${COLORS.terminalBorder}`,
          gap: 8,
        }}
      >
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
          Finder
        </div>
        <div style={{ width: 54 }} />
      </div>
      {/* Content area */}
      <div
        style={{
          display: "flex",
          flex: 1,
        }}
      >
        {/* Sidebar */}
        <div
          style={{
            width: 100,
            backgroundColor: COLORS.finderSidebar,
            borderRight: `1px solid ${COLORS.terminalBorder}`,
            padding: "12px 10px",
          }}
        >
          <div style={{ color: COLORS.dimGray, fontSize: 10, marginBottom: 8 }}>
            Favorites
          </div>
          <div style={{ color: "#8888aa", fontSize: 12, marginBottom: 4 }}>
            Desktop
          </div>
          <div style={{ color: "#8888aa", fontSize: 12, marginBottom: 4 }}>
            Downloads
          </div>
          <div style={{ color: "#8888aa", fontSize: 12 }}>Documents</div>
        </div>
        {/* Main area */}
        <div
          style={{
            flex: 1,
            padding: 16,
            fontFamily: "Inter, sans-serif",
            color: COLORS.white,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
