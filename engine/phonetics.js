// Sound, name and writing direction of every consonant stroke. Example words
// are our own (not the book's). Directions follow the 2024 Instructor rules:
// thick strokes are never written upward; chay down, ray up; l mostly up;
// sh down when standing alone or after a straight stroke (it may be written
// upward when joined, Ch. XIX); h up or down.
export const STROKE_INFO = {
  P: { ipa: 'p', name: 'pee', ex: 'pig', dir: 'down' },
  B: { ipa: 'b', name: 'bee', ex: 'bag', dir: 'down' },
  T: { ipa: 't', name: 'tee', ex: 'toe', dir: 'down' },
  D: { ipa: 'd', name: 'dee', ex: 'dog', dir: 'down' },
  CH: { ipa: 'tʃ', name: 'chay', ex: 'chin', dir: 'down' },
  J: { ipa: 'dʒ', name: 'jay', ex: 'jam', dir: 'down' },
  K: { ipa: 'k', name: 'kay', ex: 'kit', dir: 'right' },
  G: { ipa: 'ɡ', name: 'gay', ex: 'gum', dir: 'right' },
  F: { ipa: 'f', name: 'ef', ex: 'fan', dir: 'down' },
  V: { ipa: 'v', name: 'vee', ex: 'van', dir: 'down' },
  TH: { ipa: 'θ', name: 'ith', ex: 'thumb', dir: 'down' },
  DH: { ipa: 'ð', name: 'thee', ex: 'mother', dir: 'down' },
  S: { ipa: 's', name: 'ess', ex: 'sun', dir: 'down' },
  Z: { ipa: 'z', name: 'zee', ex: 'zoo', dir: 'down' },
  SH: { ipa: 'ʃ', name: 'ish', ex: 'ship', dir: 'down', dirNote: 'downward here; when joined to another curve it may be written upward (Ch. XIX)' },
  SH_UP: { ipa: 'ʃ', name: 'ish (up)', ex: 'ship', dir: 'up', dirNote: 'upward form (Ch. XIX)' },
  ZH: { ipa: 'ʒ', name: 'zhee', ex: 'measure', dir: 'down', dirNote: 'always downward (thick strokes are never written upward)' },
  M: { ipa: 'm', name: 'em', ex: 'map', dir: 'right' },
  MP: { ipa: 'mp', name: 'emp', ex: 'lamp', dir: 'right' },
  N: { ipa: 'n', name: 'en', ex: 'nut', dir: 'right' },
  NG: { ipa: 'ŋ', name: 'ing', ex: 'sing', dir: 'right' },
  L: { ipa: 'l', name: 'el', ex: 'leg', dir: 'up', dirNote: 'usually upward; downward in some joinings (later chapters)' },
  LD: { ipa: 'l', name: 'el (down)', ex: 'leg', dir: 'down' },
  RAY: { ipa: 'r', name: 'ray', ex: 'rat', dir: 'up' },
  AR: { ipa: 'r', name: 'ar', ex: 'very', dir: 'down' },
  W: { ipa: 'w', name: 'way', ex: 'win', dir: 'up' },
  WH: { ipa: 'hw', name: 'whay', ex: 'whip', dir: 'up' },
  Y: { ipa: 'j', name: 'yay', ex: 'yes', dir: 'up' },
  H_UP: { ipa: 'h', name: 'hay (up)', ex: 'hum', dir: 'up' },
  H_DOWN: { ipa: 'h', name: 'hay (down)', ex: 'hum', dir: 'down' },
};
export const DIR_TEXT = { down: 'written downward', up: 'written upward', right: 'written left to right' };
export const DIR_ARROW = { down: '↓', up: '↑', right: '→' };
