const { app, BrowserWindow, ipcMain } = require('electron')

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  })

  win.webContents.openDevTools();

  win.removeMenu()
  win.loadFile('index.html')
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

ipcMain.on('form-submission', function(event, EventName){
  console.log("this is the event's name ->", EventName)
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
