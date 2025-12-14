async function formSubmit(event) {
  event.preventDefault();

  const eventName = document.getElementById("Event").value;
  const startDate = document.getElementById("Start-Date").value;
  const startTime = document.getElementById("Start-Time").value;
  const endTime = document.getElementById("End-Time").value;
  const endDate = document.getElementById("End-Date").value || startDate;
  const privacy = document.querySelector("input[name=Privacy]:checked")?.id;
  const repeat = document.getElementById("Repeat").value;
  const friends = Array.from(document.querySelectorAll("input[friend]:checked")).map(f => f.getAttribute("friend")) || false;

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

  //Splits time strings into hours and minutes
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);

  //Doing the same for the actual date
  let [y, m, d] = startDate.split('-').map(Number);
  let currentDate = new Date(y, m-1, d);

  //Same for end date
  const [endY, endM, endD] = endDate.split('-').map(Number);
  const lastDate = new Date(endY, endM-1, endD);

  //Array to cast to JSON
  const eventDates = [];

  while (currentDate <= lastDate) {
    if (selectedDays.includes(currentDate.getDay())) {
      let startDateTime = new Date(currentDate);
      startDateTime.setHours(startHour, startMinute, 0, 0);
      if (travelTime) startDateTime.setMinutes(startDateTime.getMinutes() - travelTime);

      let endDateTime = new Date(currentDate);
      endDateTime.setHours(endHour, endMinute, 0, 0);

      if (travelTime) endDateTime.setMinutes(endDateTime.getMinutes() + travelTime);
      //This puts the date into the array created earlier in local time using toLocaleString()
      eventDates.push({ start: startDateTime.toLocaleString(), end: endDateTime.toLocaleString()});
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const NewEvent = { eventName, startDate, startTime, endTime, endDate, privacy, repeat, friends, eventDates};

  console.log(NewEvent)
  
  await createEvent(sessionStorage.getItem("username"), NewEvent);
}

function setupCalendarUI() {
    buildCalendarGrid();
    enableCellClick();
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

    setupFilterCheckbox(check, category.name);
  });
}

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


function setupSignInPopup() {
  const signInButton = document.querySelector(".signInButton > button");
  const signInOverlay = document.querySelector(".signInPopUpOverlay");
  const closePopup = document.querySelector(".closeSignInPopUp");
  const signInSubmit = document.querySelector("#signInSubmit");
  const userNameInput = document.querySelector("#userNameInput");
  userNameInput.style.zIndex = "99999";
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
    signInSubmit.addEventListener("click", () => {
      if(signInSubmit.value == "Log In"){
        const username = userNameInput.value;
        const password = passwordInput.value;
        if (username && password) {
          signInOverlay.style.display = "none";
          userNameInput.value = "";
          passwordInput.value = "";
          loginUser(username, password);
        } else {
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
        }
      }
    });
  }

  if (registerAccount) {
    registerAccount.addEventListener("click", () => {
      if(signInSubmit.value == "Log In"){
        emailInput.style.display = "block";
        signInSubmit.value = "Register"
      }else{
        emailInput.style.display = "none";
        signInSubmit.value = "Log In"
      }
    })
  }
}


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
          Privacy: categoryPrivacy
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


