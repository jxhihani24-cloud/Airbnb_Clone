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

let currentProperty = null;
let selectedCheckInDate = "";
let selectedCheckOutDate = "";

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

    const propertyKey = String(propertyId);

    return bookings.some(b => {
        if (!b) return false;
        if (String(b.userId) !== String(user.username) || String(b.propertyId) !== propertyKey) return false;
        if (!b.checkOutDate) return false;

        const checkOutRaw = storage && storage.toISODate ? storage.toISODate(b.checkOutDate) : b.checkOutDate;
        const checkOut = new Date(checkOutRaw);
        if (Number.isNaN(checkOut.getTime())) return false;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return checkOut < today;
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

    if (!hasUserStayed(propertyId)) {
        alert("You can only review a property after your stay is completed.");
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
        const storage = window.AppStorage;
        const escapedText = storage && storage.escapeHtml ? storage.escapeHtml(review.text) : review.text;
        const reviewEl = document.createElement("div");
        reviewEl.style.cssText = "background: rgba(255,255,255,0.05); padding: 14px; border-radius: 10px; border: 1px solid var(--border-color);";
        reviewEl.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                <div>
                    <p style="margin: 0; font-weight: 600;">${review.reviewer}</p>
                    <span style="font-size: 12px; opacity: 0.7;">${storage && storage.toDisplayDate ? storage.toDisplayDate(review.date) : review.date}</span>
                </div>
                <span style="color: var(--button-color); font-size: 14px;">${stars}</span>
            </div>
            <p style="margin: 8px 0 0 0; font-size: 14px; line-height: 1.5;">${escapedText}</p>
        `;
        reviewsList.appendChild(reviewEl);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    properties = loadAllProperties();

    const params = getParamsFromURL();
    selectedCheckInDate = params.checkIn || "";
    selectedCheckOutDate = params.checkOut || "";

    if (params.id) {
        const selected = properties.find(p => p.id == params.id);

        if (selected) {
            displayListings([selected]);   // show only 1
            openListingModal(selected);    // open details automatically
        } else {
            applyFilters();
        }
    } else {
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


function loadAllProperties() {
    const storage = window.AppStorage;
    const userProperties = storage
        ? storage.getLS("properties", [])
        : JSON.parse(localStorage.getItem("properties") || "[]");

    return userProperties.map(function (property) {
        return {
            ...property,
            title: property.title || "Untitled Property",
            city: property.city || "Unknown City",
            country: (property.country || "unknown").toLowerCase(),
            ownerName: property.ownerName || property.owner || "Unknown Host",
            price: Number(property.price) || 0,
            guests: Number(property.guests) || 0,
            images: Array.isArray(property.images) ? property.images : []
        };
    });
}

let properties = loadAllProperties();

function isUserLoggedIn() {
    const storage = window.AppStorage;
    const currentUser = storage
        ? storage.getCurrentUser()
        : JSON.parse(localStorage.getItem("currentUser") || "null");
    return !!currentUser;
}

function renderEmptyState(container, hasAnyProperties) {
    if (!container) return;

    if (!hasAnyProperties) {
        const canAddProperty = isUserLoggedIn();
        container.innerHTML = `
            <div class="listings-empty-state" role="status" aria-live="polite">
                <h3>No properties yet</h3>
                <p>${canAddProperty
                    ? "Add your first property to see it here and continue with bookings/reviews flow."
                    : "Log in to add your first property and start hosting."}</p>
                ${canAddProperty
                    ? '<a class="empty-state-btn" href="add-property.html">+ Add Property</a>'
                    : '<a class="empty-state-btn" href="login.html">Log In to Add Property</a>'}
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="listings-empty-state" role="status" aria-live="polite">
            <h3>No matching properties</h3>
            <p>Try adjusting your filters to find available listings.</p>
            <button id="clearFiltersBtn" class="empty-state-btn" type="button">Clear Filters</button>
        </div>
    `;

    const clearFiltersBtn = document.getElementById("clearFiltersBtn");
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener("click", () => {
            document.getElementById("searchCity").value = "";
            document.getElementById("maxPrice").value = "";
            document.getElementById("countryFilter").value = "";
            document.getElementById("guestsInput").value = "";
            applyFilters();
        });
    }
}


function displayListings(list) {
    const container = document.querySelector(".listings-grid");
    if (!container) return;
    container.innerHTML = "";

    if (!list || list.length === 0) {
        renderEmptyState(container, properties.length > 0);
        return;
    }

    list.forEach(property => {
        const img = property.images && property.images.length ? property.images[0] : "https://picsum.photos/400/300?random=99";

        const card = document.createElement("div");
        card.className = "card";

        const avgRating = getAverageRating(property.id);
        const reviews = getReviewsByProperty(property.id);
        const stars = "★".repeat(Math.round(avgRating)) + "☆".repeat(5 - Math.round(avgRating));

        card.innerHTML = `
            <img src="${img}" alt="${property.title}">
            <div class="card-info">
                <h4>${property.title}</h4>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                    <p><strong>Location:</strong> ${property.city}, ${(property.country || "unknown").charAt(0).toUpperCase() + (property.country || "unknown").slice(1)}</p>
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

        card.querySelector(".view-details-btn").addEventListener("click", (e) => {
            e.stopPropagation();
            openListingModal(property);
        });

        card.querySelector(".book-btn").addEventListener("click", (e) => {
            e.stopPropagation();
            openBookingForm(property);
        });

        container.appendChild(card);
    });
}

