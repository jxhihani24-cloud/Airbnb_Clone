
document.addEventListener('DOMContentLoaded', () => {
    const storage = window.AppStorage;
    const currentUser = storage ? storage.getCurrentUser() : JSON.parse(localStorage.getItem('currentUser') || 'null');
    const navLinks = document.querySelector('.nav-links');

    if (!currentUser || !navLinks) return;
    const loginItem = navLinks.querySelector('li:last-child');
    const loginLink = loginItem ? loginItem.querySelector('a') : null;

    if (!loginItem || !loginLink) return;

    loginLink.innerHTML = `<strong>${currentUser.firstName} ${currentUser.lastName}</strong>`;
    loginLink.href = '#';

    let dropdown = loginItem.querySelector('.user-dropdown');
    if (!dropdown) {
        dropdown = document.createElement('div');
        dropdown.className = 'user-dropdown';
        dropdown.innerHTML = `
            <button class="dropdown-item" id="accountBtn" type="button">Account</button>
            <button class="dropdown-item" id="bookingsBtn" type="button">My Bookings</button>
            <button class="dropdown-item" id="messagesBtn" type="button">Messages</button>
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

        if (e.target.id === 'messagesBtn') {
            window.location.href = window.location.pathname.includes('/pages/')
                ? 'messages.html'
                : 'pages/messages.html';
        }

        if (e.target.id === 'logoutBtn') {
            const confirmLogout = confirm("Are you sure you want to log out?");
            if (!confirmLogout) return;

            if (storage) {
                storage.setCurrentUser(null);
            } else {
                localStorage.removeItem('currentUser');
            }

            sessionStorage.removeItem('pendingBooking');
            sessionStorage.removeItem('paymentConfirmation');

            window.location.href = window.location.pathname.includes('/pages/')
                ? 'login.html'
                : 'pages/login.html';
        }
    });

    document.addEventListener('click', () => {
        dropdown.classList.remove('show');
    });
});

function getMapApiKey() {
    const metaKey = document.querySelector('meta[name="maptiler-api-key"]')?.getAttribute('content') || '';
    const localKey = localStorage.getItem('mapApiKey') || '';
    const key = (localKey || metaKey).trim();
    return key && key !== 'YOUR_MAPTILER_API_KEY' ? key : '';
}

function addBaseMapLayer(mapInstance) {
    const apiKey = getMapApiKey();

    if (apiKey) {
        const tileJsonUrl = `https://api.maptiler.com/maps/topo-v4/tiles.json?key=${apiKey}`;

        $.ajax({
            url: tileJsonUrl,
            method: 'GET',
            dataType: 'json',
            headers: { 'Accept': 'application/json' },
            success: function (tileConfig) {
                const tileUrl = tileConfig?.tiles?.[0] || `https://api.maptiler.com/maps/topo-v4/{z}/{x}/{y}.png?key=${apiKey}`;
                const maxZoom = Number.isFinite(tileConfig?.maxzoom) ? tileConfig.maxzoom : 20;
                const tileSize = Number.isFinite(tileConfig?.tileSize) ? tileConfig.tileSize : 512;

                L.tileLayer(tileUrl, {
                    attribution: '&copy; MapTiler &copy; OpenStreetMap contributors',
                    maxZoom,
                    tileSize,
                    zoomOffset: tileSize === 512 ? -1 : 0
                }).addTo(mapInstance);
            },
            error: function (error) {
                console.warn('Map API AJAX failed, loading fallback OpenStreetMap:', error);
                loadFreeMapFallback(mapInstance);
            }
        });
    } else {
        loadFreeMapFallback(mapInstance);
    }
}

function loadFreeMapFallback(mapInstance) {
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(mapInstance);
}

window.HosteraMap = window.HosteraMap || {};
window.HosteraMap.addBaseMapLayer = addBaseMapLayer;

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

document.addEventListener('DOMContentLoaded', () => {
    const popup = document.getElementById('pricePopup');
    const closeBtn = document.getElementById('closePopup');

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

document.addEventListener("DOMContentLoaded", async () => {
    if (typeof L === "undefined") return;
    const mapEl = document.getElementById("map");
    if (!mapEl) return;

    const map = L.map('map').setView([20, 0], 2);
    await addBaseMapLayer(map);

    const locations = [
        { name: "France", coords: [46.2276, 2.2137], country: "france" },
        { name: "Germany", coords: [51.1657, 10.4515], country: "germany" },
        { name: "Italy", coords: [41.8719, 12.5674], country: "italy" },
        { name: "Spain", coords: [40.4637, -3.7492], country: "spain" },
        { name: "United Kingdom", coords: [55.3781, -3.4360], country: "uk" },
        { name: "Switzerland", coords: [46.8182, 8.2275], country: "switzerland" },
        { name: "Netherlands", coords: [52.1326, 5.2913], country: "netherlands" },
        { name: "Greece", coords: [39.0742, 21.8243], country: "greece" },
        { name: "Albania", coords: [41.1533, 20.1683], country: "albania" },
        { name: "USA", coords: [37.0902, -95.7129], country: "usa" },
        { name: "Canada", coords: [56.1304, -106.3468], country: "canada" },
        { name: "Mexico", coords: [23.6345, -102.5528], country: "mexico" },

        { name: "Brazil", coords: [-14.2350, -51.9253], country: "brazil" },
        { name: "Argentina", coords: [-38.4161, -63.6167], country: "argentina" },
        { name: "Chile", coords: [-35.6751, -71.5430], country: "chile" },

        { name: "Japan", coords: [36.2048, 138.2529], country: "japan" },
        { name: "China", coords: [35.8617, 104.1954], country: "china" },
        { name: "India", coords: [20.5937, 78.9629], country: "india" },
        { name: "Thailand", coords: [15.8700, 100.9925], country: "thailand" },
        { name: "Indonesia", coords: [-0.7893, 113.9213], country: "indonesia" },
        { name: "UAE", coords: [23.4241, 53.8478], country: "uae" },

        { name: "Egypt", coords: [26.8206, 30.8025], country: "egypt" },
        { name: "South Africa", coords: [-30.5595, 22.9375], country: "southafrica" },
        { name: "Morocco", coords: [31.7917, -7.0926], country: "morocco" },
        { name: "Kenya", coords: [-0.0236, 37.9062], country: "kenya" },

        { name: "Australia", coords: [-25.2744, 133.7751], country: "australia" },
        { name: "New Zealand", coords: [-40.9006, 174.8860], country: "newzealand" }
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
    const countryFilter = document.getElementById("countryFilter");
    if (country && countryFilter) countryFilter.value = country;
    if (typeof filterListings === "function") {
        filterListings({ country });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.faq-question').forEach(button => {
        button.addEventListener('click', () => {
            const faqItem = button.parentElement;

            faqItem.classList.toggle('active');
        });
    });

    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        const newsletterInput = newsletterForm.querySelector('input');
        const newsletterButton = newsletterForm.querySelector('button');

        newsletterButton.addEventListener('click', (e) => {
            e.preventDefault();
            const email = newsletterInput.value.trim();
            const storage = window.AppStorage;

            if (email && email.includes('@')) {
                const emails = storage
                    ? storage.getLS('subscribedEmails', [])
                    : JSON.parse(localStorage.getItem('subscribedEmails') || '[]');
                if (!emails.includes(email)) {
                    emails.push(email);
                    if (storage) {
                        storage.setLS('subscribedEmails', emails);
                    } else {
                        localStorage.setItem('subscribedEmails', JSON.stringify(emails));
                    }
                    alert(`Thanks! ${email} has been registered for updates.`);
                    newsletterInput.value = '';
                } else {
                    alert('You are already subscribed!');
                }
            } else {
                alert('Please enter a valid email address.');
            }
        });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('.login-form');

    if (!loginForm || !window.location.pathname.includes('login.html')) return;

    window.__hosteraMainLoginHandler = true;

    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const storage = window.AppStorage;

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();

        if (!username || !password) {
            alert('❌ Please enter username and password!');
            return;
        }

        let users = storage ? storage.getLS('users', []) : JSON.parse(localStorage.getItem('users') || '[]');

        const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());

        if (!user) {
            alert('❌ Username not found! Please sign up first.');
            return;
        }

        const passwordOk = storage
            ? await storage.verifyPassword(user, password)
            : user.password === password;

        if (!passwordOk) {
            alert('❌ Incorrect password!');
            return;
        }

        if (storage) {
            const migratedUser = await storage.ensureUserHasPasswordHash(user);
            if (migratedUser !== user) {
                users = users.map(u => (u.username === user.username ? migratedUser : u));
                storage.setLS('users', users);
            }
            storage.setCurrentUser(migratedUser);
        } else {
            localStorage.setItem('currentUser', JSON.stringify(user));
        }

        if (!localStorage.getItem('justSignedUp')) {
            alert('✅ Welcome back, ' + user.firstName + '!');
        }
        localStorage.removeItem('justSignedUp');
        window.location.href = '../index.html';
    });
});

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

