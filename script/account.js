document.addEventListener("DOMContentLoaded", () => {
    const storage = window.AppStorage;
    const container = document.getElementById("accountDetails");
    const deleteBtn = document.getElementById("deleteAccountBtn");

    const sessionUser = storage
        ? storage.getCurrentUser()
        : JSON.parse(localStorage.getItem("currentUser") || "null");

    if (!sessionUser) {
        alert("Please log in first.");
        window.location.href = "login.html";
        return;
    }

    const users = storage ? storage.getLS("users", []) : JSON.parse(localStorage.getItem("users") || "[]");
    const user = users.find(u => u.username === sessionUser.username) || sessionUser;

    if (!container) return;

    container.innerHTML = `
        <div class="col-12 col-sm-6">
            <div class="account-row h-100">
                <strong>First Name:</strong>
                <div>${user.firstName || "-"}</div>
            </div>
        </div>

        <div class="col-12 col-sm-6">
            <div class="account-row h-100">
                <strong>Last Name:</strong>
                <div>${user.lastName || "-"}</div>
            </div>
        </div>

        <div class="col-12 col-sm-6">
            <div class="account-row h-100">
                <strong>Username:</strong>
                <div>${user.username || "-"}</div>
            </div>
        </div>

        <div class="col-12 col-sm-6">
            <div class="account-row h-100">
                <strong>Email:</strong>
                <div>${user.email || "-"}</div>
            </div>
        </div>

        <div class="col-12 col-sm-6">
            <div class="account-row h-100">
                <strong>Gender:</strong>
                <div>${user.gender || "-"}</div>
            </div>
        </div>

        <div class="col-12 col-sm-6">
            <div class="account-row h-100">
                <strong>Date of Birth:</strong>
                <div>${user.dateOfBirth || "-"}</div>
            </div>
        </div>

        <div class="col-12 col-sm-6">
            <div class="account-row h-100">
                <strong>Country:</strong>
                <div>${user.country || "-"}</div>
            </div>
        </div>

        <div class="col-12 col-sm-6">
            <div class="account-row h-100">
                <strong>Phone Number:</strong>
                <div>${user.phoneNumber || "-"}</div>
            </div>
        </div>

        <div class="col-12">
            <div class="d-grid mt-2">
                <button id="editAccountBtn" class="btn delete-account-btn" style="background:#1b1ee2;">
                    Edit
                </button>
            </div>
        </div>
    `;

    const editAccountBtn = document.getElementById("editAccountBtn");
    if (editAccountBtn) {
        editAccountBtn.addEventListener("click", () => {
            localStorage.setItem("editingAccount", "true");
            window.location.href = "signup.html";
        });
    }

    if (deleteBtn) {
        deleteBtn.addEventListener("click", async () => {
            const confirmDelete = confirm("⚠️ WARNING: This will permanently delete your account.\n\nClick OK to enter password verification.");
            if (!confirmDelete) return;

            const password = prompt("Enter your password to confirm account deletion:");
            if (!password) return;

            // Verify password first
            const storage = window.AppStorage;
            const users = storage ? storage.getLS("users", []) : JSON.parse(localStorage.getItem("users") || "[]");
            let passwordOk = false;
            if (storage && typeof storage.verifyPassword === "function") {
                passwordOk = await storage.verifyPassword(user, password);
            } else {
                passwordOk = user && typeof user.password === "string" && user.password === password;
            }

            if (!passwordOk) {
                alert("❌ Incorrect password. Account deletion cancelled.");
                return;
            }

            const finalConfirm = confirm("⚠️ LAST CHANCE! Your account and all data will be gone forever. Are you absolutely sure?");
            if (!finalConfirm) return;

            const updatedUsers = (storage ? storage.getLS("users", []) : users).filter(u => u.username !== user.username);

            if (storage) {
                storage.setLS("users", updatedUsers);
                storage.removeUserRelatedData(user.username);
                storage.setCurrentUser(null);
            } else {
                localStorage.setItem("users", JSON.stringify(updatedUsers));
                localStorage.removeItem("currentUser");
            }

            localStorage.removeItem("editingAccount");
            alert("✅ Your account has been permanently deleted.");
            window.location.href = "login.html";
        });
    }
});
