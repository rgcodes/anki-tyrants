import { readdirSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { cardTypes } from './card-types/index.js';
import { writeCards } from './utils/output.js';
import { escapeHtml, renderImage, slugify, tsvField } from './utils/html.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '../data/decks-json');

// Human-readable half-deck labels for the Anki deck hierarchy.
const DECK_LABELS = {
  drow: 'Drow',
  dragons: 'Dragons',
  demons: 'Demons',
  undead: 'Undead',
  elemental: 'Elemental Evil',
  aberrations: 'Aberrations',
};

function deckLabel(slug) {
  return DECK_LABELS[slug] ?? slug;
}

function buildFront(card, ct) {
  const showsImage = ct.showsImage !== false;
  const q = escapeHtml(ct.question);
  const parts = [];
  if (ct.showsName) parts.push(escapeHtml(card.name));
  if (showsImage) parts.push(renderImage(card.image));
  parts.push(q);
  return parts.join('<br>');
}

function buildTags(deckSlug, card, ct) {
  return [
    'tyrants',
    `tyrants::deck::${deckSlug}`,
    `tyrants::question::${ct.id}`,
    `tyrants::type::${slugify(card.type)}`,
    `tyrants::race::${slugify(card.race)}`,
  ].join(' ');
}

const requested = new Set(process.argv.slice(2));

console.log('Generating Anki cards...\n');

const decks = readdirSync(DATA_DIR)
  .filter(f => f.endsWith('.json'))
  .map(f => ({ slug: f.replace(/\.json$/, ''), path: join(DATA_DIR, f) }))
  .filter(({ slug }) => requested.size === 0 || requested.has(slug));

let total = 0;
for (const { slug, path } of decks) {
  const records = JSON.parse(readFileSync(path, 'utf8'));
  for (const ct of cardTypes) {
    const cards = records.map(card => ({
      front: tsvField(buildFront(card, ct)),
      back: tsvField(ct.answer(card)),
      tags: buildTags(slug, card, ct),
    }));
    const deckName = `Tyrants of the Underdark::${deckLabel(slug)}::${ct.label}`;
    writeCards(`${slug}-${ct.id}`, deckName, cards);
    total += cards.length;
  }
}

console.log(`\nDone. ${total} cards across ${decks.length} half-deck(s).`);
