"use strict";
require('dotenv').config();


const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const compression = require("compression");
const helmet = require("helmet");
const RateLimit = require("express-rate-limit");
const fs = require("fs");
const https = require("https");

const dao = require("./dao");

//AuthN
const passport = require("passport");
const LocalStrategy = require("passport-local");


//Server
const app = new express();
const port = process.env.PORT || 3001;

//Cors options
const corsOptions = {
  origin: [process.env.ORIGIN1, process.env.ORIGIN2] || "http://localhost:5173",
  credentials: true,
};

const limiter = RateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20,
})


app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.use(compression());
app.use(helmet());

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
const MemoryStore = require('memorystore')(session)

app.use(
  session({
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 86400000,
      httpOnly: true,
      secure: (process.env.NODE_ENV === "production" ? true : false),
    },
    store: new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
  })
);


app.use(session({

  resave: false,
  secret: 'keyboard cat'
}))

app.use(passport.authenticate("session"));

const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: "Not authenticated" });
};


function generateMarkdownTable(jsonData) {
  // Inizializza la stringa della tabella con l'intestazione
  let markdown = "| Data       |    |    |    |\n";
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

if(process.env.NODE_ENV === 'production'){
  app.set('trust proxy', 1);
}



//APIs

app.post("/api/user", [isLoggedIn], (req, res) => {
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

app.patch("/api/score", [isLoggedIn], (req, res) => {
  const { userId, score } = req.body;
  dao
    .editScore(userId, score)
    .then((response) => res.status(200).json(response))
    .catch((err) => res.status(500).json(err));
});

app.get("/api/shifts", [isLoggedIn], (req, res) => {
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
  console.log(`Server running`);
});



https
  .createServer(
    {
      key: fs.readFileSync(process.env.SSL_KEY),
      cert: fs.readFileSync(process.env.SSL_CERTIFICATE),
    },
    app
  )
  .listen(port, function () {
    console.log(
     'Server running on port ', port
    );
  });

module.exports = app;
