"use strict";

const db = require("./db");
const dayjs = require("dayjs");

exports.addUser = (name, role, password, score) => {
  return new Promise((resolve, reject) => {
    const sql =
      "INSERT INTO users (name, role, password, score) VALUES (?, ?, ?, ?)";
    db.run(sql, [name, role, password, score], function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(this.lastID);
    });
  });
};

exports.editScore = (name, score) => {
  return new Promise((resolve, reject) => {
    const sql = "UPDATE users SET score = ? WHERE name= ?";
    db.run(sql, [score, name], function (err) {
      if (err) {
        reject(err);
      }
      resolve(this.lastID);
    });
  });
};


exports.addAbsences = (userId, absences) => {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(absences)) {
      return reject("Errors in params");
    }

    db.serialize(() => {
      // Remove previous absences
      db.run(`DELETE FROM absences WHERE user = ?`, [userId], function (err) {
        if (err) {
          reject(err.message);
          return;
        }

        // Update absences
        const stmt = db.prepare(
          `INSERT INTO absences (user, date) VALUES (?, ?)`
        );
        absences.forEach((date) => {
          stmt.run(userId, date);
        });
        stmt.finalize();

        resolve("Updated");
      });
    });
  });
};

