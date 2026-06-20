# Anki Tyrants

Generate Anki flashcards for memorising the cards of the board game **Tyrants of the Underdark**. The aim is sight-recognition: shown a card image, recall its name, type, cost, effect, and values.

## Source material

- `data/decks-raw/` — scanned PDFs of the game's six half-decks (one PDF per half-deck, one card per page).
- `data/decks-json/` — extracted card records (one JSON file per half-deck).
- `data/images/<deck>/<state>/` — cropped/rendered card images, organised by state. `hint/` holds the front-of-card crops (one PNG per card); `full/` is reserved for future answer-reveal images. Filenames inside each state folder follow the `-hint` / `-full` suffix convention.
- `card-anatomy.png` — annotated diagram identifying every field on a card. Refer to this when adding a new field.

## Pipeline

Two stages:

### Step 1 — Extract (direct vision read, no automation)

For each PDF in `data/decks-raw/`, read every page as an image and produce one JSON file per half-deck in `data/decks-json/`. No OCR pipeline — read the images directly and write the records.

Filename convention: `data/decks-json/<deck>.json` where `<deck>` comes from the PDF filename stem (e.g. `tyrants-deck-drow.pdf` → `data/decks-json/drow.json`).

#### Card record schema

```json
{
  "image": "tyrants-drow-0-advocate-hint.png",
  "name": "Advocate",
  "type": "Ambition",
  "cost": 2,
  "race": "Drow",
  "effect": [
    "Choose one:",
    "• +2 influence",
    "• At end of turn, promote another card played this turn."
  ],
  "flavour": "Greed, avarice, and power: three languages I understand well.",
  "deck_value": 1,
  "inner_circle_value": 2,
  "quantity_in_deck": 4
}
```

Field mapping (per `card-anatomy.png`):

| Field | Card location |
|---|---|
| `image` | `tyrants-<deck>-<index>-<slug>-hint.png` — `deck` is the half-deck id (matches the JSON filename stem, e.g. `drow`), `index` is the card's 0-based position in the deck's JSON array, `slug` is the lowercased-kebab name. The `tyrants-` project prefix and the `<deck>-` half-deck prefix are both mandatory: Anki stores all media in one flat `collection.media/` folder shared across every deck in the user's profile, so filenames are global keys. The `tyrants-` prefix guards against collisions with media from unrelated decks the user may have imported. The `-hint` suffix marks this as the front-of-card hint image (typically a crop or partial view); a parallel `tyrants-<deck>-<index>-<slug>-full.png` slot is reserved for a future answer-reveal image showing the full card. User produces the actual image files later. |
| `name` | Top-left title |
| `type` | Band below the name (e.g. Ambition, Guile, Conquest) |
| `cost` | Top-right number |
| `race` | Top-right, below cost |
| `effect` | White text box, lower half — list of lines |
| `flavour` | Italic quote below effect (omit if absent) |
| `deck_value` | Bottom-right **white square** value |
| `inner_circle_value` | Bottom-right **purple circle** value |
| `quantity_in_deck` | Count of dots in the bottom-centre row |

#### Fields to **omit**

- The `X/40` card number bottom-left.
- The `© 2021 Wizards` copyright.
- The small **deck symbol** bottom-left (spider for drow, etc.) — it's the half-deck identifier and we already know that from the filename.

#### Effect text conventions

- Render influence orbs by counting them and writing the total — `+2 influence`, not `{orb}{orb}`.
- Keep game keywords like **promote**, **assassinate** as plain text (don't try to bold via Markdown — store as plain text and let the generator decide).
- Preserve bullets as `•` followed by a space at the start of each list item.

### Step 2 — Generate (Node.js)

Node + ESM, mirroring `../anki-music`. Run `npm run generate` to walk `data/decks-json/*.json` and produce one TSV per half-deck × question type into `output/`. Run `npm run generate -- drow` to limit to one half-deck. Card-type modules live in `src/card-types/`; shared utilities in `src/utils/`.

Each generated TSV opens with the import directives:

```
#notetype:Basic
#deck:Tyrants of the Underdark::<Half-deck>::<Question type>
#tags column:3
```

Every card uses Anki's stock `Basic` note type — no setup required. The back stacks under the front on reveal (Anki's default), so you see the hint image, the question, then the answer below the divider. If we later want flip-style reveal for a particular question type (so the front doesn't bleed through), that's a per-deck card-template tweak in Anki rather than a generator change.

The front of every card is the question (image + prompt, or name + image + prompt, depending on the question type). The back is the answer — currently plain text; the `-full` image files in `data/images/<deck>/full/` are kept on disk so we can wire them into the back later without re-extracting.

## Conventions

- British English in prose and card content.
- Slugs: lowercase-kebab from the card name (e.g. `advocate`, `drow-priestess`).
- Half-deck IDs come from the PDF filename stem.
- Generated artefacts (extracted JSON, images, TSV output) are gitignored.

## Reference projects

- `../anki-music` — sister project for music theory cards. Mirror its Node/ESM/TSV setup for Step 2.
