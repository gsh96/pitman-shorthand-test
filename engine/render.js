// SVG renderer. Engine units -> px, y flipped. Light strokes are constant
// width; heavy straights are thick lines; heavy curves are filled outlines
// tapered at both ends (as in printed Pitman).
import { sub, perpL, norm } from './geometry.js';

export const STYLE = { k: 72, light: 2.2, heavy: 6.5, ink: '#111' };

const f = (n) => +n.toFixed(2);
const P = (p, o) => `${f(o.x + p.x * STYLE.k)},${f(o.y - p.y * STYLE.k)}`;

function polyline(pts, o, w) {
  return `<polyline points="${pts.map((p) => P(p, o)).join(' ')}" fill="none" stroke="${STYLE.ink}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
}

function taperedArc(pts, o) {
  const n = pts.length - 1;
  const left = [], right = [];
  pts.forEach((p, i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n, i + 1)];
    const nn = perpL(norm(sub(b, a)));
    const t = i / n;
    const w = (STYLE.light + (STYLE.heavy - STYLE.light) * Math.pow(Math.sin(Math.PI * t), 0.7)) / STYLE.k / 2;
    left.push({ x: p.x + nn.x * w, y: p.y + nn.y * w });
    right.push({ x: p.x - nn.x * w, y: p.y - nn.y * w });
  });
  const poly = [...left, ...right.reverse()];
  return `<polygon points="${poly.map((p) => P(p, o)).join(' ')}" fill="${STYLE.ink}"/>` + polyline(pts, o, STYLE.light);
}

export function elementsToSvg(elements, o) {
  return elements.map((e) => {
    if (e.type === 'stroke') {
      const s = e.stroke;
      let out = '';
      if (s.kind === 'arc' && s.heavy) out += taperedArc(s.pts, o);
      else out += polyline(s.kind === 'line' ? [s.pts[0], s.pts[s.pts.length - 1]] : s.pts, o, s.heavy ? STYLE.heavy : STYLE.light);
      for (const x of s.extras) {
        if (x.type === 'circle') out += `<circle cx="${f(o.x + x.c.x * STYLE.k)}" cy="${f(o.y - x.c.y * STYLE.k)}" r="${f(x.r * STYLE.k)}" fill="none" stroke="${STYLE.ink}" stroke-width="${STYLE.light}"/>`;
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
export function cell(outline, { x, y, w, h, title, note, unsure, flag = 'UNSURE', lineY = 0.58, ruled = true, frame = true }) {
  const empty = !outline.elements.length;
  const bb = empty ? { x0: 0, x1: 0 } : bbox(outline.elements);
  const ly = y + h * lineY;
  const o = { x: x + w / 2 - ((bb.x0 + bb.x1) / 2) * STYLE.k, y: ly };
  let g = `<g>`;
  if (frame) g += `<rect x="${x + 4}" y="${y + 4}" width="${w - 8}" height="${h - 8}" rx="8" fill="#fff" stroke="${unsure ? '#d9822b' : '#d0d4da'}" stroke-width="${unsure ? 2 : 1}"/>`;
  if (ruled) g += `<line x1="${x + 18}" y1="${ly}" x2="${x + w - 18}" y2="${ly}" stroke="#6fa8dc" stroke-width="1.3"/>`;
  g += elementsToSvg(outline.elements, o);
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
