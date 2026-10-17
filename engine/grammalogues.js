// Pitman New Era grammalogues (logograms), contractions and short forms.
//
// Own data format, compiled from three public-domain New Era textbooks that
// were READ ONLY to verify the facts below (no scans or book text are used):
//   I20 = Pitman's Shorthand Instructor, New Era ed. (1920), archive.org
//         pitmansshorthand00pitm: phonetic grammalogue list book pp 291-292,
//         contractions list pp 293-296, vowel logograms p 17
//   W55 = Pitman's Shorthand Instructor (Wheeler, 1955), archive.org
//         in.ernet.dli.2015.459783: same lists, book pp 291-292
//   C24 = Course in Isaac Pitman Shorthand, Canadian New Era ed. (1924),
//         archive.org courseinisaacpit0000isaa: lesson list pp 178-179
//
// Each row: [form, description, words-by-position, options]
//   form   : token list for the stroke composer, or {sign: kind, heavy}
//            for detached signs; null when the engine cannot draw it
//   words  : "1 had; 2 do; 3 different, difference" (position: 1 above,
//            2 on, 3 through the line; horizontal 3rd = below the line)
//   options: { u: 'reason' } UNSURE, { nys: 'reason' } NOT YET SUPPORTED,
//            { p: page } (default book page of I20/W55), { c24: false }
//
// Token grammar: NAME[:half|:double][*][!][+r|+l][+n|+f|+shun]
//   * thickened, ! reversed curve, +r/+l initial hook, +n/+f/+shun final hook;
//   's' = small circle, 'ss' = large circle.
const P1 = 291, P2 = 292;
const HOOK_U = 'hook drawn from the rules; size not matched to print';
const HALF_HOOK_U = 'halved + hooked; proportions approx.';
const ROWS = [
  // ---- P / B
  [['P'], 'P', '3 put', {}],
  [['s', 'P'], 'circle s + P', '2 special, specially; 3 speak', {}],
  [['P+r'], 'P with initial r hook (pr)', '3 principle, principal, principally', { u: HOOK_U }],
  [['P+l'], 'P with initial l hook (pl)', '3 people', { u: HOOK_U }],
  [null, 'circle s inside r hook on P (spr) + final circle s', '1 surprise, surprised', { nys: 'circle inside initial hook (spr) not implemented' }],
  [['P:half+r'], 'half-length P, initial r hook (prt)', '1 particular; 2 opportunity', { u: HALF_HOOK_U }],
  [null, 'circle s inside r hook on half-length P (sprt)', '2 spirit', { nys: 'circle inside initial hook not implemented' }],
  [['B'], 'B', '2 be; 3 to be', {}],
  [['s', 'B'], 'circle s + B', '2 subject, subjected', {}],
  [['s', 'B+f'], 'circle s + B with final f/v hook', '2 subjective', { u: 'final f/v hook drawn from the rule (Left motion)' }],
  [null, 'circle s + B + shun hook', '2 subjection', { nys: 'shun hook on straight strokes not implemented' }],
  [['B+r'], 'B with initial r hook (br)', '1 liberty; 2 member, remember, remembered; 3 number, numbered', { u: HOOK_U }],
  [['B+l'], 'B with initial l hook (bl)', '3 belief, believe, believed', { u: HOOK_U }],
  [['B+f'], 'B with final f hook', '1 behalf', { u: 'final f/v hook drawn from the rule (Left motion)' }],
  [['B+n'], 'B with final n hook', '2 been', { u: 'final n hook drawn from the rule (Right motion)' }],
  [null, 'B with l hook, n hook and circle s', '1 balance', { nys: 'circle s inside a final hook not implemented' }],
  [['B:half+l'], 'half-length B, initial l hook (blt/bld)', '2 build, building', { u: HALF_HOOK_U }],
  // ---- T / D
  [['T'], 'T', '2 it', {}],
  [['T', 's'], 'T + circle s', '3 itself', {}],
  [['T+r'], 'T with initial r hook (tr)', '2 truth', { u: HOOK_U }],
  [['T:half+r'], 'half-length T, initial r hook', '1 tried; 2 toward, trade', { u: HALF_HOOK_U }],
  [['T:half+r', 's'], 'half-length T, initial r hook, final circle s', '2 towards', { u: HALF_HOOK_U }],
  [['T+l'], 'T with initial l hook (tl)', '2 tell; 3 till', { u: HOOK_U }],
  [['T:half+l'], 'half-length T, initial l hook', '2 told', { u: HALF_HOOK_U }],
  [null, 'circle s + T + n hook + circle s', '2 circumstance', { nys: 'circle inside final hook not implemented', c24: false }],
  [null, 'circle s + T + f hook + shun', '2 satisfaction', { nys: 'shun hook / compound hooks not implemented', c24: false }],
  [null, 'combined form (loop + hooks), not encoded', '2 instructive, instruction', { nys: 'loops and shun hook not implemented', c24: false }],
  [['D'], 'D', '1 had; 2 do; 3 different, difference', {}],
  [['D+r'], 'D with initial r hook (dr)', '1 Dr., doctor; 2 dear; 3 during', { u: HOOK_U }],
  [['D+l'], 'D with initial l hook (dl)', '2 deliver, delivered, delivery', { u: HOOK_U }],
  [['D+l+n'], 'D with initial l hook and final n hook', '2 deliverance', { u: 'final n hook drawn from the rule; any circle not shown in print at this size' }],
  [['D+f'], 'D with final f/v hook', '1 advantage; 3 difficult', { u: 'final f/v hook drawn from the rule (Left motion)' }],
  // ---- CH / J
  [['CH'], 'CH', '1 much; 2 which', {}],
  [['CH+r'], 'CH with initial r hook', '2 chair; 3 cheer', { u: HOOK_U, c24: false }],
  [['CH:half+r'], 'half-length CH, initial r hook', '1 chaired; 2 cheered', { u: HALF_HOOK_U, c24: false }],
  [['CH:half+l'], 'half-length CH, initial l hook', '1 child', { u: HALF_HOOK_U, c24: false }],
  [['J'], 'J', '1 large', {}],
  [['J+r'], 'J with initial r hook', '1 larger', { u: HOOK_U }],
  [['J+l'], 'J with initial l hook', '1 largely', { u: HOOK_U }],
  [['J+n'], 'J with final n hook', '2 general, generally', { u: 'final n hook drawn from the rule (Right motion)' }],
  [null, 'J + n hook + shun', '2 generalization', { nys: 'compound final hooks / shun not implemented', c24: false }],
  [null, 'J + s + f hook + shun', '2 justification', { nys: 'compound final hooks / shun not implemented', c24: false }],
  [['J:half+n'], 'half-length J with final n hook', '1 gentleman; 2 gentlemen', { u: 'final n hook on a half-length stroke drawn from the rule', c24: false }],
  // ---- K / G
  [['K'], 'K', '1 can; 2 come', {}],
  [['K', 's'], 'K + circle s', '1 because', {}],
  [['K+r'], 'K with initial r hook (kr)', '2 care', { u: HOOK_U }],
  [['K:half+r'], 'half-length K, initial r hook', '1 accord, according; 2 cared', { u: HALF_HOOK_U, c24: false }],
  [['K+l'], 'K with initial l hook (kl)', '1 call; 2 equal, equally', { u: HOOK_U }],
  [['K:half+l'], 'half-length K, initial l hook', '1 called; 2 equalled, cold', { u: HALF_HOOK_U, c24: false }],
  [null, 'circle s inside l hook on K (skl)', '2 school, schooled', { nys: 'circle inside initial hook not implemented', c24: false }],
  [['K:half'], 'half-length K', '1 quite; 2 could', {}],
  [['K+n'], 'K with final n hook', '1 cannot', { u: 'final n hook drawn from the rule (Right motion)', c24: false }],
  [null, 'multi-stroke form, not encoded', '1 inscribe, inscribed, inscription', { nys: 'multi-stroke form with circle-in-hook / shun not implemented', c24: false }],
  [['G'], 'G', '1 go; 2 give, given', {}],
  [['s', 'G'], 'circle s + G', '1 signify, signified, significant', {}],
  [['s', 'G', 's'], 'circle s + G + circle s', '1 significance', {}],
  [null, 'circle s + G + shun', '1 signification', { nys: 'shun hook on straight strokes not implemented', c24: false }],
  [['G:half+r'], 'half-length G, initial r hook', '1 guard; 2 great', { u: HALF_HOOK_U, c24: false }],
  [['G:half+l'], 'half-length G, initial l hook', '2 gold', { u: HALF_HOOK_U, c24: false }],
  // ---- F / V / TH / DH
  [['F'], 'F', '1 for', {}],
  [['F!+r'], 'reversed F with small initial hook (alternative fr form)', '2 from', { u: 'alternative (reversed) fr curve: shape approximated' }],
  [['V'], 'V', '2 have', { p: P2 }],
  [['s', 'V'], 'circle s + V', '2 several', { p: P2 }],
  [['V+r'], 'V with small initial hook inside (vr)', '1 over; 3 however', { u: HOOK_U, p: P2 }],
  [['V+l'], 'V with large initial hook inside (vl)', '1 valuation', { u: 'large hook drawn; any final shun not visible at print size', p: P2 }],
  [['V!+r'], 'reversed V with small initial hook (alternative vr form)', '2 very', { u: 'alternative (reversed) vr curve: shape approximated', p: P2 }],
  [['TH'], 'TH (ith)', '1 thank, thanked; 2 think', { p: P2 }],
  [['TH:half+r'], 'half-length TH with initial r hook', '2 third', { u: HALF_HOOK_U, p: P2, c24: false }],
  [['DH'], 'DH (thee)', '1 though; 2 them', { p: P2 }],
  [['DH', 's'], 'DH + circle s', '1 those, thyself; 2 this; 3 thus', { p: P2 }],
  [['DH', 'ss'], 'DH + large circle (ses)', '2 themselves', { u: 'large circle size approximate', p: P2 }],
  [['DH!+r'], 'reversed DH with small initial hook (alternative THr form)', '2 there, their', { u: 'alternative (reversed) THr curve: shape approximated', p: P2 }],
  [['DH+n'], 'DH with final n hook', '3 within', { u: 'final n hook inside curve, drawn from the rule', p: P2 }],
  [null, 'circle s + reversed THr + n hook', '2 southern', { nys: 'circle on a reversed hooked curve not implemented', p: P2 }],
  [['DH:half'], 'half-length DH', '1 that; 2 without', { p: P2 }],
  [null, 'reversed THr curve, double length', '3 therefore', { nys: 'doubled alternative THr form not implemented', p: P2 }],
  // ---- S / Z / SH / ZH
  [{ sign: 'circle' }, 'small circle s', '1 has, as; 2 his, is', { p: P2 }],
  [{ sign: 'bigcircle' }, 'large circle (ses)', '1 as is; 2 is as', { u: 'large circle size approximate', p: 'C24 178' }],
  [null, 'st loop', '2 first', { nys: 'st loop not implemented', p: P2 }],
  [['Z'], 'Z', '2 was; 3 whose', { p: P2 }],
  [['SH_UP'], 'SH (written upward when alone; looks the same)', '2 shall, shalt; 3 wish', { p: P2 }],
  [['SH_UP:half'], 'half-length SH', '2 wished', { p: P2, c24: false }],
  [['SH_UP', 's'], 'SH + circle s', '2 selfish, selfishness', { u: 'circle placement on upward SH approximate', p: P2, c24: false }],
  [['SH+r'], 'downward SH with initial r hook (shr)', '3 sure', { u: HOOK_U, p: P2 }],
  [['SH:half+r'], 'half-length downward SH, initial r hook', '1 short', { u: HALF_HOOK_U, p: P2, c24: false }],
  [['ZH'], 'ZH', '2 usual, usually', { p: P2 }],
  [['ZH+r'], 'ZH with initial r hook', '2 pleasure', { u: HOOK_U, p: P2 }],
  // ---- M / N / NG
  [['M'], 'M', '1 me; 2 him', { p: P2 }],
  [['M', 's'], 'M + circle s', '1 myself; 2 himself', { p: P2 }],
  [null, 'M + st loop', '1 most', { nys: 'st loop not implemented', p: P2 }],
  [['M+r'], 'M with small initial hook (mr)', '1 more, remark, remarked; 2 Mr., mere', { u: HOOK_U, p: P2 }],
  [['MP'], 'MP (thickened M)', '1 important, importance; 2 improve, improved, improvement', { p: P2, c24: false }],
  [['MP', 's'], 'MP + circle s', '1 impossible', { p: P2, c24: false }],
  [['N'], 'N', '1 in, any; 3 own', { p: P2 }],
  [['N', 's'], 'N + circle s', '1 influence', { p: P2 }],
  [['N', 'ss'], 'N + large circle (ses)', '1 influences', { u: 'large circle size approximate', p: 'C24 178' }],
  [null, 'N + st loop', '1 influenced; 2 next', { nys: 'st loop not implemented', p: P2 }],
  [['N+r'], 'N with small initial hook (nr)', '1 nor; 2 near', { u: HOOK_U, p: P2 }],
  [['N+n'], 'N with final n hook', '2 opinion', { u: 'final n hook inside curve, drawn from the rule', p: P2 }],
  [['N+r+n'], 'N with initial r hook and final n hook', '1 northern', { u: 'hooks drawn from the rules', p: P2 }],
  [['N+shun'], 'N with shun hook', '1 information', { u: 'shun hook inside curve, size approximate', p: P2, c24: false }],
  [['N:half*'], 'half-length N, thickened (nd)', '1 hand; 2 under', { u: 'halving + thickening: weight approximate', p: P2, c24: false }],
  [['s', 'N:half'], 'circle s + half-length N', '1 sent', { p: P2 }],
  [['NG'], 'NG', '1 language, owing; 2 thing; 3 young', { p: P2 }],
  // ---- L / R / W
  [['L*'], 'L, thickened (ld)', '2 Lord', { u: 'thickened L: length/weight not confirmed', p: P2, c24: false }],
  [['AR'], 'Ar (downward R)', '2 your; 3 year', { p: P2 }],
  [['AR:half*'], 'half-length Ar, thickened (rd)', '1 yard; 2 word', { u: 'halving + thickening: weight approximate', p: P2, c24: false }],
  [['RAY'], 'Ray (upward R)', '2 are; 3 our, hour', { p: P2 }],
  [null, 'Ray-based form with circle, not encoded', '3 ourselves', { nys: 'circle + hooked continuation not implemented', p: P2 }],
  [['RAY:double'], 'Ray, double length', '2 rather, writer', { p: P2, c24: false }],
  [['W'], 'W', '2 we', { p: P2 }],
  [null, 'W with enlarged hook + final hook/circle', '2 whether', { nys: 'enlarged W hook not implemented', p: P2, c24: false }],
  [['W:double'], 'W, double length', '2 wonderful, wonderfully', { u: 'doubled W; a final hook may be missing', p: P2, c24: false }],
  // ---- vowel logograms (I20 p 17, list p 292)
  [{ sign: 'dot' }, 'light dot', '1 a, an; 2 the', { p: P2 }],
  [{ sign: 'dot', heavy: true }, 'heavy dot', '1 ah!; 2 aye, eh?', { p: P2, c24: false }],
  [{ sign: 'dash' }, 'light dash (slanting)', '1 of; 2 to', { p: P2 }],
  [{ sign: 'dash', heavy: true }, 'heavy dash (slanting)', '1 all; 2 two, too', { p: P2 }],
  [{ sign: 'vdash' }, 'light upright dash', '1 on; 2 but', { p: P2 }],
  [{ sign: 'vdash', heavy: true }, 'heavy upright dash', '1 O, oh!, owe; 2 he', { p: P2 }],
  [{ sign: 'tick' }, 'light tick, written upward', '1 and; 2 should', { p: P2 }],
  [{ sign: 'tick', heavy: true, angle: 60 }, 'heavy tick, written downward', '1 awe, ought, aught; 2 who', { p: P2 }],
  // ---- diphthong signs
  [{ sign: 'caret' }, 'ow diphthong sign', '2 how', { p: P2 }],
  [{ sign: 'semiL' }, 'small semicircle opening right', '1 with; 2 when', { p: P2 }],
  [{ sign: 'semiR' }, 'small semicircle opening left', '1 what; 2 would', { p: P2 }],
  [{ sign: 'cap' }, 'small semicircle opening down', '1 beyond; 2 you', { p: P2 }],
  [{ sign: 'angle' }, 'small right-angle sign', '1 why', { u: 'tiny sign in print; angle shape approximate', p: P2 }],
  // ---- 1924 Canadian course only
  [null, 'logogram (1924 course), not encoded', '1 dollar, dollars', { nys: '1924 course only; exact form not determined from the scan', p: 'C24 179', i20: false }],
  [null, 'contraction (1924 course), not encoded', '1 expect, expected; 1 unexpected', { nys: '1924 course only; multi-stroke contraction not encoded', p: 'C24 179', i20: false }],
  [null, 'contraction (1924 course), not encoded', '1 acknowledged', { nys: '1924 course only; multi-stroke contraction not encoded', p: 'C24 179', i20: false }],
];

