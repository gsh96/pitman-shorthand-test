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
//            'IN' small "in" hook before a circle-in-hook (str, skr, spr), 'shun' (after a
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
import { v, add, sub, mul, dot, perpL, perpR, fromAngle, norm, len, rot, deg } from './geometry.js';
import { buildStroke, translateStroke, endOf, startOf, pointAt, isHorizontal, hookPts, insideN, withSweep, flowCircle } from './strokes.js';
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
  // a clear gap (CAL.vowelGap) between the ink of the stroke and of the sign
  const half = inkWidth(stroke, DIM.placeT[V.place]) / 2;
  if (V.mark === 'dot') { const r = V.heavy ? DIM.dotHeavy : DIM.dotLight; return { type: 'dot', c: add(p, mul(n, Math.max(DIM.dotOffset, half + CAL.vowelGap + r))), r, vowel: true }; }
  const a0 = Math.max(DIM.dashIn, half + CAL.vowelGap + (V.heavy ? CAL.heavy * 0.8 : CAL.light) / 2);
  return { type: 'line', a: add(p, mul(n, a0)), b: add(p, mul(n, a0 + DIM.dashOut - DIM.dashIn)), heavy: V.heavy, cap: 'round', vowel: true };
}

// ---------- attachment geometry (all relative to a stroke at the origin)
const motionN = (tan, motion) => (motion === 'R' ? perpR(tan) : perpL(tan));
const rightHandN = (tan) => { const a = perpL(tan), b = perpR(tan); return a.x > b.x + 1e-9 ? a : b; };
// A circle joined to a stroke is written in one movement with it (Srihari,
// round 4): the pen runs round the circle and leaves it (or enters it) along
// the stroke, so the circle touches the stroke at the joint p and its tangent
// there is the stroke's direction of writing T. n = the side it lies on
// (Left motion = anticlockwise). `out` (straights) tilts the centre along
// the stroke by CAL.circleRadial (0 = exactly tangent).
const circleAt = (p, n, R, out, T) => {
  let d = n;
  if (out) { const a = (CAL.circleRadial * Math.PI) / 180; d = norm(add(mul(n, Math.cos(a)), mul(out, Math.sin(a)))); }
  return flowCircle(p, d, R, T);
};
/** in- before skr / str / spr (Instructor ch. on prefixes: "a small hook
 *  written in the same direction as the circle"): a small hook on the side
 *  opposite the circle, lying behind the stroke start, its tip curling back
 *  towards the stroke so hook + circle read as one compact closed blob. */
