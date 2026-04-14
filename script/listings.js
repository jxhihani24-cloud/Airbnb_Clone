// ===== READ PARAMETERS FROM URL =====
function getParamsFromURL() {
    const params = new URLSearchParams(window.location.search);
    return {
        city: params.get("city") || "",
        country: params.get("country") || "",
        guests: params.get("guests") || "",
        checkIn: params.get("checkIn") || "",
        checkOut: params.get("checkOut") || "",
        id: params.get("id") || null
    };
}

// ===== CURRENT PROPERTY FOR BOOKING =====
let currentProperty = null;
let selectedCheckInDate = "";
let selectedCheckOutDate = "";

// ===== REVIEWS MANAGEMENT =====
function getReviewsByProperty(propertyId) {
    const storage = window.AppStorage;
    const reviews = storage
        ? storage.getLS("reviews", [])
        : JSON.parse(localStorage.getItem("reviews") || "[]");
    return reviews.filter(r => r.propertyId === propertyId);
}

function getAverageRating(propertyId) {
    const reviews = getReviewsByProperty(propertyId);
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / reviews.length).toFixed(1);
}

function hasUserStayed(propertyId) {
    const storage = window.AppStorage;
    const user = storage
        ? storage.getCurrentUser()
        : JSON.parse(localStorage.getItem("currentUser") || "null");
    if (!user) return false;

    const bookings = storage
        ? storage.getLS("bookings", [])
        : JSON.parse(localStorage.getItem("bookings") || "[]");

    return bookings.some(b => {
        if (b.userId !== user.username || b.propertyId !== propertyId) return false;
        const checkOut = new Date(storage ? storage.toISODate(b.checkOutDate) : b.checkOutDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return checkOut < today; // only "Stayed" bookings
    });
}

function addReview(propertyId, rating, reviewText) {
    const storage = window.AppStorage;
    const user = storage
        ? storage.getCurrentUser()
        : JSON.parse(localStorage.getItem("currentUser") || "null");
    if (!user) {
        alert("Please log in to leave a review");
        return false;
    }

    const reviews = storage
        ? storage.getLS("reviews", [])
        : JSON.parse(localStorage.getItem("reviews") || "[]");

    const newReview = {
        id: Date.now(),
        propertyId: propertyId,
        rating: rating,
        text: reviewText,
        reviewer: user.firstName + " " + user.lastName,
        reviewerUsername: user.username,
        date: new Date().toISOString(),
        createdAt: new Date().toISOString()
    };

    reviews.push(newReview);
    if (storage) storage.setLS("reviews", reviews);
    else localStorage.setItem("reviews", JSON.stringify(reviews));
    return true;
}

function displayReviews(propertyId) {
    const reviews = getReviewsByProperty(propertyId);
    const reviewsList = document.getElementById("reviewsList");
    reviewsList.innerHTML = "";

    if (reviews.length === 0) {
        reviewsList.innerHTML = "<p style='opacity: 0.7; text-align: center;'>No reviews yet. Be the first to review!</p>";
        return;
    }

    reviews.forEach(review => {
        const stars = "★".repeat(review.rating) + "☆".repeat(5 - review.rating);
        const reviewEl = document.createElement("div");
        reviewEl.style.cssText = "background: rgba(255,255,255,0.05); padding: 14px; border-radius: 10px; border: 1px solid var(--border-color);";
        reviewEl.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                <div>
                    <p style="margin: 0; font-weight: 600;">${review.reviewer}</p>
                    <span style="font-size: 12px; opacity: 0.7;">${window.AppStorage ? window.AppStorage.toDisplayDate(review.date) : review.date}</span>
                </div>
                <span style="color: var(--button-color); font-size: 14px;">${stars}</span>
            </div>
            <p style="margin: 8px 0 0 0; font-size: 14px; line-height: 1.5;">${review.text}</p>
        `;
        reviewsList.appendChild(reviewEl);
    });
}

// ===== INITIAL LOAD WITH FILTERS =====
document.addEventListener("DOMContentLoaded", () => {
    // Reload properties to include any user-added listings
    properties = loadAllProperties();

    const params = getParamsFromURL();
    selectedCheckInDate = params.checkIn || "";
    selectedCheckOutDate = params.checkOut || "";

    // IF ID EXISTS → show only that property
    if (params.id) {
        const selected = properties.find(p => p.id == params.id);

        if (selected) {
            displayListings([selected]);   // show only 1
            openListingModal(selected);    // open details automatically
        }
    } else {
        // normal behavior (filters)
        if (params.city) {
            document.getElementById("searchCity").value = params.city;
        }
        if (params.country) {
            document.getElementById("countryFilter").value = params.country;
        }
        if (params.guests) {
    document.getElementById("guestsInput").value = params.guests;
}

        applyFilters();
    }

    setupBookingFormListeners();
});


// ===== SAMPLE PROPERTIES =====
const defaultProperties = [
    { id: 1, title: "Cozy Apartment in Paris", guests: 2, city: "Paris", country: "france", owner: "alice", ownerName: "Alice Dubois", price: 120, images: ["../images/cozyparis1.png", "../images/cozyparis2.png", "../images/cozyparis3.png", "../images/cozyparis4.png"] },
    { id: 2, title: "Modern Loft in New York", guests: 3, city: "New York", country: "usa", owner: "bob", ownerName: "Bob Carter", price: 150, images: ["../images/newyork1.png", "../images/newyork2.png", "../images/newyork3.png"] },
    { id: 3, title: "Traditional House in Tokyo", guests: 3, city: "Tokyo", country: "japan", owner: "carol", ownerName: "Carol Tanaka", price: 100, images: ["../images/tokyo1.png", "../images/tokyo2.png", "../images/tokyo3.png", "../images/tokyo4.png", "../images/tokyo5.png"] },
    { id: 4, title: "Beach House in Bali", guests: 6, city: "Bali", country: "indonesia", owner: "dave", ownerName: "Dave Santoso", price: 180, images: ["../images/bali.png", "../images/bali1.png","../images/bali2.png","../images/bali3.png","../images/bali4.png"] },
    { id: 5, title: "Mountain Cabin in Switzerland", guests: 5, city: "Zermatt", country: "switzerland", owner: "eve", ownerName: "Eve Meier", price: 120, images: ["../images/swiz1.png", "../images/swiz2.png","../images/swiz3.png","../images/swiz4.png"] },
    { id: 6, title: "Luxury Apartment in Paris", guests: 4, city: "Paris", country: "france", owner: "frank", ownerName: "Frank Dupont", price: 200, images: ["../images/paris1.png", "../images/paris2.png","../images/paris3.png","../images/paris4.png","../images/paris5.png"] },
    { id: 7, title: "Ryokan in Kyoto", guests: 1, city: "Kyoto", country: "japan", owner: "haru", ownerName: "Haru Sato", price: 130, images: ["../images/ryokan.png", "../images/ryokan1.png","../images/ryokan3.png"] },
    { id: 8, title: "Villa in Ubud", guests: 6, city: "Ubud", country: "indonesia", owner: "ivan", ownerName: "Ivan Wijaya", price: 210, images: ["../images/ubud.png", "../images/ubud1.png","../images/ubud2.png","../images/ubud3.png","../images/ubud4.png"] },
    { id: 9, title: "Apartment in Geneva", guests: 3, city: "Geneva", country: "switzerland", owner: "julia", ownerName: "Julia Keller", price: 250, images: ["../images/geneva1.png", "../images/geneva2.png"] },

    // POPULAR STAYS 
    { id: 10, title: "Beach House", guests: 6, city: "Bali", country: "indonesia", owner: "kadek", ownerName: "Kadek Putra", price: 120, images: ["../images/balib1.png", "../images/balib2.png", "../images/balib3.png"] },
    { id: 11, title: "City Apartment", guests: 3, city: "New York", country: "usa", owner: "michael", ownerName: "Michael Johnson", price: 150, images: ["../images/cnewyork1.png", "../images/newyork3.png","../images/newyork3.png"] },
   
    { id: 12, title: "Skyscraper Studio Apartment", guests: 2, city: "Dubai", country: "uae", owner: "david", ownerName: "David Smith", price: 145, images: ["../images/dubai.png","../images/dubai1.png","../images/dubai2.png"] },

    // GLOBAL LISTINGS 
    { id: 13, title: "Eiffel Tower View Studio", guests: 2, city: "Paris", country: "france", owner: "marie", ownerName: "Marie Dubois", price: 140, images: ["../images/eiffel1.png","../images/eiffel2.png","../images/eiffel3.png"] },

    { id: 14, title: "Modern Seoul Apartment", guests: 3, city: "Seoul", country: "korea", owner: "yuki", ownerName: "Yuki Tanaka", price: 110, images: ["../images/seoul.png", "../images/seoul1.png","../images/seoul2.png"] },
    { id: 15, title: "Jungle Villa with Pool", guests: 6, city: "Ubud", country: "indonesia", owner: "made", ownerName: "Made Santoso", price: 200, images: ["https://images.unsplash.com/photo-1505691938895-1758d7feb511", "https://images.unsplash.com/photo-1505691938895-1758d7feb511"] },
    { id: 16, title: "Central London Flat", guests: 4, city: "London", country: "uk", owner: "emma", ownerName: "Emma Wilson", price: 190, images: ["https://images.unsplash.com/photo-1493809842364-78817add7ffb", "https://images.unsplash.com/photo-1493809842364-78817add7ffb"] },
    { id: 17, title: "Colosseum View Apartment", guests: 4, city: "Rome", country: "italy", owner: "marco", ownerName: "Marco Rossi", price: 160, images: ["https://images.unsplash.com/photo-1494526585095-c41746248156", "https://images.unsplash.com/photo-1494526585095-c41746248156"] },
    { id: 18, title: "Barcelona Beach Apartment", guests: 4, city: "Barcelona", country: "spain", owner: "sofia", ownerName: "Sofía Martinez", price: 150, images: ["https://images.unsplash.com/photo-1505693416388-ac5ce068fe85", "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85"] },
    { id: 19, title: "Sydney Ocean View House", guests: 6, city: "Sydney", country: "australia", owner: "liam", ownerName: "Liam Brown", price: 230, images: ["https://images.unsplash.com/photo-1479839672679-a46483c0e7c8", "https://images.unsplash.com/photo-1479839672679-a46483c0e7c8"] },
    { id: 20, title: "Forest Cabin Vancouver", guests: 5, city: "Vancouver", country: "canada", owner: "noah", ownerName: "Noah Smith", price: 170, images: ["https://images.unsplash.com/photo-1445019980597-93fa8acb246c", "https://images.unsplash.com/photo-1445019980597-93fa8acb246c"] },
    { id: 21, title: "Rio Beachfront Apartment", guests: 4, city: "Rio de Janeiro", country: "brazil", owner: "ana", ownerName: "Ana Silva", price: 140, images: ["https://images.unsplash.com/photo-1505692794403-34d4982c85d0", "https://images.unsplash.com/photo-1505692794403-34d4982c85d0"] },
    { id: 22, title: "Phuket Tropical Villa", guests: 5, city: "Phuket", country: "thailand", owner: "chai", ownerName: "Chai Wong", price: 130, images: ["https://images.unsplash.com/photo-1505691938895-1758d7feb511", "https://images.unsplash.com/photo-1505691938895-1758d7feb511"] },
    { id: 23, title: "Dubai Marina Luxury Apartment", guests: 5, city: "Dubai", country: "uae", owner: "ahmed", ownerName: "Ahmed Al-Farsi", price: 260, images: ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750", "https://images.unsplash.com/photo-1512917774080-9991f1c4c750"] },
    { id: 24, title: "Santorini Sea View House", guests: 4, city: "Santorini", country: "greece", owner: "nikos", ownerName: "Nikos Papadopoulos", price: 210, images: ["https://images.unsplash.com/photo-1505691938895-1758d7feb511", "https://images.unsplash.com/photo-1505691938895-1758d7feb511"] },
    { id: 25, title: "Marrakech Traditional Riad", guests: 4, city: "Marrakech", country: "morocco", owner: "youssef", ownerName: "Youssef Benali", price: 120, images: ["https://images.unsplash.com/photo-1505691938895-1758d7feb511", "https://images.unsplash.com/photo-1505691938895-1758d7feb511"] }
];

// ===== LOAD ALL PROPERTIES (DEFAULT + USER-ADDED) =====
function loadAllProperties() {
    // Get user-added properties from localStorage
    const storage = window.AppStorage;
    const userProperties = storage
        ? storage.getLS("properties", [])
        : JSON.parse(localStorage.getItem("properties") || "[]");

    // Merge default properties with user-added properties
    const allProperties = [...defaultProperties, ...userProperties];

    return allProperties;
}

let properties = loadAllProperties();


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

        // Get rating for this property
        const avgRating = getAverageRating(property.id);
        const reviews = getReviewsByProperty(property.id);
        const stars = "★".repeat(Math.round(avgRating)) + "☆".repeat(5 - Math.round(avgRating));

        card.innerHTML = `
            <img src="${img}" alt="${property.title}">
            <div class="card-info">
                <h4>${property.title}</h4>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                    <p><strong>Location:</strong> ${property.city}, ${property.country.charAt(0).toUpperCase() + property.country.slice(1)}</p>
                    <span style="font-size: 12px; color: var(--button-color);">${stars}</span>
                </div>
                <p style="font-size: 12px; opacity: 0.7;">⭐ ${avgRating} (${reviews.length})</p>
                <p><strong>Price:</strong> €${property.price} / night</p>
                <p><strong>Capacity:</strong> ${property.guests || 0} guest(s)</p>
                <p style="font-size:12px; color:var(--text-color);"><b>By:</b> ${property.ownerName}</p>
                <div class="card-buttons">
                    <button class="view-details-btn" style="background-color: #666;">View Details</button>
                    <button class="book-btn" style="background-color:var(--button-color)">📅 Book Now</button>
                </div>
            </div>
        `;

        // View details button
        card.querySelector(".view-details-btn").addEventListener("click", (e) => {
            e.stopPropagation();
            openListingModal(property);
        });

        // Book button on card
        card.querySelector(".book-btn").addEventListener("click", (e) => {
            e.stopPropagation();
            openBookingForm(property);
        });

        container.appendChild(card);
    });
}

// ===== OPEN LISTING MODAL =====
// ===== CURRENT IMAGE INDEX FOR CAROUSEL =====
let currentImageIndex = 0;
let currentPropertyImages = [];

function openListingModal(property) {
    const modal = document.getElementById("listingModal");
    const country = property.country.charAt(0).toUpperCase() + property.country.slice(1);

    document.getElementById("modalTitle").textContent = property.title;
    document.getElementById("modalDesc").textContent = `Beautiful ${property.country} property in ${property.city}. Perfect for your next stay!`;
    document.getElementById("modalLocation").textContent = property.city;
    document.getElementById("modalCountry").textContent = country;
    document.getElementById("modalPrice").textContent = `€${property.price} / night`;

    // Make owner name clickable
    const ownerElement = document.getElementById("modalOwner");
    ownerElement.innerHTML = `<a href="host-profile.html?host=${property.owner}" style="color: var(--button-color); text-decoration: none; cursor: pointer; font-weight: 600; transition: opacity 0.2s;">${property.ownerName}</a>`;

    // Make the link hover effect
    const ownerLink = ownerElement.querySelector('a');
    ownerLink.addEventListener('mouseenter', function () {
        this.style.opacity = '0.8';
    });
    ownerLink.addEventListener('mouseleave', function () {
        this.style.opacity = '1';
    });

    // Setup image carousel
    currentPropertyImages = property.images || ["https://picsum.photos/400/300?random=99"];
    currentImageIndex = 0;

    // Display first image
    document.getElementById("modalImage").src = currentPropertyImages[0];
    updateImageCounter();

    // Create thumbnail gallery
    const thumbnailGallery = document.getElementById("thumbnailGallery");
    thumbnailGallery.innerHTML = "";

    currentPropertyImages.forEach((img, index) => {
        const li = document.createElement("li");
        li.className = "thumbnail";
        if (index === 0) li.classList.add("active");

        li.innerHTML = `<img src="${img}" alt="Image ${index + 1}">`;
        li.addEventListener("click", () => {
            currentImageIndex = index;
            displayMainImage();
            updateThumbnailActive();
            updateImageCounter();
        });

        thumbnailGallery.appendChild(li);
    });

    document.getElementById("modalBookBtn").onclick = () => {
        openBookingForm(property);
    };

    // Display reviews and rating
    const avgRating = getAverageRating(property.id);
    const reviews = getReviewsByProperty(property.id);
    const stars = "★".repeat(Math.round(avgRating)) + "☆".repeat(5 - Math.round(avgRating));

    document.getElementById("avgRating").textContent = avgRating;
    document.getElementById("ratingStars").textContent = stars;
    document.getElementById("reviewCount").textContent = `(${reviews.length} reviews)`;

    displayReviews(property.id);

    // Setup review button
    document.getElementById("addReviewBtn").onclick = () => {
    const sessionUser = window.AppStorage
        ? window.AppStorage.getCurrentUser()
        : JSON.parse(localStorage.getItem("currentUser") || "null");
    if (!sessionUser) {
        alert("Please log in to leave a review.");
        return;
    }
    if (!hasUserStayed(property.id)) {
        alert("❌ You can only leave a review after staying at this property.");
        return;
    }
    openReviewModal(property.id);
};

    modal.classList.add("show");
}

// ===== DISPLAY MAIN IMAGE =====
function displayMainImage() {
    document.getElementById("modalImage").src = currentPropertyImages[currentImageIndex];
}

// ===== UPDATE THUMBNAIL ACTIVE STATE =====
function updateThumbnailActive() {
    document.querySelectorAll(".thumbnail").forEach((thumb, index) => {
        thumb.classList.toggle("active", index === currentImageIndex);
    });
}

// ===== UPDATE IMAGE COUNTER =====
function updateImageCounter() {
    document.getElementById("imageCounter").textContent = `${currentImageIndex + 1}/${currentPropertyImages.length}`;
}

// ===== CLOSE LISTING MODAL =====
function closeListingModal() {
    const modal = document.getElementById("listingModal");
    modal.classList.remove("show");
}

// ===== MODAL CLOSE BUTTON =====
document.addEventListener("DOMContentLoaded", () => {
    document.querySelector(".modal-close-btn").addEventListener("click", closeListingModal);

    const modal = document.getElementById("listingModal");
    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            closeListingModal();
        }
    });
});

// ===== FILTER FUNCTIONALITY =====
function applyFilters() {
    const destination = document.getElementById("searchCity").value.toLowerCase().trim();
    const maxPrice = parseFloat(document.getElementById("maxPrice").value);
    const country = document.getElementById("countryFilter").value.toLowerCase();
    const guests = parseInt(document.getElementById("guestsInput").value);

    const filtered = properties.filter(prop => {
        const matchesDestination = destination
            ? prop.city.toLowerCase().includes(destination) ||
              prop.country.toLowerCase().includes(destination)
            : true;

        const matchesPrice = maxPrice ? prop.price <= maxPrice : true;

        const matchesCountry = country
            ? prop.country.toLowerCase() === country
            : true;

        const matchesGuests = guests
            ? prop.guests >= guests
            : true;

        return matchesDestination && matchesPrice && matchesCountry && matchesGuests;
    });

    if (guests) {
        filtered.sort((a, b) => a.guests - b.guests);
    }

    displayListings(filtered);
}

document.getElementById("applyFilters").addEventListener("click", applyFilters);

// ===== AUTO-APPLY FILTERS WHEN INPUTS CHANGE =====
document.getElementById("searchCity").addEventListener("keyup", applyFilters);
document.getElementById("maxPrice").addEventListener("change", applyFilters);
document.getElementById("countryFilter").addEventListener("change", applyFilters);
document.getElementById("guestsInput").addEventListener("input", applyFilters);

// ===== CHECK AVAILABILITY FOR DATES =====
function checkAvailability(propertyId, checkInDate, checkOutDate) {
    const storage = window.AppStorage;
    const bookings = storage
        ? storage.getLS("bookings", [])
        : JSON.parse(localStorage.getItem("bookings") || "[]");
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    return !bookings.some(booking => {
        if (booking.propertyId !== propertyId) return false;
        const bookingCheckIn = new Date(storage ? storage.toISODate(booking.checkInDate) : booking.checkInDate);
        const bookingCheckOut = new Date(storage ? storage.toISODate(booking.checkOutDate) : booking.checkOutDate);

        // Check for overlap
        return checkIn < bookingCheckOut && checkOut > bookingCheckIn;
    });
}

// ===== SETUP BOOKING FORM LISTENERS =====
function setupBookingFormListeners() {
    const checkInInput = document.getElementById("checkInInput");
    const checkOutInput = document.getElementById("checkOutInput");
    

    // Set minimum date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split('T')[0];
    checkInInput.min = minDate;

    checkInInput.addEventListener("change", () => {
        if (checkInInput.value) {
            const checkIn = new Date(checkInInput.value);
            checkIn.setDate(checkIn.getDate() + 1);
            checkOutInput.min = checkIn.toISOString().split('T')[0];
        }
        calculatePropertiesAndAvailability();
    });

    checkOutInput.addEventListener("change", calculatePropertiesAndAvailability);
    

    // Close button
    document.querySelector(".booking-form-close").addEventListener("click", closeBookingForm);

    // Confirm booking button
    document.getElementById("confirmBookBtn").addEventListener("click", confirmBooking);

    // Close when clicking outside
    document.getElementById("bookingFormModal").addEventListener("click", (e) => {
        if (e.target.id === "bookingFormModal") {
            closeBookingForm();
        }
    });
}

// ===== CALCULATE PRICE AND AVAILABILITY =====
function calculatePropertiesAndAvailability() {
    if (!currentProperty) return;

    const checkInInput = document.getElementById("checkInInput").value;
    const checkOutInput = document.getElementById("checkOutInput").value;

    if (!checkInInput || !checkOutInput) {
        document.getElementById("availabilityStatus").style.display = "none";
        clearPrices();
        return;
    }

    const checkIn = new Date(checkInInput);
    const checkOut = new Date(checkOutInput);

    // Validate dates
    if (checkOut <= checkIn) {
        document.getElementById("availabilityStatus").style.display = "block";
        document.getElementById("availabilityStatus").textContent = "❌ Check-out must be after check-in";
        document.getElementById("availabilityStatus").classList.add("unavailable");
        document.getElementById("confirmBookBtn").disabled = true;
        return;
    }

    // Check availability
    const isAvailable = checkAvailability(currentProperty.id, checkInInput, checkOutInput);
    const availabilityEl = document.getElementById("availabilityStatus");

    if (isAvailable) {
        availabilityEl.style.display = "block";
        availabilityEl.textContent = "✅ Available for selected dates";
        availabilityEl.classList.remove("unavailable");
        document.getElementById("confirmBookBtn").disabled = false;
    } else {
        availabilityEl.style.display = "block";
        availabilityEl.textContent = "❌ Not available for selected dates";
        availabilityEl.classList.add("unavailable");
        document.getElementById("confirmBookBtn").disabled = true;
    }

    // Calculate nights and price
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    const subtotal = nights * currentProperty.price;
    const serviceFee = Math.round(subtotal * 0.1); // 10% service fee
    const total = subtotal + serviceFee;

    document.getElementById("pricePerNight").textContent = currentProperty.price;
    document.getElementById("numberOfNights").textContent = nights;
    document.getElementById("subtotal").textContent = subtotal;
    document.getElementById("serviceFee").textContent = serviceFee;
    document.getElementById("totalPrice").textContent = total;
}

// ===== CLEAR PRICES =====
function clearPrices() {
    document.getElementById("pricePerNight").textContent = "0";
    document.getElementById("numberOfNights").textContent = "0";
    document.getElementById("subtotal").textContent = "0";
    document.getElementById("serviceFee").textContent = "0";
    document.getElementById("totalPrice").textContent = "0";
}

// ===== OPEN BOOKING FORM MODAL =====
function openBookingForm(property) {
    currentProperty = property;
    document.getElementById("bookingFormTitle").textContent = `Book "${property.title}"`;

    // Prefill dates from homepage/listings URL if available
    document.getElementById("checkInInput").value = selectedCheckInDate || "";
    document.getElementById("checkOutInput").value = selectedCheckOutDate || "";

    // Show selected guests from listings filter
    const selectedGuests = parseInt(document.getElementById("guestsInput").value) || 1;
    document.getElementById("selectedGuestsDisplay").value = `${selectedGuests} guest(s)`;

    document.getElementById("availabilityStatus").style.display = "none";
    clearPrices();
    document.getElementById("confirmBookBtn").disabled = true;

    // Set min date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split('T')[0];
    document.getElementById("checkInInput").min = minDate;

    // If check-in already exists, set check-out minimum correctly
    if (selectedCheckInDate) {
        const checkIn = new Date(selectedCheckInDate);
        checkIn.setDate(checkIn.getDate() + 1);
        document.getElementById("checkOutInput").min = checkIn.toISOString().split("T")[0];
    }

    document.getElementById("bookingFormModal").classList.add("show");
    closeListingModal();

    // Recalculate immediately if both dates already exist
    if (selectedCheckInDate && selectedCheckOutDate) {
        calculatePropertiesAndAvailability();
    }
}

// ===== CLOSE BOOKING FORM MODAL =====
function closeBookingForm() {
    document.getElementById("bookingFormModal").classList.remove("show");
}

// ===== CONFIRM BOOKING =====
function confirmBooking() {
    const storage = window.AppStorage;
    const user = storage
        ? storage.getCurrentUser()
        : JSON.parse(localStorage.getItem("currentUser") || "null");
    if (!user) {
        alert("Please log in to make a booking");
        window.location.href = "login.html";
        return;
    }

    const checkInDate = document.getElementById("checkInInput").value;
    const checkOutDate = document.getElementById("checkOutInput").value;
    const guests = parseInt(document.getElementById("guestsInput").value) || 1;

    if (!checkInDate || !checkOutDate) {
        alert("Please select check-in and check-out dates");
        return;
    }

    // capacity validation
    if (guests > currentProperty.guests) {
        alert(`❌ You can't book this property for more than ${currentProperty.guests} guests.`);
        return;
    }

    // Calculate nights between check-in and check-out
    const checkInDateObj = new Date(checkInDate);
    const checkOutDateObj = new Date(checkOutDate);
    const nights = Math.ceil((checkOutDateObj - checkInDateObj) / (1000 * 60 * 60 * 24));

    // Create pending booking for payment
    const pendingBooking = {
        bookingId: Date.now(),
        userId: user.username,
        propertyId: currentProperty.id,
        propertyTitle: currentProperty.title,
        city: currentProperty.city,
        country: currentProperty.country,
        price: currentProperty.price,
        owner: currentProperty.ownerName,
        images: currentProperty.images,
        image: currentProperty.images[0],
        bookingDate: new Date().toISOString(),
        checkInDate: new Date(checkInDate).toISOString(),
        checkOutDate: new Date(checkOutDate).toISOString(),
        guests: guests,
        nights: nights,
        status: "Pending"
    };

    if (storage) storage.setSS("pendingBooking", pendingBooking);
    else sessionStorage.setItem("pendingBooking", JSON.stringify(pendingBooking));
    window.location.href = "payment.html";
}

// ===== REVIEW MODAL FUNCTIONS =====
let currentPropertyIdForReview = null;

function openReviewModal(propertyId) {
    currentPropertyIdForReview = propertyId;
    document.getElementById("selectedRating").textContent = "Select a rating";
    document.getElementById("reviewText").value = "";
    document.querySelectorAll("#starRating .star").forEach(star => {
        star.style.opacity = "0.3";
    });
    document.getElementById("reviewModal").classList.add("show");
    closeListingModal();
}

function closeReviewModal() {
    document.getElementById("reviewModal").classList.remove("show");
}

// Setup star rating
document.addEventListener("DOMContentLoaded", () => {
    let selectedRating = 0;

    document.querySelectorAll("#starRating .star").forEach(star => {
        star.addEventListener("click", function () {
            selectedRating = parseInt(this.dataset.value);
            document.querySelectorAll("#starRating .star").forEach((s, index) => {
                s.style.opacity = index < selectedRating ? "1" : "0.3";
            });
            document.getElementById("selectedRating").textContent = selectedRating + " star" + (selectedRating !== 1 ? "s" : "");
            document.getElementById("selectedRating").style.color = "var(--button-color)";
        });

        star.addEventListener("mouseenter", function () {
            const hoverRating = parseInt(this.dataset.value);
            document.querySelectorAll("#starRating .star").forEach((s, index) => {
                s.style.opacity = index < hoverRating ? "0.8" : "0.3";
            });
        });

        star.addEventListener("mouseleave", function () {
            document.querySelectorAll("#starRating .star").forEach((s, index) => {
                s.style.opacity = index < selectedRating ? "1" : "0.3";
            });
        });
    });

    // Close review modal buttons
    document.querySelector(".review-modal-close").addEventListener("click", closeReviewModal);
    document.getElementById("reviewModal").addEventListener("click", (e) => {
        if (e.target.id === "reviewModal") {
            closeReviewModal();
        }
    });

    // Submit review
    document.getElementById("submitReviewBtn").addEventListener("click", () => {
        let selectedRating = 0;
        document.querySelectorAll("#starRating .star").forEach((s, index) => {
            if (s.style.opacity !== "0.3") selectedRating = index + 1;
        });

        const reviewText = document.getElementById("reviewText").value.trim();

        if (selectedRating === 0) {
            alert("Please select a rating");
            return;
        }

        if (!reviewText) {
            alert("Please write a review");
            return;
        }

        if (addReview(currentPropertyIdForReview, selectedRating, reviewText)) {
            alert("✅ Review submitted successfully!");
            closeReviewModal();
            // Refresh the modal to show new review
            const property = properties.find(p => p.id === currentPropertyIdForReview);
            if (property) {
                openListingModal(property);
            }
        }
    });
});

// ===== EXPOSE PROPERTIES DATA FOR HOST PROFILE PAGE =====
window.propertiesData = properties;