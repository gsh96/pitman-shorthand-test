// Engine proportions, calibrated against the printed outlines of the 1920
// New Era Instructor (grammalogue list, book pp 291-292, and the stroke
// samples of ch. I), measured on 600-dpi renders of the public-domain scan.
// Unit 1 = length of a normal T (55 px in the list glyphs). Angles are the
// chord directions as written (degrees, y up). Values are medians of the
// measured glyphs; see ref/ (local only) for the measurement scripts.
export const GEOM = {
  // straight strokes            measured (list glyphs)
  // 2024 Chapter I fit (Ex 1-4 + para 12/13 overlays, ref/ch1, local only) cross-checked on the 2024 lists:
  P: { angle: -43, len: 1.18 }, // 2024: Ex 2 -41, list 'put' -37 (was -47 from 1920)
  B: { angle: -43, len: 1.18 },
  T: { angle: -90, len: 1.0 }, //  it 55 px
  D: { angle: -90, len: 1.0 }, //  had 52 px
  CH: { angle: -107, len: 1.0 }, // 2024 Ex 2 -107, list 'much' -110 (text: '30 deg from the perpendicular')
  J: { angle: -107, len: 1.0 },
  K: { angle: 0, len: 1.16 }, //  2024: K prints longer than T (Ex 2 1.3x, list 'can' 1.25x); fit 1.16
  G: { angle: 0, len: 1.16 },
  RAY: { angle: 41.5, len: 1.19 }, // 2024 print ~40 deg (Ex 1-4, list 'are' 40.7); the text says 30 deg, the 1920 print 29.4
  W: { angle: 42, len: 1.18, angleDouble: 40 }, // 2024 Ex 1-4 fit (was 30) //  we 30.3 deg, 65 px; doubled W (wonderful) 40 deg in the 2024 list
  WH: { angle: 40, len: 1.05 }, // whether: 2024 list prints it steeper/shorter than we (overlay fit)
  Y: { angle: 38, len: 1.18 }, //   2024 fit (was 30)
  H_UP: { angle: 42, len: 1.1 }, // 2024 fit (was 30 / 1.18)
  H_DOWN: { angle: -103, len: 1.0 }, // 2024 fit: a little steeper than CH (was -111)
  // curves (chord direction / chord length; quarter circles, sagitta 0.2)
  F: { angle: -43, len: 1.07 }, // for -47.3 / have -39.4; 2024 fit length 1.07
  V: { angle: -43, len: 1.07 },
  TH: { angle: -90, len: 1.0 }, // thank 55 px
  DH: { angle: -90, len: 0.95 }, // though 45-55 px
  S: { angle: -90, len: 1.07 }, // 2024 fit 1.07 (was 1.15)
  Z: { angle: -90, len: 1.07 },
  SH: { angle: -134, len: 1.22 }, // shall 46.1 / usual 47.0 (upward); 63.5 / 70.7 px
  ZH: { angle: -134, len: 1.22 },
  SH_UP: { angle: 46, len: 1.22 },
  M: { angle: 0, len: 1.2 }, //   2024: Ex fit 1.29, list 'me' 1.15 -> 1.2 (best on both)
  MP: { angle: 0, len: 1.2 },
  N: { angle: 0, len: 1.13 }, //  2024 fit (was 0.97)
  NG: { angle: 0, len: 1.13 },
  L: { angle: 46, len: 1.22 }, //  Lord 46.0 deg; 2024 fit length 1.22
  LD: { angle: -134, len: 1.3 }, // downward L: the L chord written top to bottom
  AR: { angle: -42, len: 1.28 }, // 2024 fit -42 (Ex 2 -40, list 'your' -37)
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
  shunSmall: 0.13,//    small shun hook after circle s / ns
  shunSmallSweep: 110, // deg: small shun hook leaves the stroke end across to the other side and curls with the circle's motion (tail points away from the stroke start)
  hookTail: 1.25,//       straight return leg of final n / f hooks (x hook radius)
  shunTail: 1.2, //       straight return leg of the shun hook (x radius)
  circle: 0.125, //     small circle s (has 13 px centre-line diameter)
  bigCircle: 0.21, //   large circle ses
  loopST: [0.6, 0.15], // st loop length, width: 2024 fit (first, most, influenced, next); was 0.5 x 0.13
  loopSTR: [0.68, 0.17],
  circleRadial: -20, // deg: how far a terminal circle sits beyond the stroke end (0 = tangent, 90 = on the extension)
  inHook: 0.10, //       in- hook before skr / str (small hook opposite the circle; 2024 + 1920 fit)
  inHookSweep: 240, //  in- hook sweep (deg): tip curls back toward the stroke (closed blob)
  inCircleBack: 0, //   deg: circle after in- pushed back behind the stroke start (fit: 0 = beside it)
  wHook: 0.11, //       W / Y hook (2024 Ch. I fit; was 0.09)
  wHookLarge: 0.21, //  enlarged W hook (whether; 2024 overlay fit)
  hCircle: 0.12, //    2024 Ch. I prints (was 0.1)
  hCircleBack: 45, // deg: H circle position at the stroke start (90 = straight behind, 0 = beside it, on the right of the writing direction)
  // line widths. Print (1920 + 2024 lists): light ~6 px, heavy 10-12 px per 55 px
  // stroke (D of deliver 10-12 px = 0.18-0.22). Light stays thin for screen
  // legibility; heavy raised from 0.125 to the print value so thick strokes
  // read as heavy as in the book.
  light: 0.055,
  hookTaper: 1.2, //   hooks on heavy straights: heavy at the joint tapering to light at the tip (exponent)
  heavy: 0.18,
};