function inHookPts(start, n, tan) {
  return hookPts(start, tan, mul(n, -1), CAL.inHook, false, CAL.inHookSweep);
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
function decorate(s, it, pre, post, rules, ctx = {}) {
  const ex = s.extras, straight = s.kind === 'line';
  const start = startOf(s), end = endOf(s);
  let entry = s.entry, exit = end;
  let initialSide = null; // normal of the initial attachment (for shun)
  if (s.def.hook) initialSide = s.def.hook === 'L' ? perpL(s.dir) : perpR(s.dir); // built-in W / Y hook
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
      if (circ) {
        const R = circ === 'ss' ? CAL.bigCircle : CAL.circle;
        // with in-: circle pushed back behind the start, level with the hook
        const c = hasIN ? { type: 'circle', c: add(start, add(mul(n, R * Math.cos((CAL.inCircleBack * Math.PI) / 180)), mul(s.t0, -R * Math.sin((CAL.inCircleBack * Math.PI) / 180)))), r: R, heavy: false } : circleAt(start, n, R, mul(s.t0, -1), s.t0);
        ex.push(c); cc = c.c;
      }
      else ex.push({ type: 'polyline', pts: loopAlong(s, false, n, loop === 'st' ? CAL.loopST : CAL.loopSTR), heavy: false });
      rules.push(`${circ || loop} + r hook on a straight stroke -> written on the hook side (Right motion)`);
      if (hasIN) {
        const hp = inHookPts(start, n, s.t0);
        ex.push({ type: 'polyline', pts: hp, heavy: false, joint: 'end' }); entry = hp[0];
        rules.push('in- : small hook on the other side, same direction as the circle');
      }
    } else {
      const R = circ ? (circ === 'ss' ? CAL.bigCircle : CAL.circle) : 0;
      const hrr = circ ? Math.max(hr, R + 0.035) : hr;
      const hp = hookPts(start, s.t0, n, hrr, false);
      ex.push({ type: 'polyline', pts: hp, heavy: false, joint: 'end' }); entry = hp[0];
      if (circ) { ex.push({ type: 'circle', c: add(start, mul(n, hrr)), r: R, heavy: false }); rules.push('circle written inside the initial hook'); }
      if (loop) throw new Error('loop inside an initial hook not supported');
    }
  } else if (circ || loop) {
    const n = straight ? motionN(s.t0, 'L') : insideN(s, false);
    initialSide = n;
    if (circ) ex.push(circleAt(start, n, circ === 'ss' ? CAL.bigCircle : CAL.circle, straight ? mul(s.t0, -1) : null, s.t0));
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
      if (fc) { const c = circleAt(end, n, circleR, s.t1, s.t1); ex.push(c); circleN = n; circleC = c.c; }
      else ex.push({ type: 'polyline', pts: loopAlong(s, true, n, fl === 'st' ? CAL.loopST : CAL.loopSTR), heavy: false });
      rules.push(`n hook + ${fc || fl} on a straight stroke -> written on the hook side`);
    } else {
      const R = fc ? (fc === 'ss' ? CAL.bigCircle : CAL.circle) : 0;
      const hrr = fc ? Math.max(hr, R + 0.035) : hr;
      const hp = hookPts(end, s.t1, n, hrr, true, 180, fc ? 0 : CAL.hookTail * hrr);
      ex.push({ type: 'polyline', pts: hp, heavy: false, joint: 'start' }); exit = hp[hp.length - 1];
      if (fc) { ex.push({ type: 'circle', c: add(end, mul(n, hrr)), r: R, heavy: false }); circleN = n; circleC = add(end, mul(n, hrr)); circleR = R; rules.push('circle written inside the final hook'); }
    }
  } else if (he && he.startsWith('shun')) {
    let n;
    if (!straight) n = insideN(s, true);
    else if (he === 'shunR' || he === 'shunL') n = motionN(s.t1, he === 'shunR' ? 'R' : 'L');
    else if (initialSide) { n = dot(perpL(s.t1), initialSide) > 0 ? perpR(s.t1) : perpL(s.t1); rules.push('shun opposite the initial attachment'); }
    else if (['K', 'G'].includes(s.name) && ctx.prev?.kind === 'arc') {
      // K / G after a curve: Right or Left motion as needed to keep the K / G
      // straight = the side away from the inside of the curve at the joint
      const inC = insideN(ctx.prev, true);
      n = dot(perpL(s.t1), inC) > 0 ? perpR(s.t1) : perpL(s.t1);
      rules.push('shun on K/G after a curve -> side that keeps the K/G straight');
    } else if (['T', 'D', 'J'].includes(s.name)) { n = rightHandN(s.t1); rules.push('shun on the right-hand side of T/D/J'); }
    else if (ctx.vowelSide) {
      // opposite the last vowel: vowel before the stroke -> after-side, vowel
      // after the stroke (between it and -shun) -> before-side
      const b = beforeNormal(s);
      n = ctx.vowelSide === 'after' ? b : mul(b, -1);
      rules.push('shun on the side opposite the last vowel');
    } else n = motionN(s.t1, 'R');
    const hp = hookPts(end, s.t1, n, CAL.shun, true, 180, fc ? 0 : CAL.shunTail * CAL.shun);
    ex.push({ type: 'polyline', pts: hp, heavy: false, joint: 'start' }); exit = hp[hp.length - 1];
    if (fc) { circleR = CAL.circle; const c = add(end, mul(n, CAL.shun)); ex.push({ type: 'circle', c, r: circleR * 0.85, heavy: false }); }
  } else if (fc || fl) {
    const n = straight ? motionN(s.t1, 'L') : insideN(s, true);
    if (fc) { circleR = fc === 'ss' ? CAL.bigCircle : CAL.circle; const c = circleAt(end, n, circleR, straight ? s.t1 : null, s.t1); ex.push(c); circleN = n; circleC = c.c; }
    else ex.push({ type: 'polyline', pts: loopAlong(s, true, n, fl === 'st' ? CAL.loopST : CAL.loopSTR), heavy: false });
  }
  if (fshun) {
    if (!circleN) throw new Error('shun token must follow a circle');
    // small hook on the other side of the stroke, same motion as the circle
    // the pen leaves the stroke end towards the other side (m) and curls in
    // the circle's rotation, so the hook opens away from the stroke start
    const m = mul(circleN, -1);
    const sense = (s.t1.x * circleN.y - s.t1.y * circleN.x) > 0 ? 1 : -1; // +1: circle drawn anticlockwise
    const r = CAL.shunSmall, c0 = add(end, mul(perpL(m), sense * r)), hp = [];
    for (let i = 0; i <= 16; i++) hp.push(add(c0, rot(sub(end, c0), (sense * deg(CAL.shunSmallSweep) * i) / 16)));
    ex.push({ type: 'polyline', pts: hp, heavy: false, joint: 'start' }); exit = hp[hp.length - 1];
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
  let pen, strokes, elements;
  const rules0 = rules.length, scaleBy = {}, angleBy = {};
  const build = () => {
  pen = v(0, 0); strokes = []; elements = []; rules.length = rules0;
  cIdx.forEach((ci, k) => {
    const it = items[ci];
    // 2024 Ch. I Ex 3-4: horizontal curves (m, n, ng) joined to other strokes are
    // printed flatter than when standing alone (sagitta ~0.13 vs 0.21 of the chord)
    const flatH = cIdx.length > 1 && ['M', 'MP', 'N', 'NG'].includes(it.name) && it.length === 'normal';
    let s = buildStroke(it.name, { length: scaleBy[k] ?? it.length, heavy: it.heavy, reverse: it.reverse, sweep: flatH ? CAL.joinedHorizSweep : 90, angle: angleBy[k] });
    let vowelSide = null;
    if (it.hookEnd && it.hookEnd.startsWith('shun')) {
      const nextCi = cIdx[k + 1] ?? items.length, prevCi = k ? cIdx[k - 1] : -1;
      if (items.slice(ci + 1, nextCi).some((x) => x.t === 'V')) vowelSide = 'after';
      else if (items.slice(prevCi + 1, ci).some((x) => x.t === 'V')) vowelSide = 'before';
    }
    s = decorate(s, it, pres[k] || [], posts[k] || [], rules, { prev: strokes[k - 1], vowelSide });
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
        // outside of the angle = away from the turn; the circle runs on from
        // the first stroke (tangent to it at the joint, Srihari round 4)
        if (Math.abs(turn) >= 0.08) { const out = mul(norm(sub(s.t0, prev.t1)), -1); n = CAL.medialFlow ? (dot(perpL(prev.t1), out) > 0 ? perpL(prev.t1) : perpR(prev.t1)) : out; }
      }
      if (a) elements.push(circleAt(pen, n, R, null, prev.t1));
      const lp = mc.find((x) => x === 'st' || x === 'str');
      if (lp) prev.extras.push({ type: 'polyline', pts: loopAlong(prev, true, n, lp === 'st' ? CAL.loopST : CAL.loopSTR), heavy: false });
      rules.push('medial circle/loop at the joint');
    }
    pen = s.exit;
    it.si = strokes.length;
    strokes.push(s);
    elements.push({ type: 'stroke', stroke: s });
  });
  // strokes must not run over each other (Srihari, Ch. I review). When
  // the stroke after a curve turns back sharply and would cross that curve,
  // the curve is written with a flatter end (then the next curve too) so the
  // two meet in a clean sharp angle.
  for (let k = 1; k < strokes.length; k++) {
    const ov = () => runsOver(strokes[k - 1], strokes[k]);
    if (!ov()) continue;
    const A = strokes[k - 1], B = strokes[k];
    if (A.kind !== 'arc') continue; // a curve leaving a straight stroke is printed that way
    if (!A.extras.length) for (const sw of [70, 60, 50, 45]) { strokes[k - 1] = withSweep(A, sw); if (!ov()) break; }
    if (ov() && B.kind === 'arc' && !B.extras.length) for (const sw of [50, 40, 30]) { strokes[k] = withSweep(B, sw); if (!ov()) break; }
    rules.push(`sharp joining ${A.name}-${B.name}: curve flattened so the strokes do not overlap`);
    const ei = elements.findIndex((e) => e.type === 'stroke' && e.stroke === A); if (ei >= 0) elements[ei] = { type: 'stroke', stroke: strokes[k - 1] };
    const ej = elements.findIndex((e) => e.type === 'stroke' && e.stroke === B); if (ej >= 0) elements[ej] = { type: 'stroke', stroke: strokes[k] };
  }
  };
  build();
  // Srihari, Ch. I round 3 ("follow the book's drawing"), 2024 Ch. I Ex 3-4
  // prints: an upstroke followed (directly or across
  // horizontals) by a downstroke is written longer, so the downstroke comes
  // back to the level the upstroke started from (on the line in 2nd position)
  // instead of running below it. Only full-length upstrokes are lengthened.
  for (let iter = 0; iter < 4; iter++) {
    const anchor0 = strokes.find((x) => !isHorizontal(x));
    let fix = null;
    for (let k = 1; k < strokes.length && !fix; k++) {
      const b = strokes[k];
      if (b.up || Math.abs(b.dir.y) < 0.3) continue;
      let j = k - 1; while (j >= 0 && Math.abs(strokes[j].dir.y) < 0.3) j--;
      const a = strokes[j];
      if (!a || !a.up || items[cIdx[j]].length !== 'normal' || a.dir.y < 0.2) continue;
      const level = a === anchor0 ? inkLow(a) : startOf(a).y - inkWidth(a, 0) / 2;
      const d = level - (endOf(b).y - inkWidth(b, 1) / 2);
      if (d > 0.04) fix = { j, scale: (scaleBy[j] ?? 1) + d / a.dir.y / (a.length / (scaleBy[j] ?? 1)) };
    }
    if (!fix) break;
    const A = strokes[fix.j];
    if (fix.j === 0 && A.name === 'RAY' && fix.scale > CAL.rayRiseLen && angleBy[0] == null) {
      // opening Ray: written steeper at CAL.rayRiseLen instead of doubled
      const base = A.length / (scaleBy[0] ?? 1), rise = fix.scale * base * A.dir.y;
      angleBy[0] = Math.min(60, Math.max(30, (Math.asin(Math.min(1, rise / (CAL.rayRiseLen * base))) * 180) / Math.PI));
      scaleBy[0] = CAL.rayRiseLen; build(); rules.push('opening Ray before a downstroke written steeper, not longer'); continue;
    }
    scaleBy[fix.j] = fix.scale; build();
  }
  if (Object.keys(scaleBy).length) rules.push('upstroke written longer so the following downstroke returns to the line');
  // Srihari, Ch. I round 6 (dpl; 2024 p. 7 Ex 4 line 4: the L comes up to the
  // line and stops there): a final upstroke that comes back up to the line
  // after a downstroke ends ON the line instead of running a little past it
  // (written up to CAL.upToLine shorter). 2nd position only.
  {
    const fv = items.find((x) => x.t === 'V');
    const pos = opts.position ?? (fv ? VOWELS[fv.key].place : 2);
    const n = strokes.length, a = strokes[n - 1], p = strokes[n - 2], k = n - 1;
    const anchor0 = strokes.find((x) => !isHorizontal(x));
    if (pos === 2 && n >= 2 && a.up && !p.up && p.dir.y < -0.3 && anchor0 && anchor0 !== a && !isHorizontal(strokes[0])
      && items[cIdx[k]].length === 'normal' && !items[cIdx[k]].hookEnd && !(posts[k] || []).length && !a.extras.length) {
      const e = endOf(a).y - inkLow(anchor0);
      if (e > 1e-4 && e <= CAL.upToLine) {
        const cur = scaleBy[k] ?? 1;
        scaleBy[k] = cur - e / a.dir.y / (a.length / cur); build();
        rules.push('final upstroke ends on the line');
      }
    }
  }  // 2024 Ch. I para 10: thick curves taper at both ends "except when a joining
  // such as v-g or b-ng is made": a thick stroke joined to a thick stroke stays
  // thick through the joint
  for (let k = 1; k < strokes.length; k++) {
    const a = strokes[k - 1], b = strokes[k], ia = items[cIdx[k - 1]], ib = items[cIdx[k]];
    if (a.heavy && b.heavy && !ia.hookEnd && !ib.hookStart && !(medialCircle[k - 1] || []).length) { a.thickEnd = true; b.thickStart = true; rules.push('thick-to-thick joining: no taper at the joint'); }
  }
  // Srihari, round 4: a light stroke and a heavy straight are blended: the
  // line runs on from the light stroke and swells to full thickness (and
  // thins again into a following light stroke or circle), no block-like
  // start. Heavy curves already taper at both ends; hooks on heavy straights
  // carry the full width (taperedHook) and are left alone.
  for (let k = 0; k < strokes.length; k++) {
    const s = strokes[k], it = items[cIdx[k]];
    if (!s.heavy || s.kind !== 'line') continue;
    const prev = strokes[k - 1], next = strokes[k + 1];
    const circIn = (pres[k] || []).length || (k > 0 && (medialCircle[k - 1] || []).length);
    const circOut = (posts[k] || []).some((x) => x !== 'shun') || (medialCircle[k] || []).length;
    if (!it.hookStart && ((prev && (!prev.heavy || circIn)) || (!prev && circIn))) { s.rampStart = true; s.thickStart = false; }
    if (!it.hookEnd && ((next && (!next.heavy || circOut)) || (!next && circOut))) { s.rampEnd = true; s.thickEnd = false; }
  }
  // Srihari, round 6 (variant F 'book' chosen): heavy CURVES get the same
  // treatment where they meet a light stroke, a hook or a circle: they ease
  // to about the light width over the last part of the stroke instead of
  // narrowing to a point. A free end tapers gently (book prints). A
  // thick-to-thick joint stays full width (set above).
  for (let k = 0; k < strokes.length; k++) {
    const s = strokes[k], it = items[cIdx[k]];
    if (!s.heavy || s.kind !== 'arc') continue;
    const prev = strokes[k - 1], next = strokes[k + 1];
    const circIn = (pres[k] || []).length || (k > 0 && (medialCircle[k - 1] || []).length);
    const circOut = (posts[k] || []).length || (medialCircle[k] || []).length;
    if (!s.thickStart && (prev || circIn || it.hookStart)) s.rampStart = true;
    if (!s.thickEnd && (next || circOut || it.hookEnd)) s.rampEnd = true;
  }
  // tick-the, vowels
  let firstPlace = null;
  const vinfo = []; // vowel signs drawn: which stroke, place, side (for the review cards)
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
      vinfo.push({ key: it.key, place, side, si: target.si, stroke: strokes[target.si].name, up: !!strokes[target.si].up, horizontal: isHorizontal(strokes[target.si]) });
    } else if (it.t === 'V' && firstPlace === null) firstPlace = VOWELS[it.key].place;
  });
  const position = opts.position ?? firstPlace ?? 2;
  const anchor = strokes.find((s) => !isHorizontal(s));
  let dy;
  if (position === 2) {
    // 2nd position (on the line), 2024 Ch. I Ex 1-4 prints:
    //  * the first upstroke or downstroke rests ON the line: a downstroke ends on
    //    it, an upstroke starts on it, its hook (w, y) or circle (h) sitting on
    //    the line; the ink rests on the line, it does not hang below it
    //  * an outline that opens with a horizontal (k g m n ng) keeps it on the
    //    line; after an opening up/downstroke nothing raises the outline
    //  * strokes after the first may go through or dip below the line
    //  * all-horizontal outlines rest on the line
    const ink = (s) => inkLow(s);
    if (anchor) {
      dy = -ink(anchor);
      let lift = 0;
      strokes.forEach((s, i) => {
        // the first stroke sets the placement (Srihari, rounds 3 and 6; 2024
        // prints, ¶ 24): an opening up/downstroke rests on the line and
        // nothing after it lifts the outline, so later horizontals may run
        // along or dip a little below the line. Only an outline that OPENS
        // with a horizontal keeps that first horizontal on the line.
        if (i !== 0 || !isHorizontal(s)) return;
        const ja = startOf(s).y + dy, jb = endOf(s).y + dy;
        // an opening run of 2+ horizontals (nml) rests on the line at its
        // stroke ends, like an all-horizontal outline (see below)
        const run = strokes[1] && isHorizontal(strokes[1]);
        const low = run ? Math.min(ja, jb) - Math.max(inkWidth(s, 0), inkWidth(s, 1)) / 2 - dy : ink(s);
        if (Math.min(ja, jb) > -0.12) lift = Math.max(lift, -(low + dy));
      });
      if (lift > 1e-6) { dy += lift; rules.push('horizontal written on the line: outline raised so it does not dip below'); }
    } else if (strokes.length > 1) {
      // all horizontal (Srihari, Ch. I round 6: nm, nml; 2024 p. 7 Ex 4 line
      // 6): the outline rests on the line at its stroke ends (joints), so a
      // first N / NG sags a little below it and a following M comes back down
      // onto the line; a later curve may dip (kn)
      dy = -Math.min(...strokes.flatMap((s) => [startOf(s).y - inkWidth(s, 0) / 2, endOf(s).y - inkWidth(s, 1) / 2]));
    } else dy = -ink(strokes[0]); // a single horizontal rests on the line by its ink
    rules.push('2nd position: first up/downstroke rests on the line');
  } else if (anchor) {
    const ys = anchor.pts.map((p) => p.y);
    const lo = Math.min(...ys), hi = Math.max(...ys);
    dy = position === 1 ? CAL.pos1Raise - lo : position === 2 ? -lo : -(lo + hi) / 2;
  } else {
    const ys = strokes.flatMap((s) => s.pts.map((p) => p.y));
    const lo = Math.min(...ys), hi = Math.max(...ys);
    // horizontal grammalogues in 3rd position (own, young) are written just
    // BELOW the line (1924 course Lesson III; 1920 list)
    // 2nd position: written ON the line (2024 Ch. I Ex 1 note: "m, n, ng, k, g
    // are written on the line") = the ink rests on the line
    const onLine = (strokes.some((s) => s.heavy) ? CAL.heavy : CAL.light) / 2;
    dy = position === 3 && opts.below3 ? -0.07 - hi : (position === 1 ? CAL.pos1Raise : onLine) - lo;
  }
  return { elements: shift(elements, v(0, dy)), strokes: strokes.map((s) => s.name), rules, position, vowels: vinfo };
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

