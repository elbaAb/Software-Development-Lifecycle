// utils/validationUtils.js

const path = require("path");
const { loadJson } = require("./fileUtils");

const USERS_FILE = path.join(__dirname, "..", "users", "users.json");

// Check if username is valid (letters, numbers, underscores, 3–20 chars)
function isValidUsername(username) {
  const regex = /^[a-zA-Z0-9_]{3,20}$/;
  return regex.test(username);
}

// Check if password is valid (min 8 chars, at least one number and letter)
function isValidPassword(password) {
  const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  return regex.test(password);
}

function isValidEmail(email) {
  const users = loadJson(USERS_FILE); // load array of user objects

  const match = users.find(user => user.email === email);
  return !match;   // valid only if NOT found
}

module.exports = { isValidUsername, isValidPassword, isValidEmail };
