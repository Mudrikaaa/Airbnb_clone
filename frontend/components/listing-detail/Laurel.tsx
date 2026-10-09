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

// ---- Large laurel for the reviews header: 4 plump leaves on the outside of a curved stem, curled at the
// base, dark grey with a soft top-left highlight and a drop shadow for a 3D look. Drawn for this project.

const BIG_LEAVES = [0.18, 0.42, 0.66, 0.9].map((t, i) => {
  const p = pointAt(t);
  const a = tangentAngle(t);
  const outward = ((a - 90) * Math.PI) / 180;
  return { x: p.x + Math.cos(outward) * 4.2, y: p.y + Math.sin(outward) * 4.2, angle: a + 90 - 32, scale: 1.55 - i * 0.12 };
});

export function BigLaurel({ flip = false, size = 96, id }: { flip?: boolean; size?: number; id: string }) {
  return (
    <svg
      viewBox="-6 -4 32 58"
      width={(size * 32) / 58}
      height={size}
      aria-hidden
      style={{ transform: flip ? "scaleX(-1)" : undefined, filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.18))" }}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6B6B6B" />
          <stop offset="55%" stopColor="#3A3A3A" />
          <stop offset="100%" stopColor="#222222" />
        </linearGradient>
      </defs>
      {/* stem, ending in a small curl at the base */}
      <path
        d={`M${P2.x} ${P2.y} Q${P1.x} ${P1.y} ${P0.x} ${P0.y} q3.5 2.5 1.2 5 q-2 1.6 -3.6 -0.4`}
        fill="none"
        stroke="#2E2E2E"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      {BIG_LEAVES.map((l, i) => (
        <path key={i} d={leafPath(l.scale)} fill={`url(#${id})`} transform={`translate(${l.x.toFixed(2)} ${l.y.toFixed(2)}) rotate(${l.angle.toFixed(1)})`} />
      ))}
    </svg>
  );
}