/** does stroke B (starting where A ends) cross A or run along it, away from the joint? */
function runsOver(A, B) {
  const J = A.pts[A.pts.length - 1];
  const o = (p, q, r) => (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x);
  const X = (a, b, c, d) => o(a, b, c) * o(a, b, d) < 0 && o(c, d, a) * o(c, d, b) < 0;
  const dseg = (p, a, b) => { const dx = b.x - a.x, dy = b.y - a.y, t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy || 1))); return Math.hypot(p.x - a.x - t * dx, p.y - a.y - t * dy); };
  const gap = (CAL.light + (A.heavy || B.heavy ? CAL.heavy : CAL.light)) / 2 + 0.02;
  let near = 0;
  for (let i = 1; i < A.pts.length; i++) {
    if (Math.hypot(A.pts[i].x - J.x, A.pts[i].y - J.y) < 0.12) continue;
    for (let j = 1; j < B.pts.length; j++) {
      if (Math.hypot(B.pts[j].x - J.x, B.pts[j].y - J.y) < 0.12) continue;
      if (X(A.pts[i - 1], A.pts[i], B.pts[j - 1], B.pts[j])) return true;
      if (dseg(B.pts[j], A.pts[i - 1], A.pts[i]) < gap) near++;
    }
  }
  return near > 40; // only a long shared run counts; a tangent touch is how the book joins
}

