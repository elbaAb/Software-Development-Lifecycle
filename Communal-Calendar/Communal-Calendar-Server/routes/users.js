// routes/users.js
const express = require("express");
const router = express.Router();

const { registerUser, loginUser , requestFriend, acceptFriend, denyFriend} = require("../controllers/users");
const { verifyToken } = require("../utils/tokenUtils");

router.post("/register", async (req, res) => {
  const { email, username, password } = req.body;
  try {
    await registerUser(email,username, password);
    const result = loginUser(username, password);
    res.json( result );
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await loginUser(username, password);
    res.json(result); // sends back both tokens
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/requestfriend", async (req, res) => {
  console.log("REQUEST")
  try{
    const {requester, requestee, accessToken} = req.body;
    const result = requestFriend(requester, requestee, accessToken);
    res.json(result)
  }catch (err) {
    res.status(400).json({ error: err.message })
  }
})

router.post("/acceptfriend", async (req, res) => {
  console.log("ACCEPT")
  try{
    const {requester, requestee, accessToken} = req.body;
    const result = acceptFriend(requester, requestee, accessToken);
    res.json(result)
  }catch (err) {
    res.status(400).json({ error: err.message })
  }
})

router.post("/denyfriend", async (req, res) => {
  console.log("DENY")
  try{
    const {requester, requestee, accessToken} = req.body;
    const result = denyFriend(requester, requestee, accessToken);
    res.json(result)
  }catch (err) {
    res.status(400).json({ error: err.message })
  }
})

module.exports = router;