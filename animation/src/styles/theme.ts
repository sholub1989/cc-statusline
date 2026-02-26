export const COLORS = {
  bg: "#1a1a2e",
  cyan: "#00d4ff",
  magenta: "#ff6bff",
  green: "#22c55e",
  red: "#ef4444",
  white: "#ffffff",
  dimGray: "#666666",
  terminalBg: "#0d1117",
  terminalBorder: "#30363d",
  browserBg: "#292d3e",
  browserBar: "#1e1e2e",
  finderBg: "#2d2d3d",
  finderSidebar: "#252535",
  trafficRed: "#ff5f57",
  trafficYellow: "#febc2e",
  trafficGreen: "#28c840",
} as const;

export const FONTS = {
  mono: "JetBrains Mono, monospace",
  sans: "Inter, sans-serif",
} as const;

export const FPS = 30;

// Scene durations in frames
export const SCENE = {
  install: 5 * FPS, // 150 frames
  extensionSetup: 8 * FPS, // 240 frames (toggle + drag combined)
  result: 8 * FPS, // 240 frames (extra time for annotation)
  endCard: 3 * FPS, // 90 frames
} as const;

export const TRANSITION_FRAMES = 15;

// Total = sum of scenes - (number of transitions * transition duration)
// 3 transitions between 4 scenes
export const COMP = {
  width: 800,
  height: 450,
  fps: FPS,
  totalFrames:
    SCENE.install +
    SCENE.extensionSetup +
    SCENE.result +
    SCENE.endCard -
    3 * TRANSITION_FRAMES,
} as const;
