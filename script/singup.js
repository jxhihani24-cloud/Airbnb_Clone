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

    const storage = window.AppStorage;
    const getUsers = () => (storage ? storage.getLS("users", []) : JSON.parse(localStorage.getItem("users") || "[]"));
    const setUsers = (users) => {
        if (storage) storage.setLS("users", users);
        else localStorage.setItem("users", JSON.stringify(users));
    };

    const usernameLoginField = document.getElementById("username");
    const passwordLoginField = document.getElementById("password");
    const firstNameField = document.getElementById("Fname");
    const togglePassBtn = document.querySelector(".toggle-pass");

    if (usernameLoginField && passwordLoginField && !firstNameField) {
        if (window.__hosteraMainLoginHandler) {
            if (togglePassBtn) {
                togglePassBtn.addEventListener("click", function () {
                    const targetId = this.getAttribute("data-target");
                    const targetInput = document.getElementById(targetId);
                    if (!targetInput) return;

                    const type = targetInput.getAttribute("type") === "password" ? "text" : "password";
                    targetInput.setAttribute("type", type);
                    this.textContent = type === "password" ? "👁" : "👁️";
                });
            }
            return;
        }

        const MAX_LOGIN_ATTEMPTS = 5;
        const LOCKOUT_TIME = 60000;
        const LOGIN_ATTEMPT_KEY = "loginAttempts";

        const getLoginAttempts = () => {
            const data = sessionStorage.getItem(LOGIN_ATTEMPT_KEY);
            return data ? JSON.parse(data) : {};
        };

        const saveLoginAttempts = (attempts) => {
            sessionStorage.setItem(LOGIN_ATTEMPT_KEY, JSON.stringify(attempts));
        };

        const getAttemptBucket = (attempts, username) => {
            if (!attempts[username]) {
                attempts[username] = { count: 0, lockedUntil: null };
            }
            return attempts[username];
        };

        form.addEventListener("submit", async function (e) {
            e.preventDefault();

            const username = usernameLoginField.value.trim();
            const password = passwordLoginField.value.trim();

            if (!username || !password) {
                alert("❌ Please enter both username and password!");
                return;
            }

            const attempts = getLoginAttempts();
            const bucket = getAttemptBucket(attempts, username.toLowerCase());

            if (bucket.lockedUntil && Date.now() < bucket.lockedUntil) {
                const remainingTime = Math.ceil((bucket.lockedUntil - Date.now()) / 1000);
                alert(`❌ Too many login attempts. Please try again in ${remainingTime} seconds.`);
                return;
            }

            const users = getUsers();
            const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());

            let validPassword = false;
            if (user) {
                if (storage && typeof storage.verifyPassword === "function") {
                    validPassword = await storage.verifyPassword(user, password);
                } else {
                    validPassword = password === user.password;
                }
            }

            if (!user || !validPassword) {
                bucket.count += 1;

                if (bucket.count >= MAX_LOGIN_ATTEMPTS) {
                    bucket.lockedUntil = Date.now() + LOCKOUT_TIME;
                    saveLoginAttempts(attempts);
                    alert("❌ Too many failed login attempts. Account temporarily locked for 60 seconds.");
                } else {
                    saveLoginAttempts(attempts);
                    alert(`❌ Invalid username or password. (Attempt ${bucket.count}/${MAX_LOGIN_ATTEMPTS})`);
                }
                return;
            }

            delete attempts[username.toLowerCase()];
            saveLoginAttempts(attempts);

            if (storage) storage.setCurrentUser(user);
            else localStorage.setItem("currentUser", JSON.stringify(user));

            alert(`✅ Welcome back, ${user.firstName || user.username}!`);
            window.location.href = "../index.html";
        });

        if (togglePassBtn) {
            togglePassBtn.addEventListener("click", function () {
                const targetId = this.getAttribute("data-target");
                const targetInput = document.getElementById(targetId);
                if (!targetInput) return;

                const type = targetInput.getAttribute("type") === "password" ? "text" : "password";
                targetInput.setAttribute("type", type);
                this.textContent = type === "password" ? "👁" : "👁️";
            });
        }

        return;
    }

    const isEditMode = localStorage.getItem("editingAccount") === "true";
    const currentUserData = storage
        ? storage.getCurrentUser()
        : JSON.parse(localStorage.getItem("currentUser") || "null");
    const currentUser = currentUserData
        ? getUsers().find(u => u.username === currentUserData.username) || currentUserData
        : null;

    const tit = document.getElementById("tit");
    const pageTitle = document.getElementById("pageTitle");
    const pageSubtitle = document.getElementById("pageSubtitle");
    const submitBtn = document.getElementById("submitBtn");
    const bottomText = document.getElementById("bottomText");

    const cancelEditBtn = document.getElementById("cancelEditBtn");

