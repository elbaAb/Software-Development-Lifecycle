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
  const selectedDays = Array.from(document.querySelectorAll('input[name=Day]:checked')).map(day => dayMap[day.id]);

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

      let endDateTime = new Date(currentDate);
      endDateTime.setHours(endHour, endMinute, 0, 0);

      eventDates.push({ start: startDateTime.toLocaleString(), end: endDateTime.toLocaleString()});
    }
    currentDate.setDate(currentDate.getDate() + 1);
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


function LoadUserData() {
  const username = window.sessionStorage.getItem("username");
  
  // Check if user is logged in before loading data
  if (!username) {
    console.log("No user logged in, skipping data load");
    return;
  }
  
  console.log("Loading data for user:", username);
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


document.addEventListener("DOMContentLoaded", async (event) =>{
  setupSignInPopup();
  setupAddCategoryPopup();
  setupAllFilterCheckboxes();
  setupProfilePictureHandlers();  // Set up profile picture change and sign out handlers
  
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
    const friend = await window.electronAPI.acceptFriend(requesterTEMP, requesteeTEMP, accessToken);
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
    const friend = await window.electronAPI.denyFriend(requesterTEMP, requesteeTEMP, accessToken);
    alert(friend);
    return(friend);
  } catch(err){
    console.log(err);
  }
}