//set dark mode on page load
document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('themeToggle');

    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'dark';

    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        toggle.checked = true;
    }

    // Toggle event
    toggle.addEventListener('change', () => {
        if (toggle.checked) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
        }
    });
   
});

// ===== FUNCTION TO SHOW OR HIDE PASSWORD USING THE EYE ICON ===== //
function showPassword(){
    const pass=document.getElementById("password");
    if(password.type==="password")
        password.type="text";
    else
        password.type="password";

}
// POPUP LOGIC
document.addEventListener('DOMContentLoaded', () => {

    const popup = document.getElementById('pricePopup');
    const closeBtn = document.getElementById('closePopup');

    // Check if popup was already shown
    const seen = localStorage.getItem('seenPopup');

    if (!seen) {
        // Show popup after 1 second
        setTimeout(() => {
            popup.style.display = 'block';
        }, 1000);
    }

    // Close popup when button clicked
    closeBtn.addEventListener('click', () => {
        popup.style.display = 'none';

        // Save that user has seen it
        localStorage.setItem('seenPopup', 'true');
    });
});


document.addEventListener('DOMContentLoaded', () => {
    // Create map
    const map = L.map('map').setView([20, 0], 2); // center: lat 20, lng 0, zoom 2 for world view

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Optional: example markers
    L.marker([48.8566, 2.3522]).addTo(map).bindPopup('Paris');
    L.marker([40.7128, -74.0060]).addTo(map).bindPopup('New York');
    L.marker([35.6762, 139.6503]).addTo(map).bindPopup('Tokyo');
});
 