/** 0..1 weight of a heavy straight at t: ramps from light at a joint with a
 *  light stroke / circle (smoothstep over CAL.blendRamp of the stroke) */
export function rampW(s, t) {
  const sm = (x) => { const u = Math.min(1, Math.max(0, x)); return u * u * (3 - 2 * u); };
  if (JOIN.mode === 'ramp' || !JOIN_MODES[JOIN.mode]) { // default (unchanged)
    let w = 1;
    if (s.rampStart) w = Math.min(w, sm(t / CAL.blendRamp));
    if (s.rampEnd) w = Math.min(w, sm((1 - t) / CAL.blendRamp));
    return w;
  }
  const M = JOIN_MODES[JOIN.mode];
  const curve = { smooth: sm, out: (x) => { const u = Math.min(1, Math.max(0, x)); return 1 - (1 - u) * (1 - u); } };
  const ease = (u, e) => e.to + (1 - e.to) * (curve[e.curve || 'smooth'])(u / e.len);
  // a free end = no joint, no thick-to-thick joint and no hook / circle on the stroke
  const free = !s.extras || !s.extras.length;
  let w = M.swell ? 1 + M.swell * (Math.sin(Math.PI * t) - 0.5) : 1;
  const st = s.rampStart ? M.joint : (free && !s.thickStart ? M.free : null);
  const en = s.rampEnd ? M.joint : (free && !s.thickEnd ? M.free : null);
  if (st) w = Math.min(w, ease(t, st));
  if (en) w = Math.min(w, ease(1 - t, en));
  return w;
}

