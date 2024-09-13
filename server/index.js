"use strict";

const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const dao = require("./dao");

//AuthN
const passport = require("passport");
const LocalStrategy = require("passport-local");

//Server
const app = new express();
const port = 3001;

//Cors options
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
};

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));

// for (let i = 0; i < 100; i++) {
//  dao.addUser('User '+i, 'user', 'password', 0);
// }

// dao.addUser('000 User', 'user', 'password', 0);

// dao.generateShifts(9, 2024);

passport.use(
  new LocalStrategy(async function verify(username, password, callback) {
    const user = await dao.getUser(username, password);
    if (!user) return callback(null, false, "Wrong username or password");

    return callback(null, user);
  })
);

passport.serializeUser(function (user, callback) {
  callback(null, user);
});

passport.deserializeUser(function (user, callback) {
  return callback(null, user);
});

const session = require("express-session");

app.use(
  session({
    secret: "randomSecretChengedInProduction :)",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: app.get("env") === "production" ? true : false,
    },
  })
);

app.use(passport.authenticate("session"));

const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: "Not authenticated" });
};


function generateMarkdownTable(jsonData) {
  // Inizializza la stringa della tabella con l'intestazione
  let markdown = "| Data       | Utente 1   | Utente 2   | Utente 3   |\n";
  markdown += "|------------|------------|------------|------------|\n";

  // Itera su ogni turno nel JSON
  jsonData.forEach(item => {
      const date = item.date; // Ottieni la data
      const shift = item.shift; // Ottieni gli utenti del turno

      // Gestisci il caso di meno di 3 utenti aggiungendo celle vuote
      const user1 = shift[0] || "";
      const user2 = shift[1] || "";
      const user3 = shift[2] || "";

      // Aggiungi una riga alla tabella Markdown
      markdown += `| ${date} | ${user1} | ${user2} | ${user3} |\n`;
  });

  return markdown;
}



//APIs

app.post("/api/user", (req, res) => {
  const { name, role, password, score } = req.body;
  dao
    .addUser(name, role, password, score)
    .then((response) => res.status(200).json(response))
    .catch((err) => res.status(500).json(err));
});

app.post("/api/absences", (req, res) => {
  const { userId, absences } = req.body;
  dao
    .addAbsences(userId, absences)
    .then((response) => res.status(200).json(response))
    .catch((err) => res.status(500).json(err));
});

app.patch("/api/score", (req, res) => {
  const { userId, score } = req.body;
  dao
    .editScore(userId, score)
    .then((response) => res.status(200).json(response))
    .catch((err) => res.status(500).json(err));
});

app.get("/api/shifts", (req, res) => {
  const { month, year } = req.query;
  dao
    .generateShifts(month, year)
    .then((response) => {
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="generated.md"'
      );
      res.setHeader("Content-Type", "text/markdown");
      res.status(200);
      const markdown = generateMarkdownTable(response);
      res.send(markdown);
    })
    .catch((err) => res.status(500).json(err));
});

app.get("/api/users", (req, res) => {
  dao
    .getUsers()
    .then((response) => res.status(200).json(response))
    .catch((err) => res.status(500).json(err));
});


app.post("/api/sessions", function (req, res, next) {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json({ error: info });
    }
    req.login(user, (err) => {
      if (err) return next(err);
      console.log(req.user)
      return res.status(200).json(req.user);
    });
  })(req, res, next);
});

app.get("/api/sessions/current", (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json(req.user);
  } else res.status(401).json({ error: "Not authenticated" });
});

app.delete("/api/sessions/current", (req, res) => {
  req.logout(() => {
    res.status(200).json({});
  });
});


app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

module.exports = app;
