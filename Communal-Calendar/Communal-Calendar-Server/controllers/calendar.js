// controllers/calendar.js
const fs = require("fs");
const path = require("path");

const { loadJson, saveJson, createUserFolder } = require("../utils/fileUtils");

const USERS_FILE = path.join(__dirname, "..", "users", "users.json");   //goes up to main directory and back down into users

// Build a path to a user's events file
function getEventsFilePath(username) {
  return path.join(__dirname, "..", "users", username, "events.json");
}

// Load events for a given user
function loadEvents(username) {
  console.error(username);  

  const filePath = getEventsFilePath(username);
  
  console.error(filePath);

  fs.mkdirSync(path.dirname(filePath), { recursive: true });

  console.error(filePath);
  if (!fs.existsSync(filePath)) {
    // If file doesn't exist, initialize with empty array
    fs.writeFileSync(filePath, JSON.stringify([], null, 2), "utf8");
    return [];
  }

  const data = fs.readFileSync(filePath, "utf8");
  return JSON.parse(data);
}

// Build a path to a user's events file
function getCategoriesFilePath(username) {
  return path.join(__dirname, "..", "users", username, "categories.json");
}

// Load events for a given user
function loadCategories(username) {
console.log(1);
  const filePath = getCategoriesFilePath(username);
  
  console.error(filePath);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });

  console.error(filePath);
  if (!fs.existsSync(filePath)) {
    // If file doesn't exist, initialize with empty array
    fs.writeFileSync(filePath, JSON.stringify([], null, 2), "utf8");
    return [];
  }

  const data = fs.readFileSync(filePath, "utf8");
  return JSON.parse(data);
}

function rsvpUsers(newEvent, username){
  console.log(newEvent);
  for( friend of newEvent.friends ){
    console.log(friend[0]);
    let rsvppath = path.join(__dirname, "..", "users", friend[0], "rsvp.json");
    console.log(rsvppath);
    let rsvps = loadJson(rsvppath);
    let newrsvp = {"username": username, "event": newEvent, };
    rsvps.push(newrsvp);
    console.log("NEW RSVP", newrsvp);
    console.log("FINAL RSVP", rsvps);
    saveJson(rsvppath, rsvps);
  }

}

// Save events for a given user
function saveEvents(username, events) {
  const filePath = getEventsFilePath(username);
  fs.writeFileSync(filePath, JSON.stringify(events, null, 2), "utf8");
}

// Append a new event for a given user
function addEvent(username, newEvent) {
  console.log("GASFVSDUVF")
  for(let friend in newEvent.friends){
    newEvent.friends[friend] = [ newEvent.friends[friend], "no response" ]
  }
  rsvpUsers(newEvent, username);
  let events = loadEvents(username);
  events.push(newEvent);
  saveEvents(username, events);
  return newEvent;
}

function saveCategories(username, categories) {
  console.log("Made it to saveCategories");
  const filePath = getCategoriesFilePath(username);
  fs.writeFileSync(filePath, JSON.stringify(categories, null, 2), "utf8");
}

function addCategory(username, newCategory) {
  console.log("Made it to addCategories");
  const categories = loadCategories(username);
  categories.push(newCategory);
  saveCategories(username, categories);
  return newCategory;
}

module.exports = {
  loadEvents,
  saveEvents,
  addEvent,
  loadCategories,
  saveCategories,
  addCategory,
};