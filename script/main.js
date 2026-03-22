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

// ===== FUNCTION TO SHOW OR HIDE PASSWORD USING THE EYE ICON ===== //
function showPassword(){
    const pass=document.getElementById("password");
    if(pass.type==="password")
        password.type="text";
    else
        password.type="password";

}
// ===== FUNCTION TO SHOW OR HIDE CONFIRM PASSWORD ===== //
function showConfirmPassword(){
    const pass=document.getElementById("confirmpass");
    if(pass.type==="password")
        confirmpass.type="text";
    else
        confirmpass.type="password";

}

// ===== FUNCTION TO IMPROVE FIRST AND LAST NAME IN SIGN UP ===== //
function formatName(input) {

    // remove anything that is not a letter or space
    input.value = input.value.replace(/[^a-zA-Z\s]/g, "");

    // capitalize first letter
    input.value = input.value.split(" ").map(word =>
         {
            if (word.length === 0) 
                return "";
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join(" ");
}


// ===== FUNCTION TO CHECK UNIQUENESS OF USERNAME AND CHARACTER LENGTH ===== //
const usernameInput = document.getElementById("username");
const usernameMessage = document.getElementById("username-message");

let usernameTimer;

usernameInput.addEventListener("input", function () {
    clearTimeout(usernameTimer);
    usernameMessage.textContent = "";
    usernameTimer = setTimeout(() => {checkUsername();}, 800);
});

function checkUsername() {
    const username = usernameInput.value.trim();

    if (username === "") {
        usernameMessage.textContent = "";
        return;
    }

    if (username.length < 6) {
        usernameMessage.textContent = "Username must be at least 6 characters";
        usernameMessage.style.color = "red";

        setTimeout(() => usernameMessage.textContent = "", 3000);
        return;
    }

    let users = JSON.parse(localStorage.getItem("users")) || [];

    const exists = users.some(user =>user.username.toLowerCase() === username.toLowerCase());

    if (exists) {
        usernameMessage.textContent = "Username already exists";
        usernameMessage.style.color = "red";
    } else {
        usernameMessage.textContent = "Username is available";
        usernameMessage.style.color = "var(--success-color)";
    }

    // disappear after 3 seconds
    setTimeout(() => usernameMessage.textContent = "", 3000);
}

// ===== FUNCTION TO CHECK IF EMAIL IS ALREADY IN USE ===== //
const emailInput = document.getElementById("email");

if (emailInput) {
    emailInput.addEventListener("blur", checkEmail);
}

function checkEmail() {

    const email = document.getElementById("email").value;
    const message = document.getElementById("email-message");

    // ===== PREVENTS A BUG SHOWING EMAIL IS AVAILABLE ANYTIME SOMETHING ELSE WAS PRESSED ===== //
    if (email === "") {
    message.textContent = "";
    return;
    }

    // ===== CHECKS IF EMAIL IS IN CORRECT FORMAT ===== //
    if (!email.includes("@") || !email.includes(".")) {
        message.textContent = "";
        return;
    }

    let users = JSON.parse(localStorage.getItem("users")) || [];

    const exists = users.some(user =>
        user.email.toLowerCase() === email.toLowerCase()
    );

    if (exists) {
        message.textContent = "Email already in use";
        message.style.color = "red";
    } else {
        message.textContent = "Email is available";
        message.style.color = "var(--success-color)";
    }

    // disappear after 3 seconds
    setTimeout(() => message.textContent = "", 3000);
}
 
// ===== FUNCTION FOR PASSWORD ===== //
function validatePassword() {
    const password = document.getElementById("password").value.trim();
    const message = document.getElementById("password-message");

    const hasNumber = /\d/;
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/;

    if (password === "") {
        message.textContent = "";
        return;
    }

    if (password.length < 8) {
        message.textContent = "Password must be at least 8 characters";
        message.style.color = "red";
        return;
    }

    if (!hasNumber.test(password)) {
        message.textContent = "Password must contain a number";
        message.style.color = "red";
        return;
    }

    if (!hasSpecial.test(password)) {
        message.textContent = "Password must contain a special character";
        message.style.color = "red";
        return;
    }

    message.textContent = "Password is strong";
    message.style.color = "var(--success-color)";

    setTimeout(() => message.textContent = "", 3000);
}

// ===== FUNCTION FOR CONFIRM PASSWORD ===== //
function checkConfirmPassword() {
    const password = document.getElementById("password").value.trim();
    const confirmPassword = document.getElementById("confirmpass").value.trim();
    const message = document.getElementById("confirm-password-message");

    if (confirmPassword === "") {
        message.textContent = "";
        return;
    }

    if (password !== confirmPassword) {
        message.textContent = "Passwords do not match";
        message.style.color = "red";
    } else {
        message.textContent = "Passwords match";
        message.style.color = "var(--success-color)";
    }

    setTimeout(() => {
        message.textContent = "";
    }, 3000);
}




 