const { ipcRenderer } = require('electron');

function formSubmit(event) {
    event.preventDefault();    //prevents default behaviour of submit button
    let friendsString = "";

    //the string used in our split command so we can pass our accounts through the API
    let separationStr = "@*#&^$@*#&($@#*(^%$*(@#&@#*%$*&@#)*^%&@*#$(@*#%^#@%*&@^!#&*^@#(&^$%*@$^*@%$*&^@#"    
    let eventName = document.getElementById("Event").value;
    let startDate = document.getElementById("Start-Date").value;
    let startTime = document.getElementById("Start-Time").value;
    let endTime = document.getElementById("End-Time").value;
    let endDate = document.getElementById("End-Date").value;
    let privacy = document.querySelector("input[name=Privacy]:checked").id;
    let repeat = document.getElementById("Repeat").value;
    let friends = Array.from(document.querySelectorAll('input[name=Friend]:checked'))
                   .map(friend => friend.id);    //maps our selected friends IDs to an array to be stored in js
    if (friends == null){
        friends = false;    //if no friends are selected return false
    }else{
        for(const friend in friends){//convert friend array into string w/ separator 
            friendsString += friends[friend] + separationStr;
        }
    }
    if (endDate == ""){
        endDate = startDate;    //if no endDate is selected return startDate
    }

    //send all this data to main with the code of 'create-event'
    ipcRenderer.invoke('create-event', eventName, startDate, startTime, endTime, endDate, privacy, repeat, friendsString, separationStr).then((result)=>{
    });
}

addEventListener("DOMContentLoaded", function(){
    /*ipcRenderer.invoke('retrive-schedule').then((result)=>{
        
    })*/
    ipcRenderer.invoke('retrive-catagories').then((result)=>{
        const catagories = JSON.parse(result);
        for(let catagory in catagories){
            console.log(catagories[catagory]);
        }
        ApplyCatagories(catagories);
    })
})

function ApplyCatagories(catagories){
    for(let i = 0; i < catagories.length; i++){
        let catagory = catagories[i]
        const items = document.getElementsByClassName(catagory.name)

        console.log(`outer loop: ${catagories[i]}`)

        for(let j = 0; j < items.length; j++){
            let item = items[j]
            console.log(`inner loop: ${item}`)
            item.style.backgroundColor = catagory.color
            
            item.innerHTML = catagory.name;
            
            if(catagories[i].privacy == 'private'){
                item.style.border = "2px solid black"
            }
        }
    }
}
//add an event listener so we can throw the above js when the submit button is clicked
document.getElementById('get-calendar-data').addEventListener('submit',formSubmit);
