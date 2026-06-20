export const id = 'values';
export const label = 'Values';
export const question = 'Deck value / inner circle value?';
export const showsName = true;

export function answer(card) {
  return `${card.deck_value} / ${card.inner_circle_value}`;
}