/** Thick/thin join treatment of heavy straights (Srihari, round 6: "at
 *  thick-thin joins the thick stroke suddenly becomes thin, looking like a
 *  pencil"). Srihari chose F ('book'), now the default; 'ramp' = the old look.
 *  joint = ease at a joint with a light stroke / circle, free = ease at a free
 *  end (null = full width + round cap), len = share of the stroke length,
 *  to = weight (0 = light width, 1 = heavy) reached at the end (non-default
 *  modes round every end at its own width, see render.js), swell = slight width swell in the middle.
 *  Switch with setJoinTaper('short') etc. (render.js re-exports it). */
const W15 = (CAL.light * 0.5) / (CAL.heavy - CAL.light); // weight of 1.5x the light width
export const JOIN_MODES = {
  ramp: { label: 'A', joint: { len: CAL.blendRamp, to: 0 }, free: null }, //          current: 25% smoothstep from light (the 'pencil')
  short: { label: 'B', joint: { len: 0.1, to: 0 }, free: { len: 0.12, to: 0.3 } }, //   full width, 10% ease at the joint
  blunt: { label: 'C', joint: null, free: { len: 0.12, to: 0.3 } }, //  full width to the joint, round blunt join
  swell: { label: 'D', joint: { len: 0.2, to: W15 }, free: { len: 0.2, to: W15 } }, // full in the middle 60%, 1.5x light at the ends
  shortRound: { label: 'E', joint: { len: 0.1, to: 0 }, free: null }, //               as B, free ends full width + round
  // F (Srihari, round 6: chosen, the default): slight swell, medium ease; heavy
  // curves: same joint ease, gentle taper at a free end
  book: { label: 'F', joint: { len: 0.2, to: 0.15, curve: 'out' }, free: { len: 0.2, to: 0.5, curve: 'out' }, swell: 0.12,
    curveFree: { len: 0.4, to: 0.12, curve: 'smooth' } },
};
export const JOIN = { mode: 'book' };
/** 0..1 weight of a heavy CURVE at t. 'ramp' mode keeps the old sin^0.7
 *  taper to a point at both ends; other modes ease at joints (rampStart /
 *  rampEnd) as heavy straights do and taper a free end with curveFree. */
