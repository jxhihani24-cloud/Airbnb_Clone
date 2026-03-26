// ===== READ PARAMETERS FROM URL =====
function getParamsFromURL() {
    const params = new URLSearchParams(window.location.search);
    return {
        city: params.get("city") || "",
        country: params.get("country") || ""
    };
}

// ===== INITIAL LOAD WITH FILTERS =====
document.addEventListener("DOMContentLoaded", () => {
    const params = getParamsFromURL();
    if (params.city) {
        document.getElementById("searchCity").value = params.city;
    }
    if (params.country) {
        document.getElementById("countryFilter").value = params.country;
    }
    applyFilters();
});


// ===== SAMPLE PROPERTIES =====
const properties = [
    { id: 1, title: "Cozy Apartment in Paris", city: "Paris", country: "france", owner: "alice", ownerName: "Alice", price: 120, images: ["https://picsum.photos/400/300?random=1"] },
    { id: 2, title: "Modern Loft in New York", city: "New York", country: "usa", owner: "bob", ownerName: "Bob", price: 150, images: ["https://picsum.photos/400/300?random=2"] },
    { id: 3, title: "Traditional House in Tokyo", city: "Tokyo", country: "japan", owner: "carol", ownerName: "Carol", price: 100, images: ["https://picsum.photos/400/300?random=3"] },
    { id: 4, title: "Beach House in Bali", city: "Bali", country: "indonesia", owner: "dave", ownerName: "Dave", price: 180, images: ["https://picsum.photos/400/300?random=4"] },
    { id: 5, title: "Mountain Cabin in Switzerland", city: "Zermatt", country: "switzerland", owner: "eve", ownerName: "Eve", price: 220, images: ["https://picsum.photos/400/300?random=5"] },
    { id: 6, title: "Luxury Apartment in Paris", city: "Paris", country: "france", owner: "frank", ownerName: "Frank", price: 200, images: ["https://picsum.photos/400/300?random=6"] },
    { id: 7, title: "Penthouse in New York", city: "New York", country: "usa", owner: "grace", ownerName: "Grace", price: 300, images: ["https://picsum.photos/400/300?random=7"] },
    { id: 8, title: "Ryokan in Kyoto", city: "Kyoto", country: "japan", owner: "haru", ownerName: "Haru", price: 130, images: ["https://picsum.photos/400/300?random=8"] },
    { id: 9, title: "Villa in Ubud", city: "Ubud", country: "indonesia", owner: "ivan", ownerName: "Ivan", price: 210, images: ["https://picsum.photos/400/300?random=9"] },
    { id: 10, title: "Chalet in Geneva", city: "Geneva", country: "switzerland", owner: "julia", ownerName: "Julia", price: 250, images: ["https://picsum.photos/400/300?random=10"] }
];

// ===== DISPLAY LISTINGS =====
function displayListings(list) {
    const container = document.querySelector(".listings-grid");
    container.innerHTML = "";

    if (!list || list.length === 0) {
        container.innerHTML = "<p style='text-align:center; font-size:18px;'>No properties found.</p>";
        return;
    }

    list.forEach(property => {
        const img = property.images && property.images.length ? property.images[0] : "https://picsum.photos/400/300?random=99";

        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <img src="${img}" alt="${property.title}">
            <div class="card-info">
                <h4>${property.title}</h4>
                <p><strong>Location:</strong> ${property.city}</p>
                <p><strong>Price:</strong> €${property.price} / night</p>
                <p style="font-size:12px; color:var(--text-color);"><b>By:</b> ${property.ownerName}</p>
                <button class="book-btn" style="background-color:var(--button-color)">📅 Book Now</button>
            </div>
        `;

        // Book button
        card.querySelector(".book-btn").addEventListener("click", () => {
            alert(`Booking request sent for "${property.title}" in ${property.city}!\nContact: ${property.ownerName}`);
        });

        container.appendChild(card);
    });
}

// ===== INITIAL DISPLAY =====
document.addEventListener("DOMContentLoaded", () => {
    displayListings(properties);
});

// ===== FILTER FUNCTIONALITY =====
function applyFilters() {
    const city = document.getElementById("searchCity").value.toLowerCase();
    const maxPrice = parseFloat(document.getElementById("maxPrice").value);
    const country = document.getElementById("countryFilter").value;

    const filtered = properties.filter(prop => {
        const matchesCity = city ? prop.city.toLowerCase().includes(city) : true;
        const matchesPrice = maxPrice ? prop.price <= maxPrice : true;
        const matchesCountry = country ? prop.country === country : true;
        return matchesCity && matchesPrice && matchesCountry;
    });

    displayListings(filtered);
}

document.getElementById("applyFilters").addEventListener("click", applyFilters);