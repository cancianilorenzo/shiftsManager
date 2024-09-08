"use strict";

const db = require("./db");
const dayjs = require("dayjs");
const utils = require('./utils')
const crypto = require('crypto');

const keyLength = 64;
const costFactor = 16384;
const blockSize = 8;
const parallelizationFactor = 1;

exports.addUser = (name, role, password, score) => {
  return new Promise((resolve, reject) => {

    var salt = crypto.randomBytes(32);
    crypto.scrypt(password, salt, keyLength, { N: costFactor, r: blockSize, p: parallelizationFactor }, (err, derivedKey) => {
        if (err) throw err;
        password = derivedKey.toString('hex');
        salt = salt.toString('hex');
        const sql =
        "INSERT INTO users (name, role, score, password, salt) VALUES (?, ?, ?, ?, ?)";
      db.run(sql, [name, role, score, password, salt], function (err) {
        if (err) {
          reject(err);
          return;
        }
        resolve(this.lastID);
      });

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

exports.generateShifts = (month, year) => {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM users`, (err, users) => {
      if (err) {
        reject(err.message);
        return;
      }

      const usersData = users.map((user) => {
        return new Promise((resolve, reject) => {
          db.all(
            `SELECT date FROM absences WHERE user = ?`,
            [user.id],
            (err, absences) => {
              if (err) reject(err);
              user.absences = absences.map((a) => a.date);
              resolve(user);
            }
          );
        });
      });

      Promise.all(usersData)
        .then((usersComplete) => {
          console.log(usersComplete)
          const monthlyShifts = utils.createMonthlyShifts(
            usersComplete,
            month,
            year
          );
          const weekDays = {
            domenica: "Sunday",
            lunedi: "Monday",
            mercoledi: "Wednesday",
            venerdi: "Friday",
          };
          const weeklyShifts = {
            [weekDays.domenica]: 3,
            [weekDays.lunedi]: 2,
            [weekDays.mercoledi]: 2,
            [weekDays.venerdi]: 3,
          };
          monthlyShifts.forEach((shift) => {
            shift.shift.forEach((userName) => {
              const user = usersComplete.find((p) => p.name === userName);
              const shiftType =
                weeklyShifts[dayjs(shift.date).format("dddd")] === 3
                  ? "triplo"
                  : "doppio";
              db.run(
                `INSERT INTO shifts (date, user, shift_type) VALUES (?, ?, ?)`,
                [shift.date, user.id, shiftType]
              );
              //Update user score
              console.log("updating score");
              db.run(`UPDATE users SET score = ? WHERE id = ?`, [
                user.score,
                user.id,
              ]);
            });
          });
          console.log("monthly shifts");
          console.log(monthlyShifts);
          resolve(monthlyShifts);
        })
        .catch((err) => reject(err.message));
    });
  });
};




exports.getUser = (name, password) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM users WHERE name=?';
    db.get(sql, [name], (err, row) => {
      if (err) {
        reject(err);
      } else if (row === undefined) {
        resolve(false);
      }
      else {
        const user = { id: row.id, name: row.name, role: row.role };

        crypto.scrypt(password, Buffer.from(row.salt, 'hex'), keyLength, { N: costFactor, r: blockSize, p: parallelizationFactor }, function (err, hashedPassword) {
          if (err) reject(err);
          if (!crypto.timingSafeEqual(Buffer.from(row.password, 'hex'), Buffer.from(hashedPassword, 'hex')))
            resolve(false);
          else
            resolve(user);
        });
      }
    });
  });
};