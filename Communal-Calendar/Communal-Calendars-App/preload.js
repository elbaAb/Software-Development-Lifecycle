/*
    We need to keep this file updating ANY time we make
    a new function that needs api features in renderer or
    any other file not directly imported through main.
*/
const { contextBridge, ipcRenderer } = require("electron"); //imports context bridge via electron
contextBridge.exposeInMainWorld("electronAPI", {    //exposes certain api features to renderer
  
  getCategories: (username, accessToken) => ipcRenderer.invoke("retrieve-categories", { username, accessToken }),
  getEvents: (username, accessToken) => ipcRenderer.invoke("get-events", { username, accessToken }),
  getFriends: (username, accessToken) => ipcRenderer.invoke("get-friends", { username, accessToken }),
  createEvent: (username, eventData, accessToken) => ipcRenderer.invoke("create-event", { username, eventData, accessToken }),
  loginUser: (username, password) => ipcRenderer.invoke("login-user", { username, password }),
  createCategory: (username, category, accessToken) => ipcRenderer.invoke("create-category", { username, category, accessToken }),
  loginUser: (username, password) => ipcRenderer.invoke("login-user", { username, password }),
  registerUser: (email, username, password) => ipcRenderer.invoke("register-user", { email, username, password }),
  requestFriend: (requester, requestee, accessToken) => ipcRenderer.invoke("request-friend", { requester, requestee, accessToken }),
  acceptFriend: (requester, requestee, accessToken) => ipcRenderer.invoke("accept-friend", { requester, requestee, accessToken }),
  denyFriend: (requester, requestee, accessToken) => ipcRenderer.invoke("deny-friend", { requester, requestee, accessToken }),
  changeFavorite: (username, friend, accessToken) => ipcRenderer.invoke("change-favorite", { username, friend, accessToken }),
  removeFriend: (username, friend, accessToken) => ipcRenderer.invoke("remove-friend", { username, friend, accessToken }),
  getRequests: (username, accessToken) => ipcRenderer.invoke("get-requests", { username, accessToken }),
  saveUserSession: (userData) => ipcRenderer.invoke("save-user-session", userData),
  loadUserSession: () => ipcRenderer.invoke("load-user-session"),
  clearUserSession: () => ipcRenderer.invoke("clear-user-session"),
  selectProfilePicture: () => ipcRenderer.invoke("select-profile-picture"),
  saveProfilePicture: (imageData) => ipcRenderer.invoke("save-profile-picture", imageData),
  loadProfilePicture: () => ipcRenderer.invoke("load-profile-picture"),
  compareCalendars: (me, them, accessToken) => ipcRenderer.invoke("compare-calendars", { me, them, accessToken }),
})
