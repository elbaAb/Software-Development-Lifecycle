const { app, BrowserWindow, ipcMain, dialog } = require("electron"); // Added dialog
const path = require("path");                               //initializes path
const { initializeCalendarData } = require("./calendar");   //creates the calendar inizialization function
const axios = require("axios");                             //requires the ability to send to remote server
const fs = require('fs');                                   //required for file operations

function createWindow() {                           //creates the window object with below settings
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: true,                       //isolates context for security
      preload: path.join(__dirname, "preload.js")   //preloads functions
    }
  });
  win.webContents.openDevTools();
  win.removeMenu();             //removes standard hotbar
  win.loadFile("index.html");   //loads index into the new window
}

app.whenReady().then(() => {    //when the app is ready does:
  initializeCalendarData();     //runs ./calendar.js
  createWindow();               //actually launches the window so you can see it
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();    //if on mac doesn't close app if all windows are closed like native applications
});


// added new IPC handlers for persistant login and profile pictures
// Saves user session to disk (username, tokens, etc.)
ipcMain.handle("save-user-session", async (event, userData) => {
  try {
    // Store in app's user data directory
    const userDataPath = path.join(app.getPath('userData'), 'user-session.json');
    fs.writeFileSync(userDataPath, JSON.stringify(userData, null, 2));
    console.log("User session saved for:", userData.username);
    return true;
  } catch (error) {
    console.error("Error saving user session:", error);
    throw error;
  }
});

// Loads saved user session on app start
ipcMain.handle("load-user-session", async () => {
  try {
    const userDataPath = path.join(app.getPath('userData'), 'user-session.json');
    if (fs.existsSync(userDataPath)) {
      const data = fs.readFileSync(userDataPath, 'utf8');
      const userData = JSON.parse(data);
      console.log("Loaded saved session for:", userData.username);
      return userData;
    }
    console.log("No saved user session found");
    return null;
  } catch (error) {
    console.error("Error loading user session:", error);
    return null;
  }
});

// Clears saved user session (called on sign out)
ipcMain.handle("clear-user-session", async () => {
  try {
    const userDataPath = path.join(app.getPath('userData'), 'user-session.json');
    if (fs.existsSync(userDataPath)) {
      fs.unlinkSync(userDataPath);
      console.log("User session cleared");
    }
    
    // Also delete profile picture
    const profilePicPath = path.join(app.getPath('userData'), 'profile-picture.png');
    if (fs.existsSync(profilePicPath)) {
      fs.unlinkSync(profilePicPath);
      console.log("Profile picture cleared");
    }
    
    return true;
  } catch (error) {
    console.error("Error clearing user session:", error);
    throw error;
  }
});

// Opens file dialog to select a profile picture
ipcMain.handle("select-profile-picture", async () => {
  try {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'] }
      ]
    });
    
    if (!canceled && filePaths.length > 0) {
      // Read image file and convert to base64
      const imageBuffer = fs.readFileSync(filePaths[0]);
      const base64Image = imageBuffer.toString('base64');
      const ext = path.extname(filePaths[0]).toLowerCase().replace('.', '');
      
      console.log("Profile picture selected:", filePaths[0]);
      return {
        path: filePaths[0],
        base64: base64Image,
        mimeType: ext
      };
    }
    return null;
  } catch (error) {
    console.error("Error selecting profile picture:", error);
    throw error;
  }
});

// Saves profile picture to disk
ipcMain.handle("save-profile-picture", async (event, imageData) => {
  try {
    const profilePicPath = path.join(app.getPath('userData'), 'profile-picture.png');
    const buffer = Buffer.from(imageData.base64, 'base64');
    fs.writeFileSync(profilePicPath, buffer);
    console.log("Profile picture saved to:", profilePicPath);
    return profilePicPath;
  } catch (error) {
    console.error("Error saving profile picture:", error);
    throw error;
  }
});

// Loads profile picture from disk
ipcMain.handle("load-profile-picture", async () => {
  try {
    const profilePicPath = path.join(app.getPath('userData'), 'profile-picture.png');
    
    if (fs.existsSync(profilePicPath)) {
      const buffer = fs.readFileSync(profilePicPath);
      const base64Image = buffer.toString('base64');
      console.log("Profile picture loaded");
      return `data:image/png;base64,${base64Image}`;
    }
    console.log("No profile picture found");
    return null;
  } catch (error) {
    console.error("Error loading profile picture:", error);
    return null;
  }
});



