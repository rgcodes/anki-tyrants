export const id = 'race';
export const label = 'Race';
export const question = 'What race?';
export const showsName = true;

export function answer(card) {
  return card.race;
}
