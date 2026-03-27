// ===== READ PARAMETERS FROM URL =====
function getParamsFromURL() {
    const params = new URLSearchParams(window.location.search);
    return {
        city: params.get("city") || "",
        country: params.get("country") || "",
        id: params.get("id") || null   // ✅ ADD THIS
    };
}

// ===== CURRENT PROPERTY FOR BOOKING =====
let currentProperty = null;

// ===== INITIAL LOAD WITH FILTERS =====
document.addEventListener("DOMContentLoaded", () => {
    const params = getParamsFromURL();

    // 👉 IF ID EXISTS → show only that property
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

        applyFilters();
    }

    setupBookingFormListeners();
});


// ===== SAMPLE PROPERTIES =====
const properties = [
    // ORIGINAL
    { id: 1, title: "Cozy Apartment in Paris", city: "Paris", country: "france", owner: "alice", ownerName: "Alice Dubois", price: 120, images: ["https://picsum.photos/400/300?random=1", "https://picsum.photos/400/300?random=1a", "https://picsum.photos/400/300?random=1b", "https://picsum.photos/400/300?random=1c"] },
    { id: 2, title: "Modern Loft in New York", city: "New York", country: "usa", owner: "bob", ownerName: "Bob Carter", price: 150, images: ["https://picsum.photos/400/300?random=2","https://picsum.photos/400/300?random=2a", "https://picsum.photos/400/300?random=2b"] },
    { id: 3, title: "Traditional House in Tokyo", city: "Tokyo", country: "japan", owner: "carol", ownerName: "Carol Tanaka", price: 100, images: ["https://picsum.photos/400/300?random=3","https://picsum.photos/400/300?random=3a", "https://picsum.photos/400/300?random=3b", "https://picsum.photos/400/300?random=3c", "https://picsum.photos/400/300?random=3d"] },
    { id: 4, title: "Beach House in Bali", city: "Bali", country: "indonesia", owner: "dave", ownerName: "Dave Santoso", price: 180, images: ["https://picsum.photos/400/300?random=4","https://picsum.photos/400/300?random=4a"] },
    { id: 5, title: "Mountain Cabin in Switzerland", city: "Zermatt", country: "switzerland", owner: "eve", ownerName: "Eve Meier", price: 220, images: ["https://picsum.photos/400/300?random=5","https://picsum.photos/400/300?random=5a" ] },
    { id: 6, title: "Luxury Apartment in Paris", city: "Paris", country: "france", owner: "frank", ownerName: "Frank Dupont", price: 200, images: ["https://picsum.photos/400/300?random=6","https://picsum.photos/400/300?random=6a" ] },
    { id: 7, title: "Penthouse in New York", city: "New York", country: "usa", owner: "grace", ownerName: "Grace Miller", price: 300, images: ["https://picsum.photos/400/300?random=7", "https://picsum.photos/400/300?random=7a"] },
    { id: 8, title: "Ryokan in Kyoto", city: "Kyoto", country: "japan", owner: "haru", ownerName: "Haru Sato", price: 130, images: ["https://picsum.photos/400/300?random=8", "https://picsum.photos/400/300?random=8a"] },
    { id: 9, title: "Villa in Ubud", city: "Ubud", country: "indonesia", owner: "ivan", ownerName: "Ivan Wijaya", price: 210, images: ["https://picsum.photos/400/300?random=9", "https://picsum.photos/400/300?random=9a"] },
    { id: 10, title: "Chalet in Geneva", city: "Geneva", country: "switzerland", owner: "julia", ownerName: "Julia Keller", price: 250, images: ["https://picsum.photos/400/300?random=10","https://picsum.photos/400/300?random=10a" ] },

   // POPULAR STAYS 
{ id: 11, title: "Beach House", city: "Bali", country: "indonesia", owner: "kadek", ownerName: "Kadek Putra", price: 120, images: ["https://tinyurl.com/4sz54rfv", "https://tinyurl.com/4sz54rfv", "https://tinyurl.com/4sz54rfv"] },
{ id: 12, title: "Mountain Cabin", city: "Zermatt", country: "switzerland", owner: "lukas", ownerName: "Lukas Steiner", price: 90, images: ["https://tinyurl.com/h8nbnw6z", "https://tinyurl.com/h8nbnw6z", "https://tinyurl.com/h8nbnw6z"] },
{ id: 13, title: "City Apartment", city: "New York", country: "usa", owner: "michael", ownerName: "Michael Johnson", price: 150, images: ["https://th.bing.com/th/id/R.884ee6730df0d9a1450e15cff40d6582?rik=7cKmbRU%2BNHh92w&pid=ImgRaw&r=0", "https://th.bing.com/th/id/R.884ee6730df0d9a1450e15cff40d6582?rik=7cKmbRU%2BNHh92w&pid=ImgRaw&r=0"] },
{ id: 14, title: "Apartment in Tokyo", city: "Tokyo", country: "japan", owner: "yuki", ownerName: "Yuki Nakamura", price: 80, images: ["https://tinyurl.com/bdetzwrv", "https://tinyurl.com/bdetzwrv"] },
{ id: 15, title: "Skyscraper Studio Apartment", city: "New York", country: "usa", owner: "david", ownerName: "David Smith", price: 145, images: ["images/skyscraper.webp", "https://images/skyscraper.webp"] },

// NEW GLOBAL LISTINGS 🌍
{ id: 16, title: "Eiffel Tower View Studio", city: "Paris", country: "france", owner: "marie", ownerName: "Marie Dubois", price: 140, images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688", "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688"] },
{ id: 17, title: "Luxury Manhattan Penthouse", city: "New York", country: "usa", owner: "john", ownerName: "John Carter", price: 320, images: ["https://images.unsplash.com/photo-1507089947367-19c1da9775ae", "https://images.unsplash.com/photo-1507089947367-19c1da9775ae"] },
{ id: 18, title: "Modern Shibuya Apartment", city: "Tokyo", country: "japan", owner: "yuki", ownerName: "Yuki Tanaka", price: 110, images: ["https://images.unsplash.com/photo-1554995207-c18c203602cb", "https://images.unsplash.com/photo-1554995207-c18c203602cb"] },
{ id: 19, title: "Jungle Villa with Pool", city: "Ubud", country: "indonesia", owner: "made", ownerName: "Made Santoso", price: 200, images: ["https://images.unsplash.com/photo-1505691938895-1758d7feb511", "https://images.unsplash.com/photo-1505691938895-1758d7feb511"] },
{ id: 20, title: "Alpine Luxury Chalet", city: "Zermatt", country: "switzerland", owner: "luca", ownerName: "Luca Meier", price: 280, images: ["https://images.unsplash.com/photo-1449157291145-7efd050a4d0e", "https://images.unsplash.com/photo-1449157291145-7efd050a4d0e"] },
{ id: 21, title: "Central London Flat", city: "London", country: "uk", owner: "emma", ownerName: "Emma Wilson", price: 190, images: ["https://images.unsplash.com/photo-1493809842364-78817add7ffb", "https://images.unsplash.com/photo-1493809842364-78817add7ffb"] },
{ id: 22, title: "Colosseum View Apartment", city: "Rome", country: "italy", owner: "marco", ownerName: "Marco Rossi", price: 160, images: ["https://images.unsplash.com/photo-1494526585095-c41746248156", "https://images.unsplash.com/photo-1494526585095-c41746248156"] },
{ id: 23, title: "Barcelona Beach Apartment", city: "Barcelona", country: "spain", owner: "sofia", ownerName: "Sofía Martinez", price: 150, images: ["https://images.unsplash.com/photo-1505693416388-ac5ce068fe85", "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85"] },
{ id: 24, title: "Sydney Ocean View House", city: "Sydney", country: "australia", owner: "liam", ownerName: "Liam Brown", price: 230, images: ["https://images.unsplash.com/photo-1479839672679-a46483c0e7c8", "https://images.unsplash.com/photo-1479839672679-a46483c0e7c8"] },
{ id: 25, title: "Forest Cabin Vancouver", city: "Vancouver", country: "canada", owner: "noah", ownerName: "Noah Smith", price: 170, images: ["https://images.unsplash.com/photo-1445019980597-93fa8acb246c", "https://images.unsplash.com/photo-1445019980597-93fa8acb246c"] },
{ id: 26, title: "Rio Beachfront Apartment", city: "Rio de Janeiro", country: "brazil", owner: "ana", ownerName: "Ana Silva", price: 140, images: ["https://images.unsplash.com/photo-1505692794403-34d4982c85d0", "https://images.unsplash.com/photo-1505692794403-34d4982c85d0"] },
{ id: 27, title: "Phuket Tropical Villa", city: "Phuket", country: "thailand", owner: "chai", ownerName: "Chai Wong", price: 130, images: ["https://images.unsplash.com/photo-1505691938895-1758d7feb511", "https://images.unsplash.com/photo-1505691938895-1758d7feb511"] },
{ id: 28, title: "Dubai Marina Luxury Apartment", city: "Dubai", country: "uae", owner: "ahmed", ownerName: "Ahmed Al-Farsi", price: 260, images: ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750", "https://images.unsplash.com/photo-1512917774080-9991f1c4c750"] },
{ id: 29, title: "Santorini Sea View House", city: "Santorini", country: "greece", owner: "nikos", ownerName: "Nikos Papadopoulos", price: 210, images: ["https://images.unsplash.com/photo-1505691938895-1758d7feb511", "https://images.unsplash.com/photo-1505691938895-1758d7feb511"] },
{ id: 30, title: "Marrakech Traditional Riad", city: "Marrakech", country: "morocco", owner: "youssef", ownerName: "Youssef Benali", price: 120, images: ["https://images.unsplash.com/photo-1505691938895-1758d7feb511", "https://images.unsplash.com/photo-1505691938895-1758d7feb511"] }
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
    document.getElementById("modalOwner").textContent = property.ownerName;

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

// ===== CHECK AVAILABILITY FOR DATES =====
function checkAvailability(propertyId, checkInDate, checkOutDate) {
    const bookings = JSON.parse(localStorage.getItem("bookings")) || [];
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    return !bookings.some(booking => {
        if (booking.propertyId !== propertyId) return false;
        const bookingCheckIn = new Date(booking.checkInDate);
        const bookingCheckOut = new Date(booking.checkOutDate);

        // Check for overlap
        return checkIn < bookingCheckOut && checkOut > bookingCheckIn;
    });
}

// ===== SETUP BOOKING FORM LISTENERS =====
function setupBookingFormListeners() {
    const checkInInput = document.getElementById("checkInInput");
    const checkOutInput = document.getElementById("checkOutInput");
    const guestsInput = document.getElementById("guestsInput");

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
    guestsInput.addEventListener("change", calculatePropertiesAndAvailability);

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

    // Reset form
    document.getElementById("checkInInput").value = "";
    document.getElementById("checkOutInput").value = "";
    document.getElementById("guestsInput").value = "1";
    document.getElementById("availabilityStatus").style.display = "none";
    clearPrices();
    document.getElementById("confirmBookBtn").disabled = true;

    // Set min date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split('T')[0];
    document.getElementById("checkInInput").min = minDate;

    document.getElementById("bookingFormModal").classList.add("show");
    closeListingModal();
}

// ===== CLOSE BOOKING FORM MODAL =====
function closeBookingForm() {
    document.getElementById("bookingFormModal").classList.remove("show");
}

// ===== CONFIRM BOOKING =====
function confirmBooking() {
    const userData = localStorage.getItem("currentUser");
    if (!userData) {
        alert("Please log in to make a booking");
        window.location.href = "login.html";
        return;
    }

    const checkInDate = document.getElementById("checkInInput").value;
    const checkOutDate = document.getElementById("checkOutInput").value;
    const guests = document.getElementById("guestsInput").value;

    if (!checkInDate || !checkOutDate) {
        alert("Please select check-in and check-out dates");
        return;
    }

    const user = JSON.parse(userData);

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
        bookingDate: new Date().toLocaleDateString(),
        checkInDate: new Date(checkInDate).toLocaleDateString(),
        checkOutDate: new Date(checkOutDate).toLocaleDateString(),
        guests: parseInt(guests),
        nights: nights,
        status: "Pending"
    };

    // Store in session storage and redirect to payment
    sessionStorage.setItem("pendingBooking", JSON.stringify(pendingBooking));
    window.location.href = "payment.html";
}