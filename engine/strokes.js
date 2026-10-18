// Stroke primitive library: the 24 Pitman New Era consonant strokes plus
// direction variants (Ray / downward R, upward / downward H, upward SH, MP).
// Geometry (chord angle, relative length) comes from calibration.js, which
// was measured from the printed outlines of the 1920 New Era Instructor.
//   kind  = 'line' (straight) or 'arc' (quarter circle on the chord)
//   bulge = for arcs, which side of the travel direction the curve bows to
//   heavy = thick (voiced) or light stroke
//   up    = written upward
import { v, add, sub, mul, rot, deg, fromAngle, perpL, perpR, lerp, norm, dot } from './geometry.js';
import { GEOM, CAL } from './calibration.js';

const S = (o) => Object.freeze(o);
export const STROKES = {
  P: S({ kind: 'line', heavy: false, sound: 'p' }),
  B: S({ kind: 'line', heavy: true, sound: 'b' }),
  T: S({ kind: 'line', heavy: false, sound: 't' }),
  D: S({ kind: 'line', heavy: true, sound: 'd' }),
  CH: S({ kind: 'line', heavy: false, sound: 'ch' }),
  J: S({ kind: 'line', heavy: true, sound: 'j' }),
  K: S({ kind: 'line', heavy: false, sound: 'k' }),
  G: S({ kind: 'line', heavy: true, sound: 'g' }),
  F: S({ kind: 'arc', bulge: 'R', heavy: false, sound: 'f' }),
  V: S({ kind: 'arc', bulge: 'R', heavy: true, sound: 'v' }),
  TH: S({ kind: 'arc', bulge: 'R', heavy: false, sound: 'th (ith)' }),
  DH: S({ kind: 'arc', bulge: 'R', heavy: true, sound: 'dh (thee)' }),
  S: S({ kind: 'arc', bulge: 'L', heavy: false, sound: 's' }),
  Z: S({ kind: 'arc', bulge: 'L', heavy: true, sound: 'z' }),
  SH: S({ kind: 'arc', bulge: 'L', heavy: false, sound: 'sh' }),
  ZH: S({ kind: 'arc', bulge: 'L', heavy: true, sound: 'zh' }),
  SH_UP: S({ kind: 'arc', bulge: 'R', heavy: false, up: true, sound: 'sh (upward)' }),
  M: S({ kind: 'arc', bulge: 'L', heavy: false, sound: 'm' }),
  MP: S({ kind: 'arc', bulge: 'L', heavy: true, sound: 'mp / mb (thickened M)' }),
  N: S({ kind: 'arc', bulge: 'R', heavy: false, sound: 'n' }),
  NG: S({ kind: 'arc', bulge: 'R', heavy: true, sound: 'ng' }),
  L: S({ kind: 'arc', bulge: 'L', heavy: false, up: true, sound: 'l (upward)' }),
  // downward L (Instructor ch. XIX: after N / NG, and initial L after a vowel
  // before a horizontal, e.g. electric): same curve written top to bottom
  LD: S({ kind: 'arc', bulge: 'R', heavy: false, sound: 'l (downward)' }),
  RAY: S({ kind: 'line', heavy: false, up: true, sound: 'r (Ray, upward)' }),
  AR: S({ kind: 'arc', bulge: 'L', heavy: false, sound: 'r (Ar, downward)' }),
  W: S({ kind: 'line', heavy: false, up: true, hook: 'L', sound: 'w (upward)' }),
  WH: S({ kind: 'line', heavy: false, up: true, hook: 'L', bigHook: true, geom: 'WH', sound: 'w with enlarged hook' }),
  // Wel: upward L with a large initial hook on the inside of the curve (w + l)
  WL: S({ kind: 'arc', bulge: 'L', heavy: false, up: true, hook: 'R', hookR: 0.13, geom: 'L', sound: 'wl (Wel, hooked upward L)' }),
  Y: S({ kind: 'line', heavy: false, up: true, hook: 'R', sound: 'y (upward)' }),
  H_UP: S({ kind: 'line', heavy: false, up: true, circle: true, sound: 'h (upward)' }),
  H_DOWN: S({ kind: 'line', heavy: false, circle: true, sound: 'h (downward)' }),
};

