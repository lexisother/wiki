import fs from 'fs/promises';
import path from 'path';

// TODO TODO TODO: HAHAHA PLEASE CLEAN UP THE TYPES

declare global {
  var complete: {
    title: string;
    filename: string;
    incoming: string[];
    outgoing: string[];
    linksTo: string[];
    reachableFrom: string[];
  }[];
  var completeKeyed: {
    [key: string]: {
      title: string;
      filename: string;
      incoming: string[];
      outgoing: string[];
      linksTo: string[];
      reachableFrom: string[];
    };
  };
  var allLinks: { [tag: string]: [string] };
  var allTags: { [tag: string]: [string] };
  var todos: { filename: string; todos: string[] }[];
  var stats: {
    tagReaches: {
      tag: string;
      reach: number;
      real: boolean;
    }[];
    linksFired: {
      link: string;
      intensity: number;
      real: boolean;
    }[];
    time: number;
    time2: number;
    fractions: { key: string; in: number; out: number; real: boolean }[];
  };
}

export default class Transpiler {
  async parseBooks() {
    console.log('transpiler running...');
    let timeBegin = new Date().getTime();
    let bookContents = await fs.readdir(path.join(__dirname, '../../book'));
    bookContents = bookContents.filter((filename) => {
      return !filename.startsWith('.');
    });
    let books: Promise<{
      incoming: Set<string>;
      outgoing: Set<string>;
      filename: string;
      title: string;
      linksTo: Set<string>;
      reachableFrom: Set<string>;
      todos: string[];
    }>[] = [];
    bookContents.forEach(async (filename) => {
      if (!filename.endsWith('.dream')) return;
      const book = this.readBook(filename);
      books.push(book);
    });

    // let externalText = await fs.readFile(path.join(__dirname, '../book/_external.txt'), 'utf8');
    // let external: { tag: string; destination: string }[] = [];
    // externalText.split('\n').forEach((row) => {
    //   if (row.indexOf(' ----- ') >= 0) {
    //     let rowArr = row.split(' ----- ');
    //     let tag = rowArr[0].trim();
    //     let destination = rowArr[1].trim();
    //     external.push({ tag, destination });
    //   }
    // });

    Promise.all(books).then((books) => {
      books.forEach((sender) => {
        books.forEach((receiver) => {
          if (sender !== receiver) {
            sender.outgoing.forEach((link) => {
              if (receiver.incoming.has(link)) {
                sender.linksTo.add(receiver.filename);
                receiver.reachableFrom.add(sender.filename);
              }
            });
          }
        });
      });

      // books.forEach((page) => {
      //   external.forEach((website) => {
      //     if (page.outgoing.has(website.tag)) {
      //       page.linksTo.add(website.destination);
      //     }
      //   });
      // });

      let complete: {
        title: string;
        filename: string;
        incoming: string[];
        outgoing: string[];
        linksTo: string[];
        reachableFrom: string[];
      }[] = [];
      let completeKeyed: {
        [key: string]: {
          title: string;
          filename: string;
          incoming: string[];
          outgoing: string[];
          linksTo: string[];
          reachableFrom: string[];
        };
      } = {};
      books.forEach((book) => {
        let completeBook = {
          title: book.title,
          filename: book.filename,
          incoming: Array.from(book.incoming),
          outgoing: Array.from(book.outgoing),
          linksTo: Array.from(book.linksTo),
          reachableFrom: Array.from(book.reachableFrom),
        };
        complete.push(completeBook);
        completeKeyed[book.filename] = completeBook;
      });

      // TODO: Type this, idk how
      let allLinks: { [tag: string]: [string] } = {};
      complete.forEach((page) => {
        page.incoming.forEach((tag) => {
          if (allLinks[tag]) {
            allLinks[tag].push(page.filename);
          } else {
            allLinks[tag] = [page.filename];
          }
        });
      });
      // external.forEach((link) => {
      //   let lowerTag = link.tag.toLowerCase();
      //   if (allLinks[lowerTag]) {
      //     allLinks[lowerTag].push(link.destination);
      //   } else {
      //     allLinks[lowerTag] = [link.destination];
      //   }
      // });

      let allTags: { [tag: string]: [string] } = {};
      complete.forEach((page) => {
        page.outgoing.forEach((tag) => {
          if (allTags[tag]) {
            allTags[tag].push(page.filename);
          } else {
            allTags[tag] = [page.filename];
          }
        });
      });

      let todos: { filename: string; todos: string[] }[] = [];
      books.forEach((page) => {
        if (page.todos && page.todos.length > 0) {
          let pageTodos: { filename: string; todos: string[] } = {
            filename: page.filename,
            todos: [],
          };
          page.todos.forEach((todo) => {
            pageTodos.todos.push(todo);
          });
          todos.push(pageTodos);
        }
      });

      let timeEnd = new Date().getTime();
      let time = timeEnd - timeBegin;

      global.complete = complete;
      global.completeKeyed = completeKeyed;
      global.allLinks = allLinks;
      global.allTags = allTags;
      global.todos = todos;
      fs.writeFile(
        path.join(__dirname, '../../static/complete.json'),
        JSON.stringify(complete),
        'utf8',
      );
      fs.writeFile(
        path.join(__dirname, '../../static/completeKeyed.json'),
        JSON.stringify(completeKeyed),
        'utf8',
      );
      fs.writeFile(
        path.join(__dirname, '../../static/allLinks.json'),
        JSON.stringify(allLinks),
        'utf8',
      );
      fs.writeFile(
        path.join(__dirname, '../../static/allTags.json'),
        JSON.stringify(allTags),
        'utf8',
      );
      fs.writeFile(path.join(__dirname, '../../static/todos.json'), JSON.stringify(todos), 'utf8');
      console.log('transpiler done!');

      // stats

      let allIncoming: string[] = [];
      let allOutgoing: string[] = [];
      global.complete.forEach((page) => {
        page.incoming.forEach((tag) => {
          if (!allIncoming.includes(tag)) allIncoming.push(tag);
        });
        page.outgoing.forEach((link) => {
          if (!allOutgoing.includes(link)) allOutgoing.push(link);
        });
      });

      let tagReaches: { tag: string; reach: number; real: boolean }[] = [];
      let tagReachesLookup: Map<string, number> = new Map();
      allIncoming.forEach((tag) => {
        let reach = 0;
        global.complete.forEach((page) => {
          if (page.incoming.includes(tag)) reach++;
        });
        let real = allOutgoing.includes(tag);
        tagReaches.push({ tag, reach, real });
        tagReachesLookup.set(tag, reach);
      });
      tagReaches.sort((a, b) => b.reach - a.reach);

      let linksFired: { link: string; intensity: number; real: boolean }[] = [];
      let linksFiredLookup: { [link: string]: number } = {};
      allOutgoing.forEach((link) => {
        let intensity = 0;
        global.complete.forEach((page) => {
          if (page.outgoing.includes(link)) intensity++;
        });
        let real = allIncoming.includes(link);
        linksFired.push({ link, intensity, real });
        linksFiredLookup[link] = intensity;
      });
      linksFired.sort((a, b) => b.intensity - a.intensity);

      let allKeywords: string[] = [];
      books.forEach((book) => {
        book.incoming.forEach((tag) => {
          if (!allKeywords.includes(tag)) allKeywords.push(tag);
        });
        book.outgoing.forEach((link) => {
          if (!allKeywords.includes(link)) allKeywords.push(link);
        });
      });
      let fractions: { key: string; in: number; out: number; real: boolean }[] = [];
      allKeywords.forEach((key) => {
        let ob = { key, in: 0, out: 0, real: true };
        if (linksFiredLookup[key] && typeof linksFiredLookup[key] === 'number')
          ob.out = linksFiredLookup[key]; // wtf
        if (tagReachesLookup.get(key) && typeof tagReachesLookup.get(key) === 'number')
          ob.in = tagReachesLookup.get(key)!;
        if (ob.in === 0 || ob.out === 0) ob.real = false;
        fractions.push(ob);
      });
      fractions.sort((a, b) => {
        // div b y zero checks
        if (b.out === 0) {
          if (a.out === 0) {
            // if both have zero links, order by who has the most links anyway
            return b.in - a.in;
          }
          return 1; // b divides by zero, deffo bigger than a
        } else if (a.out === 0) {
          return -1; // a deffo bigger than b, and we do b - a
        }

        // if both have 0 incoming, order by reverse outgoing i guess?
        if (b.in === 0 && a.in === 0) {
          return a.out - b.out; // not sure
        }

        // otherwise do the fractions!
        return b.in / b.out - a.in / a.out;
      });

      let timeEnd2 = new Date().getTime();
      let time2 = timeEnd2 - timeEnd;

      global.stats = { tagReaches, linksFired, time, time2, fractions };
      fs.writeFile(
        path.join(__dirname, '../../static/stats.json'),
        JSON.stringify(global.stats),
        'utf8',
      );
      console.log('transpiler stats done!');
    });
  }

