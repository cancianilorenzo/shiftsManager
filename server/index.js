"use strict";

const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const dao = require("./dao");

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

app.post("/api/score", (req, res) => {
  const { userId, score } = req.body;
  dao
    .editScore(userId, score)
    .then((response) => res.status(200).json(response))
    .catch((err) => res.status(500).json(err));
});

app.get("/api/shifts", (req, res) => {
  const { month, year } = req.body;
  dao
    .generateShifts(month, year)
    .then((response) => res.status(200).json(response))
    .catch((err) => res.status(500).json(err));
});

app.get("/api/users", (req, res) => {
  dao
    .getUsers()
    .then((response) => res.status(200).json(response))
    .catch((err) => res.status(500).json(err));
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

module.exports = app;