// Contractions (I20 pp 293-296, alphabetical). Word list only: these are
// mostly multi-stroke outlines with features the engine does not have yet,
// so every one is NOT YET SUPPORTED. Page per initial-letter block.
const CONTRACTIONS = {
  293: 'acknowledge, administrator, administratrix, advertise-d-ment, altogether, amalgamate, amalgamation, anything, arbitrary, arbitrate, arbitration, arbitrator, bankruptcy, capable, certificate, character, characteristic, circumstantial, commercial-ly, cross-examination, cross-examine-d, defective, deficient-ly-cy, denomination-al, description, difficulty, discharge-d, distinguish-ed, efficient-ly-cy, electric, electrical, electricity, England, English, Englishman, enlarge, enlarger, enthusiastic-iasm, especial-ly, esquire, establish-ed-ment, everything, exchange-d',
  294: 'executive, executor, executrix, expediency, expenditure, expensive, extinguish-ed, falsification, familiar-ity, familiarization, familiarize, February, financial-ly, govern-ed, government, howsoever, identical, identification, immediate, imperturbable, incandescence, incandescent, inconsiderate, inconvenience-t-ly, incorporated, independent-ly-ce, indispensable-ly, individual-ly, influential-ly, inform-ed, informer, inspect-ed-ion, insurance, intelligence, intelligent-ly, intelligible-ly, interest, investigation, investment, irrecoverable-ly, irregular, irremovable-ly, irresponsible-ility, January, knowledge, legislative, legislature',
  295: 'magnetic-ism, manufacture-d, manufacturer, marconigram, mathematical-ly, mathematician, mathematics, maximum, mechanical-ly, metropolitan, minimum, misfortune, mortgage-d, neglect-ed, negligence, never, nevertheless, nothing, notwithstanding, November, organization, organize-d, organizer, parliamentary, peculiar-ity, perform-ed, performance, performer, perpendicular, practicable, practice, practise-d, prejudice-d-ial-ly, preliminary, probable-ly-ility, proficient-ly-cy, proportion-ed, proportionate-ly, prospectus, public, publication, publish-ed, publisher, questionable-ly, ratepayers, recoverable, reform-ed',
  296: 'reformer, regular, relinquish-ed, remarkable-ly, removable, represent-ed, representation, representative, republic, republican, responsible-ility, satisfactory, sensible-ly-ility, something, subscribe-d, subscription, substantial-ly, sufficient-ly-cy, sympathetic, telegram, telegraphic, thankful-ly, together, unanimity, unanimous-ly, uniform-ity-ly, universal-ly, universality, universe, university, unprincipled, whatever, whenever, whensoever, whereinsoever, wheresoever, whithersoever, yesterday',
};
// contractions that also appear in the 1924 course lesson list (pp 178-179)
const C24_CONTRACTIONS = new Set(['acknowledge', 'knowledge', 'anything', 'something', 'nothing', 'establish-ed-ment', 'altogether', 'together', 'insurance', 'January', 'February', 'November', 'never', 'yesterday', 'regular', 'irregular', 'remarkable-ly', 'difficulty']);
// grammalogues missing from the 1924 lesson list (beyond those flagged c24:false above)
const NOT_C24 = new Set(['ah!', 'aye', 'eh?', 'remark', 'remarked', 'Mr.', 'mere', 'thank', 'thanked', 'principle', 'shalt', 'thyself', 'to be']);

