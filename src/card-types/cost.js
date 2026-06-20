export const id = 'cost';
export const label = 'Cost';
export const question = 'What is the cost?';
export const showsName = true;

export function answer(card) {
  return String(card.cost);
}
