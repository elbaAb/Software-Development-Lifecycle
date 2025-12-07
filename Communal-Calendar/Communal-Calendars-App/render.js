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

  //Assigning corresponding days to numbers
  const dayMap = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6
  };
  const selectedDays = Array.from(document.querySelectorAll('input[name=Day]:checked')).map(day => dayMap[day.id]); //Similar to friends, maps the selected days to their numbers
  const travelTimeRaw = document.getElementById("Travel-Time").value || 0;
  const travelTime = parseInt(travelTimeRaw, 10) || 0;

  //Splits time strings into hours and minutes (11:30 -> startHour = 11 and startMinute = 30) and converts them to numbers
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);

  //Doing the same for the actual date and creates the starting date for the loop
  let [y, m, d] = startDate.split('-').map(Number);
  let currentDate = new Date(y, m-1, d); //No idea why month was added by 1 by default but just subtracting 1 fixes it

  //Same for end date
  const [endY, endM, endD] = endDate.split('-').map(Number);
  const lastDate = new Date(endY, endM-1, endD); //Same here

  //Array to cast to JSON
  const eventDates = [];

  while (currentDate <= lastDate) {
    if (selectedDays.includes(currentDate.getDay())) {
            
      //Creating the start and end dates then setting their hours and minutes (The 0 are for seconds and milliseconds)
      let startDateTime = new Date(currentDate);
      startDateTime.setHours(startHour, startMinute, 0, 0);
      if (travelTime) startDateTime.setMinutes(startDateTime.getMinutes() - travelTime);

      let endDateTime = new Date(currentDate);
      endDateTime.setHours(endHour, endMinute, 0, 0);
      if (travelTime) endDateTime.setMinutes(endDateTime.getMinutes() + travelTime);
      //This puts the date into the array created earlier in local time using toLocaleString()
      eventDates.push({ start: startDateTime.toLocaleString(), end: endDateTime.toLocaleString()});
    }
    currentDate.setDate(currentDate.getDate() + 1); //Gets the next date
  }

  const NewEvent = { eventName, startDate, startTime, endTime, endDate, privacy, repeat, friends, eventDates};

  
  createEvent(sessionStorage.getItem("username"), NewEvent);
}

function setupFilterCheckbox(checkbox, categoryName) {
  if (!checkbox) return;
  if (!checkbox.value) checkbox.value = categoryName;
  if (!categoryName) categoryName = checkbox.value || checkbox.id;
  if (checkbox.dataset.listenerAttached === "true") {
    const show = checkbox.checked;
    const elems = document.getElementsByClassName(categoryName);
    Array.from(elems).forEach(el => {
      el.style.display = show ? "" : "none";
    });

    const boxes = document.querySelectorAll('.category-box');
    boxes.forEach(box => {
      if (box.dataset.categoryName === categoryName) {
        box.style.display = show ? "inline-block" : "none";
      }
    });
    return;
  }

  const onChange = () => {
    const show = checkbox.checked;

    const elems = document.getElementsByClassName(categoryName);
    Array.from(elems).forEach(el => {
      el.style.display = show ? "" : "none";
    });

    const boxes = document.querySelectorAll('.category-box');
    boxes.forEach(box => {
      if (box.dataset.categoryName === categoryName) {
        box.style.display = show ? "inline-block" : "none";
      }
    });
  };

  checkbox.addEventListener("change", onChange);
  checkbox.dataset.listenerAttached = "true";
  onChange();
}

