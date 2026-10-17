// Composer: turns a phonetic token list into a positioned outline.
//   tokens: consonant names ('P', 'K', 'R', 'H', 'SH', 'T:half', ...),
//           vowel keys ('ay', 'ee', 'oh', ...), 's' (small circle S/Z),
//           'THE' (tick-the, phrase-final only).
// Rules implemented:
//   * strokes join end-to-start, so each joint takes the natural angle of
//     the two stroke directions (continuous pen path)
//   * R:  initial R preceded by a vowel -> downward Ar, else upward Ray;
//         final R followed by a vowel -> Ray, else Ar; medial -> Ray
//   * H:  standing alone (or before K/G) -> downward H, else upward H
//   * SH: upward before F/V
//   * vowel side: before = left of up/downstrokes, above horizontals;
//     place 1/2/3 counted from where the stroke BEGINS (bottom of upstrokes);
//     between strokes 1st/2nd-place vowels follow stroke 1, 3rd-place vowels
//     precede stroke 2
//   * outline position from first vowel's place: 1 above, 2 on, 3 through
//     the line, measured on the first up/down stroke; all-horizontal
//     outlines go above the line (1st) or on it (2nd/3rd)
//   * small circle S: inside curves, anticlockwise (left of travel) on straights
import { v, add, sub, mul, dot, perpL, fromAngle, norm } from './geometry.js';
import { buildStroke, translateStroke, endOf, startOf, pointAt, isHorizontal } from './strokes.js';
import { VOWELS, isVowel } from './vowels.js';

export const DIM = {
  dotLight: 0.05, dotHeavy: 0.072, dotOffset: 0.17,
  dashIn: 0.1, dashOut: 0.3, circleS: 0.075, circleSes: 0.15, tick: 0.3,
  placeT: { 1: 0.1, 2: 0.5, 3: 0.9 },
  // detached logograms (dots, dashes, ticks, circle). Measured against the
  // printed grammalogue lists of the New Era Instructor (1920 / 1955) and the
  // 1924 Canadian New Era course: 1st position = mark clearly above the line
  // (its lowest point ~3/4 of a stroke up), 2nd position = mark resting ON
  // the line, 3rd position = through the line. Dashes slant like "\" at
  // ~45 deg; ticks (and/should, awe/who) slope at ~45 deg; marks are about
  // 0.4 of a full stroke long.
  signBase: { 1: 0.75, 2: 0.0, 3: -0.2 },
  signLen: 0.4, signGap: 0.01,
};

function parse(tok) {
  if (isVowel(tok)) return { t: 'V', key: tok };
  if (tok === 's') return { t: 'CIRCLE' };
  if (tok === 'ss') return { t: 'CIRCLE', big: true };
  if (tok === 'THE') return { t: 'THE' };
  // stroke token grammar: NAME[:half|:double][*][!][+r|+l][+n|+f|+shun]
  //   * = thickened (halving + thickening adds d to M N L R), ! = reversed
  //   curve (hooked alternative forms FR VR THR), +r/+l initial hook,
  //   +n/+f/+shun final hook
  const m = /^([A-Z_]+)(?::(half|normal|double))?(\*)?(!)?((?:\+(?:r|l|n|f|shun))*)$/.exec(tok);
  if (!m) throw new Error(`bad token ${tok}`);
  const hooks = m[5].split('+').filter(Boolean);
  return { t: 'C', name: m[1], length: m[2] || 'normal', heavy: m[3] ? true : undefined, reverse: !!m[4],
    hookStart: hooks.find((h) => h === 'r' || h === 'l'), hookEnd: hooks.find((h) => h === 'n' || h === 'f' || h === 'shun') };
}

