
// ===== UPDATE NAVBAR WITH LOGIN STATUS + DROPDOWN MENU ===== //
document.addEventListener('DOMContentLoaded', () => {
    const currentUser = localStorage.getItem('currentUser');
    const navLinks = document.querySelector('.nav-links');

    if (!navLinks) return;

    if (currentUser) {
        const user = JSON.parse(currentUser);

        // Find the "Log In" link
        const loginLink = navLinks.querySelector('li:last-child a');
        const loginItem = navLinks.querySelector('li:last-child');

        if (!loginLink || !loginItem) return;

        // Replace text with user's name
        loginLink.innerHTML = `<strong>${user.firstName} ${user.lastName}</strong>`;
        loginLink.href = '#';
        loginLink.style.cursor = 'pointer';

        // Create dropdown
        const dropdown = document.createElement('div');
        dropdown.classList.add('user-dropdown');
        dropdown.innerHTML = `
            <button class="dropdown-item" id="logoutBtn">Log Out</button>
            <button class="dropdown-item delete-account" id="deleteAccountBtn">Delete Account</button>
        `;

        // Make li relative so dropdown positions correctly
        loginItem.style.position = 'relative';
        loginItem.appendChild(dropdown);

        // Toggle dropdown on name click
        loginLink.addEventListener('click', (e) => {
            e.preventDefault();
            dropdown.classList.toggle('show');
        });

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', () => {
            if (confirm('Are you sure you want to log out?')) {
                localStorage.removeItem('currentUser');
                window.location.href = 'login.html';
            }
        });

        // Delete account
        document.getElementById('deleteAccountBtn').addEventListener('click', () => {
            const confirmDelete = confirm('Are you sure you want to delete your account? This cannot be undone.');

            if (!confirmDelete) return;

            let users = JSON.parse(localStorage.getItem('users')) || [];
            let properties = JSON.parse(localStorage.getItem('properties')) || [];

            // Remove user from users list
            users = users.filter(u => u.username !== user.username);

            // Remove user's properties too
            properties = properties.filter(p => p.owner !== user.username);

            localStorage.setItem('users', JSON.stringify(users));
            localStorage.setItem('properties', JSON.stringify(properties));
            localStorage.removeItem('currentUser');

            alert('✅ Account deleted successfully.');
            window.location.href = '../index.html';
        });

        // Close dropdown when clicking elsewhere
        document.addEventListener('click', (e) => {
            if (!loginItem.contains(e.target)) {
                dropdown.classList.remove('show');
            }
        });
    }
});

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

//map
document.addEventListener('DOMContentLoaded', () => {
    // Create map
    const map = L.map('map').setView([20, 0], 2);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Example markers
    L.marker([48.8566, 2.3522]).addTo(map).bindPopup('Paris');
    L.marker([40.7128, -74.0060]).addTo(map).bindPopup('New York');
    L.marker([35.6762, 139.6503]).addTo(map).bindPopup('Tokyo'); 
});

// ===== FAQ Accordion with slide effect =====
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.faq-question').forEach(button => {
        button.addEventListener('click', () => {
            const faqItem = button.parentElement;

            // Toggle active class to expand/collapse answer
            faqItem.classList.toggle('active');
        });
    });

    // ===== Newsletter Subscription Handler =====
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        const newsletterInput = newsletterForm.querySelector('input');
        const newsletterButton = newsletterForm.querySelector('button');

        newsletterButton.addEventListener('click', (e) => {
            e.preventDefault();
            const email = newsletterInput.value.trim();

            if (email && email.includes('@')) {
                // Get existing emails from localStorage
                const emails = JSON.parse(localStorage.getItem('subscribedEmails') || '[]');
                if (!emails.includes(email)) {
                    emails.push(email);
                    localStorage.setItem('subscribedEmails', JSON.stringify(emails));
                    alert(`Thanks! ${email} has been registered for updates.`);
                    newsletterInput.value = '';
                } else {
                    alert('You are already subscribed!');
                }
                console.log('Subscribed Emails:', emails); // Just for demo
            } else {
                alert('Please enter a valid email address.');
            }
        });
    }
});

// ===== LOGIN FORM HANDLER ===== //
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('.login-form');
    
    // Only run if login form exists (on login.html page)
    if (!loginForm) return;
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // 1. GET INPUT VALUES
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        
        // 2. VALIDATE FIELDS ARE FILLED
        if (!username || !password) {
            alert('❌ Please enter username and password!');
            return;
        }
        
        // 3. GET ALL USERS FROM LOCALSTORAGE
        let users = JSON.parse(localStorage.getItem('users')) || [];
        
        // 4. FIND USER BY USERNAME
        const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
        
        // 5. CHECK IF USER EXISTS
        if (!user) {
            alert('❌ Username not found! Please sign up first.');
            return;
        }
        
        // 6. CHECK IF PASSWORD MATCHES
        if (user.password !== password) {
            alert('❌ Incorrect password!');
            return;
        }
        
        // 7. SAVE LOGGED-IN USER TO LOCALSTORAGE
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // 8. SUCCESS & REDIRECT
        alert('✅ Welcome back, ' + user.firstName + '!');
        window.location.href = '../index.html';
    });
});

 