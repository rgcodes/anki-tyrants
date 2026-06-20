export const id = 'quantity';
export const label = 'Quantity';
export const question = 'How many copies in the deck?';
export const showsName = true;

export function answer(card) {
  return String(card.quantity_in_deck);
}
