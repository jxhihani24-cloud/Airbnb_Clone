// ===== FUNCTION TO SHOW OR HIDE PASSWORD USING THE EYE ICON ===== //
function showPassword(){
    const pass=document.getElementById("password");
    if(pass.type==="password")
        pass.type="text";
    else
        pass.type="password";

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
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>-_]/;

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
// ===== HANDLE SIGNUP FORM SUBMISSION ===== //
document.querySelector('.login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const firstName = document.getElementById('Fname').value.trim();
    const lastName = document.getElementById('Lname').value.trim();
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const confirmPassword = document.getElementById('confirmpass').value.trim();
    
    if (!firstName || !lastName || !username || !email || !password) {
        alert('❌ Please fill in all fields!');
        return;
    }
    
    if (password !== confirmPassword) {
        alert('❌ Passwords do not match!');
        return;
    }
    
    let users = JSON.parse(localStorage.getItem('users')) || [];
    
    const usernameExists = users.some(user => user.username.toLowerCase() === username.toLowerCase());
    if (usernameExists) {
        alert('❌ Username already taken!');
        return;
    }
    
    const emailExists = users.some(user => user.email.toLowerCase() === email.toLowerCase());
    if (emailExists) {
        alert('❌ Email already registered!');
        return;
    }
    
    const newUser = {
        firstName: firstName,
        lastName: lastName,
        username: username,
        email: email,
        password: password,
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // ✅ SET AS CURRENTLY LOGGED-IN USER (BEFORE REDIRECT)
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    
    alert('✅ Account created successfully! Welcome ' + firstName + '!');
    
    // ✅ REDIRECT TO HOME (WILL AUTO-LOGIN BECAUSE currentUser IS SET)
    window.location.href = '../index.html';
});