// Composer: turns a phonetic token list into a positioned outline.
//
// Tokens
//   strokes  NAME[:half|:double][*][!][+mods]
//            *  thickened (halving + thickening adds d to M N L R)
//            !  reversed curve (hooked alternative forms FR VR THR)
//            mods: +r +l initial hook; +n +f final hook; +shun (+shunR /
//            +shunL force Right / Left motion on straight strokes)
//   attachments written next to the stroke they belong to:
//            's' small circle, 'ss' large circle, 'st' / 'str' loops,
//            'IN' large "in" hook before a circle-in-hook, 'shun' (after a
//            circle: small shun hook on the other side)
//   vowels   'ay', 'ee', ... ;  'THE' tick-the (phrase-final)
//
// Rules implemented (New Era Instructor 1920, chapters III-XVI)
//   * strokes join end-to-start; a final hook leaves the pen at the hook's
//     end and an initial hook is entered at its tip
//   * R: initial R after a vowel -> Ar, else Ray; final R without vowel -> Ar
//   * H alone -> downward H, else upward H; SH upward before F/V
//   * circle s / loops: inside curves; Left motion (anticlockwise) on
//     straight strokes; at a joint between two straight strokes outside the
//     angle
//   * initial r hook on straights = Right motion, l hook = Left motion; on
//     curves small hook inside = r, large hook inside = l
//   * circle (or st loop) before an r-hooked straight is written on the hook
//     side with the Right motion and replaces the hook (spr, str, skr);
//     before any other hooked stroke it is written inside the hook
//   * final n hook: Right motion on straights, inside curves; f/v hook: Left
//     motion on straights (none on curves); a following circle / loop on a
//     straight n hook is written on the hook side and replaces it (ns, nst),
//     inside the f/v or curve n hook otherwise
//   * shun: inside curves; on straights opposite an initial attachment, on
//     the right-hand side of T D J, otherwise Right motion unless forced
//   * shun after circle s / ns = small hook on the other side, same motion
//   * outline position from first vowel (1 above, 2 on, 3 through), on the
//     first up/down stroke; all-horizontal outlines above / on the line,
//     horizontal grammalogues in 3rd position below the line
import { v, add, sub, mul, dot, perpL, perpR, fromAngle, norm, len } from './geometry.js';
import { buildStroke, translateStroke, endOf, startOf, pointAt, isHorizontal, hookPts, insideN } from './strokes.js';
import { CAL } from './calibration.js';
import { VOWELS, isVowel } from './vowels.js';

export const DIM = {
  dotLight: 0.05, dotHeavy: 0.072, dotOffset: 0.17,
  dashIn: 0.1, dashOut: 0.3, tick: 0.3,
  placeT: { 1: 0.1, 2: 0.5, 3: 0.9 },
  // detached logograms (dots, dashes, ticks, circle). Measured against the
  // printed grammalogue lists: 1st position = mark clearly above the line
  // (lowest point ~3/4 of a stroke up), 2nd = resting ON the line, 3rd =
  // through the line. Dashes slant "\" at ~45 deg; marks ~0.4 stroke long.
  signBase: { 1: 0.75, 2: 0.0, 3: -0.2 },
  signLen: 0.4, signGap: 0.01,
};

const ATT = new Set(['s', 'ss', 'st', 'str', 'IN', 'shun']);
function parse(tok) {
  if (isVowel(tok)) return { t: 'V', key: tok };
  if (ATT.has(tok)) return { t: 'A', a: tok };
  if (tok === 'THE') return { t: 'THE' };
  const m = /^([A-Z_]+)(?::(half|normal|double))?(\*)?(!)?((?:\+(?:r|l|n|f|shunR|shunL|shun))*)$/.exec(tok);
  if (!m) throw new Error(`bad token ${tok}`);
  const hooks = m[5].split('+').filter(Boolean);
  return {
    t: 'C', name: m[1], length: m[2] || 'normal', heavy: m[3] ? true : undefined, reverse: !!m[4],
    hookStart: hooks.find((h) => h === 'r' || h === 'l'), hookEnd: hooks.find((h) => ['n', 'f', 'shun', 'shunR', 'shunL'].includes(h)),
  };
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
  const n = side === 'before' ? beforeNormal(stroke) : mul(beforeNormal(stroke), -1);
  if (V.mark === 'dot') return { type: 'dot', c: add(p, mul(n, DIM.dotOffset)), r: V.heavy ? DIM.dotHeavy : DIM.dotLight };
  return { type: 'line', a: add(p, mul(n, DIM.dashIn)), b: add(p, mul(n, DIM.dashOut)), heavy: V.heavy, cap: 'round' };
}

