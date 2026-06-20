import { escapeHtml } from '../utils/html.js';

export const id = 'name';
export const label = 'Name';
export const question = 'What is this card called?';
export const showsName = false;

export function answer(card) {
  const name = escapeHtml(card.name);
  if (card.flavour) {
    return `${name}<br><i>${escapeHtml(card.flavour)}</i>`;
  }
  return name;
}
