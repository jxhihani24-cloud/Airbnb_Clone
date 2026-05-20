let allProperties = [];

document.addEventListener("DOMContentLoaded", async () => {
    const hostId = getHostIdFromURL();

    if (!hostId) {
        document.querySelector(".container").innerHTML =
            "<p style='text-align:center; font-size:18px;'>Host not found.</p>";
        return;
    }

    try {
        allProperties = await apiRequest("/Properties/all");

        displayHostProfile(hostId);

    } catch (error) {
        alert("❌ " + error.message);
    }
});

function getHostIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("host");
}

function displayHostProfile(hostId) {
    const hostProperties = allProperties.filter(
        p => String(p.ownerId) === String(hostId) || String(p.ownerName) === String(hostId)
    );

    if (hostProperties.length === 0) {
        document.querySelector(".container").innerHTML =
            "<p style='text-align:center; font-size:18px;'>Host not found or has no properties.</p>";
        return;
    }

    const hostInfo = hostProperties[0];

    document.getElementById("hostName").textContent =
        hostInfo.ownerName || "Host";

    document.getElementById("totalProperties").textContent =
        hostProperties.length;

    const initials = getInitials(hostInfo.ownerName || "Host");

    document.getElementById("hostAvatar").textContent = initials;

    document.getElementById("totalReviews").textContent = "0";
    document.getElementById("avgRating").textContent = "0";

    document.getElementById("hostDescription").textContent =
        "Professional host dedicated to providing excellent guest experiences.";

    displayHostProperties(hostProperties);
}

function displayHostProperties(properties) {
    const container = document.getElementById("hostProperties");

    container.innerHTML = "";

    properties.forEach(property => {
        const img = property.images && property.images.length
            ? property.images[0]
            : "https://picsum.photos/400/300?random=99";

        const card = document.createElement("div");

        card.className = "card";

        card.innerHTML = `
            <img src="${img}" alt="${property.title}">

            <div class="card-info">
                <h4>${property.title}</h4>
                <p><strong>Location:</strong> ${property.city}</p>
                <p><strong>Price:</strong> €${property.price} / night</p>

                <div class="card-buttons">
                    <button class="view-details-btn" style="background-color: #666;">View Details</button>
                    <button class="book-btn" style="background-color:var(--button-color)">📅 Book Now</button>
                </div>
            </div>
        `;

        card.querySelector(".view-details-btn").addEventListener("click", (e) => {
            e.stopPropagation();
            window.location.href = `listings.html?id=${property.id}`;
        });

        card.querySelector(".book-btn").addEventListener("click", (e) => {
            e.stopPropagation();
            window.location.href = `listings.html?id=${property.id}`;
        });

        container.appendChild(card);
    });
}

function getInitials(name) {
    return String(name || "H")
        .split(" ")
        .map(n => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);
}