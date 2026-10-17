// Engine proportions, calibrated against the printed outlines of the 1920
// New Era Instructor (grammalogue list, book pp 291-292, and the stroke
// samples of ch. I), measured on 600-dpi renders of the public-domain scan.
// Unit 1 = length of a normal T (55 px in the list glyphs). Angles are the
// chord directions as written (degrees, y up). Values are medians of the
// measured glyphs; see ref/ (local only) for the measurement scripts.
export const GEOM = {
  // straight strokes            measured (list glyphs)
  P: { angle: -47, len: 1.18 }, // put -47.5 / be -48.2; 74 / 68 px alone, shorter in compounds (overlay fit 1.1-1.2)
  B: { angle: -47, len: 1.18 },
  T: { angle: -90, len: 1.0 }, //  it 55 px
  D: { angle: -90, len: 1.0 }, //  had 52 px
  CH: { angle: -111, len: 1.0 }, // much -110.2 / large -112.6; 55 / 56 px
  J: { angle: -111, len: 1.0 },
  K: { angle: 0, len: 1.0 }, //   can 55 px
  G: { angle: 0, len: 1.0 }, //   go 49 px (heavy; drawn as K)
  RAY: { angle: 29.5, len: 1.19 }, // are 29.4 deg, 65.5 px
  W: { angle: 30, len: 1.18, angleDouble: 40 }, //  we 30.3 deg, 65 px; doubled W (wonderful) 40 deg in the 2024 list
  WH: { angle: 40, len: 1.05 }, // whether: 2024 list prints it steeper/shorter than we (overlay fit)
  Y: { angle: 30, len: 1.18 },
  H_UP: { angle: 30, len: 1.18 },
  H_DOWN: { angle: -111, len: 1.0 },
  // curves (chord direction / chord length; quarter circles, sagitta 0.2)
  F: { angle: -43, len: 1.15 }, // for -47.3 / have -39.4; 63 px
  V: { angle: -43, len: 1.15 },
  TH: { angle: -90, len: 1.0 }, // thank 55 px
  DH: { angle: -90, len: 0.95 }, // though 45-55 px
  S: { angle: -90, len: 1.15 }, // was 63 px
  Z: { angle: -90, len: 1.15 },
  SH: { angle: -134, len: 1.22 }, // shall 46.1 / usual 47.0 (upward); 63.5 / 70.7 px
  ZH: { angle: -134, len: 1.22 },
  SH_UP: { angle: 46, len: 1.22 },
  M: { angle: 0, len: 0.97 }, //   me 52 px
  MP: { angle: 0, len: 0.97 },
  N: { angle: 0, len: 0.97 }, //   in 53.5 px
  NG: { angle: 0, len: 0.97 }, //  language 50 px
  L: { angle: 46, len: 1.3 }, //   Lord 46.0 deg, 72 px
  LD: { angle: -134, len: 1.3 }, // downward L: the L chord written top to bottom
  AR: { angle: -38, len: 1.28 }, // your -37.6 deg, 70.7 px
};
// attachments (radii / sizes in units). Hook, circle and shun sizes were then
// fitted by overlaying engine renders on the 115 printed grammalogue outlines
// (coordinate descent on the mean chamfer distance; ref/opt.py, local only).
export const CAL = {
  half: 0.58, //        median of yard .64, hand .70, wished .73, that .59, particular .61, quite .41
  // per-stroke half-length overrides: K/G fitted on the 2024 list (quite, accord,
  // cared, called, equalled, schooled, guard, gold): 0.45-0.50 of a full K
  halfBy: { K: 0.48, G: 0.48 },
  doubleBy: { W: 1.8 }, // per-stroke double-length overrides (wonderful, 2024 fit)
  doubleCurve: 1.6, //  therefore / there = 83 / 53
  double: 1.86, //      rather / are = 122 / 65.5
  hookSmall: 0.12, //    initial r / l hooks on straights, small hook on curves
  hookLarge: 0.17, //   large initial hook on curves (l)
  hookN: 0.12, //       final n hook (2024 overlay fit: been, cannot, general, opinion, within ...)
  hookF: 0.13, //       final f / v hook (2024 fit 0.16, 1920 fit 0.12: behalf, subjective, advantage)
  shun: 0.19, //        large final shun hook (2024 + 1920 fit: subjection, signification, information)
  shunSmall: 0.1, //    small shun hook after circle s / ns
  hookTail: 1.25,//       straight return leg of final n / f hooks (x hook radius)
  shunTail: 1.2, //       straight return leg of the shun hook (x radius)
  circle: 0.125, //     small circle s (has 13 px centre-line diameter)
  bigCircle: 0.21, //   large circle ses
  loopST: [0.6, 0.15], // st loop length, width: 2024 fit (first, most, influenced, next); was 0.5 x 0.13
  loopSTR: [0.68, 0.17],
  circleRadial: -20, // deg: how far a terminal circle sits beyond the stroke end (0 = tangent, 90 = on the extension)
  inHook: 0.16, //       large "in" hook before circle-in-hook
  wHook: 0.09, //       W / Y hook
  wHookLarge: 0.21, //  enlarged W hook (whether; 2024 overlay fit)
  hCircle: 0.1,
  // line widths. Print (1920 + 2024 lists): light ~6 px, heavy 10-12 px per 55 px
  // stroke (D of deliver 10-12 px = 0.18-0.22). Light stays thin for screen
  // legibility; heavy raised from 0.125 to the print value so thick strokes
  // read as heavy as in the book.
  light: 0.055,
  heavy: 0.18,
};
