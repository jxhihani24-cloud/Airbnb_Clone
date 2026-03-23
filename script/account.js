document.addEventListener("DOMContentLoaded", () => {

const userData = localStorage.getItem("currentUser");

if (!userData) {
    alert("Please log in first.");
    window.location.href = "login.html";
    return;
}

const user = JSON.parse(userData);

const container = document.getElementById("accountDetails");

container.innerHTML = `
    <div class="account-row"><strong>First Name:</strong> ${user.firstName}</div>
    <div class="account-row"><strong>Last Name:</strong> ${user.lastName}</div>
    <div class="account-row"><strong>Username:</strong> ${user.username}</div>
    <div class="account-row"><strong>Email:</strong> ${user.email}</div>
`;

});

// Delete account
document.getElementById("deleteAccountBtn").addEventListener("click", () => {

    const confirmDelete = confirm("Are you sure you want to delete your account?");
    if (!confirmDelete) return;

    const user = JSON.parse(localStorage.getItem("currentUser"));

    let users = JSON.parse(localStorage.getItem("users")) || [];
    let properties = JSON.parse(localStorage.getItem("properties")) || [];

    // remove user
    users = users.filter(u => u.username !== user.username);

    // remove user's properties
    properties = properties.filter(p => p.owner !== user.username);

    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("properties", JSON.stringify(properties));

    // logout user
    localStorage.removeItem("currentUser");

    alert("Your account has been deleted.");

    // redirect to login page
    window.location.href = "login.html";

});

