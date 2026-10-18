// SVG renderer. Engine units -> px, y flipped. Light strokes are constant
// width; heavy straights are thick lines; heavy curves are filled outlines
// tapered at both ends (as in printed Pitman).
import { sub, perpL, norm } from './geometry.js';
import { CAL } from './calibration.js';
import { rampW, arcW, JOIN, JOIN_MODES, setJoinTaper } from './composer.js';
export { JOIN_MODES, setJoinTaper };
/** px width of a blended heavy straight at t, and the extra round caps */
const rampPx = (s, t) => STYLE.light + (STYLE.heavy - STYLE.light) * rampW(s, t);
/** px width of a heavy curve at t (composer arcW) */
const arcPx = (s, t) => STYLE.light + (STYLE.heavy - STYLE.light) * arcW(s, t);
// non-default modes round the joint end at its own width (flat ends show as notches)
const jointCap = () => JOIN.mode !== 'ramp' && !!JOIN_MODES[JOIN.mode];

// line widths follow the measured print proportions (calibration.js)
export const STYLE = { k: 72, light: +(CAL.light * 72).toFixed(2), heavy: +(CAL.heavy * 72).toFixed(2), ink: '#111' };

const f = (n) => +n.toFixed(2);
const P = (p, o) => `${f(o.x + p.x * STYLE.k)},${f(o.y - p.y * STYLE.k)}`;

