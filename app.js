import { cell, svgDoc } from './engine/render.js';
import { buildSample, sampleIndex, chartCells, allGrammalogues } from './engine/catalog.js';
import { SAMPLES } from './engine/words.js';

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const responsive = (svg) => svg.replace(/^<svg([^>]*?) width="\d+" height="\d+"/, '<svg$1');
const index = sampleIndex();
const grams = allGrammalogues();
const POS = { 1: '1st position – above the line', 2: '2nd position – on the line', 3: '3rd position – through the line' };
const badge = (g) => g.status === 'nys' ? '<span class="badge nys">NOT YET SUPPORTED</span>' : g.status === 'unsure' ? '<span class="badge">UNSURE</span>' : '';

function card(b) {
  const isG = !!b.kind;
  const svg = responsive(svgDoc(260, 300, cell(b.outline, { x: 0, y: 0, w: 260, h: 300, title: b.word, note: b.note, unsure: !!b.unsure, flag: b.flag, lineY: 0.58 })));
  const why = isG ? b.reason : b.unsure;
  return `<div class="card${b.unsure ? ' unsure' : ''}"><div class="svg">${svg}</div><div class="info">
    <h3>${esc(b.word)} ${isG ? badge(b) : b.unsure ? '<span class="badge">UNSURE</span>' : ''}</h3>
    ${isG ? `<p>${esc(b.kind === 'contraction' ? 'Contraction' : 'Grammalogue')}${b.pos ? ' · ' + esc(POS[b.pos]) : ''}</p><p>${esc(b.desc)}</p>`
      : b.note.filter(Boolean).map((n) => `<p>${esc(n)}</p>`).join('')}
    ${why ? `<p><b>${b.status === 'nys' ? 'Not drawn yet' : 'Why unsure'}:</b> ${esc(why)}</p>` : ''}
    ${isG ? `<p class="src">Checked against: ${esc(b.src.join(' · '))}</p>` : ''}
    ${b.outline.rules?.length ? `<p style="color:#666;font-size:.9rem">Rules applied: ${esc(b.outline.rules.join('; '))}</p>` : ''}
  </div></div>`;
}

function show(word) {
  const key = word.trim().toLowerCase().replace(/\s+/g, ' ');
  const res = $('#result');
  let hits = index.get(key) ?? [];
  // a grammalogue entry supersedes the older sample card for the same sign
  if (hits.some((h) => h.kind)) hits = hits.filter((h) => h.kind || !(h.sign || h.gram));
  document.querySelectorAll('.chip').forEach((c) => c.classList.toggle('sel', hits.some((h) => h.word === c.dataset.word)));
  if (!key) { res.innerHTML = ''; return; }
  if (!hits.length) {
    res.innerHTML = `<div class="msg">Sorry, “${esc(word.trim())}” isn’t supported yet. This early test only draws the words listed below and the grammalogues in the Grammalogues tab.</div>`;
    return;
  }
  res.innerHTML = hits.map((h) => card(h.kind ? h : buildSample(h))).join('');
}

$('#list').innerHTML = SAMPLES.map((s) => `<button class="chip" data-word="${esc(s.word)}">${esc(s.word)}${s.unsure ? '<span class="dot" title="UNSURE"></span>' : ''}</button>`).join('');
$('#list').addEventListener('click', (e) => {
  const b = e.target.closest('.chip'); if (!b) return;
  $('#q').value = b.dataset.word; show(b.dataset.word);
  $('#result').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});
$('#search').addEventListener('submit', (e) => { e.preventDefault(); show($('#q').value); });

// ---- Grammalogues tab
const gstate = { pos: 'all', kind: 'grammalogue', q: '' };
const gsvg = new Map();
function gramSvg(g) {
  if (!gsvg.has(g.id)) gsvg.set(g.id, responsive(svgDoc(180, 190, cell(g.outline, { x: 0, y: 0, w: 180, h: 190, title: '', note: [], lineY: 0.62, frame: false }))));
  return gsvg.get(g.id);
}
function renderGrams() {
  const q = gstate.q.trim().toLowerCase();
  const list = grams.filter((g) => g.kind === gstate.kind
    && (gstate.pos === 'all' || String(g.pos) === gstate.pos)
    && (!q || g.words.some((w) => w.toLowerCase().includes(q)) || g.desc.toLowerCase().includes(q)));
  const n = (st) => list.filter((g) => g.status === st).length;
  $('#gcount').textContent = `${list.length} shown · ${n('ok')} drawn · ${n('unsure')} unsure · ${n('nys')} not yet supported`;
  $('#ggrid').innerHTML = list.map((g) => `<button class="gcard ${g.status}" data-id="${esc(g.id)}" title="${esc(g.desc)}">
    ${g.status === 'nys' ? '<div class="nodraw">not drawn yet</div>' : `<div class="gsvg">${gramSvg(g)}</div>`}
    <div class="gw">${esc(g.word)}</div>
    <div class="gm">${g.pos ? ['', '1st', '2nd', '3rd'][g.pos] + ' · ' : ''}${esc(g.desc)}</div>${badge(g)}</button>`).join('') || '<div class="msg">No matches.</div>';
}
$('#gfilters').addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.pos) { gstate.pos = b.dataset.pos; if (gstate.kind === 'contraction') gstate.kind = 'grammalogue'; }
  if (b.dataset.kind) { gstate.kind = b.dataset.kind; if (b.dataset.kind === 'contraction') gstate.pos = 'all'; }
  document.querySelectorAll('#gfilters button').forEach((x) => x.classList.toggle('on', (x.dataset.pos && x.dataset.pos === gstate.pos && gstate.kind === 'grammalogue') || (x.dataset.kind === 'contraction' && gstate.kind === 'contraction')));
  renderGrams();
});
$('#gq').addEventListener('input', (e) => { gstate.q = e.target.value; renderGrams(); });
$('#ggrid').addEventListener('click', (e) => {
  const b = e.target.closest('.gcard'); if (!b) return;
  const g = grams.find((x) => x.id === b.dataset.id);
  document.querySelector('.tab[data-tab="words"]').click();
  $('#q').value = g.words[0]; $('#result').innerHTML = card(g);
  $('#result').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

let chartDone = false, gramDone = false;
document.querySelectorAll('.tab').forEach((t) => t.addEventListener('click', () => {
  document.querySelectorAll('.tab').forEach((x) => x.classList.toggle('active', x === t));
  document.querySelectorAll('.panel').forEach((p) => p.classList.toggle('active', p.id === t.dataset.tab));
  if (t.dataset.tab === 'chart' && !chartDone) {
    $('#chartgrid').innerHTML = chartCells().map((c) => responsive(svgDoc(170, 260, cell(c.outline, { x: 0, y: 0, w: 170, h: 260, title: c.title, note: c.note, lineY: 0.76 })))).join('');
    chartDone = true;
  }
  if (t.dataset.tab === 'grams' && !gramDone) { renderGrams(); gramDone = true; }
}));
// deep links: #w=<word>, #chart, #grams
const h = decodeURIComponent(location.hash.slice(1));
if (h === 'chart') document.querySelector('.tab[data-tab="chart"]').click();
if (h === 'grams') document.querySelector('.tab[data-tab="grams"]').click();
const start = h.startsWith('w=') ? h.slice(2) : 'pay';
$('#q').value = start; show(start);
