const { app, BrowserWindow, ipcMain } = require('electron')
const fs = require('fs')

const createWindow = () => { //creates the actual electron window
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences:{
      nodeIntegration: true,
      contextIsolation: false
    }
  })
  win.webContents.openDevTools()    //opens inspect element if uncommented
  win.removeMenu()    //removes windows hotbar for application
  win.loadFile('index.html');    //loads html
}

app.whenReady().then(() => {
  createWindow();   //opens the window we previously created

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();   
  })
})

//recieves data from create event button
ipcMain.handle('create-event', async (event, eventName, startDate, startTime, endTime, endDate, privacy, repeat, friendsString, separationStr) => {
  const filePath = "./test/output.txt";    //picks file for the JSON to be uploaded in
  friends = friendsString.split(separationStr)    //splits string into array because API can't handle arrays
  friends.pop();    //pops the last element because it is a null entry (split)
  eventObj = {eventName: eventName,startDate: startDate,startTime: startTime, endTime: endTime, endDate: endDate, privacy: privacy, repeat: repeat, friends: friends};    //creates an object to be JSONed
  JSONEvent = JSON.stringify(eventObj);    //converts object to JSON
  fs.appendFile(filePath, JSONEvent, 'utf8', (err) => {    //appends JSON to the specified file
    if (err) {
        // Handle errors
        console.error('Error writing to file:', err.message);
        return;
    }
    console.log(`File has been written successfully to ${filePath}`);
});
})

ipcMain.handle('retrive-catagories', async => {
  const filePath = "./test/catagories.json" //picks file for json to be pulled from
  const catagoriesJSON = fs.readFileSync(filePath, 'utf8', err => {
    if (err) {
        // Handle errors
        console.error('Error reading file:', err.message);
        return;
    }
    console.log(`File ${filePath} read from successfuly`);
  })
  return catagoriesJSON;
})
//closes app on mac when the app is exited out of
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
})