const usernameSectionTitle = document.getElementById("usernameSectionTitle");
const usernameLabel = document.getElementById("usernameLabel");

const passwordSectionTitle = document.getElementById("passwordSectionTitle");
const passwordLabel = document.getElementById("passwordLabel");
const confirmPasswordLabel = document.getElementById("confirmPasswordLabel");

const ruleUsernameLength = document.getElementById("rule-username-length");
const ruleUsernameAvailable = document.getElementById("rule-username-available");

   if (isEditMode && currentUser) {
    if (tit) tit.textContent = "Hostera - Edit Account";
    if (pageTitle) pageTitle.textContent = "Edit Your Account";
    if (pageSubtitle) pageSubtitle.textContent = "Update your personal information";
    if (submitBtn) submitBtn.textContent = "Confirm Changes";
    if (bottomText) bottomText.style.display = "none";

    if (usernameSectionTitle) usernameSectionTitle.textContent = "Change Username";
    if (usernameLabel) usernameLabel.textContent = "Change Username";

    if (passwordSectionTitle) passwordSectionTitle.textContent = "Change Password";
    if (passwordLabel) passwordLabel.textContent = "Change Password";
    if (confirmPasswordLabel) confirmPasswordLabel.textContent = "Confirm New Password";

    if (cancelEditBtn) cancelEditBtn.style.display = "block";
} else {
    if (cancelEditBtn) cancelEditBtn.style.display = "none";
}

if (cancelEditBtn) {
    cancelEditBtn.addEventListener("click", () => {
        localStorage.removeItem("editingAccount");
        window.location.href = "account.html";
    });
}

    const usernameInput = document.getElementById("username");
    const usernameMessage = document.getElementById("username-message");

    const emailInput = document.getElementById("email");
    const emailMessage = document.getElementById("email-message");

    const dobInput = document.getElementById("dob");
    const dobMessage = document.getElementById("dob-message");

    const countryInput = document.getElementById("country");

    const phoneInput = document.getElementById("phone");
    const phoneMessage = document.getElementById("phone-message");

    const passwordInput = document.getElementById("password");
    const confirmPasswordInput = document.getElementById("confirmpass");
    const confirmPasswordMessage = document.getElementById("confirm-password-message");

    const ruleLength = document.getElementById("rule-length");
    const ruleNumber = document.getElementById("rule-number");
    const ruleSpecial = document.getElementById("rule-special");

    let usernameTimer;

   let iti = null;

