// Project checklist. status: done | wip | todo. Optional 3rd item field overrides the group's category.
window.TRACKER = {
 "updated": "2026-10-17 23:30 IST",
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
       "todo",
       "Create private repo (not public, no GitHub Pages)"
      ],
      [
       "todo",
       "Decide how Srihari views it (private link / local file / password)"
      ],
      [
       "todo",
       "Chapter list matching the 2024 book order"
      ],
      [
       "todo",
       "Exercise view: engine-drawn outline next to the word"
      ],
      [
       "todo",
       "Mark each outline Correct / Wrong with a note",
       "Outlines & Accuracy"
      ],
      [
       "todo",
       "Export Srihari's marks so fixes can be tracked"
      ],
      [
       "todo",
       "Per-chapter score: % outlines approved",
       "Outlines & Accuracy"
      ],
      [
       "todo",
       "Regression check: every rule fix re-checks all earlier chapters",
       "Outlines & Accuracy"
      ]
     ],
     "cat": "Technical"
    },
    {
     "name": "Theory chapters (each: build rules → Srihari checks → fix → 100%)",
     "items": [
      [
       "todo",
       "Consonant strokes"
      ],
      [
       "todo",
       "Long vowels"
      ],
      [
       "todo",
       "Short vowels"
      ],
      [
       "todo",
       "Intervening vowels and position writing"
      ],
      [
       "todo",
       "Alternative forms (upward/downward R, L, H, Sh)"
      ],
      [
       "todo",
       "Circle S and Z"
      ],
      [
       "todo",
       "Stroke S and Z"
      ],
      [
       "todo",
       "Large circles SW, SS/SZ"
      ],
      [
       "todo",
       "Loops ST and STR"
      ],
      [
       "todo",
       "Initial hooks R and L to straight strokes"
      ],
      [
       "todo",
       "Initial hooks R and L to curves"
      ],
      [
       "todo",
       "Alternative forms for FR, VR etc."
      ],
      [
       "todo",
       "Circles and loops to initial hooks"
      ],
      [
       "todo",
       "N and F/V hooks"
      ],
      [
       "todo",
       "Circles and loops to final hooks"
      ],
      [
       "todo",
       "Shun hook"
      ],
      [
       "todo",
       "Aspirate (H)"
      ],
      [
       "todo",
       "Upward and downward R"
      ],
      [
       "todo",
       "Upward and downward L"
      ],
      [
       "todo",
       "Compound consonants (KW, GW, WH, LR, RR, MP/MB)"
      ],
      [
       "todo",
       "Vowel indication"
      ],
      [
       "todo",
       "Diphthongs and triphones"
      ],
      [
       "todo",
       "Halving principle"
      ],
      [
       "todo",
       "Doubling principle"
      ],
      [
       "todo",
       "Diphones"
      ],
      [
       "todo",
       "Medial semicircle"
      ],
      [
       "todo",
       "Prefixes"
      ],
      [
       "todo",
       "Suffixes and terminations"
      ],
      [
       "todo",
       "Grammalogues (all lists)"
      ],
      [
       "todo",
       "Contractions"
      ],
      [
       "todo",
       "Phraseography"
      ],
      [
       "todo",
       "Intersections"
      ],
      [
       "todo",
       "Omission of consonants and syllables"
      ],
      [
       "todo",
       "Figures, abbreviations and special outlines"
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
       "Stroke-by-stroke drawing animation"
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
