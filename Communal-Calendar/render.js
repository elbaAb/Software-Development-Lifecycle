const ipcRenderer = require('electron').ipcRenderer;

function sendForm(event) {
    event.preventDefault() // stop the form from submitting
    let EventName = document.getElementById("Event").value;
    ipcRenderer.send('form-submission', EventName)
}