function resolveVariants(items) {
  const cons = items.map((it, i) => (it.t === 'C' ? i : -1)).filter((i) => i >= 0);
  const rulesUsed = [];
  cons.forEach((idx, ci) => {
    const it = items[idx];
    const prevTok = items[idx - 1];
    const nextTok = items[idx + 1];
    if (it.name === 'R') {
      const first = ci === 0, last = ci === cons.length - 1;
      if (first && prevTok?.t === 'V') { it.name = 'AR'; rulesUsed.push('initial vowel+R -> Ar (down)'); }
      else if (first && !last) { it.name = 'RAY'; rulesUsed.push('initial R -> Ray (up)'); }
      else if (last && nextTok?.t !== 'V' && !first) { it.name = 'AR'; rulesUsed.push('final R, no vowel -> Ar'); }
      else { it.name = 'RAY'; rulesUsed.push('R + vowel -> Ray (up)'); }
    } else if (it.name === 'H') {
      const nextC = items[cons[ci + 1]];
      if (cons.length === 1 || (nextC && ['K', 'G'].includes(nextC.name))) { it.name = 'H_DOWN'; rulesUsed.push('H alone -> downward H'); }
      else { it.name = 'H_UP'; rulesUsed.push('H -> upward'); }
    } else if (it.name === 'SH') {
      const nextC = items[cons[ci + 1]];
      if (nextC && ['F', 'V'].includes(nextC.name)) { it.name = 'SH_UP'; rulesUsed.push('SH before F/V -> upward'); }
    }
  });
  return rulesUsed;
}

/** side normal ("before" = left of up/downstrokes, above horizontals) */
function beforeNormal(stroke) {
  const cn = perpL(stroke.dir);
  if (Math.abs(cn.x) > 0.3) return cn.x < 0 ? cn : mul(cn, -1);
  return cn.y > 0 ? cn : mul(cn, -1);
}

export function vowelMark(stroke, key, side) {
  const V = VOWELS[key];
  const { p } = pointAt(stroke, DIM.placeT[V.place]);
  const want = side === 'before' ? beforeNormal(stroke) : mul(beforeNormal(stroke), -1);
  // offset along the chord normal (keeps marks clearly beside curves, not
  // under their ends); dashes are drawn along the same normal
  let n = want;
  if (V.mark === 'dot') {
    return { type: 'dot', c: add(p, mul(n, DIM.dotOffset)), r: V.heavy ? DIM.dotHeavy : DIM.dotLight };
  }
  return { type: 'line', a: add(p, mul(n, DIM.dashIn)), b: add(p, mul(n, DIM.dashOut)), heavy: V.heavy, cap: 'round' };
}

function circleS(stroke, atEnd, big = false) {
  const R = big ? DIM.circleSes : DIM.circleS;
  const { p, tan } = pointAt(stroke, atEnd ? 1 : 0);
  let n;
  if (stroke.kind === 'arc') {
    // inside of the curve = side away from the bulge
    const mid = pointAt(stroke, 0.5).p;
    const chordMid = mul(add(startOf(stroke), endOf(stroke)), 0.5);
    const bulge = norm(sub(mid, chordMid));
    n = perpL(tan); if (dot(n, bulge) > 0) n = mul(n, -1);
  } else n = perpL(tan);
  return { type: 'circle', c: add(p, mul(n, R)), r: R, heavy: false };
}

export function composeOutline(tokens, opts = {}) {
  const items = tokens.map(parse);
  const rules = resolveVariants(items);
  let pen = v(0, 0);
  const strokes = [];
  const elements = [];
  items.forEach((it) => {
    if (it.t !== 'C') return;
    const s = translateStroke(buildStroke(it.name, { length: it.length, heavy: it.heavy, reverse: it.reverse, hookStart: it.hookStart, hookEnd: it.hookEnd }), pen);
    pen = endOf(s);
    it.si = strokes.length;
    strokes.push(s);
    elements.push({ type: 'stroke', stroke: s });
  });
  // circles, tick-the, vowels
  let firstPlace = null;
  items.forEach((it, i) => {
    const prevC = [...items.slice(0, i)].reverse().find((x) => x.t === 'C');
    const nextC = items.slice(i + 1).find((x) => x.t === 'C');
    if (it.t === 'CIRCLE') {
      if (prevC) elements.push(circleS(strokes[prevC.si], true, it.big));
      else if (nextC) elements.push(circleS(strokes[nextC.si], false, it.big));
      else elements.push({ type: 'circle', c: v(0, 0), r: DIM.circleS, heavy: false });
    } else if (it.t === 'THE') {
      const a = endOf(strokes[prevC.si]);
      elements.push({ type: 'line', a, b: add(a, mul(fromAngle(-120), DIM.tick)), heavy: false, cap: 'round' });
    } else if (it.t === 'V' && opts.vowels !== false) {
      const place = VOWELS[it.key].place;
      if (firstPlace === null) firstPlace = place;
      let target, side;
      if (!prevC) { target = nextC; side = 'before'; }
      else if (!nextC) { target = prevC; side = 'after'; }
      else if (place <= 2) { target = prevC; side = 'after'; }
      else { target = nextC; side = 'before'; }
      elements.push(vowelMark(strokes[target.si], it.key, side));
    } else if (it.t === 'V' && firstPlace === null) firstPlace = VOWELS[it.key].place;
  });
  const position = opts.position ?? firstPlace ?? 2;
  // positioning against the ruled line (y = 0)
  const anchor = strokes.find((s) => !isHorizontal(s));
  let dy;
  if (anchor) {
    const ys = anchor.pts.map((p) => p.y);
    const lo = Math.min(...ys), hi = Math.max(...ys);
    dy = position === 1 ? 0.5 - lo : position === 2 ? -lo : -(lo + hi) / 2;
  } else {
    const ys = strokes.flatMap((s) => s.pts.map((p) => p.y));
    const lo = Math.min(...ys);
    const hi = Math.max(...ys);
    // horizontal grammalogues in 3rd position (own, young) are written just
    // BELOW the line (1924 course Lesson III; 1920 list); other horizontal
    // outlines use the line for both 2nd and 3rd position
    dy = position === 3 && opts.below3 ? -0.07 - hi : (position === 1 ? 0.5 : 0.07) - lo;
  }
  return { elements: shift(elements, v(0, dy)), strokes: strokes.map((s) => s.name), rules, position };
}

