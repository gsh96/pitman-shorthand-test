// Vowel signs: New Era 12 simple vowels as dot/dash, light/heavy, place 1/2/3.
// ("Pa, may we all go too?" = long/heavy; "That pen is not much good" = short/light)
export const VOWELS = {
  ah: { mark: 'dot', heavy: true, place: 1, ex: 'pa' },
  a: { mark: 'dot', heavy: false, place: 1, ex: 'that' },
  ay: { mark: 'dot', heavy: true, place: 2, ex: 'may' },
  e: { mark: 'dot', heavy: false, place: 2, ex: 'pen' },
  ee: { mark: 'dot', heavy: true, place: 3, ex: 'we' },
  i: { mark: 'dot', heavy: false, place: 3, ex: 'is' },
  aw: { mark: 'dash', heavy: true, place: 1, ex: 'all' },
  o: { mark: 'dash', heavy: false, place: 1, ex: 'not' },
  oh: { mark: 'dash', heavy: true, place: 2, ex: 'go' },
  u: { mark: 'dash', heavy: false, place: 2, ex: 'much' },
  oo: { mark: 'dash', heavy: true, place: 3, ex: 'too' },
  uu: { mark: 'dash', heavy: false, place: 3, ex: 'good' },
};
export const isVowel = (t) => Object.prototype.hasOwnProperty.call(VOWELS, t);