// ---------- attachment geometry (all relative to a stroke at the origin)
const motionN = (tan, motion) => (motion === 'R' ? perpR(tan) : perpL(tan));
const rightHandN = (tan) => { const a = perpL(tan), b = perpR(tan); return a.x > b.x + 1e-9 ? a : b; };
const circleAt = (p, n, R, out) => {
  // out: unit vector pointing away from the stroke (terminal circles); printed
  // circles sit partly beyond the stroke end (CAL.circleRadial)
  let d = n;
  if (out) { const a = (CAL.circleRadial * Math.PI) / 180; d = norm(add(mul(n, Math.cos(a)), mul(out, Math.sin(a)))); }
  return { type: 'circle', c: add(p, mul(d, R)), r: R, heavy: false };
};
/** large "in" hook wrapped round an initial circle (centre c, radius R) */
function inHookPts(start, c, n, tan) {
  const Rh = CAL.inHook, u = mul(tan, -1), w = mul(n, -1), out = [];
  for (let i = 0; i <= 24; i++) {
    const th = ((-110 + (200 * i) / 24) * Math.PI) / 180;
    out.push(add(c, add(mul(u, Rh * Math.cos(th)), mul(w, Rh * Math.sin(th)))));
  }
  out.push(start);
  return out;
}
function ellipseHalf(p, tan, n, Ll, w, forward) {
  const out = [];
  for (let i = 0; i <= 20; i++) {
    const th = (Math.PI * i) / 20;
    out.push(add(p, add(mul(tan, (forward ? 1 : -1) * Ll * (1 - Math.cos(th)) / 2), mul(n, w * Math.sin(th)))));
  }
  return out;
}
/** loop lying along the stroke path on side n (start or end) */
function loopAlong(s, atEnd, n0, [Ll, w]) {
  const P = atEnd ? [...s.pts].reverse() : s.pts;
  const out = [P[0]];
  let acc = 0;
  for (let i = 1; i < P.length && acc < Ll; i++) {
    acc += len(sub(P[i], P[i - 1]));
    const t = Math.min(1, acc / Ll);
    const tan = norm(sub(P[i], P[i - 1]));
    let n = perpL(tan); if (dot(n, n0) < 0) n = mul(n, -1);
    out.push(add(P[i], mul(n, w * Math.sin(Math.PI * t))));
  }
  if (acc < Ll) { // stroke shorter than the loop: continue straight
    const tan = norm(sub(P[P.length - 1], P[P.length - 2]));
    const base = P[P.length - 1];
    for (let k = 1; k <= 6; k++) {
      const d = acc + ((Ll - acc) * k) / 6, t = d / Ll;
      out.push(add(add(base, mul(tan, d - acc)), mul(n0, w * Math.sin(Math.PI * t))));
    }
  }
  return out;
}

/** Decorate one stroke with its initial / final attachments. Returns the
 *  stroke with extras, entry/exit points and labels for the notes. */