function polyline(pts, o, w) {
  return `<polyline points="${pts.map((p) => P(p, o)).join(' ')}" fill="none" stroke="${STYLE.ink}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
}

function taperedArc(pts, o, s = {}) {
  const n = pts.length - 1;
  const left = [], right = [];
  pts.forEach((p, i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n, i + 1)];
    const nn = perpL(norm(sub(b, a)));
    const t = i / n;
    const w = arcPx(s, t) / STYLE.k / 2; // thick-to-thick joint: no taper; joints ease (arcW)
    left.push({ x: p.x + nn.x * w, y: p.y + nn.y * w });
    right.push({ x: p.x - nn.x * w, y: p.y - nn.y * w });
  });
  const poly = [...left, ...right.reverse()];
  let out = `<polygon points="${poly.map((p) => P(p, o)).join(' ')}" fill="${STYLE.ink}"/>` + polyline(pts, o, STYLE.light);
  if (jointCap()) for (const [p, t] of [[pts[0], 0], [pts[n], 1]]) out += `<circle cx="${f(o.x + p.x * STYLE.k)}" cy="${f(o.y - p.y * STYLE.k)}" r="${f(arcPx(s, t) / 2)}" fill="${STYLE.ink}"/>`;
  return out;
}

/** hook on a heavy straight stroke: printed hooks are part of the stroke, so
 *  the heavy width carries on into the hook and tapers to light at its tip
 *  (2024 + 1920 lists: believe, been, behalf, deliver, advantage, general). */
function taperedHook(pts, o, joint) {
  const P = joint === 'end' ? [...pts].reverse() : pts; // P[0] = at the stroke
  const n = P.length - 1, left = [], right = [];
  let tot = 0; const acc = [0];
  for (let i = 1; i <= n; i++) { tot += Math.hypot(P[i].x - P[i - 1].x, P[i].y - P[i - 1].y); acc.push(tot); }
  P.forEach((p, i) => {
    const a = P[Math.max(0, i - 1)], b = P[Math.min(n, i + 1)];
    const nn = perpL(norm(sub(b, a)));
    const t = tot ? acc[i] / tot : 1;
    const w = (STYLE.light + (STYLE.heavy - STYLE.light) * Math.pow(1 - t, CAL.hookTaper)) / STYLE.k / 2;
    left.push({ x: p.x + nn.x * w, y: p.y + nn.y * w });
    right.push({ x: p.x - nn.x * w, y: p.y - nn.y * w });
  });
  return `<polygon points="${[...left, ...right.reverse()].map((p) => P_(p, o)).join(' ')}" fill="${STYLE.ink}"/>` + polyline(pts, o, STYLE.light);
}
const P_ = (p, o) => P(p, o);

/** heavy straight joined to a light stroke: one filled outline whose width
 *  grows smoothly from the light width at the joint to the full heavy width
 *  (and back at a light joint at its end); a free end keeps the round cap */
function blendedLine(s, o) {
  const a = s.pts[0], b = s.pts[s.pts.length - 1], nn = perpL(norm(sub(b, a)));
  const N = 40, left = [], right = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N, p = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
    const w = (STYLE.light + (STYLE.heavy - STYLE.light) * rampW(s, t)) / STYLE.k / 2;
    left.push({ x: p.x + nn.x * w, y: p.y + nn.y * w }); right.push({ x: p.x - nn.x * w, y: p.y - nn.y * w });
  }
  let out = `<polygon points="${[...left, ...right.reverse()].map((p) => P(p, o)).join(' ')}" fill="${STYLE.ink}"/>` + polyline([a, b], o, STYLE.light);
  const cap = (p, w) => `<circle cx="${f(o.x + p.x * STYLE.k)}" cy="${f(o.y - p.y * STYLE.k)}" r="${f(w / 2)}" fill="${STYLE.ink}"/>`;
  if (!s.rampStart) out += cap(a, rampPx(s, 0)); else if (jointCap()) out += cap(a, rampPx(s, 0));
  if (!s.rampEnd) out += cap(b, rampPx(s, 1)); else if (jointCap()) out += cap(b, rampPx(s, 1));
  return out;
}

export function elementsToSvg(elements, o) {
  return elements.map((e) => {
    if (e.type === 'stroke') {
      const s = e.stroke;
      let out = '';
      if (s.kind === 'arc' && s.heavy) out += taperedArc(s.pts, o, s);
      else if (s.heavy && (s.rampStart || s.rampEnd)) out += blendedLine(s, o);
      else out += polyline(s.kind === 'line' ? [s.pts[0], s.pts[s.pts.length - 1]] : s.pts, o, s.heavy ? STYLE.heavy : STYLE.light);
      for (const x of s.extras) {
        if (x.type === 'circle') out += `<circle cx="${f(o.x + x.c.x * STYLE.k)}" cy="${f(o.y - x.c.y * STYLE.k)}" r="${f(x.r * STYLE.k)}" fill="none" stroke="${STYLE.ink}" stroke-width="${STYLE.light}"/>`;
        else if (x.joint && s.heavy && s.kind === 'line') out += taperedHook(x.pts, o, x.joint);
        else out += polyline(x.pts, o, STYLE.light);
      }
      return out;
    }
    if (e.type === 'dot') return `<circle cx="${f(o.x + e.c.x * STYLE.k)}" cy="${f(o.y - e.c.y * STYLE.k)}" r="${f(e.r * STYLE.k)}" fill="${STYLE.ink}"/>`;
    if (e.type === 'circle') return `<circle cx="${f(o.x + e.c.x * STYLE.k)}" cy="${f(o.y - e.c.y * STYLE.k)}" r="${f(e.r * STYLE.k)}" fill="none" stroke="${STYLE.ink}" stroke-width="${STYLE.light}"/>`;
    if (e.type === 'line') return polyline([e.a, e.b], o, e.heavy ? STYLE.heavy * 0.8 : STYLE.light);
    if (e.type === 'polyline') return polyline(e.pts, o, e.heavy ? STYLE.heavy * 0.8 : STYLE.light);
    return '';
  }).join('');
}

export function bbox(elements) {
  const pts = [];
  for (const e of elements) {
    if (e.type === 'stroke') { pts.push(...e.stroke.pts); e.stroke.extras.forEach((x) => (x.type === 'circle' ? pts.push({ x: x.c.x - x.r, y: x.c.y - x.r }, { x: x.c.x + x.r, y: x.c.y + x.r }) : pts.push(...x.pts))); }
    else if (e.type === 'dot' || e.type === 'circle') pts.push({ x: e.c.x - e.r, y: e.c.y - e.r }, { x: e.c.x + e.r, y: e.c.y + e.r });
    else if (e.type === 'line') pts.push(e.a, e.b);
    else if (e.type === 'polyline') pts.push(...e.pts);
  }
  const xs = pts.map((p) => p.x), ys = pts.map((p) => p.y);
  return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** One labelled cell with a ruled writing line. Returns an SVG <g>. */
export function cell(outline, { x, y, w, h, title, note, unsure, flag = 'UNSURE', lineY = 0.58, ruled = true, frame = true, fitTop = 62, fitBottom = 92 }) {
  const empty = !outline.elements.length;
  const bb = empty ? { x0: 0, x1: 0 } : bbox(outline.elements);
  const ly = y + h * lineY;
  const o = { x: x + w / 2 - ((bb.x0 + bb.x1) / 2) * STYLE.k, y: ly };
  let g = `<g>`;
  if (frame) g += `<rect x="${x + 4}" y="${y + 4}" width="${w - 8}" height="${h - 8}" rx="8" fill="#fff" stroke="${unsure ? '#d9822b' : '#d0d4da'}" stroke-width="${unsure ? 2 : 1}"/>`;
  if (ruled) g += `<line x1="${x + 18}" y1="${ly}" x2="${x + w - 18}" y2="${ly}" stroke="#6fa8dc" stroke-width="1.3"/>`;
  // shrink long outlines (contractions) to fit the card
  let sc = 1;
  if (!empty) {
    const k = STYLE.k, up = Math.max(10, ly - (y + fitTop)), down = Math.max(10, y + h - fitBottom - ly);
    sc = Math.min(1, (w - 24) / Math.max(1e-6, (bb.x1 - bb.x0) * k));
    if (bb.y1 > 0) sc = Math.min(sc, up / (bb.y1 * k));
    if (bb.y0 < 0) sc = Math.min(sc, down / (-bb.y0 * k));
  }
  const cx = x + w / 2;
  g += sc < 1 ? `<g transform="translate(${cx} ${ly}) scale(${sc.toFixed(3)}) translate(${-cx} ${-ly})">${elementsToSvg(outline.elements, o)}</g>` : elementsToSvg(outline.elements, o);
  g += `<text x="${x + w / 2}" y="${y + 36}" text-anchor="middle" font-family="DejaVu Sans" font-size="${Math.max(11, Math.min(22, Math.floor((w - 24) / (String(title).length * 0.74))))}" font-weight="bold" fill="#111">${esc(title)}</text>`;
  if (unsure) g += `<text x="${x + w / 2}" y="${y + 54}" text-anchor="middle" font-family="DejaVu Sans" font-size="12" font-weight="bold" fill="${flag === 'UNSURE' ? '#c0392b' : '#d9822b'}">${esc(flag)}</text>`;
  if (empty) g += `<text x="${x + w / 2}" y="${ly - 14}" text-anchor="middle" font-family="DejaVu Sans" font-size="12" font-style="italic" fill="#999">not drawn yet</text>`;
  const lines = (Array.isArray(note) ? note : [note]).flatMap((t) => wrap(String(t ?? ''), Math.floor((w - 16) / 7)));
  lines.filter(Boolean).forEach((t, i) => {
    g += `<text x="${x + w / 2}" y="${y + h - 34 + i * 15 - (lines.length - 1) * 15 + 15}" text-anchor="middle" font-family="DejaVu Sans" font-size="12" fill="#444">${esc(t)}</text>`;
  });
  return g + `</g>`;
}

function wrap(t, n) {
  if (t.length <= n) return [t];
  const out = []; let cur = '';
  for (const word of t.split(' ')) { if ((cur + ' ' + word).trim().length > n && cur) { out.push(cur); cur = word; } else cur = (cur + ' ' + word).trim(); }
  if (cur) out.push(cur);
  return out;
}

export function svgDoc(w, h, body, bg = '#fff') {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="100%" height="100%" fill="${bg}"/>${body}</svg>`;
}
export { esc };

