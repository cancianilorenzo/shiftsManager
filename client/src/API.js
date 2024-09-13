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
    body: JSON.stringify({ absences: absences, userId: id }),
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

function generateShifts(month, year) {
  return fetch(SERVER_URL + "shifts/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ month: month, year: year }),
    credentials: "include",
  }).then((res) => {
    if (res.ok) {
      return res;
    } else {
      return res.json().then((err) => {
        throw err;
      });
    }
  });
}

function patchScore(id, score) {
  return fetch(SERVER_URL + "score", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId: id, score: score }),
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

function addUser(name, role, password, score) {
  return fetch(SERVER_URL + "user", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: name, role: role, password: password, score: score}),
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



function login(username, password) {
  return fetch(SERVER_URL + "sessions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
    credentials: "include",
  })
    .then((res) => {
      if (res.ok) {
        return res.json();
      } else {
        return res.json().then((err) => {
          throw err;
        });
      }
    })
    .then((user) => {
      return user;
    })
    .catch((error) => {
      throw error
    });
}


function logout() {
  return fetch(SERVER_URL + "sessions/current", {
    method: "DELETE",
    credentials: "include",
  })
    .then((res) => {
      if (res.ok) {
        return res.json();
      } else {
        return res.json().then((err) => {
          throw err;
        });
      }
    })
    .then(() => {
      return null;
    })
    .catch((error) => {
      throw error;
    });
}

function getInfo() {
  return fetch(SERVER_URL + "sessions/current", {
    method: "GET",
    credentials: "include",
  })
    .then((res) => {
      if (res.ok) {
        return res.json();
      } else {
        return res.json().then((err) => {
          throw err;
        });
      }
    })
    .then((user) => {
      return user;
    })
    .catch((error) => {
      throw  error;
    });
}

const API = { getUsers, insertAbsences, generateShifts, login, logout, getInfo, patchScore, addUser, SERVER_URL };
export default API;
