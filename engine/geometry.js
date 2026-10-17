// Minimal 2D vector helpers. Engine coordinates are "paper" coordinates in
// stroke units (1 = one standard Pitman stroke), y pointing UP. The SVG
// renderer flips y.
export const deg = (a) => (a * Math.PI) / 180;
export const v = (x, y) => ({ x, y });
export const add = (a, b) => v(a.x + b.x, a.y + b.y);
export const sub = (a, b) => v(a.x - b.x, a.y - b.y);
export const mul = (a, k) => v(a.x * k, a.y * k);
export const len = (a) => Math.hypot(a.x, a.y);
export const norm = (a) => { const l = len(a) || 1; return v(a.x / l, a.y / l); };
export const dot = (a, b) => a.x * b.x + a.y * b.y;
export const rot = (a, rad) => v(a.x * Math.cos(rad) - a.y * Math.sin(rad), a.x * Math.sin(rad) + a.y * Math.cos(rad));
export const perpL = (a) => v(-a.y, a.x); // left of travel direction
export const perpR = (a) => v(a.y, -a.x); // right of travel direction
export const fromAngle = (a) => v(Math.cos(deg(a)), Math.sin(deg(a)));
export const lerp = (a, b, t) => v(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
