// Project checklist. status: done | wip | todo. Optional 3rd item field overrides the group's category.
window.TRACKER = {
 "updated": "2026-10-18 15:30 IST",
 "phases": [
  {
   "id": "P0",
   "title": "Phase 0 — Foundation",
   "goal": "Working stroke engine, renderer and public test site.",
   "groups": [
    {
     "name": "Project setup",
     "items": [
      [
       "done",
       "Agree app vision, audience, platforms and v1 scope"
      ],
      [
       "done",
       "Decide rules-based engine with hand-drawn/scanned overrides"
      ],
      [
       "done",
       "Set copyright rules: books for private checking only; no scans/text in app or repo",
       "Legal & Launch"
      ],
      [
       "done",
       "Create GitHub repo gsh96/pitman-shorthand-test",
       "Technical"
      ],
      [
       "done",
       "Publish test site on GitHub Pages",
       "Technical"
      ],
      [
       "done",
       "Add 'Sources and copyright' note to README",
       "Legal & Launch"
      ],
      [
       "done",
       "Gitignore book crops, PDFs and comparison images",
       "Legal & Launch"
      ],
      [
       "todo",
       "Write project README: how to build, folder structure, data format",
       "Technical"
      ]
     ],
     "cat": "Project Management"
    },
    {
     "name": "Stroke engine",
     "items": [
      [
       "done",
       "Stroke library: all 24 consonant strokes, light and heavy"
      ],
      [
       "done",
       "Upward/downward forms (R/Ray, L, H, Sh)"
      ],
      [
       "done",
       "L written downward"
      ],
      [
       "done",
       "Half-length and double-length strokes"
      ],
      [
       "done",
       "Vowel signs: dots and dashes, light/heavy, 1st/2nd/3rd place"
      ],
      [
       "done",
       "Diphthong signs"
      ],
      [
       "done",
       "Outline position (above, on, through the line) from first vowel"
      ],
      [
       "done",
       "Joining strokes into multi-stroke outlines"
      ],
      [
       "done",
       "SVG renderer with thick/thin line weights"
      ],
      [
       "done",
       "Calibrate stroke lengths and angles against printed outlines"
      ],
      [
       "done",
       "Heavy strokes drawn properly thick"
      ],
      [
       "todo",
       "Hooks take the weight of their stroke (e.g. heavy B in 'believe')"
      ],
      [
       "todo",
       "Shun hook: correct side, size and joining in all cases"
      ],
      [
       "todo",
       "One stroke written through another (crossing contractions)"
      ],
      [
       "todo",
       "Compact closed in- hook with circle (inscribe, instruction)"
      ],
      [
       "todo",
       "Performance check: all outlines render in under 50 ms",
       "Technical"
      ]
     ],
     "cat": "Stroke Engine"
    },
    {
     "name": "Grammalogues & contractions",
     "items": [
      [
       "done",
       "Full New Era grammalogue list (192) in our own data format"
      ],
      [
       "done",
       "Full contractions list (175) in our own data format"
      ],
      [
       "done",
       "Fix it, have, the, he, and"
      ],
      [
       "done",
       "Check every entry against 2024 edition"
      ],
      [
       "done",
       "Fix whether, wonderful, next"
      ],
      [
       "done",
       "Fix 10 contractions (character, electric, England, establish, etc.)"
      ],
      [
       "done",
       "Grammalogues: 185 of 192 confirmed"
      ],
      [
       "done",
       "Contractions: 137 of 175 confirmed"
      ],
      [
       "todo",
       "Fix satisfaction"
      ],
      [
       "todo",
       "Fix inscribe, inscription, instructive, instruction"
      ],
      [
       "todo",
       "Clear remaining 7 unsure grammalogues"
      ],
      [
       "todo",
       "Clear remaining 38 unsure contractions"
      ],
      [
       "todo",
       "'will' outline — ON HOLD"
      ],
      [
       "todo",
       "Srihari signs off all grammalogues and contractions"
      ]
     ],
     "cat": "Outlines & Accuracy"
    },
    {
     "name": "Test site",
     "items": [
      [
       "done",
       "Grammalogues tab with search and position filters"
      ],
      [
       "done",
       "Stroke chart"
      ],
      [
       "done",
       "Review sheets for Srihari after each fix round",
       "Outlines & Accuracy"
      ],
      [
       "done",
       "Project tracker page (this page)",
       "Project Management"
      ]
     ],
     "cat": "UX & Design"
    }
   ]
  },
  {
   "id": "P1",
   "title": "Phase 1 — Private chapter-by-chapter check",
   "goal": "Prove every New Era rule against the 2024 edition, chapter by chapter, in a private review site.",
   "groups": [
    {
     "name": "Private review site",
     "items": [
      [
       "done",
       "Private review site: encrypted (password) build published to gsh96/pitman-review on GitHub Pages; no plaintext book content online"
      ],
      [
       "done",
       "Srihari views it with a password link (staticrypt, remembered 30 days on his device)"
      ],
      [
       "done",
       "Real 2024 chapter list (44 chapters with page ranges) read from the book contents"
      ],
      [
       "done",
       "Exercise view: word + large engine outline on ruled lines showing position; tap to animate stroke by stroke"
      ],
      [
       "done",
       "Mark each outline Correct / Wrong with a note (saved on his device)",
       "Outlines & Accuracy"
      ],
      [
       "done",
       "Export Srihari's marks (copy + download JSON) so fixes can be tracked"
      ],
      [
       "done",
       "Per-chapter score: % outlines marked correct",
       "Outlines & Accuracy"
      ],
      [
       "done",
       "Items the engine cannot draw shown honestly as \"not drawable yet: <rule needed>\"",
       "Outlines & Accuracy"
      ],
      [
       "wip",
       "Regression check: every rule fix re-checks all earlier chapters (local overlay check vs. 2024 print in place for Ch. I and the grammalogue list)",
       "Outlines & Accuracy"
      ],
      [
       "done",
       "Import Srihari's exported marks and turn every \"Wrong\" into an engine fix (round 1: 21 wrong + notes, Ch. I; fixes applied to all similar outlines)",
       "Outlines & Accuracy"
      ],
      [
       "done",
       "Round 2/3: Srihari re-checks the 100 changed Chapter I outlines (rounds 3-4 redrew some again: 101 badged; his 3 unchanged \"Correct\" marks kept)",
       "Outlines & Accuracy"
      ],
      [
       "done",
       "\"Changed since your last review\" badge; marks reset only for changed outlines",
       "Outlines & Accuracy"
      ],
      [
       "done",
       "Each unique outline shown once, with a note of where else it occurs",
       "Outlines & Accuracy"
      ],
      [
       "done",
       "Resolved (Srihari, round 3): an upstroke followed by a downstroke is written longer so the downstroke returns to the line, as printed (general engine rule)",
       "Outlines & Accuracy"
      ],
      [
       "done",
       "Resolved (Srihari, round 3): Ray at 30° as the 2024 text says (print ≈ 41°); W, Y and upward H keep their printed slopes (the text gives no angle for them)",
       "Outlines & Accuracy"
      ],
      [
       "done",
       "Engine: all strokes one uniform length (book ¶10)",
       "Outlines & Accuracy"
      ],
      [
       "done",
       "Engine: line-placement rule — first up/downstroke rests on the line (upstroke starts on it, downstroke ends on it); K, G, M, N, NG stay on the line",
       "Outlines & Accuracy"
      ],
      [
       "done",
       "Engine: H joins fixed (circle rests on the line); joined curves no longer overlap; flatter joined M/N",
       "Outlines & Accuracy"
      ],
      [
       "done",
       "Resolved (Srihari, round 3): the first stroke sets the placement; later strokes may cross or dip below the line (the keep-on-the-line lift no longer overrides it)",
       "Outlines & Accuracy"
      ],
      [
       "done",
       "Engine (Srihari, round 4): circles written in one movement with their stroke: H circle and circle S/Z touch the stroke at the joint and flow into or out of it along the writing direction (animation runs round the circle the same way)",
       "Outlines & Accuracy"
      ],
      [
       "done",
       "Renderer (Srihari, round 4): a thick straight joined to a thin stroke or circle swells smoothly out of it (and thins into a following thin stroke); thick-to-thick joins stay thick",
       "Outlines & Accuracy"
      ],
      [
       "done",
       "Engine (Srihari, round 4): an outline of horizontals has its first stroke on the line; the next may dip a little below it",
       "Outlines & Accuracy"
      ],
      [
       "done",
       "Review site (Srihari, round 4): stroke animation is one continuous pen motion through the whole outline at constant speed (requestAnimationFrame, 60 fps)",
       "Outlines & Accuracy"
      ],
      [
       "done",
       "Review site (Srihari, round 5): animation re-implemented from the outline geometry (no SVG masks): each frame redraws the ink up to the pen position, so it works the same in Chrome and Safari and the last frame is exactly the static drawing; a tap during the animation restarts it",
       "Outlines & Accuracy"
      ],
      [
       "done",
       "Renderer (Srihari, round 5): thick strokes made slightly thinner (0.18 → 0.145 of a stroke length, measured against the 2024 print); thin strokes and the thin-to-thick blending unchanged",
       "Outlines & Accuracy"
      ],
      [
       "done",
       "Engine (Srihari, round 6): the first downstroke always ends ON the line (¶ 24); a later horizontal no longer lifts the whole outline, it may run along or dip slightly below the line, as the print shows (4 Chapter I outlines and 16 contractions placed lower)",
       "Outlines & Accuracy"
      ],
      [
       "done",
       "Review site (Srihari, round 6): one card per actual outline (same drawn strokes = one card, whatever the label or section; repeats listed as 'also in'); outlines reviewed in an earlier chapter are hidden in later ones (toggle to show); marks carried to the merged card, 'wrong' wins",
       "Outlines & Accuracy"
      ],
      [
       "done",
       "Thick/thin joins: book-style F chosen by Srihari and applied to straights and curves",
       "Outlines & Accuracy"
      ],
      [
       "done",
       "Engine (Srihari, round 6 marks): an all-horizontal outline rests on the line at its stroke ends, so a following M touches the line; a final upstroke that comes back up after a downstroke ends on the line (6 Chapter I outlines redrawn, marks reset)",
       "Outlines & Accuracy"
      ],
      [
       "todo",
       "Text vs. drawing: the 2024 text puts CH at 30° from the perpendicular (≈ -120°); the print measures ≈ -107° (engine follows the print) — confirm with Srihari",
       "Outlines & Accuracy"
      ]
     ],
     "cat": "Technical"
    },
    {
     "name": "Theory chapters, 2024 edition (each: build rules → Srihari checks → fix → 100%)",
     "items": [
      [
       "done",
       "I. The Consonants (pp. 1–8) — APPROVED by Srihari (100 unique outlines, rounds 1–7)"
      ],
      [
       "wip",
       "II. The Vowels (pp. 9–13) — built, in review (142 unique outlines)"
      ],
      [
       "done",
       "  ↳ II: vowel signs drawn by the engine: 12 vowels, dot / dash, heavy (long) / light (short), 3 places, before / after the stroke; first vowel sets the position"
      ],
      [
       "done",
       "  ↳ II: every exercise outline checked against the 2024 Key; cards show stroke directions, vowel sound, sign, place and side, guide lines, animation"
      ],
      [
       "done",
       "  ↳ II: Srihari's round 8 (26 ok): word pronunciation shown first on every card; vowel signs set clear of the stroke (book gap ≈ 0.1); opening Ray before a downstroke written steeper, not doubled"
      ],
      [
       "done",
       "  ↳ II: 1st position lowered nearer the line (0.5 → 0.3 of a stroke, measured in the book); 3rd position checked"
      ],
      [
       "done",
       "  ↳ II: animation writes the vowel signs after the outline, in word order (pen lift, dot tap, dash stroke)"
      ],
      [
       "done",
       "  ↳ Phonetics audit of every Chapter I and II card (RP pronunciation, strokes, vowel signs, example words) built into the review build"
      ],
      [
       "wip",
       "  ↳ II: Srihari's review (round 9) and 6 open questions"
      ],
      [
       "todo",
       "III. Intervening Vowels and Position (pp. 14–18)"
      ],
      [
       "todo",
       "IV. Alternative Signs for R and H (pp. 19–21)"
      ],
      [
       "todo",
       "V. Diphthongs (pp. 22–25)"
      ],
      [
       "todo",
       "VI. Phraseography (pp. 26–30)"
      ],
      [
       "todo",
       "VII. Circle S and Z — Left and Right Motion (pp. 31–34)"
      ],
      [
       "todo",
       "VIII. Stroke S and Z (pp. 35–38)"
      ],
      [
       "todo",
       "IX. Large Circles SW and SS or SZ (pp. 39–42)"
      ],
      [
       "todo",
       "X. Loops ST and STR (pp. 43–47)"
      ],
      [
       "todo",
       "XI. Initial Hooks to Straight Strokes and Curves (pp. 48–52)"
      ],
      [
       "todo",
       "XII. Alternative Forms for FR, VR, etc. (pp. 53–57)"
      ],
      [
       "todo",
       "XIII. Circle or Loop Preceding Initial Hook (pp. 58–61)"
      ],
      [
       "todo",
       "XIV. N and F Hooks (pp. 62–66)"
      ],
      [
       "todo",
       "XV. Circles and Loops to Final Hooks (pp. 67–71)"
      ],
      [
       "todo",
       "XVI. The Shun Hook (pp. 72–77)"
      ],
      [
       "todo",
       "XVII. The Aspirate (pp. 78–81)"
      ],
      [
       "todo",
       "XVIII. Upward and Downward R (pp. 82–86)"
      ],
      [
       "todo",
       "XIX. Upward and Downward L and SH (pp. 87–91)"
      ],
      [
       "todo",
       "XX. Compound Consonants (pp. 92–96)"
      ],
      [
       "todo",
       "XXI. Vowel Indication (pp. 97–101)"
      ],
      [
       "todo",
       "XXII. The Halving Principle (Section 1) (pp. 102–106)"
      ],
      [
       "todo",
       "XXIII. The Halving Principle (Section 2) (pp. 107–111)"
      ],
      [
       "todo",
       "XXIV. The Doubling Principle (pp. 112–118)"
      ],
      [
       "todo",
       "XXV. Diphonic or Two-Vowel Signs (pp. 119–122)"
      ],
      [
       "todo",
       "XXVI. Medial Semicircle (pp. 123–125)"
      ],
      [
       "todo",
       "XXVII. Prefixes (pp. 126–131)"
      ],
      [
       "todo",
       "XXVIII. Suffixes and Terminations (pp. 132–139)"
      ],
      [
       "todo",
       "XXIX. Contractions (pp. 140–149)"
      ],
      [
       "todo",
       "XXX. Figures, etc. (pp. 150–152)"
      ],
      [
       "todo",
       "XXXI. Note-taking, Transcription, etc. (pp. 153–161)"
      ],
      [
       "todo",
       "XXXII. Essential Vowels (pp. 162–167)"
      ],
      [
       "todo",
       "XXXIII. Special Contractions (pp. 168–188)"
      ],
      [
       "todo",
       "XXXIV. Advanced Phraseography (pp. 189–224)"
      ],
      [
       "todo",
       "XXXV. Intersections (pp. 225–233)"
      ],
      [
       "todo",
       "XXXVI. Business Phrases (pp. 234–237)"
      ],
      [
       "todo",
       "XXXVII. Political Phrases (pp. 238–242)"
      ],
      [
       "todo",
       "XXXVIII. Banking and Stockbroking Phrases (pp. 243–247)"
      ],
      [
       "todo",
       "XXXIX. Insurance and Shipping Phrases (pp. 248–253)"
      ],
      [
       "todo",
       "XL. Technical and Railway Phrases (pp. 254–259)"
      ],
      [
       "todo",
       "XLI. Legal Phrases (pp. 260–263)"
      ],
      [
       "todo",
       "XLII. Theological Phrases (pp. 264–267)"
      ],
      [
       "todo",
       "XLIII. Special List of Words (pp. 268–284)"
      ],
      [
       "todo",
       "XLIV. Shorthand in Practice (pp. 285–287)"
      ]
     ],
     "cat": "Theory Chapters"
    },
    {
     "name": "Phase 1 exit",
     "items": [
      [
       "todo",
       "Every chapter at 100% approved by Srihari"
      ],
      [
       "todo",
       "List of override outlines needed (to draw/scan)"
      ],
      [
       "todo",
       "Rules engine frozen as v1"
      ]
     ],
     "cat": "Outlines & Accuracy"
    }
   ]
  },
  {
   "id": "P2",
   "title": "Phase 2 — Our own content (copyright-safe)",
   "goal": "Replace all book material with our own word lists, phrases and passages.",
   "groups": [
    {
     "name": "Clean-up",
     "items": [
      [
       "todo",
       "Remove all book exercises, word order and text from the data"
      ],
      [
       "todo",
       "Audit repo and app for any book-derived text or images"
      ]
     ],
     "cat": "Legal & Launch"
    },
    {
     "name": "Words",
     "items": [
      [
       "todo",
       "Build master word list from common-English frequency lists"
      ],
      [
       "todo",
       "Add court, legal and SSC dictation vocabulary"
      ],
      [
       "todo",
       "Group words by theory topic our own way"
      ],
      [
       "todo",
       "Engine draws all ~1,000 words"
      ],
      [
       "todo",
       "Srihari reviews all words"
      ]
     ],
     "cat": "Content"
    },
    {
     "name": "Phrases",
     "items": [
      [
       "todo",
       "Choose ~500 common phrases"
      ],
      [
       "todo",
       "Engine draws phrase joins"
      ],
      [
       "todo",
       "Srihari reviews all phrases"
      ]
     ],
     "cat": "Content"
    },
    {
     "name": "Sentences & passages",
     "items": [
      [
       "todo",
       "Write our own practice sentences"
      ],
      [
       "todo",
       "Write our own passages: general, legal, government, court"
      ],
      [
       "todo",
       "Shorthand line-by-line with key"
      ]
     ],
     "cat": "Content"
    },
    {
     "name": "Overrides",
     "items": [
      [
       "todo",
       "Format for Srihari's drawn/scanned outlines"
      ],
      [
       "todo",
       "Convert scans into clean vector strokes"
      ],
      [
       "todo",
       "Override wins over rule-generated outline"
      ]
     ],
     "cat": "Stroke Engine"
    }
   ]
  },
  {
   "id": "P3",
   "title": "Phase 3 — Public web app v1",
   "goal": "Fast, smooth, accurate dictionary and learning app.",
   "groups": [
    {
     "name": "Core",
     "items": [
      [
       "todo",
       "Dictionary search (word, phrase, grammalogue, contraction)"
      ],
      [
       "todo",
       "Outline view with position, rules used and explanation"
      ],
      [
       "todo",
       "Stroke-by-stroke drawing animation (one continuous pen motion at constant speed, as on the review site)"
      ],
      [
       "todo",
       "Direction arrows on outlines (start dot + small arrowhead) and direction text per stroke (\"written downward / upward / left to right\")"
      ],
      [
       "todo",
       "Phonetics per stroke: IPA symbol, stroke name, our own example word; joined forms show the consonant sequence"
      ],
      [
       "todo",
       "Theory learning path in chapter order with our own examples"
      ],
      [
       "todo",
       "Grammalogue and contraction browser"
      ],
      [
       "todo",
       "Verified / under-review badge on each outline"
      ],
      [
       "todo",
       "'Report a mistake' button"
      ]
     ],
     "cat": "App Features"
    },
    {
     "name": "Speed & smoothness",
     "items": [
      [
       "todo",
       "Instant search (under 50 ms)",
       "Technical"
      ],
      [
       "todo",
       "Works offline after first load",
       "Technical"
      ],
      [
       "todo",
       "Smooth 60 fps animations"
      ],
      [
       "todo",
       "Mobile-friendly layout"
      ],
      [
       "todo",
       "Light and dark mode"
      ]
     ],
     "cat": "UX & Design"
    },
    {
     "name": "Release",
     "items": [
      [
       "todo",
       "Choose app name and domain",
       "Legal & Launch"
      ],
      [
       "todo",
       "Privacy policy and terms"
      ],
      [
       "todo",
       "Analytics (privacy-friendly)",
       "Technical"
      ],
      [
       "todo",
       "Srihari final sign-off",
       "Outlines & Accuracy"
      ]
     ],
     "cat": "Legal & Launch"
    }
   ]
  },
  {
   "id": "P4",
   "title": "Phase 4 — Practice features",
   "goal": "Learn by doing.",
   "groups": [
    {
     "name": "Practice",
     "items": [
      [
       "todo",
       "Tracing practice over outline"
      ],
      [
       "todo",
       "Stroke checking (direction, length, thickness)"
      ],
      [
       "todo",
       "Quiz: word → outline"
      ],
      [
       "todo",
       "Quiz: outline → word"
      ],
      [
       "todo",
       "Progress tracking and streaks"
      ],
      [
       "todo",
       "Spaced repetition for weak outlines"
      ]
     ],
     "cat": "App Features"
    }
   ]
  },
  {
   "id": "P5",
   "title": "Phase 5 — Dictation",
   "goal": "Speed building for exams.",
   "groups": [
    {
     "name": "Dictation",
     "items": [
      [
       "todo",
       "Record or generate audio for our own passages"
      ],
      [
       "todo",
       "Speeds: 60, 80, 100, 120 wpm (and more)"
      ],
      [
       "todo",
       "Accurate wpm timing"
      ],
      [
       "todo",
       "Shorthand key shown after dictation"
      ],
      [
       "todo",
       "Transcription check and accuracy score"
      ]
     ],
     "cat": "App Features"
    }
   ]
  },
  {
   "id": "P6",
   "title": "Phase 6 — Mobile apps",
   "goal": "Same engine on phones.",
   "groups": [
    {
     "name": "iPhone",
     "items": [
      [
       "wip",
       "Srihari: update macOS"
      ],
      [
       "todo",
       "Srihari: install and open Xcode"
      ],
      [
       "todo",
       "Native SwiftUI app wrapping the engine"
      ],
      [
       "todo",
       "Test build on Srihari's iPhone"
      ]
     ],
     "cat": "Mobile"
    },
    {
     "name": "Android",
     "items": [
      [
       "todo",
       "Android app with the same engine"
      ],
      [
       "todo",
       "Test on Android phone"
      ]
     ],
     "cat": "Mobile"
    },
    {
     "name": "Both",
     "items": [
      [
       "todo",
       "Touch tracing tuned for phones"
      ],
      [
       "todo",
       "Offline content"
      ]
     ],
     "cat": "Mobile"
    }
   ]
  },
  {
   "id": "P7",
   "title": "Phase 7 — Launch",
   "goal": "Go public.",
   "groups": [
    {
     "name": "Business & legal",
     "items": [
      [
       "todo",
       "Decide free vs paid features"
      ],
      [
       "todo",
       "IP lawyer check: 'Pitman' name and our content"
      ],
      [
       "todo",
       "Payments setup"
      ]
     ],
     "cat": "Legal & Launch"
    },
    {
     "name": "Stores",
     "items": [
      [
       "todo",
       "Google Play listing"
      ],
      [
       "todo",
       "Apple App Store listing"
      ],
      [
       "todo",
       "Screenshots, description, icon"
      ]
     ],
     "cat": "Legal & Launch"
    }
   ]
  },
  {
   "id": "P8",
   "title": "Phase 8 — Later",
   "goal": "Grow the app.",
   "groups": [
    {
     "name": "Expansion",
     "items": [
      [
       "todo",
       "More words and specialist vocabulary"
      ],
      [
       "todo",
       "More passages and dictation",
       "Content"
      ],
      [
       "todo",
       "Teacher tools (classes, assignments)",
       "App Features"
      ]
     ],
     "cat": "Content"
    }
   ]
  }
 ],
 "categories": [
  "Stroke Engine",
  "Theory Chapters",
  "Outlines & Accuracy",
  "Content",
  "App Features",
  "UX & Design",
  "Technical",
  "Mobile",
  "Legal & Launch",
  "Project Management"
 ]
};