function decorate(s, it, pre, post, rules) {
  const ex = s.extras, straight = s.kind === 'line';
  const start = startOf(s), end = endOf(s);
  let entry = s.entry, exit = end;
  let initialSide = null; // normal of the initial attachment (for shun)
  // ---- initial
  const circ = pre.find((a) => a === 's' || a === 'ss');
  const loop = pre.find((a) => a === 'st' || a === 'str');
  const hasIN = pre.includes('IN');
  if (it.hookStart) {
    let n, hr;
    if (straight) { n = motionN(s.t0, it.hookStart === 'r' ? 'R' : 'L'); hr = CAL.hookSmall; }
    else { n = insideN(s, false); hr = it.hookStart === 'r' ? CAL.hookSmall : CAL.hookLarge; }
    initialSide = n;
    if ((circ || loop) && straight && it.hookStart === 'r') {
      // spr / str / skr: circle or loop on the hook side, hook not shown
      let cc = null;
      if (circ) { const c = circleAt(start, n, circ === 'ss' ? CAL.bigCircle : CAL.circle, hasIN ? null : mul(s.t0, -1)); ex.push(c); cc = c.c; }
      else ex.push({ type: 'polyline', pts: loopAlong(s, false, n, loop === 'st' ? CAL.loopST : CAL.loopSTR), heavy: false });
      rules.push(`${circ || loop} + r hook on a straight stroke -> written on the hook side (Right motion)`);
      if (hasIN) {
        const hp = inHookPts(start, cc || add(start, mul(n, CAL.circle)), n, s.t0);
        ex.push({ type: 'polyline', pts: hp, heavy: false }); entry = hp[0];
        rules.push('in- : large hook written round the circle');
      }
    } else {
      const R = circ ? (circ === 'ss' ? CAL.bigCircle : CAL.circle) : 0;
      const hrr = circ ? Math.max(hr, R + 0.035) : hr;
      const hp = hookPts(start, s.t0, n, hrr, false);
      ex.push({ type: 'polyline', pts: hp, heavy: false }); entry = hp[0];
      if (circ) { ex.push({ type: 'circle', c: add(start, mul(n, hrr)), r: R, heavy: false }); rules.push('circle written inside the initial hook'); }
      if (loop) throw new Error('loop inside an initial hook not supported');
    }
  } else if (circ || loop) {
    const n = straight ? motionN(s.t0, 'L') : insideN(s, false);
    initialSide = n;
    if (circ) ex.push(circleAt(start, n, circ === 'ss' ? CAL.bigCircle : CAL.circle, straight ? mul(s.t0, -1) : null));
    else ex.push({ type: 'polyline', pts: loopAlong(s, false, n, loop === 'st' ? CAL.loopST : CAL.loopSTR), heavy: false });
  }
  // ---- final
  const fc = post.find((a) => a === 's' || a === 'ss');
  const fl = post.find((a) => a === 'st' || a === 'str');
  const fshun = post.includes('shun');
  const he = it.hookEnd;
  let circleN = null, circleC = null, circleR = 0;
  if (he === 'n' || he === 'f') {
    let n, hr = he === 'n' ? CAL.hookN : CAL.hookF;
    if (straight) n = motionN(s.t1, he === 'n' ? 'R' : 'L');
    else { if (he === 'f') throw new Error('no f/v hook on curves'); n = insideN(s, true); }
    if ((fc || fl) && straight && he === 'n') {
      // ns / nst on straights: circle or loop on the hook side, hook not shown
      circleR = fc === 'ss' ? CAL.bigCircle : CAL.circle;
      if (fc) { const c = circleAt(end, n, circleR, s.t1); ex.push(c); circleN = n; circleC = c.c; }
      else ex.push({ type: 'polyline', pts: loopAlong(s, true, n, fl === 'st' ? CAL.loopST : CAL.loopSTR), heavy: false });
      rules.push(`n hook + ${fc || fl} on a straight stroke -> written on the hook side`);
    } else {
      const R = fc ? (fc === 'ss' ? CAL.bigCircle : CAL.circle) : 0;
      const hrr = fc ? Math.max(hr, R + 0.035) : hr;
      const hp = hookPts(end, s.t1, n, hrr, true);
      ex.push({ type: 'polyline', pts: hp, heavy: false }); exit = hp[hp.length - 1];
      if (fc) { ex.push({ type: 'circle', c: add(end, mul(n, hrr)), r: R, heavy: false }); circleN = n; circleC = add(end, mul(n, hrr)); circleR = R; rules.push('circle written inside the final hook'); }
    }
  } else if (he && he.startsWith('shun')) {
    let n;
    if (!straight) n = insideN(s, true);
    else if (he === 'shunR' || he === 'shunL') n = motionN(s.t1, he === 'shunR' ? 'R' : 'L');
    else if (initialSide) { n = dot(perpL(s.t1), initialSide) > 0 ? perpR(s.t1) : perpL(s.t1); rules.push('shun opposite the initial attachment'); }
    else if (['T', 'D', 'J'].includes(s.name)) { n = rightHandN(s.t1); rules.push('shun on the right-hand side of T/D/J'); }
    else n = motionN(s.t1, 'R');
    const hp = hookPts(end, s.t1, n, CAL.shun, true);
    ex.push({ type: 'polyline', pts: hp, heavy: false }); exit = hp[hp.length - 1];
    if (fc) { circleR = CAL.circle; const c = add(end, mul(n, CAL.shun)); ex.push({ type: 'circle', c, r: circleR * 0.85, heavy: false }); }
  } else if (fc || fl) {
    const n = straight ? motionN(s.t1, 'L') : insideN(s, true);
    if (fc) { circleR = fc === 'ss' ? CAL.bigCircle : CAL.circle; const c = circleAt(end, n, circleR, straight ? s.t1 : null); ex.push(c); circleN = n; circleC = c.c; }
    else ex.push({ type: 'polyline', pts: loopAlong(s, true, n, fl === 'st' ? CAL.loopST : CAL.loopSTR), heavy: false });
  }
  if (fshun) {
    if (!circleN) throw new Error('shun token must follow a circle');
    // small hook on the other side of the stroke, same motion as the circle
    const m = mul(circleN, -1);
    const hp = hookPts(end, s.t1, m, CAL.shunSmall, true);
    ex.push({ type: 'polyline', pts: hp, heavy: false }); exit = hp[hp.length - 1];
    rules.push('shun after circle -> small hook on the other side');
  }
  return { ...s, entry, exit };
}

