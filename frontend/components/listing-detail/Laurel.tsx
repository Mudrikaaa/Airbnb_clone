/**
 * Laurel branch drawn for this project (Airbnb frames "Guest favourite" between two of them).
 * Leaves are placed along a curved stem and angled away from it on both sides, so the branch
 * still reads as leaves when it's small. Geometry is computed once at module load.
 */

// Stem: quadratic Bézier from the base (bottom right) to the tip (top).
const P0 = { x: 17, y: 46 };
const P1 = { x: 1, y: 27 };
const P2 = { x: 13, y: 3 };

function pointAt(t: number) {
  const u = 1 - t;
  return { x: u * u * P0.x + 2 * u * t * P1.x + t * t * P2.x, y: u * u * P0.y + 2 * u * t * P1.y + t * t * P2.y };
}

function tangentAngle(t: number) {
  const dx = 2 * (1 - t) * (P1.x - P0.x) + 2 * t * (P2.x - P1.x);
  const dy = 2 * (1 - t) * (P1.y - P0.y) + 2 * t * (P2.y - P1.y);
  return (Math.atan2(dy, dx) * 180) / Math.PI;
}

type Leaf = { x: number; y: number; angle: number; scale: number };

const LEAVES: Leaf[] = [0.12, 0.27, 0.42, 0.57, 0.72, 0.86].flatMap((t, i) => {
  const p = pointAt(t);
  const a = tangentAngle(t); // direction of travel along the stem (towards the tip)
  const shrink = 1 - i * 0.07; // leaves get smaller towards the tip
  const outward = ((a - 90) * Math.PI) / 180; // left-hand side of the stem = outside of the wreath
  return [
    // outer leaf, angled 40° away from the stem
    { x: p.x + Math.cos(outward) * 3.2, y: p.y + Math.sin(outward) * 3.2, angle: a + 90 - 40, scale: shrink },
    // inner leaf, smaller, angled 40° the other way
    { x: p.x - Math.cos(outward) * 2.6, y: p.y - Math.sin(outward) * 2.6, angle: a + 90 + 40, scale: shrink * 0.78 },
  ];
});

const leafPath = (s: number) =>
  `M0 ${-5.5 * s} C${3 * s} ${-2.5 * s} ${3 * s} ${2.5 * s} 0 ${5.5 * s} C${-3 * s} ${2.5 * s} ${-3 * s} ${-2.5 * s} 0 ${-5.5 * s}Z`;

export function Laurel({ flip = false, size = 32 }: { flip?: boolean; size?: number }) {
  return (
    <svg viewBox="-2 0 26 48" width={(size * 26) / 48} height={size} aria-hidden style={flip ? { transform: "scaleX(-1)" } : undefined}>
      <path d={`M${P0.x} ${P0.y} Q${P1.x} ${P1.y} ${P2.x} ${P2.y}`} fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      {LEAVES.map((l, i) => (
        <path key={i} d={leafPath(l.scale)} fill="currentColor" transform={`translate(${l.x.toFixed(2)} ${l.y.toFixed(2)}) rotate(${l.angle.toFixed(1)})`} />
      ))}
    </svg>
  );
}
