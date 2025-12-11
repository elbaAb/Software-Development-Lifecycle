// routes/users.js
const express = require("express");
const router = express.Router();

const { registerUser, loginUser , requestFriend, acceptFriend, denyFriend, getFriends, changeFavorite, removeFriend, getRequests} = require("../controllers/users");
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
    const {requester, requestee} = req.body;
    const result = requestFriend(requester, requestee);
    res.json(result)
  }catch (err) {
    res.status(400).json({ error: err.message })
  }
})

router.post("/acceptfriend", async (req, res) => {
  try{
    const {requester, requestee} = req.body;
    const result = acceptFriend(requester, requestee);
    res.json(result)
  }catch (err) {
    res.status(400).json({ error: err.message })
  }
})

router.post("/denyfriend", async (req, res) => {
  try{
    const {requester, requestee} = req.body;
    const result = denyFriend(requester, requestee);
    res.json(result)
  }catch (err) {
    res.status(400).json({ error: err.message })
  }
})

router.post("/changefavorite", async (req, res) => {
  try{
    const { username, friend } = req.body;
    const result = changeFavorite( username, friend );
    console.log("result", result);
    res.json(result);
  }catch(err){
    res.status(400).json({ error: err.message })
  }
})

router.post("/removefriend", async (req, res) => {
  try{
    const { username, friend } = req.body;
    const result = removeFriend( username, friend );
    res.json(result);
  }catch(err){
    res.status(400).json({ error: err.message })
  }
})

router.get("/friends/:username", async (req, res) => {
  try {
    let { username } = req.params;
    const result = await getFriends(username);
    res.json(result);
  } catch(err){
    res.status(400).json({ error: err.message });
  }
})

router.get("/getrequests/:username", async (req, res) => {
  try{
    const { username } = req.params;
    const result = getRequests(username);

    res.json(result);
  }catch(err){
    res.status(400).json({ error:err.message })
  }
})




module.exports = router;