/** Detached logogram signs written in position 1/2/3.
 *  kind: 'dot' | 'dash' (slanting "\\") | 'vdash' (vertical) | 'tick'
 *  (straight mark written at `angle`; ticks start at their lower end) | 'circle'.
 *  The mark is placed so its LOWEST point sits at DIM.signBase[pos]. */
export function composeSign(kind, { heavy = false, pos = 2, angle } = {}) {
  const base = DIM.signBase[pos] + (pos === 2 ? DIM.signGap : 0);
  const L = DIM.signLen;
  let el;
  if (kind === 'dot') {
    const r = heavy ? DIM.dotHeavy : DIM.dotLight;
    el = { type: 'dot', c: v(0, base + r), r };
  } else if (kind === 'circle' || kind === 'bigcircle') {
    const R = kind === 'circle' ? DIM.circleS : DIM.circleSes;
    el = { type: 'circle', c: v(0, base + R), r: R, heavy: false };
  } else if (kind in SEMI) {
    // small diphthong-shaped signs: semicircles, caret, angle
    const R = 0.11, pts = SEMI[kind](R);
    const lo = Math.min(...pts.map((p) => p.y));
    el = { type: 'polyline', pts: pts.map((p) => v(p.x, p.y - lo + base + 0.012)), heavy: false };
  } else {
    const ang = angle ?? (kind === 'vdash' ? 90 : kind === 'dash' ? -45 : 45);
    const d = mul(fromAngle(ang), L);
    // start point chosen so the lower end of the mark is at `base`
    const cap = (heavy ? 0.036 : 0.015) * Math.abs(d.y) / L; // round line cap
    const a = d.y >= 0 ? v(0, base + cap) : v(0, base + cap - d.y);
    el = { type: 'line', a, b: add(a, d), heavy, cap: 'round' };
  }
  return { elements: [el], strokes: [], rules: [], position: pos };
}

// semicircle "c" (opens right: with/when), "ɔ" (opens left: what/would),
// "∩" (beyond/you), caret "^" (how) and the angle sign of why
const arc = (R, a0, a1) => Array.from({ length: 17 }, (_, i) => { const a = (a0 + (a1 - a0) * i / 16) * Math.PI / 180; return v(R * Math.cos(a), R * Math.sin(a)); });
const SEMI = {
  semiL: (R) => arc(R, 90, 270),
  semiR: (R) => arc(R, 90, -90),
  cap: (R) => arc(R, 180, 0),
  caret: (R) => [v(-R, 0), v(0, R * 1.5), v(R, 0)],
  angle: (R) => [v(0, R * 2), v(0, 0), v(R * 1.4, 0)],
};

export function shift(elements, off) {
  const t = (p) => add(p, off);
  return elements.map((e) => {
    switch (e.type) {
      case 'stroke': return { ...e, stroke: translateStroke(e.stroke, off) };
      case 'dot': case 'circle': return { ...e, c: t(e.c) };
      case 'line': return { ...e, a: t(e.a), b: t(e.b) };
      case 'polyline': return { ...e, pts: e.pts.map(t) };
      default: return e;
    }
  });
}
