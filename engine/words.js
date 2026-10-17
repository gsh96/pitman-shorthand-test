// Sample outlines. `tokens` go through the rules-based composer; `sign`
// entries are detached logograms. `unsure` = reason the shape/position is
// not verified against a New Era textbook.
export const SAMPLES = [
  { word: 'pay', tokens: ['P', 'ay'] },
  { word: 'bay', tokens: ['B', 'ay'] },
  { word: 'tea', tokens: ['T', 'ee'] },
  { word: 'day', tokens: ['D', 'ay'] },
  { word: 'came', tokens: ['K', 'ay', 'M'] },
  { word: 'fee', tokens: ['F', 'ee'] },
  { word: 'see', tokens: ['S', 'ee'] },
  { word: 'so', tokens: ['S', 'oh'] },
  { word: 'may', tokens: ['M', 'ay'] },
  { word: 'no', tokens: ['N', 'oh'], extra: 'written out (not a grammalogue)' },
  { word: 'ray', tokens: ['R', 'ay'] },
  { word: 'air', tokens: ['ay', 'R'] },
  { word: 'tape', tokens: ['T', 'ay', 'P'] },
  { word: 'fade', tokens: ['F', 'ay', 'D'] },
  { word: 'pays', tokens: ['P', 'ay', 's'] },
  { word: 'pay the', tokens: ['P', 'ay', 'THE'], extra: 'tick-the phrase' },
  // grammalogues (logograms). Verified against three public-domain New Era
  // sources: Pitman's Shorthand Instructor, New Era ed. (1920, archive.org
  // pitmansshorthand00pitm, book pp 17, 289-292); Wheeler 1955 Instructor
  // (archive.org in.ernet.dli.2015.459783, book pp 17, 289-292); Canadian New
  // Era Course 1924 (archive.org courseinisaacpit0000isaa, book pp 178-179).
  { word: 'a / an', sign: ['dot', { heavy: false, pos: 1 }], note: 'light dot, above line' },
  { word: 'the', sign: ['dot', { heavy: false, pos: 2 }], note: 'light dot, on line' },
  { word: 'he', sign: ['vdash', { heavy: true, pos: 2 }], note: 'heavy upright dash, on line' },
  { word: 'and', sign: ['tick', { heavy: false, pos: 1 }], note: 'light tick (up), above line' },
  { word: 'of', sign: ['dash', { heavy: false, pos: 1 }], note: 'light dash, above line' },
  { word: 'to', sign: ['dash', { heavy: false, pos: 2 }], note: 'light dash, on line' },
  { word: 'all', sign: ['dash', { heavy: true, pos: 1 }], note: 'heavy dash, above line' },
  { word: 'two / too', sign: ['dash', { heavy: true, pos: 2 }], note: 'heavy dash, on line' },
  { word: 'it', tokens: ['T'], position: 2, gram: true },
  { word: 'be', tokens: ['B'], position: 2, gram: true },
  { word: 'do', tokens: ['D'], position: 2, gram: true },
  { word: 'which', tokens: ['CH'], position: 2, gram: true },
  { word: 'have', tokens: ['V'], position: 2, gram: true },
  { word: 'is / his', sign: ['circle', { pos: 2 }], note: 'small circle s, on line' },
  // not a grammalogue in any of the three sources above
  { word: 'will', tokens: ['WL', 'i'], position: 3, extra: 'full outline (not a grammalogue)', unsure: 'not in the New Era grammalogue lists, so written in full as Wel (hooked upward L) + short i; hook shape, vowel and position still to be confirmed' },
];
