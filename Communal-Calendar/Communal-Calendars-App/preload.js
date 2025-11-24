/*
    We need to keep this file updating ANY time we make
    a new function that needs api features in renderer or
    any other file not directly imported through main.
*/
const { contextBridge, ipcRenderer } = require("electron"); //imports context bridge via electron

contextBridge.exposeInMainWorld("electronAPI", {    //exposes certain api features to renderer
  getCategories: (username, accessToken) => ipcRenderer.invoke("retrieve-categories", { username, accessToken }),
  getEvents: (username, accessToken) => ipcRenderer.invoke("get-events", { username, accessToken }),
  createEvent: (username, eventData, accessToken) => ipcRenderer.invoke("create-event", { username, eventData, accessToken }),
  loginUser: (username, password) => ipcRenderer.invoke("login-user", { username, password}),
  registerUser: (email, username, password) => ipcRenderer.invoke("register-user", { email, username, password }),
  requestFriend: (requester, requestee, accessToken) => ipcRenderer.invoke("request-friend", { requester, requestee, accessToken}),
  acceptFriend: (requester, requestee, accessToken) => ipcRenderer.invoke("accept-friend", { requester, requestee, accessToken}),
  denyFriend: (requester, requestee, accessToken) => ipcRenderer.invoke("deny-friend", { requester, requestee, accessToken})
})