import bodyParser from "body-parser";
import express from "express";
import { engine } from "express-handlebars";
import path from "path";

const PORT = 7004;

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../public")));
console.log(path.join(__dirname, "../public"));
app.engine("hbs", engine());
app.set("view engine", "hbs");

app.get("/", (req, res) => {
  return res.render("home", {
    title: "Home",
    contohText: "Hello World",
  });
});

const server = app.listen(
  PORT,
  () => console.log(`Server started on port ${PORT}`), // tslint:disable-line
);

// Handling terminate gracefully
process.on("SIGTERM", () => {
  console.log('SIGTERM signal received.'); // tslint:disable-line
  console.log('Closing Express Server'); // tslint:disable-line
  server.close(() => {
    console.log('Express server closed.'); // tslint:disable-line
  });
});