export function composeOutline(tokens, opts = {}) {
  const items = tokens.map(parse);
  const rules = resolveVariants(items);
  // group attachments: [pre-attachments of stroke 0] C0 [between] C1 ... [post]
  const cIdx = items.map((it, i) => (it.t === 'C' ? i : -1)).filter((i) => i >= 0);
  const att = (a, b) => items.slice(a, b).filter((x) => x.t === 'A').map((x) => x.a);
  const pres = [], posts = [], medialCircle = [];
  cIdx.forEach((ci, k) => {
    const it = items[ci];
    if (k === 0) pres.push(att(0, ci));
    if (k === cIdx.length - 1) { posts[k] = att(ci + 1, items.length); return; }
    const mid = att(ci + 1, cIdx[k + 1]);
    const next = items[cIdx[k + 1]];
    // a circle / loop between strokes belongs to an adjacent hook if there is one
    if (next.hookStart && mid.some((a) => a !== 'shun')) { posts[k] = mid.filter((a) => a === 'shun'); pres[k + 1] = mid.filter((a) => a !== 'shun'); }
    else if (it.hookEnd) { posts[k] = mid; pres[k + 1] = []; }
    else { posts[k] = mid.filter((a) => a === 'shun'); pres[k + 1] = []; medialCircle[k] = mid.filter((a) => a !== 'shun'); }
  });
  if (!cIdx.length && items.some((x) => x.t === 'A')) {
    // standalone circle / loop
    const a = items.find((x) => x.t === 'A').a;
    const els = a === 'st' || a === 'str'
      ? [{ type: 'polyline', pts: (() => { const [Ll, w] = a === 'st' ? CAL.loopST : CAL.loopSTR; const tan = fromAngle(60), n = perpL(tan); return [...ellipseHalf(v(0, 0), tan, n, Ll, w, true), ...ellipseHalf(v(0, 0), tan, mul(n, -1), Ll, w, true).reverse()]; })(), heavy: false }]
      : [{ type: 'circle', c: v(0, 0), r: a === 'ss' ? CAL.bigCircle : CAL.circle, heavy: false }];
    return positionDetached(els, opts.position ?? 2, rules);
  }
  let pen = v(0, 0);
  const strokes = [];
  const elements = [];
  cIdx.forEach((ci, k) => {
    const it = items[ci];
    let s = buildStroke(it.name, { length: it.length, heavy: it.heavy, reverse: it.reverse });
    s = decorate(s, it, pres[k] || [], posts[k] || [], rules);
    s = translateStroke(s, sub(pen, s.entry));
    // medial circle / loop at the joint with the previous stroke
    const mc = medialCircle[k - 1];
    if (mc && mc.length) {
      const prev = strokes[k - 1];
      const a = mc.find((x) => x === 's' || x === 'ss') ? mc.find((x) => x === 's' || x === 'ss') : null;
      const R = a === 'ss' ? CAL.bigCircle : CAL.circle;
      let n;
      if (prev.kind === 'arc') n = insideN(prev, true);
      else if (s.kind === 'arc') n = insideN(s, false);
      else {
        const turn = prev.t1.x * s.t0.y - prev.t1.y * s.t0.x; // >0: turning left
        n = Math.abs(turn) < 0.08 ? perpL(prev.t1) : turn > 0 ? perpR(prev.t1) : perpL(prev.t1);
        // outside of the angle = away from the turn
        if (Math.abs(turn) >= 0.08) { const bis = norm(sub(s.t0, prev.t1)); n = mul(bis, -1); }
      }
      if (a) elements.push(circleAt(pen, n, R));
      const lp = mc.find((x) => x === 'st' || x === 'str');
      if (lp) prev.extras.push({ type: 'polyline', pts: loopAlong(prev, true, n, lp === 'st' ? CAL.loopST : CAL.loopSTR), heavy: false });
      rules.push('medial circle/loop at the joint');
    }
    pen = s.exit;
    it.si = strokes.length;
    strokes.push(s);
    elements.push({ type: 'stroke', stroke: s });
  });
  // tick-the, vowels
  let firstPlace = null;
  items.forEach((it, i) => {
    const prevC = [...items.slice(0, i)].reverse().find((x) => x.t === 'C');
    const nextC = items.slice(i + 1).find((x) => x.t === 'C');
    if (it.t === 'THE') {
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
  const anchor = strokes.find((s) => !isHorizontal(s));
  let dy;
  if (anchor) {
    const ys = anchor.pts.map((p) => p.y);
    const lo = Math.min(...ys), hi = Math.max(...ys);
    dy = position === 1 ? 0.5 - lo : position === 2 ? -lo : -(lo + hi) / 2;
  } else {
    const ys = strokes.flatMap((s) => s.pts.map((p) => p.y));
    const lo = Math.min(...ys), hi = Math.max(...ys);
    // horizontal grammalogues in 3rd position (own, young) are written just
    // BELOW the line (1924 course Lesson III; 1920 list)
    dy = position === 3 && opts.below3 ? -0.07 - hi : (position === 1 ? 0.5 : 0.07) - lo;
  }
  return { elements: shift(elements, v(0, dy)), strokes: strokes.map((s) => s.name), rules, position };
}

function positionDetached(els, pos, rules) {
  const ys = els.flatMap((e) => (e.type === 'circle' ? [e.c.y - e.r, e.c.y + e.r] : e.pts.map((p) => p.y)));
  const lo = Math.min(...ys), hi = Math.max(...ys);
  const dy = pos === 1 ? 0.5 - lo : pos === 2 ? 0.01 - lo : -(lo + hi) / 2;
  return { elements: shift(els, v(0, dy)), strokes: [], rules, position: pos };
}

/** Detached logogram signs written in position 1/2/3.
 *  kind: 'dot' | 'dash' (slanting "\\") | 'vdash' (vertical) | 'tick'
 *  (straight mark written at `angle`) | 'circle' | 'bigcircle' | small
 *  diphthong signs. The mark's LOWEST point sits at DIM.signBase[pos]. */
export function composeSign(kind, { heavy = false, pos = 2, angle } = {}) {
  const base = DIM.signBase[pos] + (pos === 2 ? DIM.signGap : 0);
  const L = DIM.signLen;
  let el;
  if (kind === 'dot') {
    const r = heavy ? DIM.dotHeavy : DIM.dotLight;
    el = { type: 'dot', c: v(0, base + r), r };
  } else if (kind === 'circle' || kind === 'bigcircle') {
    const R = kind === 'circle' ? CAL.circle : CAL.bigCircle;
    el = { type: 'circle', c: v(0, base + R), r: R, heavy: false };
  } else if (kind in SEMI) {
    const R = 0.11, pts = SEMI[kind](R);
    const lo = Math.min(...pts.map((p) => p.y));
    el = { type: 'polyline', pts: pts.map((p) => v(p.x, p.y - lo + base + 0.012)), heavy: false };
  } else {
    const ang = angle ?? (kind === 'vdash' ? 90 : kind === 'dash' ? -45 : 45);
    const d = mul(fromAngle(ang), L);
    const cap = (heavy ? 0.036 : 0.015) * Math.abs(d.y) / L;
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
