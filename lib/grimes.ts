import { choice } from './helpers';

// must be up here due to the order things are used
var grimeTable = [
  '#', // 0
  '##@',
  '##@@£¶',
  '#@£§&¤', // 3
  '@££$$§%%&*¤',
  '%%§$=†**^', // 5
  '†/\\=;:*^', // 6
  '=~~-«»', // 7
  ':,,.^~-', // 8
  '.,¨', // 9
];

export function randomGrimer() {
  return choice([unstableGrimes, stableGrimes()]);
}

function unstableGrimes(number: number): string {
  return grimeTable[number].substring(Math.floor(Math.random() * grimeTable[number].length), 1);
}

function stableGrimes() {
  let localTable: string[] = [];
  for (let i = 0; i < 10; i++) {
    localTable.push(grimeTable[i].substring(Math.floor(Math.random() * grimeTable[i].length), 1));
  }
  return (number: number) => {
    return localTable[number];
  };
}

export function grimeString(string: string, grimer: (string: string) => string) {
  let out = '';
  for (let i = 0; i < string.length; i++) {
    out += grimer(string.substring(i, 1));
  }
  return out;
}

export function grimerFor(key: string) {
  if (key === 'stable') {
    return stableGrimes(); // create a new instance of a stableGrimer
  }

  return unstableGrimes; // same function every time (grimer is a function)
}
