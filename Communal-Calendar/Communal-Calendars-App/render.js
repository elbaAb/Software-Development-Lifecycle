function formSubmit(event) {
  event.preventDefault();

  const eventName = document.getElementById("Event").value;
  const startDate = document.getElementById("Start-Date").value;
  const startTime = document.getElementById("Start-Time").value;
  const endTime = document.getElementById("End-Time").value;
  const endDate = document.getElementById("End-Date").value || startDate;
  const privacy = document.querySelector("input[name=Privacy]:checked")?.id;
  const repeat = document.getElementById("Repeat").value;
  const friends = Array.from(document.querySelectorAll("input[name=Friend]:checked")).map(f => f.id) || false;

  const NewEvent = { eventName, startDate, startTime, endTime, endDate, privacy, repeat, friends };

  createEvent(sessionStorage.getItem("username"), NewEvent);
}

//creates the filter checkboxes in the top right
function SetFilter(categories) {
  const FilterContent = document.getElementById("filterMenuStuff");
  categories.forEach(category => {
    const label = document.createElement("label");
    const check = document.createElement("input");
    check.checked = true;
    check.type = "checkbox";
    check.value = category.name;
    label.textContent = category.name;
    label.insertBefore(check, label.firstChild);
    FilterContent.appendChild(label);
    check.addEventListener("change", () => {
      const schedules = document.getElementsByClassName(category.name);
      Array.from(schedules).forEach(schedule => {
        schedule.style.display = check.checked ? "block" : "none";
      });
    });
  });
}

//applies category colors to the different events
function ApplyCategories(categories) {
  categories.forEach(category => {
    const items = document.getElementsByClassName(category.name);
    Array.from(items).forEach(item => {
      item.style.backgroundColor = category.color;
      item.innerHTML = category.name;
      if (category.privacy === "private") {
        item.style.border = "2px solid black";
      }
    });
  });
}

// Sign‑in popup logic
function setupSignInPopup() {
  const signInButton = document.querySelector(".signInButton > button");
  const signInOverlay = document.querySelector(".signInPopUpOverlay");
  const closePopup = document.querySelector(".closeSignInPopUp");
  const signInSubmit = document.querySelector("#signInSubmit");
  const userNameInput = document.querySelector("#userNameInput");
  const passwordInput = document.querySelector("#passwordInput");
  const registerAccount = document.getElementById("Register-Account");
  const emailInput = document.getElementById("emailInput");

  if (signInButton) {
    signInButton.addEventListener("click", () => {
      signInOverlay.style.display = "block";
    });
  }

  if (closePopup) {
    closePopup.addEventListener("click", () => {
      signInOverlay.style.display = "none";
    });
  }

  if (signInSubmit) {
      console.log("AHASHDAIUSDVIAUFIVSADFASFKASUBFIUASDIFBSDAVFUVSADFYVUSADBFUVSADIFBASUBFIASF")
    signInSubmit.addEventListener("click", () => {
      console.log("AHASHDAIUSDVIAUFIVSADFASFKASUBFIUASDIFBSDAVFUVSADFYVUSADBFUVSADIFBASUBFIASF")
      if(signInSubmit.value == "Log In"){
        const username = userNameInput.value;
        const password = passwordInput.value;
        if (username && password) {
          signInOverlay.style.display = "none";
          userNameInput.value = "";
          passwordInput.value = "";
          loginUser(username, password);
        } else {
          alert("Please enter a username and password.");
        }
      }else{
        const username = userNameInput.value;
        const password = passwordInput.value;
        const email = emailInput.value;
        if (username && password && email) {
          signInOverlay.style.display = "none";
          userNameInput.value = "";
          passwordInput.value = "";
          emailInput.value = "";
          registerUser(email, username, password);
        } else {
          alert("Please enter an email, username, and password.");
        }
      }
    });
  }

  if (registerAccount) {
    registerAccount.addEventListener("click", () => {
      console.log("AHASHDAIUSDVIAUFIVSADFASFKASUBFIUASDIFBSDAVFUVSADFYVUSADBFUVSADIFBASUBFIASF")
      if(signInSubmit.value == "Log In"){
        emailInput.style.display = "block";
        signInSubmit.value = "Register"
      }else{
        console.log("WUWASOIB")
        emailInput.style.display = "none";
        signInSubmit.value = "Log In"
      }
    })
  }
}

