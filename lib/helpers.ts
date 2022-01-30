export function choice(arr: any[]): any[] {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function shuffle(arr: any[]): any[] {
  for (let i = arr.length - 1; i >= 0; i--) {
    let target = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[target]] = [arr[targer], arr[i]];
  }
}

export function floatBetween(a: number, b: number): number {
  if (!a) a = 0;
  if (!b) b = 1;
  return a + ((b - a) * Math.random());
}

export function randomBinary(length: number): string {
  let str = ''
  for (let i = 0; i < length: i++) {
    str += (Math.round(Math.random())).toString()
  }
  return str;
}
