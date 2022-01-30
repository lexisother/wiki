import bodyParser from 'body-parser';
import express, { Request, Response, NextFunction } from 'express';
import { engine } from 'express-handlebars';
import fs from 'fs/promises';
import path from 'path';
import Transpiler from './wiki/transpiler';

const PORT = 7004;

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../static')));
app.engine('hbs', engine());
app.set('view engine', 'hbs');

const server = app.listen(
  PORT,
  () => console.log(`Server started on port ${PORT}`), // tslint:disable-line
);

const jsonColdStorage = ['complete', 'completeKeyed', 'allLinks', 'allTags', 'stats', 'todos'];
let needsUpdate = false;
let index = 0;
jsonColdStorage.forEach(async (variable) => {
  let filename = path.join(__dirname, `../static/${variable}.json`);
  await fs
    .readFile(filename, 'utf8')
    .then((text) => {
      /// @ts-expect-error errr, well, yanno... global stuff in TS...
      global[variable] = JSON.parse(text);
      console.log(`read ${filename}`);
    })
    .catch(async () => {
      console.log(`couldn't read ${filename} - it will be created`);
      needsUpdate = true;
    });
  if (needsUpdate && index === jsonColdStorage.length - 1) {
    let transpiler = new Transpiler();
    transpiler.parseBooks();
  }
  index++;
});

app.use((request, _response, next) => {
  console.log(request.url);
  next();
});

app.use((_request, response, _next) => {
  response.status(404).send('404 lmao');
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err) {
    res.status(500).send('500 lmao: ' + err);
    console.log(err);
  }
});

// Handling terminate gracefully
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received.'); // tslint:disable-line
  console.log('Closing Express Server'); // tslint:disable-line
  server.close(() => {
    console.log('Express server closed.'); // tslint:disable-line
  });
});
