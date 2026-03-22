// GLOBAL DATA (accessible from other files)
window.listings = [
  { id: 1, title: "Modern Apartment", city: "Tirana", price: 45, img: "../images/Logo.png" },
  { id: 2, title: "Beach House", city: "Durres", price: 80, img: "../images/Logo.png" },
  { id: 3, title: "Cozy Studio", city: "Vlora", price: 35, img: "../images/Logo.png" }
];

// RENDER FUNCTION (can render ALL or FILTERED)
window.renderListings = function (data) {
    const container = document.querySelector(".listings-grid");
    if (!container) return;

    container.innerHTML = "";

    if (data.length === 0) {
        container.innerHTML = "<p>No listings found.</p>";
        return;
    }

    data.forEach(listing => {
        container.innerHTML += `
        <div class="card">
            <img src="${listing.img}" alt="property">
            <div class="card-info">
                <h4>${listing.title}</h4>
                <p>${listing.city}</p>
                <p>€${listing.price} / night</p>
                <button onclick="removeListing(${listing.id})">Remove</button>
            </div>
        </div>
        `;
    });
};

// ADD LISTING
window.addListing = function () {
    const newListing = {
        id: Date.now(),
        title: "New Place",
        city: "Saranda",
        price: 60,
        img: "../images/house1.jpg"
    };

    window.listings.push(newListing);
    window.renderListings(window.listings);
};

// REMOVE LISTING
window.removeListing = function (id) {
    window.listings = window.listings.filter(item => item.id !== id);
    window.renderListings(window.listings);
};

// INITIAL LOAD
document.addEventListener("DOMContentLoaded", () => {
    window.renderListings(window.listings);
});