export const LENGTHS = { half: CAL.half, normal: 1, double: CAL.double };
const N_SAMPLES = 32;

/** semicircular hook at point p (tangent tan, written direction) on side n.
 *  initial hooks sit behind the start (the pen arrives at pts[0]); final
 *  hooks run on past the end (the pen leaves at the last point). `sweep` in
 *  degrees (180 = semicircle). */
export function hookPts(p, tan, n, r, atEnd, sweep = 180, tail = 0) {
  const c = add(p, mul(n, r));
  const out = [];
  const K = 20;
  for (let i = 0; i <= K; i++) {
    const th = (deg(sweep) * i) / K;
    out.push(add(c, add(mul(n, -r * Math.cos(th)), mul(tan, (atEnd ? 1 : -1) * r * Math.sin(th)))));
  }
  // printed final hooks run back alongside the stroke: straight return leg
  if (tail > 0) { const q = out[out.length - 1]; for (let i = 1; i <= 4; i++) out.push(add(q, mul(tan, (atEnd ? -1 : 1) * tail * i / 4))); }
  return atEnd ? out : out.reverse();
}

/** Build a bare stroke at the origin (no hooks/circles except the built-in
 *  W/Y hook and H circle). opts: length, heavy (thickening override),
 *  reverse (curve bows the other way: alternative FR/VR/THR forms). */
export function buildStroke(name, { length = 'normal', heavy, reverse = false, sweep = 90, angle } = {}) {
  const def = STROKES[name];
  if (!def) throw new Error(`unknown stroke ${name}`);
  const g = GEOM[def.geom || name];
  const L = (length === 'double' && def.kind === 'arc' ? CAL.doubleCurve : length === 'half' ? (CAL.halfBy[def.geom || name] ?? CAL.half) : length === 'double' ? (CAL.doubleBy[def.geom || name] ?? CAL.double) : (LENGTHS[length] ?? length)) * g.len;
  const dir = fromAngle(angle ?? (length === 'double' && g.angleDouble != null ? g.angleDouble : g.angle));
  const start = v(0, 0);
  const end = mul(dir, L);
  const pts = [];
  const bulgeSide = def.kind === 'arc' ? (reverse ? (def.bulge === 'L' ? 'R' : 'L') : def.bulge) : null;
  const bulgeN = bulgeSide === 'L' ? perpL(dir) : perpR(dir);
  if (def.kind === 'line') {
    for (let i = 0; i <= N_SAMPLES; i++) pts.push(lerp(start, end, i / N_SAMPLES));
  } else {
    // circular arc on the chord; sweep 90 = quarter circle (sagitta 0.21 of the chord)
    const ph = deg(sweep), R = L / (2 * Math.sin(ph / 2));
    const c = sub(mul(add(start, end), 0.5), mul(bulgeN, R * Math.cos(ph / 2)));
    const r0 = sub(start, c);
    const sense = Math.abs(add(c, rot(r0, ph)).x - end.x) + Math.abs(add(c, rot(r0, ph)).y - end.y) < 1e-6 ? 1 : -1;
    for (let i = 0; i <= N_SAMPLES; i++) pts.push(add(c, rot(r0, sense * ph * (i / N_SAMPLES))));
  }
  const extras = [];
  if (def.circle) {
    // 2024 Ch. I table / Ex 1-3: the circle sits behind the start, turned to
    // the right of the direction of writing: upward H = circle below and to the
    // right; downward H = the "9" shape (circle above, a little to the left).
    // Srihari, round 4: the circle and the stroke are one pen movement; the
    // circle closes at the stroke start and the stroke leaves it along the
    // circle's tangent (hCircleBack 0 = exactly tangent)
    const side = perpR(dir), a = deg(def.up ? CAL.hCircleBackUp : CAL.hCircleBack);
    extras.push(flowCircle(start, add(mul(side, Math.cos(a)), mul(dir, -Math.sin(a))), CAL.hCircle, dir));
  }
  let entry = start;
  if (def.hook) {
    const n = def.hook === 'L' ? perpL(dir) : perpR(dir);
    const hp = hookPts(start, dir, n, def.hookR ?? (def.bigHook ? CAL.wHookLarge : CAL.wHook), false);
    extras.push({ type: 'polyline', pts: hp, heavy: false });
    entry = hp[0];
  }
  const t0 = norm(sub(pts[1], pts[0])), t1 = norm(sub(pts[N_SAMPLES], pts[N_SAMPLES - 1]));
  return { name, def, length: L, dir, pts, extras, heavy: heavy ?? def.heavy, up: !!def.up, kind: def.kind, bulgeN, t0, t1, entry, exit: end, reverse, sweep };
}

