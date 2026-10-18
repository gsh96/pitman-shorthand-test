// SVG renderer. Engine units -> px, y flipped. Light strokes are constant
// width; heavy straights are thick lines; heavy curves are filled outlines
// tapered at both ends (as in printed Pitman).
import { sub, perpL, norm } from './geometry.js';
import { CAL } from './calibration.js';
import { rampW } from './composer.js';

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
    const full = (s.thickStart && t < 0.5) || (s.thickEnd && t > 0.5); // thick-to-thick joint: no taper
    const w = (STYLE.light + (STYLE.heavy - STYLE.light) * (full ? 1 : Math.pow(Math.sin(Math.PI * t), 0.7))) / STYLE.k / 2;
    left.push({ x: p.x + nn.x * w, y: p.y + nn.y * w });
    right.push({ x: p.x - nn.x * w, y: p.y - nn.y * w });
  });
  const poly = [...left, ...right.reverse()];
  return `<polygon points="${poly.map((p) => P(p, o)).join(' ')}" fill="${STYLE.ink}"/>` + polyline(pts, o, STYLE.light);
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
  const cap = (p) => `<circle cx="${f(o.x + p.x * STYLE.k)}" cy="${f(o.y - p.y * STYLE.k)}" r="${f(STYLE.heavy / 2)}" fill="${STYLE.ink}"/>`;
  if (!s.rampStart) out += cap(a);
  if (!s.rampEnd) out += cap(b);
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
