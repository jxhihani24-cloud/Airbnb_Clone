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
            localStorage.removeItem("editingAccount");

            alert("Your account has been deleted.");
            window.location.href = "login.html";
        });
    }
});