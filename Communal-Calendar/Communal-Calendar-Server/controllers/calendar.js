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

  fs.mkdirSync(path.dirname(filePath), { recursive: true });

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
  newEvent.inviter = username;
  for( friend of newEvent.friends ){
    console.log(friend);
    let rsvppath = path.join(__dirname, "..", "users", friend.username, "rsvp.json");
    console.log(rsvppath);
    let rsvps = loadJson(rsvppath);
    let newrsvp = {"username": username, "event": newEvent };
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
  
  console.log("Before new thing")

  newEvent.friends = newEvent.friends.map(friend => ({
    "username": friend,
    "status": "no response"
  }));

  console.log("after new thing")
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

function getRSVP(username){
  const RSVP_PATH = path.join(__dirname, "..", "users", username, "rsvp.json");
  const rsvps = loadJson(RSVP_PATH);
  return(rsvps);
}

function respondRSVP(username, inviter, stat, eventName){
  const RSVP_PATH = path.join(__dirname, "..", "users", username, "rsvp.json");
  let rsvps = loadJson(RSVP_PATH);
  rsvps = rsvps.filter(u => !(u.event.inviter == inviter && u.event.eventName == eventName))
  saveJson(RSVP_PATH,rsvps);

  console.log("inside respondRSVP");
  
  let inviterEvents = loadEvents(inviter)
  let event = inviterEvents.find(u => (u.eventName == eventName && u.friends.some(k => k.username == username)));
  console.log("event:", event);
  if(event){
    inviterEvents = inviterEvents.filter(u => !(u.eventName == eventName && u.friends.find(k => k.username == username)));
    console.log("Preaddition",inviterEvents)
    event.friends.find( u => u.username == username).status = stat;
    console.log("FRIENDS WHO HAVE ACCEPTED AND WHO HAVN'T",event.friends);
    inviterEvents.push(event);
    console.log("post addition",inviterEvents)
    saveEvents(inviter, inviterEvents);
    console.log("HUH>!>!>!>")
    event.inviter = inviter;

    console.log("filter for who has accepted: ");
    console.log(event.friends.filter( u=> u.status == "true" ))
    for( let friend of event.friends.filter( u=> u.status == "true" )){
      console.log("1")
      let tempevents = loadEvents(friend.username);
      console.log(tempevents);
      tempevents = tempevents.filter(u => !(u.inviter == inviter && u.eventName == eventName))
      console.log("3")

      tempevents.push(event)
      console.log("the temp events designed to fill up the event for our user", tempevents)
      saveEvents(friend.username, tempevents);
      console.log("4")
    }
    return("Success");
  }

  return("This event has been canceled");
}

module.exports = {
  loadEvents,
  saveEvents,
  addEvent,
  loadCategories,
  saveCategories,
  addCategory,
  getRSVP,
  respondRSVP
};