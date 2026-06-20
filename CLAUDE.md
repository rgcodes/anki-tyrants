# Anki Tyrants

Generate Anki flashcards for memorising the cards of the board game **Tyrants of the Underdark**. The aim is sight-recognition: shown a card image, recall its name, type, cost, effect, and values.

## Source material

- `data/decks-raw/` — scanned PDFs of the game's six half-decks (one PDF per half-deck, one card per page).
- `data/decks-json/` — extracted card records (one JSON file per half-deck).
- `data/images/<deck>/` — cropped/rendered card images (one PNG per card).
- `card-anatomy.png` — annotated diagram identifying every field on a card. Refer to this when adding a new field.

## Pipeline

Two stages:

### Step 1 — Extract (direct vision read, no automation)

For each PDF in `data/decks-raw/`, read every page as an image and produce one JSON file per half-deck in `data/decks-json/`. No OCR pipeline — read the images directly and write the records.

Filename convention: `data/decks-json/<deck>.json` where `<deck>` comes from the PDF filename stem (e.g. `tyrants-deck-drow.pdf` → `data/decks-json/drow.json`).

#### Card record schema

```json
{
  "image": "drow-0-advocate.png",
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
| `image` | `<deck>-<index>-<slug>.png` — `deck` is the half-deck id (matches the JSON filename stem, e.g. `drow`), `index` is the card's 0-based position in the deck's JSON array, `slug` is the lowercased-kebab name. The deck prefix is mandatory: Anki stores all media in one flat `collection.media/` folder per profile, so any cross-half-deck filename collision would silently overwrite. User produces the actual image files later. |
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

### Step 2 — Generate (Node.js, TBD)

Once the JSON exists, produce Anki-importable TSV. Match the conventions of the adjacent `../anki-music` project: Node + ESM, generators per card set, `npm run generate`.

The Anki front shows the cropped card image; the back shows the recall answer. Prompt styles (image → name, image → effect, etc.) to be decided once Step 1 data is in hand.

## Conventions

- British English in prose and card content.
- Slugs: lowercase-kebab from the card name (e.g. `advocate`, `drow-priestess`).
- Half-deck IDs come from the PDF filename stem.
- Generated artefacts (extracted JSON, images, TSV output) are gitignored.

## Reference projects

- `../anki-music` — sister project for music theory cards. Mirror its Node/ESM/TSV setup for Step 2.