function parseWords(spec) {
  return spec.split(';').map((g) => g.trim()).filter(Boolean).map((g) => {
    const m = /^([123])\s+(.*)$/.exec(g);
    return { pos: +m[1], words: m[2].split(',').map((w) => w.trim()).filter(Boolean) };
  });
}
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');

/** Flat list: one entry per (form, position). */
export function grammalogueEntries() {
  const out = [];
  for (const [form, desc, spec, o] of ROWS) {
    for (const { pos, words } of parseWords(spec)) {
      const src = [];
      const page = o.p ?? P1;
      if (typeof page === 'number') src.push(`I20 p.${page}`, `W55 p.${page}`);
      if (typeof page === 'string') src.push(page);
      const c24 = o.c24 !== false && words.some((w) => !NOT_C24.has(w));
      if (c24 && !src.some((s) => s.startsWith('C24'))) src.push('C24 pp.178-179');
      const status = !form ? 'nys' : o.nys ? 'nys' : o.u ? 'unsure' : 'ok';
      out.push({
        id: slug(words[0]) + '_' + pos, kind: 'grammalogue', words, pos, desc,
        tokens: Array.isArray(form) ? form : null,
        sign: form && !Array.isArray(form) ? { kind: form.sign, heavy: !!form.heavy, angle: form.angle } : null,
        status, reason: o.nys || o.u || '', src,
      });
    }
  }
  for (const [page, list] of Object.entries(CONTRACTIONS)) {
    for (const w of list.split(',').map((x) => x.trim())) {
      out.push({
        id: 'c_' + slug(w), kind: 'contraction', words: [w], pos: null, desc: 'contraction (multi-stroke short form)',
        tokens: null, sign: null, status: 'nys', reason: 'contraction outline not yet encoded',
        src: [`I20 p.${page}`, ...(C24_CONTRACTIONS.has(w) ? ['C24 pp.178-179'] : [])],
      });
    }
  }
  return out;
}
