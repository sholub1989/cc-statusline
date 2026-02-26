import React, { useMemo } from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
// @ts-expect-error roughjs CJS import
import rough from "roughjs";
import { FlowArrow } from "../components/FlowArrow";

// ─── Excalidraw-style palette (self-contained) ─────────────────────
const EX = {
  bg: "#ffffff",
  stroke: "#1e1e1e",
  blue: "#a5d8ff",
  yellow: "#ffec99",
  green: "#b2f2bb",
  red: "#e03131",
  text: "#1e1e1e",
};

const FONT = "'Caveat', cursive";
const FONT_MONO = "'Caveat', cursive";

// ─── Phase timing (frames @ 30fps) ─────────────────────────────────
const P = {
  introStart: 0,
  introEnd: 25,
  triggerStart: 25,
  triggerEnd: 55,
  line1Start: 55,
  line1End: 90,
  socketStart: 90,
  socketEnd: 135,
  fetchStart: 135,
  fetchEnd: 195,
  apiStart: 195,
  apiEnd: 255,
  returnStart: 255,
  returnEnd: 330,
  line2Start: 330,
  line2End: 370,
};

// ─── Layout coordinates ────────────────────────────────────────────
const L = {
  statusline: { x: 30, y: 55, w: 265, h: 70 },
  chromeExt: { x: 430, y: 28, w: 340, h: 350 },
  hostPy: { x: 455, y: 55, w: 290, h: 78 },
  bgJs: { x: 455, y: 195, w: 290, h: 70 },
  line1: { x: 30, y: 195, w: 265, h: 52 },
  line2: { x: 30, y: 258, w: 265, h: 52 },
};

// ─── Helpers ───────────────────────────────────────────────────────

interface OpData {
  op: string;
  data: number[];
}

function opsToPath(ops: OpData[]): string {
  return ops
    .map(({ op, data }) => {
      switch (op) {
        case "move":
          return `M ${data[0].toFixed(1)} ${data[1].toFixed(1)}`;
        case "lineTo":
          return `L ${data[0].toFixed(1)} ${data[1].toFixed(1)}`;
        case "bcurveTo":
          return `C ${data[0].toFixed(1)} ${data[1].toFixed(1)}, ${data[2].toFixed(1)} ${data[3].toFixed(1)}, ${data[4].toFixed(1)} ${data[5].toFixed(1)}`;
        default:
          return "";
      }
    })
    .join(" ");
}

interface DrawableSet {
  type: string;
  ops: OpData[];
}

interface Drawable {
  sets: DrawableSet[];
}

function getPathsFromDrawable(drawable: Drawable) {
  return drawable.sets.map((set) => ({
    d: opsToPath(set.ops),
    type: set.type,
  }));
}

// ─── Sub-components ────────────────────────────────────────────────

const AnimatedShape: React.FC<{
  drawable: Drawable;
  drawStart: number;
  drawEnd: number;
  fillColor?: string;
  strokeColor?: string;
}> = ({
  drawable,
  drawStart,
  drawEnd,
  fillColor,
  strokeColor = EX.stroke,
}) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [drawStart, drawEnd], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  const pathData = useMemo(() => getPathsFromDrawable(drawable), [drawable]);
  const DASH = 3000;

  if (progress <= 0) return null;

  return (
    <g>
      {pathData.map((p, i) => {
        if (p.type === "fillPath" || p.type === "fillSketch") {
          return (
            <path
              key={i}
              d={p.d}
              fill={fillColor || "none"}
              stroke="none"
              opacity={Math.min(1, progress * 1.5)}
            />
          );
        }
        return (
          <path
            key={i}
            d={p.d}
            fill="none"
            stroke={strokeColor}
            strokeWidth={2}
            strokeDasharray={DASH}
            strokeDashoffset={DASH * (1 - progress)}
            strokeLinecap="round"
          />
        );
      })}
    </g>
  );
};

