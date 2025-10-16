const ipcRenderer = require('electron').ipcRenderer;

function sendForm(event) {
    event.preventDefault() // stop the form from submitting
    let EventName = document.getElementById("Event").value;
    ipcRenderer.send('form-submission', EventName)
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
});