let currentImageIndex = 0;
let currentPropertyImages = [];

function openListingModal(property) {
    const modal = document.getElementById("listingModal");
    const rawCountry = property.country || "unknown";
    const country = rawCountry.charAt(0).toUpperCase() + rawCountry.slice(1);

    document.getElementById("modalTitle").textContent = property.title;
    document.getElementById("modalDesc").textContent = `Beautiful ${property.country} property in ${property.city}. Perfect for your next stay!`;
    document.getElementById("modalLocation").textContent = property.city;
    document.getElementById("modalCountry").textContent = country;
    document.getElementById("modalPrice").textContent = `€${property.price} / night`;

    const ownerElement = document.getElementById("modalOwner");
    ownerElement.innerHTML = `<a href="host-profile.html?host=${property.owner || ""}" style="color: var(--button-color); text-decoration: none; cursor: pointer; font-weight: 600; transition: opacity 0.2s;">${property.ownerName || "Unknown Host"}</a>`;

    const ownerLink = ownerElement.querySelector('a');
    ownerLink.addEventListener('mouseenter', function () {
        this.style.opacity = '0.8';
    });
    ownerLink.addEventListener('mouseleave', function () {
        this.style.opacity = '1';
    });

    currentPropertyImages = property.images || ["https://picsum.photos/400/300?random=99"];
    currentImageIndex = 0;

    document.getElementById("modalImage").src = currentPropertyImages[0];
    updateImageCounter();

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

    const avgRating = getAverageRating(property.id);
    const reviews = getReviewsByProperty(property.id);
    const stars = "★".repeat(Math.round(avgRating)) + "☆".repeat(5 - Math.round(avgRating));

    document.getElementById("avgRating").textContent = avgRating;
    document.getElementById("ratingStars").textContent = stars;
    document.getElementById("reviewCount").textContent = `(${reviews.length} reviews)`;

    displayReviews(property.id);

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

function displayMainImage() {
    document.getElementById("modalImage").src = currentPropertyImages[currentImageIndex];
}

function updateThumbnailActive() {
    document.querySelectorAll(".thumbnail").forEach((thumb, index) => {
        thumb.classList.toggle("active", index === currentImageIndex);
    });
}

function updateImageCounter() {
    document.getElementById("imageCounter").textContent = `${currentImageIndex + 1}/${currentPropertyImages.length}`;
}

function closeListingModal() {
    const modal = document.getElementById("listingModal");
    modal.classList.remove("show");
}

document.addEventListener("DOMContentLoaded", () => {
    document.querySelector(".modal-close-btn").addEventListener("click", closeListingModal);

    const modal = document.getElementById("listingModal");
    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            closeListingModal();
        }
    });
});

