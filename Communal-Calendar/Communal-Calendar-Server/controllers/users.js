const fs = require("fs");           //requires file editing
const path = require("path");       //requires path functions
const bcrypt = require("bcrypt");   //requires encryption

const { loadJson, saveJson, createUserFolder } = require("../utils/fileUtils");
const { hashPassword, comparePassword } = require("../utils/cryptoUtils");
const { isValidUsername, isValidPassword, isValidEmail } = require("../utils/validationUtils");
const { generateAccessToken, generateRefreshToken, verifyToken } = require("../utils/tokenUtils");
const { error } = require("console");



const USERS_FILE = path.join(__dirname, "..", "users", "users.json");   //goes up to main directory and back down into users

async function registerUser(email, username, password) {   
  
  const users = loadJson(USERS_FILE);   //loads all ussers
  
  if (!isValidUsername(username)) {
    throw new Error("Invalid username format");
  }
  

  if (!isValidPassword(password)) {
    throw new Error("Password must be at least 8 chars, with letters and numbers");
  }


  if(!isValidEmail(email)){
    throw new Error("Email already linked to an account");
  }

  const passwordHash = await hashPassword(password); //hashes the password
  let user = { username: username, password: passwordHash, email: email };
  users.push(user);
  
  createUserFolder(username);   //creates a new folder

  saveJson(USERS_FILE, users);  //saves the user to the file
}
 

async function loginUser(username, password) {
  const users = loadJson(USERS_FILE);   //loads the users json data
  console.log("Login attempt:", username, password);
  console.log("Users on file:", users);

  // Find the user object in the array
  const user = users.find(u => u.username === username);
  if (!user) {
    throw new Error("User not found");
  }

  // Compare password (adjust field name if you stored plain text vs hash)
  const match = await comparePassword(password, user.passwordHash || user.password);
  if (!match) {
    throw new Error("Invalid password");
  }


  const accessToken = generateAccessToken({ username }, process.env.JWT_SECRET || "defaultSuperSecretKey");
  const refreshToken = generateRefreshToken({ username }, process.env.JWT_REFRESH_SECRET || "defaultSuperSecretKey");

  return {
    message: "Login successful",
    accessToken,
    refreshToken,
  };
}

function requestFriend(requester, requestee, accessToken) {
  console.log(requester, requestee, accessToken)
  verifyToken(accessToken, process.env.JWT_SECRET ||  "defaultSuperSecretKey" );

  const users = loadJson(USERS_FILE);
  console.log("LOAD USERS:", requester, requestee, accessToken);

  if (!requester || !requestee) {
    return { message: "Missing requester or requestee" };
  }

  // Validate target exists
  if (!users.find(u => u.username === requestee)) {
    return {
      message: `${requestee} is not a valid user (make sure you spelled it right!)`
    };
  }

  const filepath = path.join(__dirname, "..", "users", requestee, "friendRequests.json");

  // Ensure array
  let friendRequests = loadJson(filepath);
  if (!Array.isArray(friendRequests)) friendRequests = [];

  // Already sent?
  if (friendRequests.find(r => r.from === requester)) {
    return {
      message: `${requestee} already has a request from you!`
    };
  }

  // Add request
  friendRequests.push({
    from: requester,
    read: false,
    at: new Date().toISOString()
  });

  saveJson(filepath, friendRequests);

  return {
    message: `${requestee} has been sent a friend request`
  };
}

function denyFriend(requester, requestee, accessToken) {
  verifyToken(accessToken, process.env.JWT_SECRET ||  "defaultSuperSecretKey" );
  if (!requester || !requestee) {
    return { message: "Missing requester or requestee" };
  }

  const filepath = path.join(__dirname, "..", "users", requestee, "friendRequests.json");

  let friendRequests = loadJson(filepath);
  if (!Array.isArray(friendRequests)) friendRequests = [];

  // Remove the request
  const updated = friendRequests.filter(r => r.from !== requester);

  saveJson(filepath, updated);

  return { message: `You have successfully denied ${requester}` };
}

function acceptFriend(requester, requestee, accessToken) {
  verifyToken(accessToken, process.env.JWT_SECRET ||  "defaultSuperSecretKey" );

  const users = loadJson(USERS_FILE);

  if (!users.find(u => u.username === requester)) {
    return { message: `Requester ${requester} not found` };
  }

  const reqPath   = path.join(__dirname, "..", "users", requestee, "friendRequests.json");
  const frReqee   = path.join(__dirname, "..", "users", requestee, "friends.json");
  const frReqer   = path.join(__dirname, "..", "users", requester, "friends.json");

  let requests   = loadJson(reqPath);   if (!Array.isArray(requests)) requests = [];
  let friendsee  = loadJson(frReqee);   if (!Array.isArray(friendsee)) friendsee = [];
  let friendser  = loadJson(frReqer);   if (!Array.isArray(friendser)) friendser = [];

  // Must have pending request
  if (!requests.find(r => r.from === requester)) {
    return { message: `No friend request from ${requester} to accept` };
  }

  // Remove request
  requests = requests.filter(r => r.from !== requester);
  saveJson(reqPath, requests);

  // Add each other as friends (avoid duplicates)
  if (!friendsee.find(f => f.username === requester)) {
    friendsee.push({ username: requester, favorite: false });
  }

  if (!friendser.find(f => f.username === requestee)) {
    friendser.push({ username: requestee, favorite: false });
  }

  saveJson(frReqee, friendsee);
  saveJson(frReqer, friendser);

  return {
    message: `${requestee} is your new friend`
  };
}

module.exports = { registerUser, loginUser, acceptFriend, requestFriend, denyFriend };