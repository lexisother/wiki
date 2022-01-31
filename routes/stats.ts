import express from 'express';
import {} from '../wiki/transpiler';

const router = express.Router();

router.route('/!stats/').all(async (req, res) => {
  const globalData = {
    allLinks: global.allLinks,
    allTags: global.allTags,
    pages: global.completeKeyed,
  };
  const dataString = JSON.stringify(globalData);
  const dataBuffer = Buffer.from(dataString, 'binary').toString('base64');

  let data = {
    title: 'dw stats',
    layout: 'secret',
    pages: global.complete.length,
    time: global.stats.time,
    time2: global.stats.time2,
    tagReaches: global.stats.tagReaches,
    linksFired: global.stats.linksFired,
    fractions: global.stats.fractions,
    todos: global.todos,
    allPages: [{}],
    dataBuffer,
  };

  let wew = [...global.complete];
  wew.sort((a, b) => {
    return a.incoming.length - b.incoming.length; // largest one last
  });
  data.allPages = wew;

  res.render('stats.handlebars', data);
});

export default router;
