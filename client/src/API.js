"use strict";

const SERVER_URL = "http://localhost:3001/api/";

function getUsers() {
  return fetch(SERVER_URL + "users")
    .then((users) => {
      return users.json();
    })
    .catch((error) => {
      throw error;
    });
}

function insertAbsences(id, absences) {
  return fetch(SERVER_URL + "absences/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ absences: absences, userId: id}),
    credentials: "include",
  }).then((res) => {
    if (res.ok) {
      return res.json();
    } else {
      return res.json().then((err) => {
        throw err;
      });
    }
  });
}

const API = { getUsers, insertAbsences };
export default API;