  async readBook(filename: string) {
    let incoming: Set<string> = new Set();
    let outgoing: Set<string> = new Set();
    let content = await fs.readFile(path.join(__dirname, `../../book/${filename}`), 'utf8');
    let linksTo: Set<string> = new Set();
    let reachableFrom: Set<string> = new Set();
    let rows = content.split('\n');
    let title = '(undefined)';
    let todos: string[] = [];
    rows.forEach((row) => {
      if (row.startsWith('^')) {
        let split = row.split('^');
        if (split[1].includes('tag')) {
          let tagstring = split[2].split(' ');
          tagstring.forEach((tag) => {
            if (tag.trim().length > 0) incoming.add(tag.trim());
          });
        } else if (split[1].includes('title')) {
          title = split[2].trim();
        } else if (split[1].includes('todo')) {
          todos.push(split[2].trim());
        }
      } else {
        let row2 = row.replace(/[^a-zA-Z_]+/g, ' ');
        row2 = row2.replace(/s+/g, ' ');
        let words = row2.split(' ');
        words.forEach((word) => {
          if (word.trim().length === 0) return;
          if (word.toLowerCase() === word) {
            outgoing.add(word.toLowerCase());
          } else {
            word = word.replace(/[^A-Z_]/, '');
            if (word.trim().length === 0) return;
            outgoing.add(word.toLowerCase());
          }
        });
      }
    });
    return {
      incoming,
      outgoing,
      filename,
      title,
      linksTo,
      reachableFrom,
      todos,
    };
  }
}
