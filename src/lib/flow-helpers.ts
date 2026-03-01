/**
 * flow-helpers.ts
 * Math utilities for the SkillFlowGraphic SVG diagram.
 */

/** Returns a cubic-bezier SVG path string: M x1,y1 C cx1,cy1 cx2,cy2 x2,y2 */
export function cubicBezier(
  x1: number, y1: number,
  cx1: number, cy1: number,
  cx2: number, cy2: number,
  x2: number, y2: number
): string {
  return `M ${x1},${y1} C ${cx1},${cy1} ${cx2},${cy2} ${x2},${y2}`;
}

/**
 * Smooth S-curve from a left-side node to the centre.
 * CP1 extends horizontally right from the start (same Y).
 * CP2 approaches the centre from slightly left (same Y as centre).
 */
export function leftToCenter(
  sx: number, sy: number,
  cx: number, cy: number
): string {
  const span = cx - sx;
  return cubicBezier(
    sx, sy,
    sx + span * 0.48, sy,    // depart horizontally
    cx - span * 0.12, cy,    // arrive from left
    cx, cy
  );
}

/**
 * Smooth S-curve from a right-side node to the centre.
 * Mirror of leftToCenter.
 */
export function rightToCenter(
  sx: number, sy: number,
  cx: number, cy: number
): string {
  const span = sx - cx;
  return cubicBezier(
    sx, sy,
    sx - span * 0.48, sy,    // depart horizontally
    cx + span * 0.12, cy,    // arrive from right
    cx, cy
  );
}

/**
 * Evenly distribute `count` items between `topY` and `bottomY`.
 * Returns the Y coordinate for the given `index`.
 */
export function distributeY(
  index: number,
  count: number,
  topY: number,
  bottomY: number
): number {
  if (count <= 1) return (topY + bottomY) / 2;
  return topY + (index / (count - 1)) * (bottomY - topY);
}

/** Simple seeded LCG — deterministic pseudo-random sequence */
function seededRand(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** Scatter `count` dots inside a circle (deterministic via `seed`). */
export function clusterDots(
  cx: number,
  cy: number,
  radius: number,
  count: number,
  seed = 1337
): Array<{ x: number; y: number; r: number; opacity: number; colorIdx: number }> {
  const rand = seededRand(seed);
  return Array.from({ length: count }, (_, i) => {
    const angle = rand() * Math.PI * 2;
    const dist  = Math.sqrt(rand()) * radius;   // uniform disc distribution
    return {
      x:        cx + Math.cos(angle) * dist,
      y:        cy + Math.sin(angle) * dist,
      r:        rand() * 2.5 + 0.8,
      opacity:  rand() * 0.55 + 0.15,
      colorIdx: i % 3,
    };
  });
}

/** `count` points evenly spaced on a circle, starting at `offsetDeg` degrees. */
export function circlePoints(
  cx: number,
  cy: number,
  radius: number,
  count: number,
  offsetDeg = 0
): Array<{ x: number; y: number }> {
  return Array.from({ length: count }, (_, i) => {
    const angle = ((i / count) * 360 + offsetDeg) * (Math.PI / 180);
    return {
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius,
    };
  });
}
