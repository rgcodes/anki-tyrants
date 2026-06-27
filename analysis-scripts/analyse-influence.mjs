import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIR = join(__dirname, '..', 'data', 'decks-json');

const decks = readdirSync(DIR).filter((f) => f.endsWith('.json'));

const extractInfluence = (line) => {
  // Matches "+N influence" — capture all in the line
  const matches = [...line.matchAll(/\+(\d+)\s+influence/gi)];
  const fromPlus = matches.reduce((sum, m) => sum + Number(m[1]), 0);
  // Also: "gain N influence" / "gain N influence"
  const gainMatches = [...line.matchAll(/gain\s+(\d+)\s+influence/gi)];
  const fromGain = gainMatches.reduce((sum, m) => sum + Number(m[1]), 0);
  return fromPlus + fromGain;
};

// Classify a single effect line for influence
// Returns { max, unconditional }
const classifyLine = (line, inChoose) => {
  const inf = extractInfluence(line);
  if (inf === 0) return { max: 0, unconditional: 0 };

  // Arrow effect (focus, spy-return, devour) — conditional
  if (line.includes('▶')) {
    return { max: inf, unconditional: 0 };
  }
  // "If X, ..." conditional
  if (/\bIf\b/.test(line)) {
    return { max: inf, unconditional: 0 };
  }
  // "For each X, gain N influence" — conditional on count
  if (/For each/i.test(line)) {
    return { max: inf, unconditional: 0 };
  }
  // Otherwise — unconditional production
  return { max: inf, unconditional: inf };
};

// Process a card's effect array, taking the max of choose alternatives
const classifyCard = (card) => {
  const lines = card.effect;
  let max = 0;
  let unconditional = 0;

  // Track choose blocks
  let chooseActive = false;
  let chooseLines = [];

  const flushChoose = () => {
    if (!chooseActive) return;
    // Pick the option with highest influence (max) and highest unconditional
    let bestMax = 0;
    let bestUnc = 0;
    for (const l of chooseLines) {
      const c = classifyLine(l, true);
      if (c.max > bestMax) bestMax = c.max;
      if (c.unconditional > bestUnc) bestUnc = c.unconditional;
    }
    max += bestMax;
    unconditional += bestUnc;
    chooseActive = false;
    chooseLines = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (/^Choose\s+(one|two|three|four)/i.test(trimmed) || /^Choose\s+(one|two|three)\s+times/i.test(trimmed)) {
      flushChoose();
      chooseActive = true;
      chooseLines = [];
      continue;
    }
    if (chooseActive && trimmed.startsWith('•')) {
      chooseLines.push(trimmed);
      continue;
    }
    // Non-bullet line ends a choose block
    if (chooseActive) flushChoose();

    const c = classifyLine(trimmed, false);
    max += c.max;
    unconditional += c.unconditional;
  }
  flushChoose();

  return { max, unconditional };
};

const results = [];

for (const file of decks) {
  const deck = file.replace(/\.json$/, '');
  const cards = JSON.parse(readFileSync(join(DIR, file), 'utf-8'));

  let totalMax = 0;
  let totalUnc = 0;
  let cardsWithInfluence = 0; // unique card types that can produce influence (max > 0)
  let copiesWithInfluence = 0;
  let cardsWithUncInfluence = 0;
  let copiesWithUncInfluence = 0;
  const breakdown = [];

  for (const card of cards) {
    const { max, unconditional } = classifyCard(card);
    if (max > 0) {
      cardsWithInfluence += 1;
      copiesWithInfluence += card.quantity_in_deck;
      totalMax += max * card.quantity_in_deck;
      breakdown.push({
        name: card.name,
        qty: card.quantity_in_deck,
        max,
        unconditional,
      });
    }
    if (unconditional > 0) {
      cardsWithUncInfluence += 1;
      copiesWithUncInfluence += card.quantity_in_deck;
      totalUnc += unconditional * card.quantity_in_deck;
    }
  }

  results.push({
    deck,
    totalMax,
    totalUnc,
    cardsWithInfluence,
    copiesWithInfluence,
    cardsWithUncInfluence,
    copiesWithUncInfluence,
    breakdown,
  });
}

// Print
for (const r of results) {
  console.log(`\n=== ${r.deck.toUpperCase()} ===`);
  console.log(`  Total max influence:           ${r.totalMax}`);
  console.log(`  Total unconditional influence: ${r.totalUnc}`);
  console.log(`  Distinct cards producing any influence:           ${r.cardsWithInfluence} (${r.copiesWithInfluence} copies)`);
  console.log(`  Distinct cards producing unconditional influence: ${r.cardsWithUncInfluence} (${r.copiesWithUncInfluence} copies)`);
  console.log(`  Breakdown:`);
  for (const b of r.breakdown) {
    console.log(`    ${b.name.padEnd(28)} x${b.qty}  max=${b.max}  unconditional=${b.unconditional}`);
  }
}

// Summary table
console.log('\n\n=== SUMMARY ===');
console.log('Deck'.padEnd(14) + 'MaxInf'.padStart(8) + 'UncInf'.padStart(8) + 'AnyCards'.padStart(10) + 'AnyCopies'.padStart(11) + 'UncCards'.padStart(10) + 'UncCopies'.padStart(11));
for (const r of results) {
  console.log(
    r.deck.padEnd(14) +
    String(r.totalMax).padStart(8) +
    String(r.totalUnc).padStart(8) +
    String(r.cardsWithInfluence).padStart(10) +
    String(r.copiesWithInfluence).padStart(11) +
    String(r.cardsWithUncInfluence).padStart(10) +
    String(r.copiesWithUncInfluence).padStart(11)
  );
}
