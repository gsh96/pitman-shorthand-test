// Stroke primitive library: the 24 Pitman New Era consonant strokes plus
// direction variants (Ray / downward R, upward / downward H, upward SH).
//
// Every stroke is defined by the direction in which it is WRITTEN:
//   angle  = direction of the chord from start to end, degrees, y up
//            (0 = left->right, -90 = straight down, +30 = Ray slope, ...)
//   kind   = 'line' (straight) or 'arc' (quarter circle)
//   bulge  = for arcs, which side of the travel direction the curve bows to
//   heavy  = thick (voiced) or light stroke
//   up     = written upward (affects vowel-place order: 1st place = start)
import { v, add, sub, mul, rot, deg, fromAngle, perpL, perpR, lerp, norm } from './geometry.js';

const S = (o) => Object.freeze(o);
export const STROKES = {
  // straight downstrokes / horizontals
  P: S({ kind: 'line', angle: -60, heavy: false, sound: 'p' }),
  B: S({ kind: 'line', angle: -60, heavy: true, sound: 'b' }),
  T: S({ kind: 'line', angle: -90, heavy: false, sound: 't' }),
  D: S({ kind: 'line', angle: -90, heavy: true, sound: 'd' }),
  CH: S({ kind: 'line', angle: -120, heavy: false, sound: 'ch' }),
  J: S({ kind: 'line', angle: -120, heavy: true, sound: 'j' }),
  K: S({ kind: 'line', angle: 0, heavy: false, sound: 'k' }),
  G: S({ kind: 'line', angle: 0, heavy: true, sound: 'g' }),
  // curved downstrokes (quarter circles)
  F: S({ kind: 'arc', angle: -60, bulge: 'R', heavy: false, sound: 'f' }),
  V: S({ kind: 'arc', angle: -60, bulge: 'R', heavy: true, sound: 'v' }),
  TH: S({ kind: 'arc', angle: -90, bulge: 'R', heavy: false, sound: 'th (ith)' }),
  DH: S({ kind: 'arc', angle: -90, bulge: 'R', heavy: true, sound: 'dh (thee)' }),
  S: S({ kind: 'arc', angle: -90, bulge: 'L', heavy: false, sound: 's' }),
  Z: S({ kind: 'arc', angle: -90, bulge: 'L', heavy: true, sound: 'z' }),
  SH: S({ kind: 'arc', angle: -120, bulge: 'L', heavy: false, sound: 'sh' }),
  ZH: S({ kind: 'arc', angle: -120, bulge: 'L', heavy: true, sound: 'zh' }),
  SH_UP: S({ kind: 'arc', angle: 60, bulge: 'R', heavy: false, up: true, sound: 'sh (upward)' }),
  // horizontal curves
  M: S({ kind: 'arc', angle: 0, bulge: 'L', heavy: false, sound: 'm' }),
  MP: S({ kind: 'arc', angle: 0, bulge: 'L', heavy: true, sound: 'mp / mb (thickened M)' }),
  N: S({ kind: 'arc', angle: 0, bulge: 'R', heavy: false, sound: 'n' }),
  NG: S({ kind: 'arc', angle: 0, bulge: 'R', heavy: true, sound: 'ng' }),
  // upstrokes and the two R / two H forms
  L: S({ kind: 'arc', angle: 60, bulge: 'L', heavy: false, up: true, sound: 'l (upward)' }),
  RAY: S({ kind: 'line', angle: 30, heavy: false, up: true, sound: 'r (Ray, upward)' }),
  AR: S({ kind: 'arc', angle: -60, bulge: 'L', heavy: false, sound: 'r (Ar, downward)' }),
  W: S({ kind: 'line', angle: 60, heavy: false, up: true, hook: 'L', sound: 'w (upward)' }),
  // Wel: upward L with a large initial hook on the inside of the curve (w + l)
  WL: S({ kind: 'arc', angle: 60, bulge: 'L', heavy: false, up: true, hook: 'R', hookR: 0.13, sound: 'wl (Wel, hooked upward L)' }),
  Y: S({ kind: 'line', angle: 60, heavy: false, up: true, hook: 'R', sound: 'y (upward)' }),
  H_UP: S({ kind: 'line', angle: 60, heavy: false, up: true, circle: true, sound: 'h (upward)' }),
  H_DOWN: S({ kind: 'line', angle: -120, heavy: false, circle: true, sound: 'h (downward)' }),
};

export const LENGTHS = { half: 0.5, normal: 1, double: 2 };
const N_SAMPLES = 32;

export const HOOK = { small: 0.085, large: 0.14, shun: 0.15 };

/** inside-of-curve normal at a point with tangent `tan` */
function insideN(tan, bulgeN) { let n = perpL(tan); if (n.x * bulgeN.x + n.y * bulgeN.y > 0) n = mul(n, -1); return n; }

/** semicircular hook at point p (tangent tan, written direction) on side n.
 *  initial hooks sit behind the start, final hooks run on past the end. */
