
// ===== UPDATE NAVBAR WITH LOGIN STATUS + DROPDOWN MENU ===== //
document.addEventListener('DOMContentLoaded', () => {
    const currentUser = localStorage.getItem('currentUser');
    const navLinks = document.querySelector('.nav-links');

    if (!currentUser || !navLinks) return;

    const user = JSON.parse(currentUser);
    const loginItem = navLinks.querySelector('li:last-child');
    const loginLink = loginItem ? loginItem.querySelector('a') : null;

    if (!loginItem || !loginLink) return;

    loginLink.innerHTML = `<strong>${user.firstName} ${user.lastName}</strong>`;
    loginLink.href = '#';

    let dropdown = loginItem.querySelector('.user-dropdown');
    if (!dropdown) {
        dropdown = document.createElement('div');
        dropdown.className = 'user-dropdown';
        dropdown.innerHTML = `
            <button class="dropdown-item" id="accountBtn" type="button">Account</button>
            <button class="dropdown-item" id="bookingsBtn" type="button">My Bookings</button>
            <button class="dropdown-item" id="logoutBtn" type="button">Log Out</button>
        `;
        loginItem.style.position = 'relative';
        loginItem.appendChild(dropdown);
    }

    loginLink.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropdown.classList.toggle('show');
    });

    dropdown.addEventListener('click', (e) => {
        e.stopPropagation();

        if (e.target.id === 'accountBtn') {
            window.location.href = window.location.pathname.includes('/pages/')
                ? 'account.html'
                : 'pages/account.html';
        }

        if (e.target.id === 'bookingsBtn') {
            window.location.href = window.location.pathname.includes('/pages/')
                ? 'bookings.html'
                : 'pages/bookings.html';
        }

        if (e.target.id === 'logoutBtn') {
            const confirmLogout = confirm("Are you sure you want to log out?");
            if (!confirmLogout) return;

            localStorage.removeItem('currentUser');

            window.location.href = window.location.pathname.includes('/pages/')
                ? 'login.html'
                : 'pages/login.html';
        }
    });

    document.addEventListener('click', () => {
        dropdown.classList.remove('show');
    });
});

// ===== ACCOUNT DROPDOWN MENU ===== //

document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('themeToggle');
    const root = document.documentElement;

    const savedTheme = localStorage.getItem('theme') || 'dark';

    root.classList.toggle('dark-mode', savedTheme === 'dark');

    if (toggle) {
        toggle.checked = savedTheme === 'dark';

        toggle.addEventListener('change', () => {
            const isDark = toggle.checked;
            root.classList.toggle('dark-mode', isDark);
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        });
    }
});

// POPUP LOGIC
// ===== POPUP LOGIC ===== //
document.addEventListener('DOMContentLoaded', () => {
    const popup = document.getElementById('pricePopup');
    const closeBtn = document.getElementById('closePopup');

    // STOP if popup does not exist on this page
    if (!popup || !closeBtn) return;

    const seen = localStorage.getItem('seenPopup');

    if (!seen) {
        setTimeout(() => {
            popup.style.display = 'block';
        }, 1000);
    }

    closeBtn.addEventListener('click', () => {
        popup.style.display = 'none';
        localStorage.setItem('seenPopup', 'true');
    });
});

// ===== INITIALIZE MAP =====
document.addEventListener("DOMContentLoaded", () => {
    const map = L.map('map').setView([20, 0], 2);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    const locations = [
        { name: "France", coords: [46.2276, 2.2137], country: "france" },
        { name: "USA", coords: [37.0902, -95.7129], country: "usa" },
        { name: "Japan", coords: [36.2048, 138.2529], country: "japan" },
        { name: "Indonesia", coords: [-0.7893, 113.9213], country: "indonesia" },
        { name: "Switzerland", coords: [46.8182, 8.2275], country: "switzerland" }
    ];

    locations.forEach(loc => {
        const marker = L.marker(loc.coords).addTo(map);
        marker.bindPopup(`
    <strong>${loc.name}</strong><br>
    <a href="./pages/listings.html?country=${loc.country}" style="color:#ff385c; text-decoration:none;">See Listings</a>
`);
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const country = urlParams.get("country") || "";
    if (country) document.getElementById("countryFilter").value = country;
    filterListings({ country });
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
    if (!loginForm || !window.location.pathname.includes('login.html')) return;

    loginForm.addEventListener('submit', function (e) {
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
        if (!localStorage.getItem('justSignedUp')) {
            alert('✅ Welcome back, ' + user.firstName + '!');
        }
        localStorage.removeItem('justSignedUp');
        window.location.href = '../index.html';
    });
});

// Wait until page is fully loaded
/*document.addEventListener("DOMContentLoaded", function () {

    const modal = document.getElementById("contactModal");
    const openBtn = document.querySelector(".nav-btn");
    const closeBtn = document.querySelector(".close");

    // Open modal
    openBtn.addEventListener("click", function () {
        modal.classList.add("show");
    });

    // Close modal (X button)
    closeBtn.addEventListener("click", function () {
        modal.classList.remove("show");
    });

    // Close when clicking outside modal content
    window.addEventListener("click", function (e) {
        if (e.target === modal) {
            modal.classList.remove("show");
        }
    });

});*/
document.addEventListener("DOMContentLoaded", function () {
    const modal = document.getElementById("contactModal");
    const openBtn = document.querySelector(".nav-btn");
    const closeBtn = document.querySelector(".contact-close");

    if (!modal || !openBtn || !closeBtn) return;

    openBtn.addEventListener("click", function () {
        modal.classList.add("show");
    });

    closeBtn.addEventListener("click", function () {
        modal.classList.remove("show");
    });

    window.addEventListener("click", function (e) {
        if (e.target === modal) {
            modal.classList.remove("show");
        }
    });
});