if (phoneInput && window.intlTelInput) {
    iti = window.intlTelInput(phoneInput, {
        initialCountry: "auto",
        geoIpLookup: function(callback) {
            fetch("https://ipapi.co/json")
                .then(res => res.json())
                .then(data => callback(data.country_code || "us"))
                .catch(() => callback("us"));
        },
        utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@23.0.11/build/js/utils.js"
    });
}

    function clearValidationState(input) {
        if (!input) return;
        input.classList.remove("is-valid", "is-invalid");
    }

    function migrateUsernameReferences(oldUsername, newUsername) {
        if (!oldUsername || !newUsername || oldUsername === newUsername) return;

        const readKey = (key) => (storage ? storage.getLS(key, []) : JSON.parse(localStorage.getItem(key) || "[]"));
        const writeKey = (key, value) => {
            if (storage) storage.setLS(key, value);
            else localStorage.setItem(key, JSON.stringify(value));
        };

        const bookings = readKey("bookings").map((item) => {
            if (!item || item.userId !== oldUsername) return item;
            return { ...item, userId: newUsername };
        });
        writeKey("bookings", bookings);

        const conversations = readKey("conversations").map((item) => {
            if (!item) return item;
            let changed = false;
            const next = { ...item };

            if (item.userId === oldUsername) {
                next.userId = newUsername;
                changed = true;
            }

            if (Array.isArray(item.messages)) {
                const updatedMessages = item.messages.map((msg) => {
                    if (!msg || msg.sender !== oldUsername) return msg;
                    changed = true;
                    return { ...msg, sender: newUsername };
                });

                if (changed) next.messages = updatedMessages;
            }

            return changed ? next : item;
        });
        writeKey("conversations", conversations);

        const payments = readKey("payments").map((item) => {
            if (!item || !item.bookingData || item.bookingData.userId !== oldUsername) return item;
            return { ...item, bookingData: { ...item.bookingData, userId: newUsername } };
        });
        writeKey("payments", payments);

        const reviews = readKey("reviews").map((item) => {
            if (!item) return item;
            const next = { ...item };
            let changed = false;

            if (item.userId === oldUsername) {
                next.userId = newUsername;
                changed = true;
            }

            if (item.reviewerUsername === oldUsername) {
                next.reviewerUsername = newUsername;
                changed = true;
            }

            return changed ? next : item;
        });
        writeKey("reviews", reviews);

        const hostReviews = readKey("hostReviews").map((item) => {
            if (!item) return item;
            const next = { ...item };
            let changed = false;

            if (item.reviewerUsername === oldUsername) {
                next.reviewerUsername = newUsername;
                changed = true;
            }

            if (item.hostUsername === oldUsername) {
                next.hostUsername = newUsername;
                changed = true;
            }

            return changed ? next : item;
        });
        writeKey("hostReviews", hostReviews);

        const properties = readKey("properties").map((item) => {
            if (!item || item.owner !== oldUsername) return item;
            return { ...item, owner: newUsername };
        });
        writeKey("properties", properties);
    }

    function toggleRule(el, valid) {
        if (!el) return;
        el.classList.remove("rule-valid", "rule-invalid");
        el.classList.add(valid ? "rule-valid" : "rule-invalid");
    }

    function checkUsername() {
    if (!usernameInput || !usernameMessage) return false;

    const username = usernameInput.value.trim();

    if (username === "") {
        usernameMessage.textContent = "";

        clearValidationState(usernameInput);

        if (ruleUsernameLength) ruleUsernameLength.classList.remove("rule-valid", "rule-invalid");
        if (ruleUsernameAvailable) ruleUsernameAvailable.classList.remove("rule-valid", "rule-invalid");

        return isEditMode ? true : false;
    }

    const hasLength = username.length >= 6;

    let users = getUsers();

    const exists = users.some(user => {
        if (isEditMode && currentUser && user.username === currentUser.username) return false;
        return user.username.toLowerCase() === username.toLowerCase();
    });

    const available = !exists;

    toggleRule(ruleUsernameLength, hasLength);
    toggleRule(ruleUsernameAvailable, available);

    const valid = hasLength && available;

    if (!hasLength) {
        usernameMessage.textContent = "";
        usernameInput.classList.add("is-invalid");
        usernameInput.classList.remove("is-valid");
        return false;
    }

    if (!available) {
        usernameMessage.textContent = "";
        usernameInput.classList.add("is-invalid");
        usernameInput.classList.remove("is-valid");
        return false;
    }

    usernameMessage.textContent = "";
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

    function checkEmail() {
        if (!emailInput || !emailMessage) return false;

        const email = emailInput.value.trim();

        if (email === "") {
            emailMessage.textContent = "";
            clearValidationState(emailInput);
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            emailMessage.textContent = "Please enter a valid email";
            emailMessage.style.color = "#e0262d";
            emailInput.classList.add("is-invalid");
            emailInput.classList.remove("is-valid");
            return false;
        }

        let users = getUsers();

        const exists = users.some(user => {
            if (isEditMode && currentUser && user.username === currentUser.username) return false;
            return user.email.toLowerCase() === email.toLowerCase();
        });

        if (exists) {
            emailMessage.textContent = "Email already in use";
            emailMessage.style.color = "#e0262d";
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
        emailInput.addEventListener("input", checkEmail);
    }

    function is18OrOlder(dateString) {
        if (!dateString) return false;

        const today = new Date();
        const dob = new Date(dateString);

        if (dob > today) {
            return false; // Future date invalid
        }

        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
            age--;
        }

        return age >= 18 && age <= 120;
    }

    function validateDob() {
        if (!dobInput || !dobMessage) return false;

        const dob = dobInput.value;

        if (!dob) {
            dobMessage.textContent = "";
            clearValidationState(dobInput);
            return false;
        }

        const valid = is18OrOlder(dob);

        dobInput.classList.toggle("is-valid", valid);
        dobInput.classList.toggle("is-invalid", !valid);

        dobMessage.textContent = valid
            ? "Age requirement met."
            : "You must be at least 18 years old.";

        dobMessage.className = "form-text";
        dobMessage.style.color = valid ? "var(--success-color)" : "#e0262d";

        return valid;
    }

    if (dobInput) {
        dobInput.addEventListener("change", validateDob);
    }

    function validatePhone() {
        if (!phoneInput || !phoneMessage) return false;

        if (!phoneInput.value.trim()) {
            phoneMessage.textContent = "";
            clearValidationState(phoneInput);
            return false;
        }

        const valid = iti ? iti.isValidNumber() : true;

        phoneInput.classList.toggle("is-valid", valid);
        phoneInput.classList.toggle("is-invalid", !valid);

        phoneMessage.textContent = valid
            ? "Phone number is valid."
            : "Invalid phone number.";

        phoneMessage.className = "form-text";
        phoneMessage.style.color = valid ? "var(--success-color)" : "#e0262d";

        return valid;
    }

    if (phoneInput) {
        phoneInput.addEventListener("blur", validatePhone);
    }

    function validatePasswordLive() {
        if (!passwordInput) return false;

        const password = passwordInput.value.trim();

        if (password === "") {
            passwordInput.classList.remove("is-valid", "is-invalid");
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

    document.querySelectorAll(".toggle-pass").forEach(btn => {
        btn.addEventListener("click", () => {
            const target = document.getElementById(btn.dataset.target);
            if (!target) return;

            target.type = target.type === "password" ? "text" : "password";
            btn.textContent = target.type === "password" ? "👁" : "🙈";
        });
    });

    if (isEditMode && currentUser) {
        document.getElementById("Fname").value = currentUser.firstName || "";
        document.getElementById("Lname").value = currentUser.lastName || "";
        usernameInput.value = currentUser.username || "";
        emailInput.value = currentUser.email || "";
        document.getElementById("gender").value = currentUser.gender || "";
        dobInput.value = currentUser.dateOfBirth || "";
        countryInput.value = currentUser.country || "";

        if (currentUser.phoneNumber) {
            iti.setNumber(currentUser.phoneNumber);
        }

        passwordInput.placeholder = "Leave blank to keep current password";
        confirmPasswordInput.placeholder = "Confirm new password if changing";
    }

    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        let firstName = document.getElementById("Fname").value.trim();
let lastName = document.getElementById("Lname").value.trim();
let gender = document.getElementById("gender").value;
let dob = dobInput.value;
let country = countryInput.value.trim();
let phone = iti ? iti.getNumber() : "";

let username = usernameInput ? usernameInput.value.trim() : "";
let email = emailInput ? emailInput.value.trim() : "";
let password = passwordInput ? passwordInput.value.trim() : "";
let confirmPassword = confirmPasswordInput ? confirmPasswordInput.value.trim() : "";
const persistedCurrentUser = isEditMode && currentUser
    ? getUsers().find(u => u.username === currentUser.username) || null
    : null;

if (!isEditMode) {
    if (!firstName || !lastName || !gender || !dob || !country || !phone || !username || !email) {
        alert("❌ Please fill in all required fields!");
        return;
    }
} else {
    firstName = firstName || currentUser.firstName;
    lastName = lastName || currentUser.lastName;
    gender = gender || currentUser.gender;
    dob = dob || currentUser.dateOfBirth;
    country = country || currentUser.country;
    phone = phone || currentUser.phoneNumber;
    username = username || currentUser.username;
    email = email || currentUser.email;
}

        const usernameValid = isEditMode && usernameInput.value.trim() === "" ? true : checkUsername();
const emailValid = isEditMode && emailInput.value.trim() === "" ? true : checkEmail();
const dobValid = isEditMode && dobInput.value.trim() === "" ? true : validateDob();
const phoneValid = isEditMode && phoneInput.value.trim() === "" ? true : validatePhone();

if (!usernameValid) {
    alert("❌ Please choose a valid username.");
    return;
}

if (!emailValid) {
    alert("❌ Please enter a valid email.");
    return;
}

if (!dobValid) {
    alert("❌ You must be at least 18 years old.");
    return;
}

if (!phoneValid) {
    alert("❌ Please enter a valid phone number.");
    return;
}

        let finalPassword = password;
        let finalPasswordHash = null;

if (!isEditMode) {
    if (!password || !confirmPassword) {
        alert("❌ Please fill in all password fields!");
        return;
    }

    const passwordValid = validatePasswordLive();
    const confirmValid = validateConfirmPasswordLive();

    if (!passwordValid) {
        alert("❌ Password does not meet the requirements.");
        return;
    }

    if (!confirmValid) {
        alert("❌ Passwords do not match!");
        return;
    }
} else {
    if (password === "" && confirmPassword === "") {
        finalPassword = persistedCurrentUser && typeof persistedCurrentUser.password === "string"
            ? persistedCurrentUser.password
            : "";
        finalPasswordHash = persistedCurrentUser ? persistedCurrentUser.passwordHash || null : null;

        if (!finalPassword && !finalPasswordHash) {
            alert("❌ Please enter a new password to secure your account.");
            return;
        }
    } else {
        const passwordValid = validatePasswordLive();
        const confirmValid = validateConfirmPasswordLive();

        if (!passwordValid) {
            alert("❌ Password does not meet the requirements.");
            return;
        }

        if (!confirmValid) {
            alert("❌ Passwords do not match!");
            return;
        }

        finalPasswordHash = storage
            ? await storage.hashPassword(finalPassword)
            : finalPassword;
    }
}

        if (!isEditMode) {
            finalPasswordHash = storage
                ? await storage.hashPassword(finalPassword)
                : finalPassword;
        } else if (storage && !finalPasswordHash && finalPassword) {
            finalPasswordHash = await storage.hashPassword(finalPassword);
        }

        let users = getUsers();

        const finalUser = {
            firstName: firstName,
            lastName: lastName,
            gender: gender,
            dateOfBirth: dob,
            country: country,
            phoneNumber: phone,
            username: username,
            email: email,
            passwordHash: finalPasswordHash,
            createdAt: isEditMode && currentUser ? currentUser.createdAt : new Date().toISOString()
        };

        if (!storage) {
            finalUser.password = finalPassword;
        }

        if (isEditMode && currentUser) {
            const oldUsername = currentUser.username;
            const userIndex = users.findIndex(u => u.username === currentUser.username);

            if (userIndex === -1) {
                alert("❌ User not found.");
                return;
            }

            const usernameTaken = users.some(
                (u, i) => i !== userIndex && u.username.toLowerCase() === username.toLowerCase()
            );
            if (usernameTaken) {
                alert("❌ Username already taken!");
                return;
            }

            const emailTaken = users.some(
                (u, i) => i !== userIndex && u.email.toLowerCase() === email.toLowerCase()
            );
            if (emailTaken) {
                alert("❌ Email already registered!");
                return;
            }

            users[userIndex] = finalUser;

            setUsers(users);
            migrateUsernameReferences(oldUsername, finalUser.username);
            if (storage) {
                storage.setCurrentUser(finalUser);
            } else {
                localStorage.setItem("currentUser", JSON.stringify(finalUser));
            }
            localStorage.removeItem("editingAccount");

            alert("✅ Account updated successfully!");
            window.location.href = "account.html";
        } else {
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

            users.push(finalUser);
            setUsers(users);
            if (storage) {
                storage.setCurrentUser(finalUser);
            } else {
                localStorage.setItem("currentUser", JSON.stringify(finalUser));
            }

            alert("✅ Account created successfully! Welcome " + firstName + "!");
            window.location.href = "../index.html";
        }
    });

});
