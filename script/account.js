document.addEventListener("DOMContentLoaded", () => {
    const userData = localStorage.getItem("currentUser");
    const container = document.getElementById("accountDetails");
    const deleteBtn = document.getElementById("deleteAccountBtn");

    if (!userData) {
        alert("Please log in first.");
        window.location.href = "login.html";
        return;
    }

    const user = JSON.parse(userData);

    /* =========================
   CHANGE USERNAME FEATURE
   ========================= */

const newUsernameInput = document.getElementById("newUsername");
const changeUsernameBtn = document.getElementById("changeUsernameBtn");
const usernameFeedback = document.getElementById("usernameFeedback");

const ruleUsernameLength = document.getElementById("rule-username-length");
const ruleUsernameDifferent = document.getElementById("rule-username-different");
const ruleUsernameAvailable = document.getElementById("rule-username-available");

function toggleRule(el, valid) {
    if (!el) return;
    el.classList.remove("rule-valid", "rule-invalid");
    el.classList.add(valid ? "rule-valid" : "rule-invalid");
}

function validateUsernameLive() {

    if (!newUsernameInput) return false;

    const newUsername = newUsernameInput.value.trim();

    if (newUsername === "") {

        newUsernameInput.classList.remove("is-valid", "is-invalid");

        [ruleUsernameLength,
         ruleUsernameDifferent,
         ruleUsernameAvailable].forEach(rule => {
            if (rule) rule.classList.remove("rule-valid","rule-invalid");
        });

        if (usernameFeedback) usernameFeedback.textContent = "";

        return false;
    }

    const users = JSON.parse(localStorage.getItem("users")) || [];

    const hasLength = newUsername.length >= 6;
    const isDifferent = newUsername !== user.username;

    const exists = users.some(
        u => u.username.toLowerCase() === newUsername.toLowerCase()
    );

    const available = !exists;

    toggleRule(ruleUsernameLength, hasLength);
    toggleRule(ruleUsernameDifferent, isDifferent);
    toggleRule(ruleUsernameAvailable, available);

    const valid = hasLength && isDifferent && available;

    newUsernameInput.classList.toggle("is-valid", valid);
    newUsernameInput.classList.toggle("is-invalid", !valid);

    if (usernameFeedback) {
        usernameFeedback.textContent = valid
            ? "Username is valid."
            : "Username does not meet the requirements.";

        usernameFeedback.className = valid
            ? "form-text text-success"
            : "form-text text-danger";
    }

    return valid;
}

if (newUsernameInput) {
    newUsernameInput.addEventListener("input", validateUsernameLive);
}

if (changeUsernameBtn) {

    changeUsernameBtn.addEventListener("click", () => {

        const valid = validateUsernameLive();

        if (!valid) {
            alert("❌ Please choose a valid username.");
            return;
        }

        let users = JSON.parse(localStorage.getItem("users")) || [];

        const index = users.findIndex(
            u => u.username === user.username
        );

        if (index === -1) {
            alert("❌ User not found.");
            return;
        }

        users[index].username = newUsernameInput.value.trim();

        localStorage.setItem("users", JSON.stringify(users));

        const updatedUser = users[index];
        localStorage.setItem("currentUser", JSON.stringify(updatedUser));

        alert("✅ Username changed successfully.");

        newUsernameInput.value = "";
        newUsernameInput.classList.remove("is-valid","is-invalid");
    });

}

    const currentPasswordInput = document.getElementById("currentPassword");
const newPasswordInput = document.getElementById("newPassword");
const confirmNewPasswordInput = document.getElementById("confirmNewPassword");
const changePasswordBtn = document.getElementById("changePasswordBtn");

const currentPasswordFeedback = document.getElementById("currentPasswordFeedback");
const confirmPasswordFeedback = document.getElementById("confirmPasswordFeedback");

const ruleLength = document.getElementById("rule-length");
const ruleNumber = document.getElementById("rule-number");
const ruleSpecial = document.getElementById("rule-special");
const ruleDifferent = document.getElementById("rule-different");

function toggleRule(el, valid) {
    el.classList.remove("rule-valid", "rule-invalid");
    el.classList.add(valid ? "rule-valid" : "rule-invalid");
}

function validateNewPasswordLive() {
    const currentPassword = currentPasswordInput.value.trim();
    const newPassword = newPasswordInput.value.trim();

    if (newPassword === "") {
        newPasswordInput.classList.remove("is-valid", "is-invalid");

        [ruleLength, ruleNumber, ruleSpecial, ruleDifferent].forEach(rule => {
            rule.classList.remove("rule-valid", "rule-invalid");
        });

        return false;
    }

    const hasLength = newPassword.length >= 8;
    const hasNumber = /\d/.test(newPassword);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>_\-]/.test(newPassword);
    const isDifferent = newPassword !== currentPassword;

    toggleRule(ruleLength, hasLength);
    toggleRule(ruleNumber, hasNumber);
    toggleRule(ruleSpecial, hasSpecial);
    toggleRule(ruleDifferent, isDifferent);

    const allValid = hasLength && hasNumber && hasSpecial && isDifferent;
    newPasswordInput.classList.toggle("is-valid", allValid);
    newPasswordInput.classList.toggle("is-invalid", !allValid);

    return allValid;
}

function validateCurrentPasswordLive() {
    const currentPassword = currentPasswordInput.value.trim();

    if (currentPassword === "") {
        currentPasswordInput.classList.remove("is-valid", "is-invalid");
        currentPasswordFeedback.textContent = "";
        return false;
    }

    const isCorrect = currentPassword === user.password;

    currentPasswordInput.classList.toggle("is-valid", isCorrect);
    currentPasswordInput.classList.toggle("is-invalid", !isCorrect);

    currentPasswordFeedback.textContent = isCorrect
        ? "Current password is correct."
        : "Current password is incorrect.";

    currentPasswordFeedback.className = isCorrect
        ? "form-text text-success"
        : "form-text text-danger";

    return isCorrect;
}

function validateConfirmPasswordLive() {
    const newPassword = newPasswordInput.value.trim();
    const confirmPassword = confirmNewPasswordInput.value.trim();

    if (confirmPassword === "") {
        confirmNewPasswordInput.classList.remove("is-valid", "is-invalid");
        confirmPasswordFeedback.textContent = "";
        return false;
    }

    const matches = newPassword === confirmPassword;

    confirmNewPasswordInput.classList.toggle("is-valid", matches);
    confirmNewPasswordInput.classList.toggle("is-invalid", !matches);

    confirmPasswordFeedback.textContent = matches
        ? "Passwords match."
        : "Passwords do not match.";

    confirmPasswordFeedback.className = matches
        ? "form-text text-success"
        : "form-text text-danger";

    return matches;
}

document.querySelectorAll(".toggle-pass").forEach(btn => {
    btn.addEventListener("click", () => {
        const target = document.getElementById(btn.dataset.target);
        target.type = target.type === "password" ? "text" : "password";
        btn.textContent = target.type === "password" ? "👁" : "🙈";
    });
});

if (currentPasswordInput) {
    currentPasswordInput.addEventListener("input", () => {
    validateCurrentPasswordLive();

    if (newPasswordInput.value.trim() !== "") {
        validateNewPasswordLive();
    }
});
}

if (newPasswordInput) {
    newPasswordInput.addEventListener("input", () => {
        validateNewPasswordLive();
        validateConfirmPasswordLive();
    });
}

if (confirmNewPasswordInput) {
    confirmNewPasswordInput.addEventListener("input", validateConfirmPasswordLive);
}

if (changePasswordBtn) {
    changePasswordBtn.addEventListener("click", () => {
        const currentOk = validateCurrentPasswordLive();
        const newOk = validateNewPasswordLive();
        const confirmOk = validateConfirmPasswordLive();

        if (!currentOk || !newOk || !confirmOk) {
            alert("❌ Please fix the password fields before continuing.");
            return;
        }

        let users = JSON.parse(localStorage.getItem("users")) || [];
        const userIndex = users.findIndex(u => u.username === user.username);

        if (userIndex === -1) {
            alert("❌ User not found.");
            return;
        }

        users[userIndex].password = newPasswordInput.value.trim();
        localStorage.setItem("users", JSON.stringify(users));

        const updatedUser = users[userIndex];
        localStorage.setItem("currentUser", JSON.stringify(updatedUser));

        currentPasswordInput.value = "";
        newPasswordInput.value = "";
        confirmNewPasswordInput.value = "";

        currentPasswordInput.classList.remove("is-valid", "is-invalid");
        newPasswordInput.classList.remove("is-valid", "is-invalid");
        confirmNewPasswordInput.classList.remove("is-valid", "is-invalid");

        currentPasswordFeedback.textContent = "";
        confirmPasswordFeedback.textContent = "";

        [ruleLength, ruleNumber, ruleSpecial, ruleDifferent].forEach(rule => {
            rule.classList.remove("rule-valid", "rule-invalid");
        });

        alert("✅ Password changed successfully.");
    });
}
    container.innerHTML = `
    <div class="col-12 col-sm-6">
        <div class="account-row h-100">
            <strong>First Name:</strong>
            <div>${user.firstName}</div>
        </div>
    </div>

    <div class="col-12 col-sm-6">
        <div class="account-row h-100">
            <strong>Last Name:</strong>
            <div>${user.lastName}</div>
        </div>
    </div>

    <div class="col-12 col-sm-6">
        <div class="account-row h-100">
            <strong>Username:</strong>
            <div>${user.username}</div>
        </div>
    </div>

    <div class="col-12 col-sm-6">
        <div class="account-row h-100">
            <strong>Email:</strong>
            <div>${user.email}</div>
        </div>
    </div>
`;

    if (deleteBtn) {
        deleteBtn.addEventListener("click", () => {
            const confirmDelete = confirm("Are you sure you want to delete your account?");
            if (!confirmDelete) return;

            let users = JSON.parse(localStorage.getItem("users")) || [];
            let properties = JSON.parse(localStorage.getItem("properties")) || [];

            users = users.filter(u => u.username !== user.username);
            properties = properties.filter(p => p.owner !== user.username);

            localStorage.setItem("users", JSON.stringify(users));
            localStorage.setItem("properties", JSON.stringify(properties));
            localStorage.removeItem("currentUser");

            alert("Your account has been deleted.");
            window.location.href = "login.html";
        });
    }
});

