// SPDX-License-Identifier: MIT
// Your Agent in One Emoji — entry program.
//
// The entry is a single emoji: a compass. An AI agent finds the way and
// gets things done on your behalf — it charts the route, not just the map.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The one emoji that stands for this agent.
const ENTRY_EMOJI = "🧭";

// The gate (from the kit's RULES.txt): /output/entry.txt must be UTF-8
// text of 1 to 16 characters, not only white space.
const MIN_CHARS = 1;
const MAX_CHARS = 16;

function validateEntry(text: string): void {
  if (typeof text !== "string" || text.length === 0) {
    throw new Error("entry must be a non-empty string");
  }
  if (text.trim().length === 0) {
    throw new Error("entry must not be only white space");
  }
  const chars = [...text];
  if (chars.length < MIN_CHARS || chars.length > MAX_CHARS) {
    throw new Error(
      `entry must be ${MIN_CHARS} to ${MAX_CHARS} characters, got ${chars.length}`,
    );
  }
  // Exactly one grapheme cluster: a single emoji, nothing else.
  const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
  const graphemes = [...segmenter.segment(text)].map((s) => s.segment);
  if (graphemes.length !== 1) {
    throw new Error(`entry must be exactly one emoji, got ${graphemes.length} graphemes`);
  }
  const single = graphemes[0];
  if (!/\p{Extended_Pictographic}/u.test(single)) {
    throw new Error("entry must be a single emoji (pictographic character)");
  }
  // One grapheme, one glyph: reject ZWJ sequences and keycap combos that
  // smuggle several emojis into a single grapheme cluster. A lone emoji
  // is one code point (a trailing U+FE0F variation selector is tolerated).
  const codePoints = [...single];
  const withoutVs16 = codePoints.filter((cp) => cp !== "\uFE0F");
  if (withoutVs16.length !== 1) {
    throw new Error(
      `entry must be a single emoji glyph, got ${withoutVs16.length} code points`,
    );
  }
}

function main(): void {
  validateEntry(ENTRY_EMOJI);

  const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "entry.txt");
  writeFileSync(outPath, ENTRY_EMOJI, "utf8");
  // Round-trip: what we wrote must be exactly the validated entry.
  const written = readFileSync(outPath, "utf8");
  if (written !== ENTRY_EMOJI) {
    throw new Error(`round-trip mismatch: wrote ${JSON.stringify(written)}`);
  }
  console.log(`Wrote ${ENTRY_EMOJI} to ${outPath}`);
}

main();
