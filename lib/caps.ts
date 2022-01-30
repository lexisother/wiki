import { choice } from './helpers';

function uppercase(text: string): string {
  return text.toUpperCase();
}

function lowercase(text: string): string {
  return text.toLowerCase();
}

function titlecase(text: string): string {
  return text.charAt(0).toUpperCase() + text.substr(1).toLowerCase();
}

function dice(text: string): string {
  return text
    .split('')
    .map((letter) => choice([uppercase, lowercase])(letter))
    .join('');
}

function terezi(text: string): string {
  return uppercase(text).replace('A', '4').replace('E', '3').replace('I', '1');
}

function randomCaps() {
  return choice([uppercase, uppercase, uppercase, lowercase, titlecase, terezi]);
}

export function capsFor(key: string) {
  if (key === 'lowercase') return lowercase;
  if (key === 'titlecase') return titlecase;
  if (key === 'dicecase') return dice;
  if (key === 'terezi') return terezi;

  if (key === 'random') return randomCaps();

  return uppercase;
}
