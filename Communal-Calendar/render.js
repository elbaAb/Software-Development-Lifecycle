const ipcRenderer = require('electron').ipcRenderer;

function sendForm(event) {
    event.preventDefault() // stop the form from submitting
    let EventName = document.getElementById("Event").value;
    ipcRenderer.send('form-submission', EventName)
}

// ========== UPCOMING EVENTS FUNCTIONALITY ==========

// Sample events data (replace with your actual data source)
const sampleEvents = [
  { id: 1, title: "Team Meeting", datetime: new Date(Date.now() + 2 * 60 * 60 * 1000), location: "Conference Room A" },
  { id: 2, title: "Lunch with Friends", datetime: new Date(Date.now() + 24 * 60 * 60 * 1000), location: "Central Park" },
  { id: 3, title: "Doctor Appointment", datetime: new Date(Date.now() + 40 * 60 * 60 * 1000), location: "Medical Center" },
  { id: 4, title: "Birthday Party", datetime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), location: "John's House" }
];

function loadUpcomingEvents() {
  const now = new Date();
  const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
  
  // Filter events for next 2 days
  const upcomingEvents = sampleEvents.filter(event => 
    event.datetime >= now && event.datetime <= twoDaysFromNow
  ).sort((a, b) => a.datetime - b.datetime); // Sort by closest first
  
  const eventsContainer = document.getElementById('events-container');
  const noEvents = document.getElementById('no-events');
  const eventsCount = document.getElementById('events-count');
  const upcomingCount = document.getElementById('upcoming-count');
  const totalEvents = document.getElementById('total-events');
  
  // Update counts
  eventsCount.textContent = `${upcomingEvents.length} event${upcomingEvents.length !== 1 ? 's' : ''}`;
  upcomingCount.textContent = upcomingEvents.length;
  totalEvents.textContent = sampleEvents.length;
  
  // Clear container
  eventsContainer.innerHTML = '';
  
  if (upcomingEvents.length === 0) {
    noEvents.classList.remove('hidden');
    return;
  }
  
  noEvents.classList.add('hidden');
  
  // Add events to container
  upcomingEvents.forEach((event, index) => {
    const eventElement = document.createElement('div');
    eventElement.className = `event-item ${index === 0 ? 'next-upcoming' : ''}`;
    
    const timeString = event.datetime.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    eventElement.innerHTML = `
      <div class="event-title">${event.title}</div>
      <div class="event-datetime">${timeString}</div>
      <div class="event-location">📍 ${event.location}</div>
    `;
    
    eventsContainer.appendChild(eventElement);
  });
}

// ========== ACCOUNT TAB FUNCTIONALITY ==========
document.addEventListener('DOMContentLoaded', function() {
    const accountButton = document.getElementById('account-button');
    const accountDropdown = document.getElementById('account-dropdown');
    const categoryForm = document.getElementById('category-form');
    const categoryTypeSelect = document.getElementById('category-type');
    const colorGroup = document.getElementById('color-group');
    const repeatGroup = document.getElementById('repeat-group');
    const categoryImageInput = document.getElementById('category-image');
    const imagePreview = document.getElementById('image-preview');
    const categoriesContainer = document.getElementById('categories-container');

    let categories = [];

    // Initialize upcoming events
    loadUpcomingEvents();

    // Show/hide account dropdown
    accountButton.addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent the click from bubbling up
        accountDropdown.classList.toggle('hidden');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function() {
        accountDropdown.classList.add('hidden');
    });

    // Prevent dropdown from closing when clicking inside it
    accountDropdown.addEventListener('click', function(e) {
        e.stopPropagation();
    });

    // Show/hide color picker and repeat schedule based on category type
    categoryTypeSelect.addEventListener('change', function() {
        if (this.value === 'primary') {
            colorGroup.style.display = 'block';
            repeatGroup.style.display = 'block';
        } else {
            colorGroup.style.display = 'none';
            repeatGroup.style.display = 'none';
        }
    });

    // Image preview functionality
    categoryImageInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                imagePreview.innerHTML = `<img src="${e.target.result}" alt="Category preview">`;
            };
            reader.readAsDataURL(file);
        }
    });

    // Handle category form submission
    categoryForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const categoryName = document.getElementById('category-name').value;
        const categoryType = document.getElementById('category-type').value;
        const categoryColor = document.getElementById('category-color').value;
        const repeatSchedule = document.getElementById('repeat-schedule').value;
        const categoryImage = categoryImageInput.files[0];

        // Create category object
        const category = {
            id: Date.now(),
            name: categoryName,
            type: categoryType,
            color: categoryType === 'primary' ? categoryColor : null,
            repeatSchedule: categoryType === 'primary' ? repeatSchedule : null,
            image: categoryImage ? URL.createObjectURL(categoryImage) : null
        };

        // Add to categories array
        categories.push(category);

        // Update UI
        renderCategories();

        // Reset form
        categoryForm.reset();
        imagePreview.innerHTML = '';
        colorGroup.style.display = 'block';
        repeatGroup.style.display = 'block';
    });

    // Render categories list
    function renderCategories() {
        categoriesContainer.innerHTML = '';
        
        categories.forEach(category => {
            const categoryElement = document.createElement('div');
            categoryElement.className = 'category-item';
            categoryElement.innerHTML = `
                ${category.color ? `<div class="category-color" style="background-color: ${category.color}"></div>` : ''}
                <div class="category-name">${category.name}</div>
                <div class="category-type">${category.type}</div>
                ${category.repeatSchedule ? `<div class="repeat-schedule">Repeats: ${category.repeatSchedule}</div>` : ''}
                ${category.image ? `<img src="${category.image}" alt="${category.name}" style="width: 20px; height: 20px; margin-left: 5px;">` : ''}
                <button onclick="deleteCategory(${category.id})" style="margin-left: 5px; background: red; padding: 2px 5px; font-size: 0.7em;">Delete</button>
            `;
            categoriesContainer.appendChild(categoryElement);
        });
    }

    // Delete category function (needs to be global)
    window.deleteCategory = function(categoryId) {
        categories = categories.filter(cat => cat.id !== categoryId);
        renderCategories();
    };

    // Refresh events every minute to update "next upcoming" highlighting
    setInterval(loadUpcomingEvents, 60000);
});