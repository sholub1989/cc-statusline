import React from "react";
import { interpolate, useCurrentFrame, Easing } from "remotion";

interface FlowArrowProps {
  d: string;
  startFrame: number;
  endFrame: number;
  color?: string;
  pathLength: number;
  strokeWidth?: number;
}

export const FlowArrow: React.FC<FlowArrowProps> = ({
  d,
  startFrame,
  endFrame,
  color = "#1e1e1e",
  pathLength,
  strokeWidth = 2.5,
}) => {
  const frame = useCurrentFrame();

  const progress = interpolate(frame, [startFrame, endFrame], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  const arrowHead = getArrowHead(d);

  return (
    <g>
      {/* Main path with draw-on effect */}
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={pathLength}
        strokeDashoffset={pathLength * (1 - progress)}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Hand-drawn arrowhead — only appears once line nearly reaches the end */}
      {progress > 0.8 && arrowHead && (
        <polygon
          points={arrowHead}
          fill={color}
          opacity={interpolate(progress, [0.8, 0.95], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })}
        />
      )}
    </g>
  );
};

/**
 * Compute a small sketchy arrowhead at the end of the path.
 * Extract all numbers from the path string, use the last pair as
 * the endpoint and the pair before that as the direction reference
 * (works correctly for both L and C commands).
 */
function getArrowHead(d: string): string | null {
  // Extract all numbers (including negatives/decimals) from the path
  const nums = d.match(/-?\d+\.?\d*/g)?.map(Number);
  if (!nums || nums.length < 4) return null;

  const endX = nums[nums.length - 2];
  const endY = nums[nums.length - 1];
  // For C commands this is the last control point, giving the tangent direction
  const prevX = nums[nums.length - 4];
  const prevY = nums[nums.length - 3];

  const dx = endX - prevX;
  const dy = endY - prevY;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return null;

  const ux = dx / len;
  const uy = dy / len;

  // Arrowhead size
  const size = 9;
  // Perpendicular
  const px = -uy;
  const py = ux;

  // Small fixed offsets for hand-drawn feel
  const j = 0.8;

  const tipX = endX;
  const tipY = endY;
  const leftX = endX - ux * size + px * size * 0.4 + j;
  const leftY = endY - uy * size + py * size * 0.4 - j * 0.5;
  const rightX = endX - ux * size - px * size * 0.4 - j * 0.5;
  const rightY = endY - uy * size - py * size * 0.4 + j * 0.5;

  return `${tipX},${tipY} ${leftX},${leftY} ${rightX},${rightY}`;
}
