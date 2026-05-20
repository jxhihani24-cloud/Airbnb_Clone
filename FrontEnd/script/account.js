document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("accountDetails");
    const deleteBtn = document.getElementById("deleteAccountBtn");

    const user = requireLogin();

    if (!user) {
        return;
    }

    if (!container) {
        return;
    }

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
            window.location.href = "signup.html?editAccount=true";
        });
    }

    if (deleteBtn) {
        deleteBtn.addEventListener("click", async () => {
            const confirmed = confirm(
                "Are you sure you want to permanently delete your account?"
            );

            if (!confirmed) {
                return;
            }

            const finalConfirm = confirm(
                "Last confirmation: this will delete your account and related data."
            );

            if (!finalConfirm) {
                return;
            }

            try {
                const result = await apiRequest(`/Auth/delete/${user.id}`, "DELETE");

                alert(result.message);

                localStorage.removeItem("currentUser");
                localStorage.removeItem("token");

                window.location.href = "login.html";

            } catch (error) {
                alert("❌ " + error.message);
            }
        });
    }
});