// DOMContentLoaded wrapper to initialize everything
function LoadUserData() {
  const username = window.sessionStorage.getItem("username");
  getCategories(username);
  getEvents(username);

  const form = document.getElementById("get-calendar-data");
  const request = document.getElementById("request-friend demo2");
  const accept = document.getElementById("accept-friend demo2");
  const deny = document.getElementById("deny-friend demo2");

  console.log("test 1/4")
  if (form) {
    form.addEventListener("submit", formSubmit);
  }
  if(request){
  console.log("test 2/4")
    request.addEventListener("click", requestFriend);
  }
  if(accept){
  console.log("test 3/4")
    accept.addEventListener("click", acceptFriend)
  }
  if(deny){
  console.log("test 4/4")
    deny.addEventListener("click", denyFriend)
  }
};


document.addEventListener("DOMContentLoaded", (event) =>{
  setupSignInPopup();
})


async function loginUser(username, password) {
  try {
    const { accessToken, refreshToken } = await window.electronAPI.loginUser(username, password);
    console.log("Login successful");
    console.log("Access Token:", accessToken);
    console.log("Refresh Token:", refreshToken);

    // Store tokens in memory or localStorage if needed
    window.sessionStorage.setItem("username", username);
    window.sessionStorage.setItem("accessToken", accessToken);
    window.sessionStorage.setItem("refreshToken", refreshToken);

    LoadUserData();
    return { accessToken, refreshToken };
  } catch (err) {
    console.error("Login failed:", err);
  }
}

async function registerUser(email, username, password){
  try {
    const { accessToken, refreshToken } = await window.electronAPI.registerUser(email, username, password);
    console.log("Registration successful");
    console.log("Access Token:", accessToken);
    console.log("Refresh Token:", refreshToken);

    // Store tokens in memory or localStorage if needed
    window.sessionStorage.setItem("username", username);
    window.sessionStorage.setItem("accessToken", accessToken);
    window.sessionStorage.setItem("refreshToken", refreshToken);

    LoadUserData();
    return { accessToken, refreshToken };
  } catch (err) {
    console.error("Registration failed:", err);
  }
}

async function createEvent(username, eventData) {
  try {
    const accessToken = window.sessionStorage.getItem("accessToken");
    const event = await window.electronAPI.createEvent(username, eventData, accessToken);
    console.log("Event created:", event);
    return event;
  } catch (err) {
    console.error("Event creation failed:", err);
  }
}

async function getEvents(username) {
  try {
    const accessToken = window.sessionStorage.getItem("accessToken");
    const events = await window.electronAPI.getEvents(username, accessToken);
    console.log("Events:", events);
    return events;
  } catch (err) {
    console.error("Failed to retrieve events:", err);
  }
}

async function getCategories(username) {
  try {
    const accessToken = window.sessionStorage.getItem("accessToken");
    const categories = await window.electronAPI.getCategories(username, accessToken);
    console.log("Categories:", categories);
    return categories;
  } catch (err) {
    console.error("Failed to retrieve categories:", err);
  }
}

async function requestFriend(e) {
  try{
    const accessToken = window.sessionStorage.getItem("accessToken");
    const event = e.currentTarget;
    const requestee = event.id.split(" ").pop();
    const requester = sessionStorage.getItem("username");
    const friendRequest = await window.electronAPI.requestFriend(requester, requestee, accessToken);
    alert(friendRequest);
    return(friendRequest);
  } catch (err) {
    console.error("Failed send friend Request:", err);
  }
}

async function acceptFriend(e) {
  try{
    const accessToken = window.sessionStorage.getItem("accessToken");
    const event = e.currentTarget;
    const requester = event.id.split(" ").pop();
    const requestee = sessionStorage.getItem("username");
    const requesterTEMP = requestee;
    const requesteeTEMP = requester;
    const friend = await window.electronAPI.acceptFriend(requesterTEMP, requesteeTEMP, accessToken); //THIS IS BACKWARDS FOR TESTING MUST BE SWITCHED WITH NEW CODE!!!!
    alert(friend);
    return(friend);
  } catch(err){
    console.log(err);
  }
}

async function denyFriend(e) {
  try{
    const accessToken = window.sessionStorage.getItem("accessToken");
    const event = e.currentTarget;
    const requester = event.id.split(" ").pop();
    const requestee = sessionStorage.getItem("username");
    const requesterTEMP = requestee;
    const requesteeTEMP = requester;
    const friend = await window.electronAPI.denyFriend(requesterTEMP, requesteeTEMP, accessToken); //THIS IS BACKWARDS FOR TESTING MUST BE SWITCHED WITH NEW CODE!!!!
    alert(friend);
    return(friend);
  } catch(err){
    console.log(err);
  }
}