// ---------- progressive drawing for the stroke animation -------------------
// The animation is drawn from the geometry itself (no SVG masks or dash
// tricks, which some browsers clip or fail to repaint): the outline is split
// into pen-order pieces (initial circle / hook, stroke, final hook / circle),
// and each frame draws every piece up to the pen position with the same
// widths as the static drawing (thin-to-thick blending included).
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const near2 = (a, b) => dist(a, b) < 0.02;
/** first fraction u (by arc length) of a point list, last point interpolated */
function cut(pts, W, u) {
  if (u >= 1) return { pts, W };
  const acc = [0];
  for (let i = 1; i < pts.length; i++) acc.push(acc[i - 1] + dist(pts[i], pts[i - 1]));
  const L = acc[acc.length - 1] * Math.max(0, u);
  const P = [pts[0]], Q = [W[0]];
  for (let i = 1; i < pts.length; i++) {
    if (acc[i] <= L) { P.push(pts[i]); Q.push(W[i]); continue; }
    const f0 = (L - acc[i - 1]) / ((acc[i] - acc[i - 1]) || 1);
    P.push({ x: pts[i - 1].x + (pts[i].x - pts[i - 1].x) * f0, y: pts[i - 1].y + (pts[i].y - pts[i - 1].y) * f0 }); Q.push(W[i - 1] + (W[i] - W[i - 1]) * f0);
    break;
  }
  return { pts: P, W: Q };
}
/** variable-width ribbon (px widths W) along pts, light centre line on top */
function ribbon(pts, W, o, caps) {
  if (pts.length < 2) return '';
  const n = pts.length - 1, left = [], right = [];
  pts.forEach((p, i) => {
    // tangent from the nearest neighbours that are not (almost) the same
    // point: the cut tip is interpolated and may sit on top of a sample
    let j = i + 1; while (j < n && dist(pts[j], p) < 1e-3) j++;
    let k = i - 1; while (k > 0 && dist(pts[k], p) < 1e-3) k--;
    const A = pts[Math.max(0, k)], B = pts[Math.min(n, j)];
    const nn = perpL(norm(sub(dist(A, B) > 1e-6 ? B : pts[n], dist(A, B) > 1e-6 ? A : pts[0])));
    const w = W[i] / STYLE.k / 2;
    left.push({ x: p.x + nn.x * w, y: p.y + nn.y * w }); right.push({ x: p.x - nn.x * w, y: p.y - nn.y * w });
  });
  let out = `<polygon points="${[...left, ...right.reverse()].map((p) => P(p, o)).join(' ')}" fill="${STYLE.ink}"/>` + polyline(pts, o, STYLE.light);
  for (const [p, w] of caps || []) out += `<circle cx="${f(o.x + p.x * STYLE.k)}" cy="${f(o.y - p.y * STYLE.k)}" r="${f(w / 2)}" fill="${STYLE.ink}"/>`;
  return out;
}
function circlePen(x) {
  const from = x.at || { x: x.c.x, y: x.c.y + x.r }, sense = x.sense || 1;
  const a0 = Math.atan2(from.y - x.c.y, from.x - x.c.x), pts = [];
  for (let i = 0; i <= 48; i++) { const a = a0 + (sense * 2 * Math.PI * i) / 48; pts.push({ x: x.c.x + x.r * Math.cos(a), y: x.c.y + x.r * Math.sin(a) }); }
  return pts;
}
function piece(pts, W, staticSvg, capsFull) {
  let L = 0; for (let i = 1; i < pts.length; i++) L += dist(pts[i], pts[i - 1]);
  const constW = W.every((w) => w === W[0]);
  return {
    len: L, start: pts[0], end: pts[pts.length - 1], pts,
    svg(u, o) {
      if (u >= 1) return staticSvg(o);
      const c = cut(pts, W, u);
      if (c.pts.length < 2) return '';
      if (constW) return polyline(c.pts, o, W[0]);
      // the moving tip is round like the pen nib (no flat cut)
      return ribbon(c.pts, c.W, o, [...(capsFull || []).filter(([p]) => p === pts[0]), [c.pts[c.pts.length - 1], c.W[c.W.length - 1]]]);
    },
  };
}
// After the outline the pen lifts and writes the vowel signs in the order of
// the word (Srihari, Ch. II round 8: "the vowel should be part of the
// writing"), then any later marks (e.g. a capital mark). Timings are given
// as pen-path lengths so the animation keeps one speed: a short pen-lift
// pause (the pen dot travels to the sign), a quick tap for a dot, a short
// stroke for a dash in its writing direction (left to right, or downward).
export const ANIM = { lift: 0.34, tap: 0.2, dash: 0.26 };
const isLate = (e) => !!(e.vowel || e.after);
const ease = (u) => (u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2);
function liftPiece(from, to) {
  return { len: ANIM.lift, lift: true, start: from, end: to, pen: (u) => { const k = ease(Math.min(1, Math.max(0, u))); return { x: from.x + (to.x - from.x) * k, y: from.y + (to.y - from.y) * k }; }, svg: () => '' };
}
function latePieces(e) {
  if (e.type === 'dot') return { len: ANIM.tap, start: e.c, end: e.c, svg(u, o) {
    if (u >= 1) return elementsToSvg([e], o);
    const k = 1 - Math.pow(1 - u, 3); // quick tap: grows to full size
    return `<circle cx="${f(o.x + e.c.x * STYLE.k)}" cy="${f(o.y - e.c.y * STYLE.k)}" r="${f(e.r * STYLE.k * (0.35 + 0.65 * k))}" fill="${STYLE.ink}" opacity="${f(0.4 + 0.6 * k)}"/>`;
  } };
  if (e.type === 'line') {
    const d = { x: e.b.x - e.a.x, y: e.b.y - e.a.y };
    const fwd = Math.abs(d.x) >= Math.abs(d.y) * 0.5 ? d.x >= 0 : d.y <= 0; // left to right, else downward
    const w = e.heavy ? STYLE.heavy * 0.8 : STYLE.light;
    const p = piece(fwd ? [e.a, e.b] : [e.b, e.a], [w, w], (o) => elementsToSvg([e], o));
    p.len = ANIM.dash; return p;
  }
  return { len: 0, start: null, svg: (u, o) => elementsToSvg([e], o) };
}
/** pen-order pieces of an outline; sum of len = pen path length (incl. pen lifts) */
export function penPieces(elements) {
  const out = penPiecesOf(elements.filter((e) => !isLate(e)));
  let pen = out.length ? out[out.length - 1].end : null;
  for (const e of elements.filter(isLate)) {
    const p = latePieces(e);
    if (p.start && pen) out.push(liftPiece(pen, p.start));
    else if (p.start) out.push({ ...liftPiece(p.start, p.start) });
    out.push(p); if (p.end) pen = p.end;
  }
  return out;
}
function penPiecesOf(elements) {
  const out = [];
  for (const e of elements) {
    if (e.type === 'circle') { const pts = circlePen(e); out.push(piece(pts, pts.map(() => STYLE.light), (o) => elementsToSvg([e], o))); continue; }
    if (e.type === 'line') { out.push(piece([e.a, e.b], [e.heavy ? STYLE.heavy * 0.8 : STYLE.light, e.heavy ? STYLE.heavy * 0.8 : STYLE.light], (o) => elementsToSvg([e], o))); continue; }
    if (e.type === 'polyline') { out.push(piece(e.pts, e.pts.map(() => (e.heavy ? STYLE.heavy * 0.8 : STYLE.light)), (o) => elementsToSvg([e], o))); continue; }
    if (e.type !== 'stroke') { out.push({ len: 0, svg: (u, o) => elementsToSvg([e], o) }); continue; }
    const s = e.stroke, a = s.pts[0], b = s.pts[s.pts.length - 1];
    const pre = [], post = [];
    const ex = (x) => {
      if (x.type === 'circle') { const pts = circlePen(x); return piece(pts, pts.map(() => STYLE.light), (o) => circleSvg(x, o)); }
      const heavyHook = x.joint && s.heavy && s.kind === 'line';
      if (!heavyHook) return piece(x.pts, x.pts.map(() => STYLE.light), (o) => polyline(x.pts, o, STYLE.light));
      // widths as taperedHook: heavy at the stroke, light at the tip
      const Pj = x.joint === 'end' ? [...x.pts].reverse() : x.pts; let tot = 0; const acc = [0];
      for (let i = 1; i < Pj.length; i++) { tot += dist(Pj[i], Pj[i - 1]); acc.push(tot); }
      let W = Pj.map((_, i) => STYLE.light + (STYLE.heavy - STYLE.light) * Math.pow(1 - (tot ? acc[i] / tot : 1), CAL.hookTaper));
      if (x.joint === 'end') W = W.reverse();
      return piece(x.pts, W, (o) => taperedHook(x.pts, o, x.joint));
    };
    for (const x of s.extras) {
      if (x.type === 'circle') { const ca = x.at ? near2(x.at, a) : dist(x.c, a) <= dist(x.c, b); (ca ? pre : post).push(ex(x)); }
      else if (near2(x.pts[x.pts.length - 1], a)) pre.push(ex(x));
      else post.push(ex(x));
    }
    // the stroke itself, widths as in elementsToSvg
    const n = s.pts.length - 1;
    let W, caps = [];
    if (s.kind === 'arc' && s.heavy) { W = s.pts.map((_, i) => arcPx(s, i / n)); if (jointCap()) caps.push([s.pts[0], arcPx(s, 0)]); }
    else if (s.heavy && (s.rampStart || s.rampEnd)) { W = s.pts.map((_, i) => STYLE.light + (STYLE.heavy - STYLE.light) * rampW(s, i / n)); if (!s.rampStart) caps.push([s.pts[0], rampPx(s, 0)]); else if (jointCap()) caps.push([s.pts[0], rampPx(s, 0)]); }
    else W = s.pts.map(() => (s.heavy ? STYLE.heavy : STYLE.light));
    const body = piece(s.pts, W, (o) => elementsToSvg([{ type: 'stroke', stroke: { ...s, extras: [] } }], o), caps);
    out.push(...pre, body, ...post);
  }
  return out;
}
const circleSvg = (x, o) => `<circle cx="${f(o.x + x.c.x * STYLE.k)}" cy="${f(o.y - x.c.y * STYLE.k)}" r="${f(x.r * STYLE.k)}" fill="none" stroke="${STYLE.ink}" stroke-width="${STYLE.light}"/>`;
/** SVG of the outline drawn up to pen distance d (engine units) */
export function partialSvg(pieces, d, o, opts = {}) {
  let out = '', acc = 0, pen = null;
  for (const p of pieces) {
    if (d <= acc && p.len > 0) break;
    const u = p.len ? (d - acc) / p.len : 1;
    if (p.lift) { if (u < 1) pen = p.pen(u); }
    else out += p.svg(u > 1 - 1e-9 ? 1 : u, o); // float sums: the pen at the end draws the exact static piece
    acc += p.len;
  }
  // the pen in the air between the outline and a vowel sign
  if (pen && opts.penColor) out += `<circle class="pen" cx="${f(o.x + pen.x * STYLE.k)}" cy="${f(o.y - pen.y * STYLE.k)}" r="${f(opts.penR ?? 4.5)}" fill="${opts.penColor}" opacity="0.9"/>`;
  return out;
}
