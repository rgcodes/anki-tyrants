# Anki Tyrants

Anki flashcard decks for memorising the cards of the board game *Tyrants of the Underdark*. The aim is sight-recognition: shown a card image, recall its name, type, cost, effect, and values.

## Prerequisites

- [Anki desktop](https://apps.ankiweb.net/) installed, and a profile opened at least once (so `collection.media/` exists).
- Node.js 18+ (no dependencies — pure standard library).

## Generate the TSVs

```sh
npm run generate           # all 6 half-decks × 7 question types → 42 TSV files
npm run generate -- drow   # limit to a single half-deck (e.g. for spot-checks)
```

Output lands in `output/<deck>-<question-type>.txt`.

## Import into Anki

1. **Copy images into Anki's media folder.** Anki uses a flat folder, so we flatten on copy:

   ```sh
   # macOS — adjust profile name if not "User 1"
   cp data/images/*/hint/*.png ~/Library/Application\ Support/Anki2/User\ 1/collection.media/

   # Linux
   cp data/images/*/hint/*.png ~/.local/share/Anki2/User\ 1/collection.media/

   # Windows (PowerShell)
   Copy-Item data\images\*\hint\*.png $env:APPDATA\Anki2\'User 1'\collection.media\
   ```

   Filenames are globally unique (`tyrants-<deck>-<index>-<slug>-hint.png`), so there's no collision risk across decks or with other Anki content.

2. **Import each TSV.** Anki → **File → Import** → pick a file from `output/`. The TSV header sets the note type, target sub-deck, and tags column automatically — no dialog choices needed.

3. **Sync.** Click sync (or `Cmd+Y`). Cards, the `Game Card` note type, and the media all propagate to AnkiWeb and mobile devices.

## Project structure

```
data/
  decks-raw/<deck>.pdf         scanned source PDFs (committed)
  decks-json/<deck>.json       extracted card records (committed)
  images/<deck>/hint/*.png     front-of-card crops (gitignored)
  images/<deck>/full/*.png     reserved for future answer-reveal images (gitignored)
src/
  generate.js                  entry point — npm run generate
  card-types/                  one module per question type
  utils/                       html.js, output.js
output/                        generated TSVs (gitignored)
```

For the card record schema, extraction conventions, and pipeline rationale, see [CLAUDE.md](./CLAUDE.md).