/** circle through joint point p, centre p + d*R; `at` and `sense` (+1 =
 *  anticlockwise) give the pen path: the pen runs round it in the sense that
 *  matches the stroke's direction of writing T at the joint */
export function flowCircle(p, d, R, T) {
  const sense = T ? (T.x * d.y - T.y * d.x >= 0 ? 1 : -1) : 1;
  return { type: 'circle', c: add(p, mul(d, R)), r: R, heavy: false, at: p, sense };
}

/** points of a circular arc from a to b bowing to side bulgeN, `sweep` degrees */
export function arcPts(a, b, bulgeN, sweep) {
  const L = Math.hypot(b.x - a.x, b.y - a.y), ph = deg(sweep), R = L / (2 * Math.sin(ph / 2));
  const c = sub(mul(add(a, b), 0.5), mul(bulgeN, R * Math.cos(ph / 2)));
  const r0 = sub(a, c);
  const sense = Math.abs(add(c, rot(r0, ph)).x - b.x) + Math.abs(add(c, rot(r0, ph)).y - b.y) < 1e-6 ? 1 : -1;
  const pts = [];
  for (let i = 0; i <= N_SAMPLES; i++) pts.push(add(c, rot(r0, sense * ph * (i / N_SAMPLES))));
  return pts;
}
/** same arc stroke redrawn with another sweep (chord, ends and side unchanged) */
export function withSweep(s, sweep) {
  const a = s.pts[0], b = s.pts[s.pts.length - 1];
  const pts = arcPts(a, b, s.bulgeN, sweep);
  return { ...s, pts, sweep, t0: norm(sub(pts[1], pts[0])), t1: norm(sub(pts[N_SAMPLES], pts[N_SAMPLES - 1])) };
}

export function translateStroke(s, off) {
  const t = (p) => add(p, off);
  return {
    ...s,
    pts: s.pts.map(t), entry: t(s.entry), exit: t(s.exit),
    extras: s.extras.map((e) => (e.type === 'circle' ? { ...e, c: t(e.c), ...(e.at ? { at: t(e.at) } : {}) } : { ...e, pts: e.pts.map(t) })),
  };
}

export const startOf = (s) => s.pts[0];
export const endOf = (s) => s.pts[s.pts.length - 1];
/** Point and unit tangent at parameter t in [0,1] along the stroke as written. */
export function pointAt(s, t) {
  const i = Math.min(s.pts.length - 2, Math.max(0, Math.floor(t * (s.pts.length - 1))));
  const f = t * (s.pts.length - 1) - i;
  return { p: lerp(s.pts[i], s.pts[i + 1], f), tan: norm(sub(s.pts[i + 1], s.pts[i])) };
}
/** inside-of-curve normal at the start / end of an arc stroke */
export function insideN(s, atEnd) {
  const tan = atEnd ? s.t1 : s.t0;
  let n = perpL(tan); if (dot(n, s.bulgeN) > 0) n = mul(n, -1);
  return n;
}
export const isHorizontal = (s) => Math.abs(s.dir.y) < 0.02;
