// Engine proportions. Angles fitted on the 2024 Instructor prints (Ch. I
// exercises and the grammalogue / contraction lists; scripts in ref/, local
// only); attachment sizes first fitted on the 1920 lists, then the 2024 ones.
// Unit 1 = the uniform stroke length. Angles are the
// chord directions as written (degrees, y up). Values are medians of the
// measured glyphs; see ref/ (local only) for the measurement scripts.
// 2024 Ch. I para 10 + Summary 6: "all the strokes should be made equal in
// length", "strokes must be of a uniform length". Every full-length stroke
// therefore has the same chord length UNIT (the T). The 2024 prints vary
// (horizontals print up to 1.4x a T), but a uniform length fits the 2024
// grammalogue / contraction lists better too (mean overlay 0.0201 vs 0.0206).
export const UNIT = 1.0;
export const GEOM = {
  // straight strokes            measured (list glyphs)
  // 2024 Chapter I fit (Ex 1-4 + para 12/13 overlays, ref/ch1, local only) cross-checked on the 2024 lists:
  P: { angle: -43, len: UNIT }, // 2024: Ex 2 -41, list 'put' -37 (was -47 from 1920)
  B: { angle: -43, len: UNIT },
  T: { angle: -90, len: UNIT }, //  it 55 px
  D: { angle: -90, len: UNIT }, //  had 52 px
  CH: { angle: -107, len: UNIT }, // 2024 Ex 2 -107, list 'much' -110 (text: '30 deg from the perpendicular')
  J: { angle: -107, len: UNIT },
  K: { angle: 0, len: UNIT }, //  the 2024 print draws K longer than T (Ex 2 1.3x); uniform by rule
  G: { angle: 0, len: UNIT },
  RAY: { angle: 30, len: UNIT }, // 2024 Ch. I para 12: "ray is always written up at an angle of 30 deg from the horizontal" (Srihari, round 3: follow the text; the 2024 print measures ~40)
  W: { angle: 42, len: UNIT, angleDouble: 40 }, // 2024 Ex 1-4 fit (was 30) //  we 30.3 deg, 65 px; doubled W (wonderful) 40 deg in the 2024 list
  WH: { angle: 40, len: UNIT }, // whether: 2024 list prints it steeper/shorter than we (overlay fit)
  Y: { angle: 38, len: UNIT }, //   2024 fit (was 30)
  H_UP: { angle: 42, len: UNIT }, // 2024 fit (was 30)
  H_DOWN: { angle: -103, len: UNIT }, // 2024 fit: a little steeper than CH (was -111)
  // curves (chord direction / chord length; quarter circles, sagitta 0.2)
  F: { angle: -43, len: UNIT }, // same slope as P (2024 Ch. I fit; uniform-length refit -39, kept parallel to P)
  V: { angle: -43, len: UNIT },
  TH: { angle: -90, len: UNIT }, // thank 55 px
  DH: { angle: -90, len: UNIT }, // same length as Z (Srihari, Ch. I slope diagram)
  S: { angle: -90, len: UNIT },
  Z: { angle: -90, len: UNIT },
  SH: { angle: -134, len: UNIT }, // same length as S (Srihari, Ch. I slope diagram)
  ZH: { angle: -134, len: UNIT },
  SH_UP: { angle: 46, len: UNIT },
  M: { angle: 0, len: UNIT },
  MP: { angle: 0, len: UNIT },
  N: { angle: 0, len: UNIT },
  NG: { angle: 0, len: UNIT },
  L: { angle: 46, len: UNIT }, //  2024 Ch. I fit 46 deg
  LD: { angle: -134, len: UNIT }, // downward L: the L chord written top to bottom
  AR: { angle: -42, len: UNIT }, // 2024 fit -42 (Ex 2 -40, list 'your' -37)
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
  circleRadial: 0, // deg: circle S/Z on a straight: 0 = tangent at the joint, so circle and stroke are one movement (Srihari, round 4; was -20 from the overlay fit, overlay change within +/-0.0001)
  medialFlow: false, // medial circle at an angle: false = centred on the bisector outside the angle, so it leaves the first stroke and enters the second symmetrically (tangent to the first only fitted the 2024 lists worse: 0.0211 vs 0.0210)
  inHook: 0.10, //       in- hook before skr / str (small hook opposite the circle; 2024 + 1920 fit)
  inHookSweep: 240, //  in- hook sweep (deg): tip curls back toward the stroke (closed blob)
  inCircleBack: 0, //   deg: circle after in- pushed back behind the stroke start (fit: 0 = beside it)
  joinedHorizSweep: 60, // deg: m / n / ng joined to other strokes (2024 Ch. I Ex 3-4 prints; 90 = quarter circle when alone)
  wHook: 0.11, //       W / Y hook (2024 Ch. I fit; was 0.09)
  wHookLarge: 0.21, //  enlarged W hook (whether; 2024 overlay fit)
  hCircle: 0.12, //    2024 Ch. I prints (was 0.1)
  hCircleBackUp: 0, // deg, upward H: 0 = the circle is tangent to the stroke at its start, one pen movement (Srihari, round 4; Ch. I overlay better than 45)
  hCircleBack: 0, // deg: downward H likewise tangent (90 = straight behind, 0 = beside it, on the right of the writing direction)
  // line widths. Print (1920 + 2024 lists): light ~6 px, heavy 10-12 px per 55 px
  // stroke (D of deliver 10-12 px = 0.18-0.22). Light stays thin for screen
  // legibility; heavy raised from 0.125 to the print value so thick strokes
  // read as heavy as in the book.
  light: 0.055,
  hookTaper: 1.2, //   hooks on heavy straights: heavy at the joint tapering to light at the tip (exponent)
  heavy: 0.145, //     Srihari, round 5: "too thick, slightly thinner" (was 0.18). 2024 print: heavy straights 0.12-0.16 of a stroke wide, light 0.087 (scan blur adds ~0.03)
  blendRamp: 0.25, //   light -> heavy straight: the heavy line swells from light width over this share of its length (Srihari, round 4; 2024 Ch. I Ex 3-4 prints)
};
