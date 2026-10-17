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
  W: { angle: 30, len: 1.18 }, //  we 30.3 deg, 65 px
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
  AR: { angle: -38, len: 1.28 }, // your -37.6 deg, 70.7 px
};
// attachments (radii / sizes in units). Hook, circle and shun sizes were then
// fitted by overlaying engine renders on the 115 printed grammalogue outlines
// (coordinate descent on the mean chamfer distance; ref/opt.py, local only).
export const CAL = {
  half: 0.58, //        median of yard .64, hand .70, wished .73, that .59, particular .61, quite .41
  doubleCurve: 1.6, //  therefore / there = 83 / 53
  double: 1.86, //      rather / are = 122 / 65.5
  hookSmall: 0.12, //    initial r / l hooks on straights, small hook on curves
  hookLarge: 0.17, //   large initial hook on curves (l)
  hookN: 0.09, //       final n hook
  hookF: 0.08, //       final f / v hook
  shun: 0.15, //        large final shun hook
  shunSmall: 0.1, //    small shun hook after circle s / ns
  circle: 0.125, //     small circle s (has 13 px centre-line diameter)
  bigCircle: 0.21, //   large circle ses
  loopST: [0.5, 0.13], // st loop: length, width (first 26 x 14 px)
  loopSTR: [0.68, 0.17],
  circleRadial: -20, // deg: how far a terminal circle sits beyond the stroke end (0 = tangent, 90 = on the extension)
  inHook: 0.16, //       large "in" hook before circle-in-hook
  wHook: 0.09, //       W / Y hook
  wHookLarge: 0.16, //  enlarged W hook (whether)
  hCircle: 0.1,
  light: 0.055, //      line widths (light 6 px, heavy 9-10 px in the list glyphs)
  heavy: 0.125,
};