// CHANGE PASSWORD //
const changePasswordBtn = document.getElementById("changePasswordBtn");

if (changePasswordBtn) {
    changePasswordBtn.addEventListener("click", () => {
        const currentPasswordInput = document.getElementById("currentPassword").value.trim();
        const newPasswordInput = document.getElementById("newPassword").value.trim();
        const confirmNewPasswordInput = document.getElementById("confirmNewPassword").value.trim();

        if (!currentPasswordInput || !newPasswordInput || !confirmNewPasswordInput) {
            alert("❌ Please fill in all password fields.");
            return;
        }

        if (currentPasswordInput !== user.password) {
            alert("❌ Current password is incorrect.");
            return;
        }

        if (newPasswordInput.length < 8) {
            alert("❌ New password must be at least 8 characters.");
            return;
        }

        if (!/\d/.test(newPasswordInput)) {
            alert("❌ New password must contain at least one number.");
            return;
        }

        if (!/[!@#$%^&*(),.?\":{}|<>_\-]/.test(newPasswordInput)) {
            alert("❌ New password must contain at least one special character.");
            return;
        }

        if (newPasswordInput !== confirmNewPasswordInput) {
            alert("❌ New passwords do not match.");
            return;
        }

        if (newPasswordInput === currentPasswordInput) {
            alert("❌ New password must be different from the current password.");
            return;
        }

        let users = JSON.parse(localStorage.getItem("users")) || [];
        const userIndex = users.findIndex(u => u.username === user.username);

        if (userIndex === -1) {
            alert("❌ User not found.");
            return;
        }

        users[userIndex].password = newPasswordInput;
        localStorage.setItem("users", JSON.stringify(users));

        const updatedUser = users[userIndex];
        localStorage.setItem("currentUser", JSON.stringify(updatedUser));

        document.getElementById("currentPassword").value = "";
        document.getElementById("newPassword").value = "";
        document.getElementById("confirmNewPassword").value = "";

        alert("✅ Password changed successfully.");
    });
}