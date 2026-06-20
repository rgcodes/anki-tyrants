import { joinEffect } from '../utils/html.js';

export const id = 'effect';
export const label = 'Effect';
export const question = 'What is the effect?';
export const showsName = true;

export function answer(card) {
  return joinEffect(card.effect);
}
