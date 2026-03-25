// ===== FUNCTION TO SHOW OR HIDE PASSWORD USING THE EYE ICON ===== //
function showPassword() {
    const pass = document.getElementById("password");
    if (!pass) return;
    pass.type = pass.type === "password" ? "text" : "password";
}

// ===== FUNCTION TO SHOW OR HIDE CONFIRM PASSWORD ===== //
function showConfirmPassword() {
    const pass = document.getElementById("confirmpass");
    if (!pass) return;
    pass.type = pass.type === "password" ? "text" : "password";
}

// ===== FUNCTION TO IMPROVE FIRST AND LAST NAME IN SIGN UP ===== //
function formatName(input) {
    input.value = input.value.replace(/[^a-zA-Z\s]/g, "");
    input.value = input.value
        .split(" ")
        .map(word => {
            if (word.length === 0) return "";
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join(" ");
}

document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector(".login-form");
    if (!form) return;

    const usernameInput = document.getElementById("username");
    const usernameMessage = document.getElementById("username-message");

    const emailInput = document.getElementById("email");
    const emailMessage = document.getElementById("email-message");

    const passwordInput = document.getElementById("password");
    const confirmPasswordInput = document.getElementById("confirmpass");
    const confirmPasswordMessage = document.getElementById("confirm-password-message");

    const ruleLength = document.getElementById("rule-length");
    const ruleNumber = document.getElementById("rule-number");
    const ruleSpecial = document.getElementById("rule-special");

    let usernameTimer;

    function clearValidationState(input) {
        if (!input) return;
        input.classList.remove("is-valid", "is-invalid");
    }

    function toggleRule(el, valid) {
        if (!el) return;
        el.classList.remove("rule-valid", "rule-invalid");
        el.classList.add(valid ? "rule-valid" : "rule-invalid");
    }

    // ===== USERNAME CHECK ===== //
    function checkUsername() {
        if (!usernameInput || !usernameMessage) return false;

        const username = usernameInput.value.trim();

        if (username === "") {
            usernameMessage.textContent = "";
            clearValidationState(usernameInput);
            return false;
        }

        if (username.length < 6) {
            usernameMessage.textContent = "Username must be at least 6 characters";
            usernameMessage.style.color = "red";
            usernameInput.classList.add("is-invalid");
            usernameInput.classList.remove("is-valid");
            return false;
        }

        let users = JSON.parse(localStorage.getItem("users")) || [];
        const exists = users.some(
            user => user.username.toLowerCase() === username.toLowerCase()
        );

        if (exists) {
            usernameMessage.textContent = "Username already exists";
            usernameMessage.style.color = "red";
            usernameInput.classList.add("is-invalid");
            usernameInput.classList.remove("is-valid");
            return false;
        }

        usernameMessage.textContent = "Username is available";
        usernameMessage.style.color = "var(--success-color)";
        usernameInput.classList.add("is-valid");
        usernameInput.classList.remove("is-invalid");
        return true;
    }

    if (usernameInput) {
        usernameInput.addEventListener("input", function () {
            clearTimeout(usernameTimer);
            usernameMessage.textContent = "";
            clearValidationState(usernameInput);

            usernameTimer = setTimeout(() => {
                checkUsername();
            }, 500);
        });
    }

    // ===== EMAIL CHECK ===== //
    function checkEmail() {
        if (!emailInput || !emailMessage) return false;

        const email = emailInput.value.trim();

        if (email === "") {
            emailMessage.textContent = "";
            clearValidationState(emailInput);
            return false;
        }

        if (!email.includes("@") || !email.includes(".")) {
            emailMessage.textContent = "Please enter a valid email";
            emailMessage.style.color = "red";
            emailInput.classList.add("is-invalid");
            emailInput.classList.remove("is-valid");
            return false;
        }

        let users = JSON.parse(localStorage.getItem("users")) || [];
        const exists = users.some(
            user => user.email.toLowerCase() === email.toLowerCase()
        );

        if (exists) {
            emailMessage.textContent = "Email already in use";
            emailMessage.style.color = "red";
            emailInput.classList.add("is-invalid");
            emailInput.classList.remove("is-valid");
            return false;
        }

        emailMessage.textContent = "Email is available";
        emailMessage.style.color = "var(--success-color)";
        emailInput.classList.add("is-valid");
        emailInput.classList.remove("is-invalid");
        return true;
    }

    if (emailInput) {
        emailInput.addEventListener("blur", checkEmail);
        emailInput.addEventListener("input", () => {
            emailMessage.textContent = "";
            clearValidationState(emailInput);
        });
    }

    // ===== PASSWORD LIVE VALIDATION ===== //
    function validatePasswordLive() {
        if (!passwordInput) return false;

        const password = passwordInput.value.trim();

        if (password === "") {
            clearValidationState(passwordInput);
            [ruleLength, ruleNumber, ruleSpecial].forEach(rule => {
                if (rule) rule.classList.remove("rule-valid", "rule-invalid");
            });
            return false;
        }

        const hasLength = password.length >= 8;
        const hasNumber = /\d/.test(password);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>_\-]/.test(password);

        toggleRule(ruleLength, hasLength);
        toggleRule(ruleNumber, hasNumber);
        toggleRule(ruleSpecial, hasSpecial);

        const allValid = hasLength && hasNumber && hasSpecial;

        passwordInput.classList.toggle("is-valid", allValid);
        passwordInput.classList.toggle("is-invalid", !allValid);

        return allValid;
    }

    // ===== CONFIRM PASSWORD LIVE VALIDATION ===== //
    function validateConfirmPasswordLive() {
        if (!passwordInput || !confirmPasswordInput || !confirmPasswordMessage) return false;

        const password = passwordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();

        if (confirmPassword === "") {
            clearValidationState(confirmPasswordInput);
            confirmPasswordMessage.textContent = "";
            return false;
        }

        const matches = password === confirmPassword;

        confirmPasswordInput.classList.toggle("is-valid", matches);
        confirmPasswordInput.classList.toggle("is-invalid", !matches);

        confirmPasswordMessage.textContent = matches
            ? "Passwords match."
            : "Passwords do not match.";

        confirmPasswordMessage.className = matches
            ? "form-text text-success"
            : "form-text text-danger";

        return matches;
    }

    if (passwordInput) {
        passwordInput.addEventListener("input", () => {
            validatePasswordLive();

            if (confirmPasswordInput && confirmPasswordInput.value.trim() !== "") {
                validateConfirmPasswordLive();
            }
        });
    }

    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener("input", validateConfirmPasswordLive);
    }

    // ===== EYE TOGGLE BUTTONS ===== //
    document.querySelectorAll(".toggle-pass").forEach(btn => {
        btn.addEventListener("click", () => {
            const target = document.getElementById(btn.dataset.target);
            if (!target) return;

            target.type = target.type === "password" ? "text" : "password";
            btn.textContent = target.type === "password" ? "👁" : "🙈";
        });
    });

    // ===== HANDLE SIGNUP FORM SUBMISSION ===== //
    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const firstName = document.getElementById("Fname").value.trim();
        const lastName = document.getElementById("Lname").value.trim();
        const username = usernameInput ? usernameInput.value.trim() : "";
        const email = emailInput ? emailInput.value.trim() : "";
        const password = passwordInput ? passwordInput.value.trim() : "";
        const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value.trim() : "";

        if (!firstName || !lastName || !username || !email || !password || !confirmPassword) {
            alert("❌ Please fill in all fields!");
            return;
        }

        const usernameValid = checkUsername();
        const emailValid = checkEmail();
        const passwordValid = validatePasswordLive();
        const confirmValid = validateConfirmPasswordLive();

        if (!usernameValid) {
            alert("❌ Please choose a valid username.");
            return;
        }

        if (!emailValid) {
            alert("❌ Please enter a valid email.");
            return;
        }

        if (!passwordValid) {
            alert("❌ Password does not meet the requirements.");
            return;
        }

        if (!confirmValid) {
            alert("❌ Passwords do not match!");
            return;
        }

        let users = JSON.parse(localStorage.getItem("users")) || [];

        const usernameExists = users.some(
            user => user.username.toLowerCase() === username.toLowerCase()
        );
        if (usernameExists) {
            alert("❌ Username already taken!");
            return;
        }

        const emailExists = users.some(
            user => user.email.toLowerCase() === email.toLowerCase()
        );
        if (emailExists) {
            alert("❌ Email already registered!");
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
        localStorage.setItem("users", JSON.stringify(users));
        localStorage.setItem("currentUser", JSON.stringify(newUser));

        alert("✅ Account created successfully! Welcome " + firstName + "!");
        window.location.href = "../index.html";
    });
});