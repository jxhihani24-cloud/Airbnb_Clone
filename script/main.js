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
    if(newsletterForm) {
        const newsletterInput = newsletterForm.querySelector('input');
        const newsletterButton = newsletterForm.querySelector('button');

        newsletterButton.addEventListener('click', (e) => {
            e.preventDefault(); // prevent page reload
            const email = newsletterInput.value.trim();

            if(email && email.includes('@')) {
                alert(`Thanks! ${email} has been registered for updates.`);

                // Optional: clear input
                newsletterInput.value = '';
            } else {
                alert('Please enter a valid email address.');
            }
        });
    }
});

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





 