function hookPts(p, tan, n, r, atEnd) {
  const c = add(p, mul(n, r));
  const out = [];
  for (let i = 0; i <= 16; i++) {
    const th = (Math.PI * i) / 16;
    out.push(atEnd ? add(c, add(mul(n, -r * Math.cos(th)), mul(tan, r * Math.sin(th))))
      : add(c, add(mul(n, r * Math.cos(th)), mul(tan, -r * Math.sin(th)))));
  }
  return out;
}

/** Build a stroke instance starting at the origin.
 *  opts: length ('half' | 'normal' | 'double'), heavy (thickening override),
 *  reverse (curve bulges the other way: the hooked alternative FR/VR/THR forms),
 *  hookStart ('r' | 'l'), hookEnd ('n' | 'f' | 'shun').
 *  Hook rules (New Era Instructor 1920, ch. XI and XIV):
 *   - straight strokes: initial r hook and final n hook = Right motion
 *     (clockwise), initial l hook and final f/v hook = Left motion
 *   - curves: small initial hook inside = r, large initial hook inside = l,
 *     small final hook inside = n; there is no f/v hook on curves
 *   - shun: large final hook, inside curves (straight-stroke side rules are
 *     not implemented) */
export function buildStroke(name, { length = 'normal', heavy, reverse = false, hookStart, hookEnd } = {}) {
  const def = STROKES[name];
  if (!def) throw new Error(`unknown stroke ${name}`);
  const L = LENGTHS[length] ?? length;
  const dir = fromAngle(def.angle);
  const start = v(0, 0);
  const end = mul(dir, L);
  const pts = [];
  const bulgeSide = def.kind === 'arc' ? (reverse ? (def.bulge === 'L' ? 'R' : 'L') : def.bulge) : null;
  const bulgeN = bulgeSide === 'L' ? perpL(dir) : perpR(dir);
  if (def.kind === 'line') {
    for (let i = 0; i <= N_SAMPLES; i++) pts.push(lerp(start, end, i / N_SAMPLES));
  } else {
    // quarter circle on the chord: radius = L/sqrt2, centre L/2 from chord midpoint
    const c = sub(mul(add(start, end), 0.5), mul(bulgeN, L / 2));
    const r0 = sub(start, c);
    // pick rotation sense that reaches `end` through the bulge side
    const sense = Math.abs(add(c, rot(r0, deg(90))).x - end.x) + Math.abs(add(c, rot(r0, deg(90))).y - end.y) < 1e-6 ? 1 : -1;
    for (let i = 0; i <= N_SAMPLES; i++) pts.push(add(c, rot(r0, sense * deg(90) * (i / N_SAMPLES))));
  }
  const extras = [];
  const r = 0.085; // radius of H circle / W,Y hook
  if (def.circle) {
    // H: small circle written at the start of the stroke
    extras.push({ type: 'circle', c: sub(start, mul(dir, r)), r, heavy: false });
  }
  if (def.hook) {
    // W/Y: small initial hook; W on the left of the stroke, Y on the right
    const n = def.hook === 'L' ? perpL(dir) : perpR(dir);
    extras.push({ type: 'polyline', pts: hookPts(start, dir, n, def.hookR ?? r, false), heavy: false });
  }
  const t0 = norm(sub(pts[1], pts[0])), t1 = norm(sub(pts[N_SAMPLES], pts[N_SAMPLES - 1]));
  if (hookStart) {
    if (def.hook || def.circle) throw new Error(`${name} already has an initial hook/circle`);
    let n, hr;
    if (def.kind === 'line') { n = hookStart === 'r' ? perpR(t0) : perpL(t0); hr = HOOK.small; }
    else { n = insideN(t0, bulgeN); hr = hookStart === 'r' ? HOOK.small : HOOK.large; }
    extras.push({ type: 'polyline', pts: hookPts(start, t0, n, hr, false), heavy: false });
  }
  if (hookEnd) {
    let n, hr = HOOK.small;
    if (def.kind === 'line') {
      if (hookEnd === 'shun') throw new Error('shun hook on straight strokes not implemented');
      n = hookEnd === 'n' ? perpR(t1) : perpL(t1);
    } else {
      if (hookEnd === 'f') throw new Error('no f/v hook on curves');
      n = insideN(t1, bulgeN); if (hookEnd === 'shun') hr = HOOK.shun;
    }
    extras.push({ type: 'polyline', pts: hookPts(pts[N_SAMPLES], t1, n, hr, true), heavy: false });
  }
  return { name, def, length: L, dir, pts, extras, heavy: heavy ?? def.heavy, up: !!def.up, kind: def.kind, bulgeN, hookStart, hookEnd, reverse };
}

export function translateStroke(s, off) {
  const t = (p) => add(p, off);
  return {
    ...s,
    pts: s.pts.map(t),
    extras: s.extras.map((e) => (e.type === 'circle' ? { ...e, c: t(e.c) } : { ...e, pts: e.pts.map(t) })),
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
export const isHorizontal = (s) => Math.abs(s.def.angle) < 1 || Math.abs(Math.abs(s.def.angle) - 180) < 1;
