import { cell, svgDoc } from './engine/render.js';
import { buildSample, sampleIndex, chartCells } from './engine/catalog.js';
import { SAMPLES } from './engine/words.js';

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const responsive = (svg) => svg.replace(/^<svg([^>]*?) width="\d+" height="\d+"/, '<svg$1');
const index = sampleIndex();

function show(word) {
  const key = word.trim().toLowerCase().replace(/\s+/g, ' ');
  const res = $('#result');
  document.querySelectorAll('.chip').forEach((c) => c.classList.toggle('sel', c.dataset.word.toLowerCase() === (index.get(key)?.word || '').toLowerCase()));
  if (!key) { res.innerHTML = ''; return; }
  const s = index.get(key);
  if (!s) {
    res.innerHTML = `<div class="msg">Sorry, “${esc(word.trim())}” isn’t supported yet. This early test only draws the words listed below – please pick one of those.</div>`;
    return;
  }
  const b = buildSample(s);
  const svg = responsive(svgDoc(260, 300, cell(b.outline, { x: 0, y: 0, w: 260, h: 300, title: b.word, note: b.note, unsure: !!b.unsure, lineY: 0.58 })));
  res.innerHTML = `<div class="card${b.unsure ? ' unsure' : ''}"><div class="svg">${svg}</div><div class="info">
    <h3>${esc(b.word)} ${b.unsure ? '<span class="badge">UNSURE</span>' : ''}</h3>
    ${b.note.filter(Boolean).map((n) => `<p>${esc(n)}</p>`).join('')}
    ${b.unsure ? `<p><b>Why unsure:</b> ${esc(b.unsure)}</p>` : ''}
    ${b.outline.rules.length ? `<p style="color:#666;font-size:.9rem">Rules applied: ${esc(b.outline.rules.join('; '))}</p>` : ''}
  </div></div>`;
}

$('#list').innerHTML = SAMPLES.map((s) => `<button class="chip" data-word="${esc(s.word)}">${esc(s.word)}${s.unsure ? '<span class="dot" title="UNSURE"></span>' : ''}</button>`).join('');
$('#list').addEventListener('click', (e) => {
  const b = e.target.closest('.chip'); if (!b) return;
  $('#q').value = b.dataset.word; show(b.dataset.word);
  $('#result').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});
$('#search').addEventListener('submit', (e) => { e.preventDefault(); show($('#q').value); });

let chartDone = false;
document.querySelectorAll('.tab').forEach((t) => t.addEventListener('click', () => {
  document.querySelectorAll('.tab').forEach((x) => x.classList.toggle('active', x === t));
  document.querySelectorAll('.panel').forEach((p) => p.classList.toggle('active', p.id === t.dataset.tab));
  if (t.dataset.tab === 'chart' && !chartDone) {
    $('#chartgrid').innerHTML = chartCells().map((c) => responsive(svgDoc(170, 260, cell(c.outline, { x: 0, y: 0, w: 170, h: 260, title: c.title, note: c.note, lineY: 0.76 })))).join('');
    chartDone = true;
  }
}));
// deep links: #w=<word> or #chart
const h = decodeURIComponent(location.hash.slice(1));
if (h === 'chart') document.querySelector('.tab[data-tab="chart"]').click();
const start = h.startsWith('w=') ? h.slice(2) : 'pay';
$('#q').value = start; show(start);
