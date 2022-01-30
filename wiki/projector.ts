import Page from './page';
import { grimerFor } from '../lib/grimes';
import { curtainsFor } from '../lib/curtains';
import { justifierFor } from '../lib/justify';
import { capsFor } from '../lib/caps';
import { randomScheme, schemeFromHex } from '../lib/colour';

export default class Projector {
  public page: Page;
  public output: string;

  public secrets: string[];

  public grimer: (num: number) => string;
  public curtains: (grimer: (num: number) => string) => { left: string; right: string };
  public justifier: (str: string) => string;
  public caps: (str: string) => string;
  public colourScheme: {
    prim: string;
    hint: string;
    grime: string;
    wall: string;
  };

  constructor(page: Page) {
    this.page = page;
    this.output = '';

    this.secrets = [];

    this.grimer = grimerFor('stable');
    this.curtains = curtainsFor('random');
    this.justifier = justifierFor('auto');
    this.caps = capsFor('random');
    this.colourScheme = randomScheme();

    this.runCommandsForRow(0);

    this.render();
  }

  render() {
    let output = '';
    let index = 0;
    for (let i = 0; i < 5; i++) {
      let curtains = this.curtains(this.grimer);
      output += `<span class="grime">${curtains.left}</span> `;
      output += ' '.repeat(40);
      output += ` <span class="grime">${curtains.right}</span>\n`;
    }
    for (let row of this.page.textRows) {
      this.runCommandsForRow(index);

      let curtains = this.curtains(this.grimer);
      output += `<span class="grime">${curtains.left}</span> `;
      output += this.decorateRow(this.justifier(row));
      output += ` <span class="grime">${curtains.right}</span>\n`;

      index += 1;
    }
    this.runCommandsForRow(this.page.textRows.length); // stray tags after last text row
    for (let i = 0; i < 5; i++) {
      let curtains = this.curtains(this.grimer);
      output += `<span class="grime">${curtains.left}</span> `;
      output += ' '.repeat(40);
      output += ` <span class="grime">${curtains.right}</span>\n`;
    }

    this.output = output;
  }

  runCommandsForRow(row: number) {
    this.page.commandRows
      .filter((command) => command.row === row)
      .forEach((command) => {
        if (command.command === 'grimes') {
          this.grimer = grimerFor(command.params);
        }
        if (command.command === 'curtains') {
          this.curtains = curtainsFor(command.params);
        }
        if (command.command === 'justify' || command.command === 'align') {
          this.justifier = justifierFor(command.params);
        }
        if (command.command === 'caps') {
          this.caps = capsFor(command.params);
        }
        if (command.command === 'colour') {
          this.colourScheme = schemeFromHex(command.params);
        }
        if (command.command === 'secret') {
          this.secrets.push(command.params);
        }
      });
  }

  decorateRow(row: string) {
    let tokens = this.findTokens(row);
    let rowout = '';
    tokens.forEach((token) => {
      if (token.which === 'etc') {
        rowout += token.token;
        return;
      }
      if (token.which === 'grime') {
        rowout += '<span class="grime">' + token.token + '</span>';
        return;
      }

      let wordlink = this.linkExists(token.token, this.page.filename);
      let capsOrNot = '';
      let tokenDisplay = token.token.replace(/_/g, ' ');
      tokenDisplay = this.caps(tokenDisplay);
      if (token.which === 'uppercase') {
        capsOrNot = 'class="link"';
      }
      if (wordlink) {
        rowout +=
          '<a href="' + token.token.toLowerCase() + '/" ' + capsOrNot + '>' + tokenDisplay + '</a>';
      } else {
        rowout += tokenDisplay;
      }
    });
    return rowout;
  }
  findTokens(row: string) {
    let pos = 0;
    let tokens = [];
    let ack = '';
    let which = 'nada';
    while (pos < 40) {
      let next = row.substring(pos, 1);
      if (pos === 0) which = this.tokenType(next);
      if (this.tokenType(next) !== which && next !== '_') {
        tokens.push({ token: ack, which });
        which = this.tokenType(next);
        ack = '';
      }
      if (which === 'grime') {
        console.log(`DEBUG: GRIME FOUND!!!! ${next} (NUM: ${Number(next)}) | ${ack}`);
        ack += this.grimer(Number(next));
        console.log(`DEBUG: ${which} PUSHED THROUGH GRIMER, RESULT: ${this.grimer(Number(next))}`);
      } else {
        ack += next;
      }
      pos += 1;
    }
    tokens.push({ token: ack, which });
    return tokens;
  }

  tokenType(letter: string) {
    if (letter.match(/[0-9]/)) return 'grime';
    if (letter.match(/[a-z_]/)) return 'lowercase';
    if (letter.match(/[A-Z_]/)) return 'uppercase';
    return 'etc';
  }

  linkExists(word: string, filename: string) {
    if (!global.allLinks[word.toLowerCase()]) return false;
    if (
      filename &&
      global.allLinks[word.toLowerCase()].length === 1 &&
      global.allLinks[word.toLowerCase()][0] === filename
    )
      return false;
    return true;
  }
}
