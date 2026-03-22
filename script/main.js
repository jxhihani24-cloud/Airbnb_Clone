// ===== UPDATE NAVBAR WITH LOGIN STATUS ===== //
document.addEventListener('DOMContentLoaded', () => {
    const currentUser = localStorage.getItem('currentUser');
    const navLinks = document.querySelector('.nav-links');
    
    if (currentUser) {
        // User is logged in
        const user = JSON.parse(currentUser);
        
        // Find the "Log In" link
        const loginLink = navLinks.querySelector('li:last-child a');
        
        // Replace it with user's name and logout button
        loginLink.innerHTML = `<strong>${user.firstName} ${user.lastName}</strong>`;
        loginLink.href = '#'; // Prevent navigation
        loginLink.style.cursor = 'pointer';
        
        // Add logout functionality
        loginLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Are you sure you want to logout?')) {
                localStorage.removeItem('currentUser');
                window.location.href = 'pages/login.html'; // Redirect to login
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

 