// Handles user login
ipcMain.handle("login-user", async (event, { username, password }) => {
  try {
    const response = await axios.post("http://localhost:3000/users/login", {
      username,
      password
    }, {
      headers: { "Content-Type": "application/json" }
    });
    console.log(response);
    return response.data; // { accessToken, refreshToken, message }
  } catch (err) {
    console.error("Login failed:", err.message);
    throw err;
  }
});

// Handles event creation
ipcMain.handle("create-event", async (event, { username, eventData, accessToken }) => {
  try {
    const response = await axios.post(
      `http://localhost:3000/calendar/events/${username}`,
      eventData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        }
      }
    );
    return response.data;
  } catch (err) {
    console.error("Event creation failed:", err.message);
    throw err;
  }
});

// Retrieves events for a user
ipcMain.handle("get-events", async (event, { username, accessToken }) => {
  try {
    const response = await axios.get(`http://localhost:3000/calendar/events/${username}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    return response.data;
  } catch (err) {
    console.error("Failed to retrieve events:", err.message);
    throw err;
  }
});

// Retrieves categories for a user
ipcMain.handle("get-friends", async (event, { username, accessToken }) => {
  try {
    const response = await axios.get(`http://localhost:3000/users/friends/${username}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    return response.data;
  } catch (err) {
    console.error("Failed to retrieve friends:", err.message);
    throw err;
  }
});

ipcMain.handle("retrieve-categories", async (event, { username, accessToken }) => {
  try {
    const response = await axios.get(`http://localhost:3000/calendar/categories/${username}`,{ 
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    return response.data;
  } catch (err) {
    console.error("Failed to retrieve categories:", err.message);
    throw err;
  }
});

// Creates a new category
ipcMain.handle("create-category", async (event, { username, category, accessToken }) => {
  try {
    const response = await axios.post(`http://localhost:3000/calendar/categories/${username}`, 
      category,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        }
      }
    );
    return response.data;
  } catch (err) {
    console.error("Create category failed:", err.message);
    throw err;
  }
});

// Handles user registration
ipcMain.handle("register-user", async (event, { email, username, password }) => {
  try {
    const response = await axios.post("http://localhost:3000/users/register", {
      email,
      username,
      password
    });
    return response.data; // { accessToken, refreshToken, message }
  } catch (err) {
    console.error("Registration failed:", err.message);
    throw err;
  }
});

// Sends a friend request
ipcMain.handle("request-friend", async (event, { requester, requestee, accessToken }) => {
  try{
    console.log("Sending friend request:", {requester, requestee});
    const response = await axios.post(`http://localhost:3000/users/requestfriend`, {
      requester, 
      requestee, 
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`
      }
    });

    return response.data;
  }catch(err){
    console.error("Friend request failed:", err);
    throw err;
  }
});

// Accepts a friend request
ipcMain.handle("accept-friend", async (event, { requester, requestee, accessToken }) => {
  try{
    const response = await axios.post(`http://localhost:3000/users/acceptfriend`, {
      requester, 
      requestee, 
    },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        }
      });

    return response.data;
  }catch (err){
    console.error("Accept friend failed:", err);
    throw err;
  }
});

// Denies a friend request
ipcMain.handle("deny-friend", async (event, { requester, requestee, accessToken }) => {
  try{
    const response = await axios.post(`http://localhost:3000/users/denyfriend`, {
      requester, 
      requestee, 
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`
      }
    });

    return response.data;
  }catch (err){
    console.error("Deny friend failed:", err);
    throw err;
  }
});

ipcMain.handle("change-favorite", async (event, {username, friend, accessToken}) => {
  try{
    const response = await axios.post(`http://localhost:3000/users/changefavorite`, {
      username,
      friend,
    },
    {
      headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`
      }
    })
    console.log(response)
    return response.data;
  }catch(err){
    console.log(err);
  }
})

ipcMain.handle("remove-friend", async (event, {username, friend, accessToken}) => {
  try{
    const response = await axios.post(`http://localhost:3000/users/removefriend`, {
      username,
      friend,
    },
    {
      headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`
      }
    })
    
    return response.data;
  }catch(err){
    console.log(err);
  }
})

ipcMain.handle("get-requests", async (event, {username, accessToken}) => {
  try{
    console.log("username in main", username)
    const response = await axios.get(`http://localhost:3000/users/getrequests/${username}`,
    {
      headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`
      }
    })

    console.log("RESPONSE:", response);
    return response.data;
  }catch(err){
    console.log(err);
  }
})
