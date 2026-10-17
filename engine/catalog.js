// Shared by the Node build and the browser app: builds outlines + notes for
// the sample words and the consonant chart. No Node-only APIs here.
import { STROKES } from './strokes.js';
import { composeOutline, composeSign, vowelMark } from './composer.js';
import { VOWELS } from './vowels.js';
import { SAMPLES } from './words.js';

export const posName = { 1: 'above line', 2: 'on line', 3: 'through line' };
const strokeLabel = { RAY: 'Ray', AR: 'Ar', H_UP: 'H up', H_DOWN: 'H down', SH_UP: 'SH up' };
const sl = (n) => { const [b, l] = n.split(':'); return (strokeLabel[b] || b) + (l ? ` (${l})` : ''); };

export function buildSample(s) {
  let o, note;
  if (s.sign) {
    o = composeSign(...s.sign);
    note = [s.note, 'grammalogue'];
  } else {
    o = composeOutline(s.tokens, { position: s.position, vowels: !s.gram });
    const vow = s.tokens.filter((t) => VOWELS[t]).map((t) => `${t} ${VOWELS[t].heavy ? 'hvy' : 'lt'} ${VOWELS[t].mark} ${VOWELS[t].place}`);
    note = [o.strokes.map(sl).join(' + ') + (s.tokens.includes('s') ? ' + circle s' : '') + (s.tokens.includes('THE') ? ' + tick the' : ''),
      (s.gram ? 'grammalogue, ' : vow.length ? vow.join('; ') + ', ' : '') + posName[o.position]];
    if (s.extra) note.push(s.extra);
  }
  return { ...s, outline: o, note, file: s.word.replace(/[^a-z]+/gi, '_').replace(/^_|_$/g, '') };
}
export const allSamples = () => SAMPLES.map(buildSample);

/** lookup keys: "a / an" -> ["a","an","a / an"] */
export function sampleIndex() {
  const idx = new Map();
  for (const s of SAMPLES) {
    idx.set(s.word.toLowerCase(), s);
    for (const part of s.word.split('/')) idx.set(part.trim().toLowerCase(), s);
  }
  return idx;
}

const CHART = [
  ['P', 'down'], ['B', 'down'], ['T', 'down'], ['D', 'down'], ['CH', 'down'], ['J', 'down'], ['K', 'left→right'], ['G', 'left→right'],
  ['F', 'down'], ['V', 'down'], ['TH', 'down (ith)'], ['DH', 'down (thee)'], ['S', 'down'], ['Z', 'down'], ['SH', 'down'], ['ZH', 'down'],
  ['M', 'left→right'], ['N', 'left→right'], ['NG', 'left→right'], ['L', 'up'], ['RAY', 'R up (Ray)'], ['AR', 'R down (Ar)'], ['W', 'up'], ['Y', 'up'],
  ['H_UP', 'H up'], ['H_DOWN', 'H down'], ['SH_UP', 'SH up (before F/V)'],
];
export function chartCells() {
  const cells = CHART.map(([n, d]) => ({ title: strokeLabel[n] || n, note: [d, STROKES[n].heavy ? 'heavy' : 'light'], outline: composeOutline([n], { position: 2, vowels: false }), file: n }));
  for (const L of ['half', 'normal', 'double']) cells.push({ title: `T ${L}`, note: ['length variant'], outline: composeOutline([`T:${L}`], { position: 2, vowels: false }), file: `T_${L}` });
  for (const L of ['half', 'double']) cells.push({ title: `F ${L}`, note: ['length variant'], outline: composeOutline([`F:${L}`], { position: 2, vowels: false }), file: `F_${L}` });
  const base = composeOutline(['T'], { position: 2, vowels: false });
  const t = base.elements[0].stroke;
  const els = [...base.elements, ...['ah', 'ay', 'ee'].map((k) => vowelMark(t, k, 'before')), ...['o', 'u', 'uu'].map((k) => vowelMark(t, k, 'after'))];
  cells.push({ title: 'vowel places', note: ['left: ah ay ee (before)', 'right: o u uu (after)'], outline: { elements: els }, file: 'vowel_places' });
  return cells;
}
