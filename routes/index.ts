import express, { Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { choice } from '../lib/helpers';
import Page from '../wiki/page';
import Projector from '../wiki/projector';

const router = express.Router();

router.route('/').all((_res, res) => {
  return res.redirect('/welcome.dream/');
});
router.route('/:dreamfile').all(pagefuck);
router.route('/:dreamfile/:link').all((req, res) => {
  if (!linkExists(req.params.link)) res.redirect('/fourohfour.dream/');
  let desiredPage = findLink(req.params.link, req.params.dreamfile);
  // if (desiredPage.match(/^https?:\/\/(.*)/)) {
  //   // external link
  //   return res.redirect(desiredPage);
  // }
  return res.redirect('/' + desiredPage + '/');
});

async function pagefuck(req: Request, res: Response) {
  if (req.url.includes('..')) return req.next!();
  if (req.url.includes('.') && !req.url.includes('.dream')) return req.next!();

  if (!req.url.endsWith('/')) return res.redirect(req.url + '/');

  let dreamfile = 'welcome.dream';
  if (req.params.dreamfile) {
    if (req.params.dreamfile.endsWith('.dream')) {
      dreamfile = req.params.dreamfile;
    } else if (linkExists(req.params.dreamfile)) {
      let desiredPage = findLink(req.params.dreamfile);
      return res.redirect('/' + desiredPage + '/');
    } else {
      return res.redirect('/fourohfour.dream/');
    }
  }

  let pagetext = await fs
    .readFile(path.join(__dirname, '../book' + dreamfile), 'utf8')
    .catch((err) => {
      if (err.errno === -2) {
        res.redirect('/fourohfour.dream/');
      } else {
        console.error(err);
        res.status(500).send('500 somehow');
      }
    });
  if (pagetext === undefined) return;

  let page = Page.readFromPage(pagetext, dreamfile);
  let projector = new Projector(page);

  let pageData = {
    title: page.title,
    filename: page.filename,
    secrets: projector.secrets,
    output: projector.output,
    colour: projector.colourScheme,
  };

  return res.render('page.handlebars', pageData);
}

function linkExists(word: string) {
  if (!global.allLinks[word.toLowerCase()]) return false;
  return true;
}

function findLink(link: string, verboten?: string): string {
  let candidates = global.allLinks[link.toLowerCase()];
  console.log('findlink', link, 'from', verboten, 'candidates', candidates);
  if (candidates.length === 1 && candidates[0] == verboten) {
    console.log('returning identity!', verboten);
    return verboten;
  }
  do {
    var desiredPage = choice(candidates);
  } while (verboten && desiredPage === verboten);
  return desiredPage;
}
