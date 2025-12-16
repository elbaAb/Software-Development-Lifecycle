// routes/events.js
const express = require("express");
const router = express.Router();
const { loadEvents, addEvent, loadCategories, addCategory, getRSVP, respondRSVP } = require("../controllers/calendar");

// GET all events for a user
router.get("/events/:username", (req, res) => {
  const { username } = req.params;
  try {
    const events = loadEvents(username);
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: "Failed to load events" });
  }
});

// POST a new event for a user
router.post("/events/:username", (req, res) => {
  const { username } = req.params;
  const newEvent = req.body;

  try {
    const createdEvent = addEvent(username, newEvent);
    res.json(createdEvent);
  } catch (err) {
    res.status(500).json({ error: "Failed to save event" });
  }
});

router.get("/categories/:username", (req, res) => {
  const { username } = req.params;
  const newEvent = req.body;

  try {
    const retrievedCategories = loadCategories(username, newEvent);
    res.json(retrievedCategories);
  } catch (err) {
    res.status(500).json({ error: "Failed to load categories" });
  }
});

router.post("/categories/:username", (req, res) => {
  const { username } = req.params;
  const category = req.body;

  try {
    const created = addCategory(username, category);
    res.json(created);
  } catch (err) {
    res.status(500).json({ error: "Failed to save category" });
  }
});

router.get("/getrsvp/:username", (req, res) => {
  try{
    console.log("INSIDE GET RSVPS")
    const { username } = req.params;
    console.log(username);
    const result = getRSVP(username);
    console.log("RESULT FROM GETRSVP CONTROLLER:",result);
    res.json(result);

  }catch(err){
    res.status(500).json({ error: "Failed to Retrieve RSVPs"})
  }
})

router.post("/respondrsvp", ( req, res ) => {
  try{
    const { username, inviter, stat, events } = req.body;
    console.log("IN RESPOND RSVP")
    const result = respondRSVP( username, inviter, stat, events )

    res.json(result);
  }catch(err){
    res.status(500).json({ error: "Could not respond to RSVP"})
  }
})
module.exports = router;