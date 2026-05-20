const API_BASE = "http://localhost:5290/api";

async function apiRequest(endpoint, method = "GET", body = null) {
    const token = localStorage.getItem("token");

    const options = {
        method,
        headers: {
            "Content-Type": "application/json"
        }
    };

    if (token) {
        options.headers["Authorization"] = `Bearer ${token}`;
    }

    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE}${endpoint}`, options);

    const raw = await response.text();

    let data = null;

    try {
        data = raw ? JSON.parse(raw) : null;
    } catch {
        data = raw;
    }

    if (!response.ok) {
        console.error("API ERROR:", {
            endpoint,
            status: response.status,
            data
        });

        if (data?.errors) {
            const messages = Object.entries(data.errors)
                .map(([field, errors]) => `${field}: ${errors.join(", ")}`)
                .join("\n");

            throw new Error(messages);
        }

        if (typeof data === "string") {
            throw new Error(data || `Server error ${response.status}`);
        }

        throw new Error(data?.message || `Server error ${response.status}`);
    }

    return data;
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem("currentUser") || "null");
}

function getToken() {
    return localStorage.getItem("token");
}

function logoutUser() {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("token");
    window.location.href = "login.html";
}

function requireLogin() {
    const user = getCurrentUser();
    const token = getToken();

    if (!user || !user.id || !token) {
        alert("Please log in first.");
        window.location.href = "login.html";
        return null;
    }

    return user;
}

async function uploadImage(file) {
    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE}/Uploads/image`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`
        },
        body: formData
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Image upload failed");
    }

    return data.imageUrl;
}