export function arcW(s, t) {
  const fullS = s.thickStart && t < 0.5, fullE = s.thickEnd && t > 0.5;
  if (JOIN.mode === 'ramp' || !JOIN_MODES[JOIN.mode]) return fullS || fullE ? 1 : Math.pow(Math.sin(Math.PI * t), 0.7);
  const M = JOIN_MODES[JOIN.mode];
  const sm = (x) => { const u = Math.min(1, Math.max(0, x)); return u * u * (3 - 2 * u); };
  const curve = { smooth: sm, out: (x) => { const u = Math.min(1, Math.max(0, x)); return 1 - (1 - u) * (1 - u); } };
  const ease = (u, e) => e.to + (1 - e.to) * (curve[e.curve || 'smooth'])(u / e.len);
  const fr = M.curveFree !== undefined ? M.curveFree : M.free;
  let w = M.swell ? 1 + M.swell * (Math.sin(Math.PI * t) - 0.5) : 1;
  const st = s.thickStart ? null : s.rampStart ? M.joint : fr;
  const en = s.thickEnd ? null : s.rampEnd ? M.joint : fr;
  if (s.thickStart && t < 0.5) w = Math.max(w, 1);
  if (s.thickEnd && t > 0.5) w = Math.max(w, 1);
  if (st) w = Math.min(w, ease(t, st));
  if (en) w = Math.min(w, ease(1 - t, en));
  return w;
}
export function setJoinTaper(mode) { if (!JOIN_MODES[mode]) throw new Error('unknown joinTaper ' + mode); JOIN.mode = mode; }
/** stroke ink width at parameter t (matches render.js) */
export function inkWidth(s, t) {
  if (!s.heavy) return CAL.light;
  if (s.kind === 'line') return CAL.light + (CAL.heavy - CAL.light) * rampW(s, t);
  return CAL.light + (CAL.heavy - CAL.light) * arcW(s, t);
}
/** lowest point of the ink of one stroke, its hooks and circles included */
export function inkLow(s) {
  const n = s.pts.length - 1;
  let lo = Infinity;
  s.pts.forEach((p, i) => { lo = Math.min(lo, p.y - inkWidth(s, i / n) / 2); });
  for (const x of s.extras) lo = Math.min(lo, x.type === 'circle' ? x.c.y - x.r - CAL.light / 2 : Math.min(...x.pts.map((p) => p.y)) - CAL.light / 2);
  return lo;
}

export function shift(elements, off) {
  const t = (p) => add(p, off);
  return elements.map((e) => {
    switch (e.type) {
      case 'stroke': return { ...e, stroke: translateStroke(e.stroke, off) };
      case 'dot': return { ...e, c: t(e.c) };
      case 'circle': return { ...e, c: t(e.c), ...(e.at ? { at: t(e.at) } : {}) };
      case 'line': return { ...e, a: t(e.a), b: t(e.b) };
      case 'polyline': return { ...e, pts: e.pts.map(t) };
      default: return e;
    }
  });
}