async function LoadUserData() {
  const username = window.sessionStorage.getItem("username");
  const accessToken = window.sessionStorage.getItem("accessToken");
  
  // Check if user is logged in before loading data
  if (!username) {
    console.log("No user logged in, skipping data load");
    return;
  }
  
  console.log("Loading data for user:", username);
  await getCategories(username);
  await getEvents(username);
  await getFriends(username, accessToken);

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


document.addEventListener("DOMContentLoaded", async (event) =>{
  setupSignInPopup();
  setupAddCategoryPopup();
  setupAllFilterCheckboxes();
  setupProfilePictureHandlers();  // Set up profile picture change and sign out handlers
  setupCalendarUI();

  // Check for saved user session when app starts
  await checkSavedUserOnStart();
})


/**
 * Updates the nav bar to show user display instead of Sign In button
 * @param {Object} userData - User data including username and tokens
 */
function updateUserDisplay(userData) {
  const userDisplay = document.getElementById('user-display');
  const usernameDisplay = document.getElementById('username-display');
  const profilePic = document.getElementById('profile-picture');
  const signInButton = document.querySelector('.signInButton');
  
  if (userData && userData.username) {
    // Show user display - add the "show" class
    userDisplay.classList.add('show');
    usernameDisplay.textContent = userData.username;
    
    // Hide Sign In button
    if (signInButton) {
      signInButton.style.display = 'none';
    }
    
    // Load and display profile picture
    loadAndDisplayProfilePicture();
    
    // Hide sign-in popup if it's open
    const signInOverlay = document.querySelector('.signInPopUpOverlay');
    if (signInOverlay) {
      signInOverlay.style.display = 'none';
    }
    
    console.log("User display updated for:", userData.username);
  } else {
    // Show Sign In button, hide user display - remove the "show" class
    userDisplay.classList.remove('show');
    if (signInButton) {
      signInButton.style.display = 'block';
    }
    console.log("Showing Sign In button - no user logged in");
  }
}

/**
 * Loads profile picture from disk or creates default with user's initial
 */
async function loadAndDisplayProfilePicture() {
  try {
    const profilePic = document.getElementById('profile-picture');
    if (!profilePic) return;
    
    // Try to load saved profile picture
    const savedPic = await window.electronAPI.loadProfilePicture();
    if (savedPic) {
      profilePic.src = savedPic;
      console.log("Loaded saved profile picture");
    } else {
      // Create default profile picture with user's initial
      const username = window.sessionStorage.getItem('username') || '';
      const initial = username.charAt(0).toUpperCase() || 'U';
      
      // Create SVG circle with user's initial
      const svgString = `
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
          <circle cx="16" cy="16" r="16" fill="#4a90e2"/>
          <text x="16" y="22" text-anchor="middle" fill="white" font-size="14" font-family="Arial">
            ${initial}
          </text>
        </svg>
      `;
      profilePic.src = 'data:image/svg+xml;base64,' + btoa(svgString);
      console.log("Created default profile picture with initial:", initial);
    }
  } catch (error) {
    console.error('Error loading profile picture:', error);
  }
}

/**
 * Sets up event handlers for profile picture change and sign out buttons
 */
function setupProfilePictureHandlers() {
  const changeProfilePicBtn = document.getElementById('change-profile-pic');
  const signOutBtn = document.getElementById('sign-out-btn');
  
  if (changeProfilePicBtn) {
    changeProfilePicBtn.addEventListener('click', async () => {
      try {
        console.log("Opening file dialog for profile picture...");
        const imageData = await window.electronAPI.selectProfilePicture();
        
        if (imageData) {
          console.log("Profile picture selected, saving...");
          // Save the profile picture to disk
          await window.electronAPI.saveProfilePicture(imageData);
          
          // Update display immediately
          const profilePic = document.getElementById('profile-picture');
          if (profilePic && imageData.base64) {
            const mimeType = imageData.mimeType || 'png';
            profilePic.src = `data:image/${mimeType};base64,${imageData.base64}`;
            console.log("Profile picture updated");
          }
        } else {
          console.log("No profile picture selected");
        }
      } catch (error) {
        console.error('Error changing profile picture:', error);
        alert('Failed to change profile picture. Please try again.');
      }
    });
  }
  
  if (signOutBtn) {
    signOutBtn.addEventListener('click', async () => {
      try {
        console.log("Signing out...");
        // Clear persistent session data
        await window.electronAPI.clearUserSession();
        
        // Clear session storage (temporary)
        window.sessionStorage.clear();
        
        // Update UI to show Sign In button again
        updateUserDisplay(null);
        
        console.log("Signed out successfully");
        alert("You have been signed out.");
      } catch (error) {
        console.error('Error signing out:', error);
        alert('Error signing out. Please try again.');
      }
    });
  }
}

/**
 * Checks for saved user session when app starts
 * @returns {Promise<boolean>} True if user was automatically logged in
 */
async function checkSavedUserOnStart() {
  try {
    console.log("Checking for saved user session...");
    const userData = await window.electronAPI.loadUserSession();
    
    if (userData && userData.username && userData.accessToken) {
      console.log('Found saved session for user:', userData.username);
      
      // Restore user data to sessionStorage (for existing code compatibility)
      window.sessionStorage.setItem("username", userData.username);
      window.sessionStorage.setItem("accessToken", userData.accessToken);
      if (userData.refreshToken) {
        window.sessionStorage.setItem("refreshToken", userData.refreshToken);
      }
      
      // Update UI to show user is logged in (replaces Sign In button)
      updateUserDisplay(userData);
      
      // Load user's calendar data
      LoadUserData();
      
      loadUserCalendar();

      return true;
    } else {
      console.log("No saved user session found");
    }
  } catch (error) {
    console.error('Error loading saved user session:', error);
  }
  
  return false;
}


/**
 * Logs in a user and saves session persistently
 */
async function loginUser(username, password) {
  try {
    console.log("Attempting login for:", username);
    const { accessToken, refreshToken } = await window.electronAPI.loginUser(username, password);
    console.log("Login successful");
    
    // Store tokens in sessionStorage (temporary, for existing code)
    window.sessionStorage.setItem("username", username);
    window.sessionStorage.setItem("accessToken", accessToken);
    window.sessionStorage.setItem("refreshToken", refreshToken);
    
    // Save user data persistently to disk
    const userData = {
      username,
      accessToken,
      refreshToken,
      loggedInAt: new Date().toISOString()
    };
    
    await window.electronAPI.saveUserSession(userData);
    console.log("User session saved persistently");
    
    // Update UI to show user display (replaces Sign In button)
    updateUserDisplay(userData);
    
    // Load user's calendar data
    LoadUserData();
    
    return { accessToken, refreshToken };
  } catch (err) {
    console.error("Login failed:", err);
    alert("Login failed. Please check your username and password.");
    throw err;
  }
}


/**
 * Registers a new user and saves session persistently
 */
async function registerUser(email, username, password) {
  try {
    console.log("Attempting registration for:", username);
    const { accessToken, refreshToken } = await window.electronAPI.registerUser(email, username, password);
    console.log("Registration successful");
    
    // Store tokens in sessionStorage
    window.sessionStorage.setItem("username", username);
    window.sessionStorage.setItem("accessToken", accessToken);
    window.sessionStorage.setItem("refreshToken", refreshToken);
    
    // Save user data persistently to disk
    const userData = {
      username,
      email,
      accessToken,
      refreshToken,
      loggedInAt: new Date().toISOString()
    };
    
    await window.electronAPI.saveUserSession(userData);
    console.log("User session saved persistently");
    
    // Update UI to show user display (replaces Sign In button)
    updateUserDisplay(userData);
    
    // Load user's calendar data
    LoadUserData();
    
    return { accessToken, refreshToken };
  } catch (err) {
    console.error("Registration failed:", err);
    alert("Registration failed. Please try a different username or email.");
    throw err;
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

function setupFriendsDropdown(e) {
  let friends_button = document.getElementById("friends-dropdown-button");
  let content = document.getElementById("friends-dropdown-content");

  friends_button.addEventListener("click", () => {

    if(content.style.display == "none"){
      content.style.display = "block";
    }else {
      content.style.display = "none";
    }
  })


}

async function getEvents(username, accessToken) {
  try {
    const events = await window.electronAPI.getEvents(username, accessToken);
    console.log("Events:", events);
    return events;
  } catch (err) {
    console.error("Failed to retrieve events:", err);
  }
}

async function getRSVP(username, accessToken){
  try{
    const rsvp = await window.electronAPI.getRSVP(username, accesstoken);

    for( let item of rsvp ){
      container = document.createElement("div");
      title = document.createElement("h2");
      date = document.createElement("h3");
      time = document.createElement("h3");
      days = document.createElement("p")

      title.textContent = item.eventName;
      date.textContent = `${item.startDate} - ${item.endDate}`
      time.textContent = `${item.startTime} - ${item.endTime}`

      for( let day of item.event){

      }
    }
  }
  catch(err){

  }
}

async function getCategories(username, accessToken) {
  try {
    const categories = await window.electronAPI.getCategories(username, accessToken);
    console.log("Categories:", categories);
    return categories;
  } catch (err) {
    console.error("Failed to retrieve categories:", err);
  }
}

async function getFriends(username, accessToken) {
  try {
    const friends = await window.electronAPI.getFriends(username, accessToken);
    console.log("Friends:", friends);

    let content = document.getElementById("friends-dropdown-content");
    let rsvpFriends = document.getElementById("search-friends-section");

    content.innerHTML = "";     // clear these so if you relogin it doesn't refill them
    rsvpFriends.innerHTML = "";

    const requests = await getRequests(username, accessToken);

    console.log(requests);

    for( let request of requests ){
      console.log("Friend request ", request);

      let container = document.createElement("div");
      container.setAttribute("request", request.from);
      let name = document.createElement("div");
      name.textContent = request.from;
      let accept = document.createElement("button");
      accept.textContent = "Accept";
      accept.setAttribute("friend", request.from);
      accept.addEventListener("click", acceptFriend);
      let decline = document.createElement("button");
      decline.textContent = "Decline";
      decline.setAttribute("friend", request.from);
      decline.addEventListener("click", denyFriend);

      container.appendChild(name)
      container.appendChild(accept);
      container.appendChild(decline);

      content.appendChild(container);
    }

    if (content) {
      for (let i = 0; i < friends.length; i++) {
        // Base container with name + checkbox
        let container = document.createElement("div");
        container.className = "Friends-Drop-Container";
        container.setAttribute("friendParent",  friends[i].username)

        let name = document.createElement("label");

        let check = document.createElement("input");
        check.type = "checkbox";
        check.checked = false;
        check.setAttribute("friend", friends[i].username);
        name.appendChild(check);

        name.appendChild(document.createTextNode(friends[i].username));
        container.appendChild(name);

        if (friends[i].favorite) {
          container.className = "Friends-Drop-Container favoriteFriend";
        }

        // Clone the base container for each section
        let rsvpClone = container.cloneNode(true);
        let contentClone = container.cloneNode(true);

        // Add buttons ONLY to the content clone
        let favorite = document.createElement("button");
        favorite.setAttribute("friend", friends[i].username);
        favorite.addEventListener("click", changeFavorite);
        favorite.textContent = friends[i].favorite ? "Unfavorite" : "Favorite";

        let remove = document.createElement("button");
        remove.setAttribute("friend", friends[i].username);
        remove.addEventListener("click", removeFriend);
        remove.textContent = "Remove";

        contentClone.appendChild(favorite);
        contentClone.appendChild(remove);

        // Append to each section
        rsvpFriends.appendChild(rsvpClone);
        content.appendChild(contentClone);

        // Attach checkbox listener to both clones
        let rsvpCheckbox = rsvpClone.querySelector("input[type=checkbox]");
        if (rsvpCheckbox) {
          rsvpCheckbox.addEventListener("change", toggleFriendEvents);
        }
        let contentCheckbox = contentClone.querySelector("input[type=checkbox]");
        if (contentCheckbox) {
          contentCheckbox.addEventListener("change", toggleFriendEvents);
        }
      }
    }

    // Add search section at the bottom of content
    let searchSection = document.createElement("div");
    searchSection.className = "Friends-Drop-Container";
    let searchFriend = document.createElement("input");
    searchFriend.id = "friend-request-search";
    searchFriend.type = "text";
    let friendSubmit = document.createElement("button");
    friendSubmit.textContent = "Add Friend";
    friendSubmit.addEventListener("click", requestFriend);
    searchSection.appendChild(searchFriend);
    searchSection.appendChild(friendSubmit);
    content.appendChild(searchSection);

  } catch (err) {
    console.error("Failed to retrieve friends:", err);
  }
}

// Toggle Friend Calendar Overlay
async function toggleFriendEvents(e) {
  const cb = e.currentTarget;
  const friendName = cb.getAttribute("friend");
  if (!friendName) return;

  const show = cb.checked;

  // Keep BOTH clones (dropdown + RSVP section) in sync
  document
    .querySelectorAll(`input[type="checkbox"][friend="${friendName}"]`)
    .forEach(x => (x.checked = show));

  // If turned OFF: remove that friend's blocks and stop
  if (!show) {
    document
      .querySelectorAll(`.event-block.friend-event[data-friend="${friendName}"]`)
      .forEach(el => el.remove());
    return;
  }

  // Turned ON: fetch friend's events and draw them
  try {
    const friendEvents = await fetchEvents(friendName);
    drawFriendCalendar(friendName, friendEvents);
  } catch (err) {
    console.error("Failed to load friend's events:", friendName, err);
  }
}



async function requestFriend(e) {
  try{
    const searchFriend = document.getElementById("friend-request-search")
    const accessToken = window.sessionStorage.getItem("accessToken");
    const requestee = searchFriend.value;
    const requester = sessionStorage.getItem("username");
    console.log(requester);
    console.log(requestee);
    
    if(requestee == requester) {
      return("you cannot friend yourself");
    }

    const friendRequest = await window.electronAPI.requestFriend(requester, requestee, accessToken);
    return(friendRequest);
  } catch (err) {
    console.error("Failed send friend Request:", err);
  }
}

async function acceptFriend(e) {
  try{
    const accessToken = window.sessionStorage.getItem("accessToken");
    const event = e.currentTarget;
    const requester = event.getAttribute("friend")
    const requestee = sessionStorage.getItem("username");
    const friend = await window.electronAPI.acceptFriend(requester, requestee, accessToken); 

    getFriends(requestee, accessToken);
    return(friend);
  } catch(err){
    console.log(err);
  }
}

async function denyFriend(e) {
  try{
    const accessToken = window.sessionStorage.getItem("accessToken");
    const event = e.currentTarget;
    const requester = event.getAttribute("friend")
    const requestee = sessionStorage.getItem("username");
    getFriends(requestee, accessToken)
    return(friend);
  } catch(err){
    console.log(err);
  }
}

async function changeFavorite(e){
  console.log("WORKS");
  try{
    const accessToken = window.sessionStorage.getItem("accessToken");
    const button = e.currentTarget;
    const friend = button.getAttribute("friend");
    const username = sessionStorage.getItem("username");
    const result = await window.electronAPI.changeFavorite(username, friend, accessToken);
    console.log(result)
    if(result){
      button.textContent = "Unfavorite"
    }else{
      button.textContent = "Favorite"
    }
    return(result);
  }catch(err){
    console.log("failed to change favorite: ", err)
  }
}

async function removeFriend(e){
try{
    const accessToken = window.sessionStorage.getItem("accessToken");
    const friend = e.currentTarget.getAttribute("friend");
    const username = sessionStorage.getItem("username");
    const result = await window.electronAPI.removeFriend(username, friend, accessToken);
    getFriends(username, accessToken);
    console.log(result)
    return(result);
  }catch(err){
    console.log("failed to remove friend: ", err)
  }
}

async function getRequests(username, accessToken){
try{
    const result = await window.electronAPI.getRequests(username, accessToken);
    console.log(result)
    return(result);
  }catch(err){
    console.log("failed to remove friend: ", err)
  }
}



async function fetchEvents(username) {
    try {
        const res = await fetch(
            `http://localhost:3000/calendar/events/${username}`
        );

        if (!res.ok) {
            throw new Error("Failed to fetch events");
        }

        const events = await res.json();
        console.log("Fetched events:", events);
        return events;
    } catch (err) {
        console.error("fetchEvents error:", err);
        return [];
    }
}

async function loadUserCalendar() {
    const username = sessionStorage.getItem("username");

    if (!username) {
        console.warn("Calendar load skipped — no username");
        return;
    }

    const events = await fetchEvents(username);
    drawCalendar(events);
}

function buildCalendarGrid() {
    const grid = document.getElementById("calendarGrid");
    if (!grid) return;

    let calendarBox = grid.querySelector("#calendarBox");

    grid.innerHTML = "";

    if (!calendarBox) {
        calendarBox = document.createElement("div");
        calendarBox.id = "calendarBox";
    }
    grid.appendChild(calendarBox);

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

function enableCellClick() {
    const grid = document.getElementById("calendarGrid");
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
            popup.style.top = `${rect.bottom}px`;
            popup.style.left = `${rect.left}px`;
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

  const dayOffset = Number(currentCell.dataset.day); // 0=Mon ... 6=Sun
  const hour = Number(currentCell.dataset.hour);

  // ✅ Monday-based start of week (matches your drawCalendar day mapping)
  const now = new Date();
  const mondayIndex = (now.getDay() + 6) % 7; // Sun(0)->6, Mon(1)->0, ...
  const weekStart = new Date(now);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(now.getDate() - mondayIndex);

  // Build start/end based on clicked cell
  const start = new Date(weekStart);
  start.setDate(weekStart.getDate() + dayOffset);
  start.setHours(hour, 0, 0, 0);

  const end = new Date(start);
  end.setHours(end.getHours() + 1);

  const newEvent = {
    eventName,
    startDate: start.toISOString().split("T")[0],
    endDate: end.toISOString().split("T")[0],
    startTime: start.toTimeString().slice(0, 5),
    endTime: end.toTimeString().slice(0, 5),
    privacy: "public",
    repeat: "none",
    friends: [],
    eventDates: [{ start: start.toLocaleString(), end: end.toLocaleString() }]
  };

  try {
    const username = sessionStorage.getItem("username");
    await createEvent(username, newEvent);

    const updatedEvents = await fetchEvents(username);
    drawCalendar(updatedEvents);
  } catch (err) {
    console.error("Save event error:", err);
    alert("Failed to save event.");
  } finally {
    popup.style.display = "none";
  }
});

    cancelBtn.addEventListener("click", () => (popup.style.display = "none"));
}

function drawCalendar(events) {
    console.log("drawCalendar() called");
    console.log("Received events:", JSON.stringify(events, null, 2));

    const grid = document.getElementById("calendarGrid");
    const calendarBox = document.getElementById("calendarBox");

    if (!grid || !calendarBox) {
        console.warn("grid or calendarBox missing");
        return;
    }

    calendarBox.innerHTML = "";

    const gridRect = grid.getBoundingClientRect();
    console.log("GridRect:", gridRect);

    const cellWidth = gridRect.width / 7;

    const sampleCell = grid.querySelector(".hour-cell");
    if (!sampleCell) return;

    const cellRect = sampleCell.getBoundingClientRect();
    const cellHeight = cellRect.height;

    //CRITICAL FIX: offset to the first hour row
    const firstCellTop =
        cellRect.top - gridRect.top;

    console.log("Cell width:", cellWidth, "Cell height:", cellHeight);
    console.log("First cell top offset:", firstCellTop);

    events.forEach(event => {
        console.log("---- EVENT:", event.eventName);

        event.eventDates.forEach(date => {
            console.log("Raw date object:", date);

            const start = new Date(date.start);
            const end = new Date(date.end);

            console.log("Parsed start:", start);
            console.log("Parsed end:", end);

            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                console.error("INVALID DATE:", date.start, date.end);
                return;
            }

            // Monday = 0, Sunday = 6
            const day = (start.getDay() + 6) % 7;

            const startHour = start.getHours() + start.getMinutes() / 60;
            const endHour = end.getHours() + end.getMinutes() / 60;
            const duration = endHour - startHour;

            console.log(
                "Day:", day,
                "StartHour:", startHour,
                "EndHour:", endHour,
                "Duration:", duration
            );

            const block = document.createElement("div");
            block.className = "event-block";
            block.textContent = event.eventName;

            block.style.left = `${day * cellWidth}px`;
            block.style.top = `${firstCellTop + startHour * cellHeight}px`; // ✅ FIX
            block.style.width = `${cellWidth}px`;
            block.style.height = `${duration * cellHeight}px`;

            console.log("Appending block:", block);

            calendarBox.appendChild(block);
        });
    });

    console.log("Finished rendering events.");
}

function drawFriendCalendar(friendName, events) {
  const grid = document.getElementById("calendarGrid");
  const calendarBox = document.getElementById("calendarBox");
  if (!grid || !calendarBox) return;

  // remove old blocks for this friend
  document
    .querySelectorAll(`.event-block.friend-event[data-friend="${friendName}"]`)
    .forEach(el => el.remove());

  const gridRect = grid.getBoundingClientRect();
  const cellWidth = gridRect.width / 7;

  const sampleCell = grid.querySelector(".hour-cell");
  if (!sampleCell) return;

  const cellRect = sampleCell.getBoundingClientRect();
  const cellHeight = cellRect.height;
  const firstCellTop = cellRect.top - gridRect.top;

  (events || []).forEach(event => {
    (event.eventDates || []).forEach(date => {
      const start = new Date(date.start);
      const end = new Date(date.end);
      if (isNaN(start) || isNaN(end)) return;

      const day = (start.getDay() + 6) % 7;
      const startHour = start.getHours() + start.getMinutes() / 60;
      const endHour = end.getHours() + end.getMinutes() / 60;
      const duration = endHour - startHour;
      if (duration <= 0) return;

      const block = document.createElement("div");
      block.className = "event-block friend-event";
      block.dataset.friend = friendName;
      block.textContent = `${event.eventName || "(Event)"} (${friendName})`;

      block.style.left = `${day * cellWidth}px`;
      block.style.top = `${firstCellTop + startHour * cellHeight}px`;
      block.style.width = `${cellWidth}px`;
      block.style.height = `${duration * cellHeight}px`;
      block.style.opacity = "0.7";

      calendarBox.appendChild(block);
    });
  });
}

// ==============================
// Toggle "Next Event Today" pane
// ==============================
document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("toggle-today-btn");
  const rightSection = document.querySelector(".right-section");

  if (!toggleBtn || !rightSection) {
    console.warn("Toggle Today: button or right section not found.");
    return;
  }

  let visible = true;

  toggleBtn.addEventListener("click", () => {
    visible = !visible;

    rightSection.style.display = visible ? "flex" : "none";
    toggleBtn.textContent = visible ? "Hide Search" : "Show Search";
  });
});

