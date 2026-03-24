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

    if (container) {
        container.innerHTML = `
            <div class="account-row"><strong>First Name:</strong> ${user.firstName}</div>
            <div class="account-row"><strong>Last Name:</strong> ${user.lastName}</div>
            <div class="account-row"><strong>Username:</strong> ${user.username}</div>
            <div class="account-row"><strong>Email:</strong> ${user.email}</div>
        `;
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

            alert("Your account has been deleted.");
            window.location.href = "login.html";
        });
    }
});