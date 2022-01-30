export function ruleForInt(ruleNum: number): string[] {
  let binary = ruleNum.toString(2);
  return ('00000000' + binary).slice(-8).split('');
}

export function iterate(previous: string, rule: string[]): string {
  let output = '';
  for (let i = 0; i < previous.length; i++) {
    let mask = 0;
    if (previous.substring((i + previous.length - 1) % previous.length, 1) == '1') mask += 4;
    if (previous.substring(i, 1) == '1') mask += 2;
    if (previous.substring((i + previous.length + 1) % previous.length, 1) == '1') mask += 1;
    output += rule[mask].toString();
  }
  return output;
}

export function translate(input: string, table: number[]): string {
  let output = '';
  for (let i = 0; i < input.length; i++) {
    output += table[parseInt(input.substring(i, 1))].toString();
  }
  return output;
}