// --- Event Search Functionality ---
document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("events-search");
  const todayEventDiv = document.getElementById("today-event");

  if (!searchInput || !todayEventDiv) return;

  searchInput.addEventListener("input", async () => {
    const query = searchInput.value.toLowerCase().trim();

    const username = sessionStorage.getItem("username");
    const accessToken = sessionStorage.getItem("accessToken");
    const events = await window.electronAPI.getEvents(username, accessToken);

    const filtered = (events || []).filter(ev => {
      const name = (ev.eventName || "").toLowerCase();
      const startDate = (ev.startDate || "").toLowerCase();
      const startTime = (ev.startTime || "").toLowerCase();
      const endTime = (ev.endTime || "").toLowerCase();

      return (
        name.includes(query) ||
        startDate.includes(query) ||
        startTime.includes(query) ||
        endTime.includes(query) 
      );
    });

    todayEventDiv.innerHTML = "";

    if (filtered.length === 0) {
      todayEventDiv.textContent = "No matching events found.";
      return;
    }

    filtered.forEach(ev => {
      const item = document.createElement("div");

      const locText = ev.location ? ` @ ${ev.location}` : "";
      item.textContent = `${ev.eventName || "(Unnamed Event)"} — ${ev.startDate || "No Date"} ${ev.startTime || ""}${locText}`;

      item.classList.add("event-item");
      todayEventDiv.appendChild(item);
    });
  });
});
