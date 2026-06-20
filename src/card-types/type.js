export const id = 'type';
export const label = 'Type';
export const question = 'What type?';
export const showsName = true;
// The card's type is shown by a coloured icon in the corner of the image, so we hide the image here.
export const showsImage = false;

export function answer(card) {
  return card.type;
}
