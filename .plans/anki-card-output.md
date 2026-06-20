## Plan: Anki card output

**Last updated:** 2026-06-20

Generate Anki-importable TSV from `data/<deck>.json` records. Seven distinct card types per game card, mirroring the Node/ESM/TSV setup of `../anki-music`.

## Reference record (from `data/drow.json`)

```json
{
  "image": "drow-0-advocate.png",
  "name": "Advocate",
  "type": "Ambition",
  "cost": 2,
  "race": "Drow",
  "effect": ["Choose one:", "• +2 influence", "• At end of turn, promote another card played this turn."],
  "flavour": "Greed, avarice, and power: three languages I understand well.",
  "deck_value": 1,
  "inner_circle_value": 2,
  "quantity_in_deck": 4
}
```

## Card types

Seven cards per game card. The image is rendered as `<img src="<image>">` (Anki resolves against its media folder).

The **Name** card hides the name (that's the answer). The other six show name + image + question — you're training fast attribute recall on a known card.

| # | Card type     | Front                                                  | Back                                  |
|---|---------------|--------------------------------------------------------|---------------------------------------|
| 1 | Name          | image + "What is this card called?"                    | `Advocate`                            |
| 2 | Cost          | name + image + "What is the cost?"                     | `2`                                   |
| 3 | Race          | name + image + "What race?"                            | `Drow`                                |
| 4 | Type          | name + image + "What type?"                            | `Ambition`                            |
| 5 | Effect        | name + image + "What is the effect?"                   | effect lines joined with `<br>`       |
| 6 | Quantity      | name + image + "How many copies in the deck?"          | `4`                                   |
| 7 | Values        | name + image + "Deck value / inner circle value?"      | `1 / 2`                               |

For **Advocate** (drow #0) this yields 7 cards. For a 20-card half-deck → 140 cards. Six half-decks → ~840 cards total.

## TSV format

Follow `../anki-music`: tab-separated, three columns (front, back, tags), with a header:

```
#deck:Tyrants of the Underdark::<Deck>::<Card type>
#tags column:3
<front>\t<back>\t<tags>
```

- Anki accepts HTML in fields by default — `<img>` and `<br>` render correctly.
- Tabs and newlines inside fields must be stripped/escaped. Effect lines use `<br>` rather than literal newlines.

### Deck hierarchy

One Anki sub-deck per (half-deck × card type), so the user can study e.g. just *Drow → Effect*:

```
Tyrants of the Underdark::Drow::Name
Tyrants of the Underdark::Drow::Cost
Tyrants of the Underdark::Drow::Race
Tyrants of the Underdark::Drow::Type
Tyrants of the Underdark::Drow::Effect
Tyrants of the Underdark::Drow::Quantity
Tyrants of the Underdark::Drow::Values
```

### Tags

Per-card tags for cross-cutting filters:

```
tyrants tyrants::<half-deck> tyrants::<card-type> tyrants::type::<ambition|guile|...> tyrants::race::<drow|...>
```

e.g. `tyrants tyrants::drow tyrants::effect tyrants::type::ambition tyrants::race::drow`.

## Output file layout

One TSV per half-deck × card type:

```
output/
  drow-name.txt
  drow-cost.txt
  drow-race.txt
  drow-type.txt
  drow-effect.txt
  drow-quantity.txt
  drow-values.txt
  ...
```

Rationale: matches the Anki sub-deck split, so each file imports into one sub-deck without per-row deck overrides. Keeps imports reviewable.

## Code structure (mirroring anki-music)

```
src/
  generate.js                # entry point: loads data/*.json, runs all card-type generators per half-deck
  card-types/
    name.js
    cost.js
    race.js
    type.js
    effect.js
    quantity.js
    values.js
  utils/
    output.js                # writeCards(filename, deck, cards)
    html.js                  # escapeField, renderImage, joinEffect
```

Each `card-types/*.js` exports:

```js
export const id = 'name';
export const question = 'What is this card called?';
export function front(card) { /* returns HTML string */ }
export function back(card)  { /* returns HTML string */ }
export const showsName = false; // true for all except `name`
```

`generate.js` walks `data/*.json` × card types, building `output/<deck>-<type>.txt`. `package.json` script: `npm run generate`.

## Field escaping rules

- Replace any tab (`\t`) and newline (`\n`, `\r`) in source text with a single space before writing.
- HTML-escape `<`, `>`, `&` in source text **before** wrapping with `<br>` or `<img>` tags we control.
- Effect bullets (`•`) and the right-arrow (`▶`) are left as-is — they're plain characters Anki renders fine.

## Open questions for the user

1. **Image rendering**: bare `<img src="0-advocate.png">` or wrapped with sizing (e.g. `<img src="..." style="max-width:400px">`)? Anki desktop will scale to viewer width by default; mobile may need a cap.
2. **Question phrasing**: confirm the seven prompt strings above (especially "Deck value / inner circle value?" vs separate cards).
3. **Effect formatting**: join lines with `<br>` (single line breaks) or wrap in `<div>` per line? `<br>` is simplest; `<div>` lets CSS style indents for `•` bullets.
4. **Flavour text**: omit from all cards, or include as small italic text on the *Name* back as a memory hook?
5. **Image file delivery**: confirm that PNGs will be dropped directly into Anki's `collection.media` folder (filenames in JSON match exactly — including the mandatory `<deck>-` prefix to avoid cross-half-deck collisions). No path prefix needed in `<img src>`.
6. **Tag prefix**: `tyrants` or something longer like `tyrants-of-the-underdark`? Shorter is easier to type in the Anki browser.