function applyFilters() {
    const destination = document.getElementById("searchCity").value.toLowerCase().trim();
    const maxPrice = parseFloat(document.getElementById("maxPrice").value);
    const country = document.getElementById("countryFilter").value.toLowerCase();
    const guests = parseInt(document.getElementById("guestsInput").value);

    const filtered = properties.filter(prop => {
                const propCity = (prop.city || "").toLowerCase();
                const propCountry = (prop.country || "").toLowerCase();

        const matchesDestination = destination
                        ? propCity.includes(destination) || propCountry.includes(destination)
            : true;

        const matchesPrice = maxPrice ? prop.price <= maxPrice : true;

        const matchesCountry = country
            ? propCountry === country
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

document.getElementById("searchCity").addEventListener("keyup", applyFilters);
document.getElementById("maxPrice").addEventListener("change", applyFilters);
document.getElementById("countryFilter").addEventListener("change", applyFilters);
document.getElementById("guestsInput").addEventListener("input", applyFilters);

function checkAvailability(propertyId, checkInDate, checkOutDate) {
    const storage = window.AppStorage;
    const bookings = storage
        ? storage.getLS("bookings", [])
        : JSON.parse(localStorage.getItem("bookings") || "[]");
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    return !bookings.some(booking => {
        if (booking.propertyId !== propertyId) return false;
        if (booking.status === 'cancelled' || booking.cancelled === true) return false;
        
        const bookingCheckIn = new Date(storage ? storage.toISODate(booking.checkInDate) : booking.checkInDate);
        const bookingCheckOut = new Date(storage ? storage.toISODate(booking.checkOutDate) : booking.checkOutDate);

        return checkIn < bookingCheckOut && checkOut > bookingCheckIn;
    });
}

function setupBookingFormListeners() {
    const checkInInput = document.getElementById("checkInInput");
    const checkOutInput = document.getElementById("checkOutInput");
    

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
    

    document.querySelector(".booking-form-close").addEventListener("click", closeBookingForm);

    document.getElementById("confirmBookBtn").addEventListener("click", confirmBooking);

    document.getElementById("bookingFormModal").addEventListener("click", (e) => {
        if (e.target.id === "bookingFormModal") {
            closeBookingForm();
        }
    });
}

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

    if (checkOut <= checkIn) {
        document.getElementById("availabilityStatus").style.display = "block";
        document.getElementById("availabilityStatus").textContent = "❌ Check-out must be after check-in";
        document.getElementById("availabilityStatus").classList.add("unavailable");
        document.getElementById("confirmBookBtn").disabled = true;
        return;
    }

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

function clearPrices() {
    document.getElementById("pricePerNight").textContent = "0";
    document.getElementById("numberOfNights").textContent = "0";
    document.getElementById("subtotal").textContent = "0";
    document.getElementById("serviceFee").textContent = "0";
    document.getElementById("totalPrice").textContent = "0";
}

function openBookingForm(property) {
    currentProperty = property;
    document.getElementById("bookingFormTitle").textContent = `Book "${property.title}"`;

    document.getElementById("checkInInput").value = selectedCheckInDate || "";
    document.getElementById("checkOutInput").value = selectedCheckOutDate || "";

    const selectedGuests = parseInt(document.getElementById("guestsInput").value) || 1;
    document.getElementById("selectedGuestsDisplay").value = `${selectedGuests} guest(s)`;

    document.getElementById("availabilityStatus").style.display = "none";
    clearPrices();
    document.getElementById("confirmBookBtn").disabled = true;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split('T')[0];
    document.getElementById("checkInInput").min = minDate;

    if (selectedCheckInDate) {
        const checkIn = new Date(selectedCheckInDate);
        checkIn.setDate(checkIn.getDate() + 1);
        document.getElementById("checkOutInput").min = checkIn.toISOString().split("T")[0];
    }

    document.getElementById("bookingFormModal").classList.add("show");
    closeListingModal();

    if (selectedCheckInDate && selectedCheckOutDate) {
        calculatePropertiesAndAvailability();
    }
}

function closeBookingForm() {
    document.getElementById("bookingFormModal").classList.remove("show");
}

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

    if (guests > currentProperty.guests) {
        alert(`❌ You can't book this property for more than ${currentProperty.guests} guests.`);
        return;
    }

    const checkInDateObj = new Date(checkInDate);
    const checkOutDateObj = new Date(checkOutDate);
    const nights = Math.ceil((checkOutDateObj - checkInDateObj) / (1000 * 60 * 60 * 24));

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

    document.querySelector(".review-modal-close").addEventListener("click", closeReviewModal);
    document.getElementById("reviewModal").addEventListener("click", (e) => {
        if (e.target.id === "reviewModal") {
            closeReviewModal();
        }
    });

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
            const property = properties.find(p => p.id === currentPropertyIdForReview);
            if (property) {
                openListingModal(property);
            }
        }
    });
});

window.propertiesData = properties;