const FadeInText: React.FC<{
  x: number;
  y: number;
  text: string;
  startFrame: number;
  duration?: number;
  fontSize?: number;
  fill?: string;
  fontWeight?: string | number;
  textAnchor?: "start" | "middle" | "end";
  fontFamily?: string;
}> = ({
  x,
  y,
  text,
  startFrame,
  duration = 12,
  fontSize = 22,
  fill = EX.text,
  fontWeight = "bold",
  textAnchor = "middle",
  fontFamily = FONT,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [startFrame, startFrame + duration],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  if (opacity <= 0) return null;

  return (
    <text
      x={x}
      y={y}
      fill={fill}
      fontSize={fontSize}
      fontFamily={fontFamily}
      fontWeight={fontWeight}
      textAnchor={textAnchor}
      opacity={opacity}
    >
      {text}
    </text>
  );
};

// ─── Arrow path definitions ────────────────────────────────────────

// Socket: statusline.sh → host.py (L→R)
const ARROW_SOCKET = "M 295 82 C 340 78, 410 85, 455 88";
const ARROW_SOCKET_LEN = 185;

// Fetch: host.py → background.js (down inside Chrome Ext)
const ARROW_FETCH = "M 600 133 L 600 195";
const ARROW_FETCH_LEN = 65;

// API call: background.js → external (down-right, within Chrome Ext)
const ARROW_API_OUT = "M 710 265 L 710 335";
const ARROW_API_OUT_LEN = 75;

// Return: API response → background.js (up, offset right)
const ARROW_API_RETURN = "M 730 335 L 730 265";
const ARROW_API_RETURN_LEN = 75;

// Return: background.js → host.py (up)
const ARROW_BGJS_UP = "M 620 195 L 620 133";
const ARROW_BGJS_UP_LEN = 65;

// Return: host.py → statusline.sh (R→L)
const ARROW_RETURN_LEFT = "M 455 108 C 410 110, 340 100, 295 98";
const ARROW_RETURN_LEFT_LEN = 185;

// ─── Main Scene ────────────────────────────────────────────────────

export const DataFlowScene: React.FC = () => {
  const frame = useCurrentFrame();

  // Pre-compute rough shapes (deterministic via seed)
  const shapes = useMemo(() => {
    const gen = rough.generator();
    const opts = (seed: number, fill?: string) => ({
      seed,
      roughness: 1.8,
      strokeWidth: 2,
      disableMultiStroke: true,
      ...(fill ? { fill, fillStyle: "solid" as const } : {}),
    });

    return {
      statusline: gen.rectangle(
        L.statusline.x,
        L.statusline.y,
        L.statusline.w,
        L.statusline.h,
        opts(1, EX.blue)
      ),
      chromeExt: gen.rectangle(
        L.chromeExt.x,
        L.chromeExt.y,
        L.chromeExt.w,
        L.chromeExt.h,
        { seed: 12, roughness: 0.8, strokeWidth: 2, disableMultiStroke: true }
      ),
      hostPy: gen.rectangle(
        L.hostPy.x,
        L.hostPy.y,
        L.hostPy.w,
        L.hostPy.h,
        opts(3, EX.yellow)
      ),
      bgJs: gen.rectangle(
        L.bgJs.x,
        L.bgJs.y,
        L.bgJs.w,
        L.bgJs.h,
        opts(4, EX.green)
      ),
      line1: gen.rectangle(
        L.line1.x,
        L.line1.y,
        L.line1.w,
        L.line1.h,
        opts(5)
      ),
      line2: gen.rectangle(
        L.line2.x,
        L.line2.y,
        L.line2.w,
        L.line2.h,
        opts(6)
      ),
    };
  }, []);

  // Phase visibility helpers
  const afterIntro = frame >= P.introEnd;
  const afterSocket = frame >= P.socketEnd;

  return (
    <svg
      viewBox="0 0 800 450"
      width={800}
      height={450}
      style={{ background: EX.bg }}
    >
      {/* ── Phase 1: Intro (0–25) — boxes sketch in ── */}

      {/* statusline.sh box */}
      <AnimatedShape
        drawable={shapes.statusline}
        drawStart={P.introStart}
        drawEnd={P.introEnd}
        fillColor={EX.blue}
      />
      <FadeInText
        x={L.statusline.x + L.statusline.w / 2}
        y={L.statusline.y + 42}
        text="statusline.sh"
        startFrame={5}
        fontSize={24}
      />

      {/* Chrome Extension container */}
      <AnimatedShape
        drawable={shapes.chromeExt}
        drawStart={P.introStart + 3}
        drawEnd={P.introEnd + 5}
      />
      <FadeInText
        x={L.chromeExt.x + L.chromeExt.w / 2}
        y={L.chromeExt.y + L.chromeExt.h - 12}
        text="Chrome Extension"
        startFrame={8}
        fontSize={18}
        fontWeight={400}
        fill="#666666"
      />

      {/* host.py box */}
      <AnimatedShape
        drawable={shapes.hostPy}
        drawStart={P.introStart + 5}
        drawEnd={P.introEnd + 3}
        fillColor={EX.yellow}
      />
      <FadeInText
        x={L.hostPy.x + L.hostPy.w / 2}
        y={L.hostPy.y + 48}
        text="host.py"
        startFrame={10}
        fontSize={24}
      />

      {/* background.js box (part of extension, draws with intro) */}
      <AnimatedShape
        drawable={shapes.bgJs}
        drawStart={P.introStart + 5}
        drawEnd={P.introEnd + 3}
        fillColor={EX.green}
      />
      <FadeInText
        x={L.bgJs.x + L.bgJs.w / 2}
        y={L.bgJs.y + 44}
        text="background.js"
        startFrame={10}
        fontSize={22}
      />

      {/* ── Phase 2: Trigger (25–55) — "session JSON" label ── */}
      {afterIntro && (
        <FadeInText
          x={L.statusline.x + L.statusline.w / 2}
          y={L.statusline.y + L.statusline.h + 28}
          text="session JSON"
          startFrame={P.triggerStart}
          fontSize={17}
          fill={EX.red}
          fontWeight={600}
          fontFamily={FONT_MONO}
        />
      )}

      {/* ── Phase 3: Line 1 (55–90) — output strip ── */}
      <AnimatedShape
        drawable={shapes.line1}
        drawStart={P.line1Start}
        drawEnd={P.line1End}
      />
      <FadeInText
        x={L.line1.x + L.line1.w / 2}
        y={L.line1.y + 34}
        text="model | path | branch"
        startFrame={P.line1Start + 10}
        fontSize={18}
        fontWeight={400}
        fontFamily={FONT_MONO}
      />

      {/* ── Phase 4: Socket arrow (90–135) ── */}
      <FlowArrow
        d={ARROW_SOCKET}
        startFrame={P.socketStart}
        endFrame={P.socketEnd}
        pathLength={ARROW_SOCKET_LEN}
        color={EX.stroke}
      />
      {afterSocket && (
        <FadeInText
          x={375}
          y={68}
          text="unix socket"
          startFrame={P.socketStart + 15}
          fontSize={15}
          fontWeight={400}
          fill="#666666"
        />
      )}

      {/* ── Phase 5: Chrome fetch (135–195) — arrow down ── */}

      {/* Fetch arrow: host.py → background.js */}
      <FlowArrow
        d={ARROW_FETCH}
        startFrame={P.fetchStart + 20}
        endFrame={P.fetchEnd - 15}
        pathLength={ARROW_FETCH_LEN}
        color={EX.stroke}
      />
      <FadeInText
        x={622}
        y={170}
        text="fetch"
        startFrame={P.fetchStart + 30}
        fontSize={15}
        fontWeight={400}
        textAnchor="start"
        fill="#666666"
      />

      {/* ── Phase 6: API call (195–255) — arc right ── */}
      <FlowArrow
        d={ARROW_API_OUT}
        startFrame={P.apiStart}
        endFrame={P.apiEnd - 15}
        pathLength={ARROW_API_OUT_LEN}
        color={EX.stroke}
      />
      <FadeInText
        x={700}
        y={310}
        text="GET /api/usage"
        startFrame={P.apiStart + 20}
        fontSize={14}
        fontWeight={400}
        textAnchor="end"
        fill={EX.red}
        fontFamily={FONT_MONO}
      />

      {/* ── Phase 7: Return path (255–330) ── */}

      {/* API response back to bg.js */}
      <FlowArrow
        d={ARROW_API_RETURN}
        startFrame={P.returnStart}
        endFrame={P.returnStart + 25}
        pathLength={ARROW_API_RETURN_LEN}
        color={EX.stroke}
      />

      {/* bg.js → host.py (up) */}
      <FlowArrow
        d={ARROW_BGJS_UP}
        startFrame={P.returnStart + 20}
        endFrame={P.returnStart + 50}
        pathLength={ARROW_BGJS_UP_LEN}
        color={EX.stroke}
      />

      {/* host.py → statusline.sh (left) */}
      <FlowArrow
        d={ARROW_RETURN_LEFT}
        startFrame={P.returnStart + 45}
        endFrame={P.returnEnd}
        pathLength={ARROW_RETURN_LEFT_LEN}
        color={EX.stroke}
      />
      <FadeInText
        x={375}
        y={120}
        text="JSON"
        startFrame={P.returnStart + 50}
        fontSize={15}
        fontWeight={600}
        fill={EX.red}
      />

      {/* ── Phase 8: Line 2 (330–370) — usage output strip ── */}
      <AnimatedShape
        drawable={shapes.line2}
        drawStart={P.line2Start}
        drawEnd={P.line2End}
      />
      <FadeInText
        x={L.line2.x + L.line2.w / 2}
        y={L.line2.y + 34}
        text="19% 3h 46m | 16% Sat 10PM"
        startFrame={P.line2Start + 12}
        fontSize={17}
        fontWeight={400}
        fontFamily={FONT_MONO}
      />
    </svg>
  );
};