function setupAllFilterCheckboxes() {
  const filterMenu = document.getElementById("filterMenuStuff");
  if (!filterMenu) return;
  const checkboxes = filterMenu.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(cb => {
    if (cb.id === "addCategoryBtn") return;
    const name = cb.value || cb.id;
    setupFilterCheckbox(cb, name);
  });
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

    // use centralized wiring so both schedule items and boxes are toggled
    setupFilterCheckbox(check, category.name);
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
// Add Category popup logic
function setupAddCategoryPopup() {
  const addCategoryButton = document.querySelector("#addCategoryBtn");
  const addCategoryOverlay = document.querySelector(".addCategoryPopupOverlay");
  const closePopup = document.querySelector(".closeAddCategoryPopUp");
  const saveCategoryButton = document.querySelector("#saveCategoryBtn");
  const categoryNameInput = document.querySelector("#newCategoryInput");
  const categoryColorInput = document.querySelector("#newCategoryColor");
  const categoryPrivacyInputs = document.querySelector("#catPrivacy");
  const filterMenu = document.querySelector("#filterMenuStuff");
  const categoryDisplay = document.getElementById("category-display") || document.querySelector(".main");

  //This just gets a contrasting color (black or white) based on the background color provided
  function getContrastColor(hex) {
    try {
      const c = hex.replace("#", "");
      const r = parseInt(c.substr(0,2),16);
      const g = parseInt(c.substr(2,2),16);
      const b = parseInt(c.substr(4,2),16);
      const luminance = (0.299*r + 0.587*g + 0.114*b) / 255;
      return luminance > 0.6 ? "#000" : "#fff";
    } catch (e) {
      return "#fff";
    }
  }

  // Open/Close popup
  if (addCategoryButton) {
    addCategoryButton.addEventListener("click", () => {
      addCategoryOverlay.style.display = "block";
    });
  }

  if (closePopup) {
    closePopup.addEventListener("click", () => {
      addCategoryOverlay.style.display = "none";
    });
  }

  // Save category
  if (saveCategoryButton) {
    saveCategoryButton.addEventListener("click", async () => {
        const categoryName = categoryNameInput.value.trim();
        const categoryColor = categoryColorInput.value || "#cccccc";
        const categoryPrivacy = document.querySelector('input[name="catPrivacy"]:checked')?.id;
        if (!categoryName) return;

        const categoryFormat = {
          Name: categoryName,
          Color: categoryColor,
          Privacy: categoryPrivacy //Change to what the user selects in the future
        };
        const username = window.sessionStorage.getItem("username");
        const accessToken = window.sessionStorage.getItem("accessToken");

        try {
          console.log("Calling createCategory", username, categoryFormat);
          let result = await window.electronAPI.createCategory(username, categoryFormat, accessToken);
          console.log("createCategory result:", result);
        } catch (err) {
          console.error("createCategory failed:", err);
          alert("Could not save category to server");
          return;
        }

        const newCategoryDiv = document.createElement("div");
        newCategoryDiv.style.padding = "4px";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = categoryName;
        checkbox.value = categoryName;
        checkbox.checked = true;

        const label = document.createElement("label");
        label.htmlFor = categoryName;
        label.textContent = categoryName;

        newCategoryDiv.appendChild(checkbox);
        newCategoryDiv.appendChild(label);
        filterMenu.appendChild(newCategoryDiv);

        setupFilterCheckbox(checkbox, categoryName);

        const box = document.createElement("div");
        box.className = "category-box";
        box.classList.add(categoryName);
        box.textContent = categoryName;
        box.style.backgroundColor = categoryColor;
        box.style.color = getContrastColor(categoryColor);
        box.style.margin = "6px";
        box.style.borderRadius = "6px";
        box.style.display = "inline-block";
        box.style.minWidth = "40px";

        box.dataset.categoryName = categoryName;
        box.dataset.categoryColor = categoryColor;

        categoryDisplay.appendChild(box);

        categoryNameInput.value = "";
        categoryColorInput.value = "#ff0000";
        addCategoryOverlay.style.display = "none";
      });
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
  setupAddCategoryPopup();
  setupAllFilterCheckboxes();
})

// Toggle "Next Event Today"
document.addEventListener("DOMContentLoaded", () => {
    const toggleButton = document.getElementById("toggle-today-btn");
    const todaySection = document.querySelector(".right-section");

    if (toggleButton && todaySection) {
        toggleButton.addEventListener("click", () => {
            todaySection.style.display =
                todaySection.style.display === "none" ? "flex" : "none";
        });
    }
});

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
document.addEventListener("DOMContentLoaded", async () => {
    const grid = document.getElementById("calendarGrid");
    const calendarBox = document.getElementById("calendarBox");

    if (!grid || !calendarBox) {
        console.error("calendarGrid or calendarBox not found!");
        return;
    }

    buildCalendarGrid(grid);       // Build 7×24 grid
    enableCellClick(grid);         // Attach popup click listeners after cells exist

    const events = await fetchEvents();
    drawCalendar(events);          // Draw existing events
});

async function fetchEvents() {
    try {
        const res = await fetch("/api/events");
        if (!res.ok) throw new Error("Failed to fetch events");
        return await res.json();
    } catch (err) {
        console.error(err);
        return [];
    }
}

function buildCalendarGrid(grid) {
    grid.innerHTML = "";
    grid.style.position = "relative";

    for (let day = 0; day < 7; day++) {
        for (let hour = 0; hour < 24; hour++) {
            const cell = document.createElement("div");
            cell.className = "hour-cell";
            cell.dataset.day = day;
            cell.dataset.hour = hour;
            grid.appendChild(cell);
        }
    }
}

function enableCellClick(grid) {
    const popup = document.getElementById("eventPopup");
    const popupInput = document.getElementById("popupEventName");
    const saveBtn = document.getElementById("popupSaveBtn");
    const cancelBtn = document.getElementById("popupCancelBtn");

    let currentCell = null;

    grid.querySelectorAll(".hour-cell").forEach(cell => {
        cell.style.cursor = "pointer";
        cell.addEventListener("click", (e) => {
            e.stopPropagation();
            currentCell = cell;

            const rect = cell.getBoundingClientRect();
            popup.style.top = `${rect.bottom + window.scrollY}px`;
            popup.style.left = `${rect.left + window.scrollX}px`;
            popupInput.value = "";
            popup.style.display = "block";
            popupInput.focus();
        });
    });

    saveBtn.addEventListener("click", async () => {
        const eventName = popupInput.value.trim();
        if (!eventName || !currentCell) {
            popup.style.display = "none";
            return;
        }

        const now = new Date();
        const dayOffset = Number(currentCell.dataset.day);
        const hour = Number(currentCell.dataset.hour);

        const start = new Date(now);
        start.setDate(start.getDate() - start.getDay() + dayOffset);
        start.setHours(hour, 0, 0, 0);

        const end = new Date(start);
        end.setHours(end.getHours() + 1);

        const newEvent = {
            eventName,
            startDate: start.toISOString().split('T')[0],
            endDate: end.toISOString().split('T')[0],
            startTime: start.toTimeString().slice(0,5),
            endTime: end.toTimeString().slice(0,5),
            privacy: "public",
            repeat: "none",
            friends: [],
            eventDates: [{ start: start.toLocaleString(), end: end.toLocaleString() }]
        };

        try {
            await createEvent(sessionStorage.getItem("username"), newEvent);
            const updatedEvents = await fetchEvents();
            drawCalendar(updatedEvents);
        } catch (err) {
            console.error(err);
            alert("Failed to save event.");
        } finally {
            popup.style.display = "none";
        }
    });

    cancelBtn.addEventListener("click", () => {
        popup.style.display = "none";
    });

    document.addEventListener("click", (e) => {
        if (!popup.contains(e.target) && e.target !== currentCell) {
            popup.style.display = "none";
        }
    });
}

function drawCalendar(events) {
    const grid = document.getElementById("calendarGrid");
    const calendarBox = document.getElementById("calendarBox");
    if (!grid || !calendarBox) return;

    calendarBox.innerHTML = "";

    const gridRect = grid.getBoundingClientRect();
    const cellWidth = gridRect.width / 7;
    const cellHeight = gridRect.height / 24;

    events.forEach(event => {
        event.eventDates.forEach(date => {
            const start = new Date(date.start);
            const end = new Date(date.end);

            const day = start.getDay();
            const startHour = start.getHours() + start.getMinutes() / 60;
            const endHour = end.getHours() + end.getMinutes() / 60;
            const duration = endHour - startHour;

            const block = document.createElement("div");
            block.className = "event-block";
            block.textContent = event.eventName;
            block.style.position = "absolute";
            block.style.top = `${startHour * cellHeight}px`;
            block.style.left = `${day * cellWidth}px`;
            block.style.width = `${cellWidth - 2}px`;
            block.style.height = `${duration * cellHeight}px`;
            block.style.backgroundColor = "#6fc3ff";
            block.style.border = "1px solid #333";
            block.style.boxSizing = "border-box";
            block.style.padding = "2px";
            block.style.overflow = "hidden";
            block.style.cursor = "pointer";

            block.dataset.id = event.id;

            block.addEventListener("click", async (e) => {
                e.stopPropagation();
                const newName = prompt("Edit event name:", event.eventName);
                if (newName === null) return;

                const updatedEvent = { ...event, eventName: newName };
                try {
                    const res = await fetch(`/api/events/${event.id}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(updatedEvent)
                    });
                    if (!res.ok) throw new Error("Failed to update event");

                    const updatedEvents = await fetchEvents();
                    drawCalendar(updatedEvents);
                } catch (err) {
                    console.error(err);
                    alert("Failed to update event.");
                }
            });

            block.addEventListener("contextmenu", async (e) => {
                e.preventDefault();
                if (!confirm("Delete this event?")) return;

                try {
                    const res = await fetch(`/api/events/${event.id}`, { method: "DELETE" });
                    if (!res.ok) throw new Error("Failed to delete event");

                    const updatedEvents = await fetchEvents();
                    drawCalendar(updatedEvents);
                } catch (err) {
                    console.error(err);
                    alert("Failed to delete event.");
                }
            });

            calendarBox.appendChild(block);
        });
    });
}
