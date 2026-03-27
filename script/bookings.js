// ===== GET BOOKING STATUS BASED ON DATES =====
function getBookingStatus(booking) {
    if (!booking.checkOutDate) return "Confirmed";

    const checkOutDate = new Date(booking.checkOutDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkOutDate < today) {
        return "Stayed";
    }
    return "Confirmed";
}

// ===== LOAD AND DISPLAY BOOKINGS =====
document.addEventListener("DOMContentLoaded", () => {
    const userData = localStorage.getItem("currentUser");
    if (!userData) {
        alert("Please log in to view bookings.");
        window.location.href = "login.html";
        return;
    }

    const user = JSON.parse(userData);
    const bookings = JSON.parse(localStorage.getItem("bookings")) || [];
    const userBookings = bookings.filter(b => b.userId === user.username);

    // Add filter buttons
    const bookingsList = document.getElementById("bookingsList");
    const filterContainer = document.createElement("div");
    filterContainer.className = "booking-filter-container mb-4";
    filterContainer.style.cssText = "display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; margin-bottom: 20px;";

    const filterButtons = [
        { label: "All", status: null, class: "filter-btn active" },
        { label: "Confirmed", status: "Confirmed", class: "filter-btn" },
        { label: "Stayed", status: "Stayed", class: "filter-btn" }
    ];

    filterButtons.forEach(btn => {
        const button = document.createElement("button");
        button.textContent = btn.label;
        button.className = btn.class;
        button.style.cssText = "padding: 8px 16px; border-radius: 8px; border: 1px solid var(--border-color);background: var(--card-bg); color: var(--text-color); cursor: pointer; transition: 0.2s;font-weight: 500;";

        button.addEventListener("click", () => {
            document.querySelectorAll(".filter-btn").forEach(b => {
                b.style.background = "var(--card-bg)";
                b.style.opacity = "0.7";
                b.style.color = "var(--text-color)";
            });
            button.style.background = "var(--button-color)";
            button.style.color = "white";
            button.style.opacity = "1";

            const filtered = btn.status ? userBookings.filter(b => getBookingStatus(b) === btn.status) : userBookings;
            displayBookings(filtered);
        });

        if (btn.status === null) {
            button.style.background = "var(--button-color)";
            button.style.color = "white";
            button.style.opacity = "1";
        }

        filterContainer.appendChild(button);
    });

    bookingsList.parentElement.insertBefore(filterContainer, bookingsList);
    displayBookings(userBookings);
});

// ===== DISPLAY BOOKINGS =====
function displayBookings(userBookings) {
    const bookingsList = document.getElementById("bookingsList");
    const noBookingsMsg = document.getElementById("noBookingsMsg");

    if (!userBookings || userBookings.length === 0) {
        bookingsList.innerHTML = "";
        noBookingsMsg.style.display = "block";
        return;
    }

    noBookingsMsg.style.display = "none";
    bookingsList.innerHTML = "";

    userBookings.forEach(booking => {
        const status = getBookingStatus(booking);
        const badgeColor = status === "Stayed" ? "bg-warning" : "bg-success";

        const bookingCard = document.createElement("div");
        bookingCard.className = "col-md-6 col-lg-4";
        bookingCard.innerHTML = `
            <div class="card booking-card shadow-sm h-100">
                <img src="${booking.image}" alt="${booking.propertyTitle}" class="booking-card-img">
                <div class="card-body d-flex flex-column">
                    <h6 class="card-title mb-3">${booking.propertyTitle}</h6>

                    <div class="detail-label">Location</div>
                    <div class="detail-value">${booking.city}, ${booking.country.charAt(0).toUpperCase() + booking.country.slice(1)}</div>

                    <div class="detail-label">Price</div>
                    <div class="detail-value" style="color: red; font-weight: 700;">€${booking.price}/night</div>

                    <div class="detail-label">Check-in</div>
                    <div class="detail-value">${booking.checkInDate || booking.bookingDate}</div>

                    <div class="detail-label">Check-out</div>
                    <div class="detail-value">${booking.checkOutDate || 'N/A'}</div>

                    <div class="detail-label">Guests</div>
                    <div class="detail-value">${booking.guests || 1} guest(s)</div>

                    <div class="detail-label">Host</div>
                    <div class="detail-value">${booking.owner}</div>

                    <div class="d-flex justify-content-between align-items-center mt-2 mb-3">
                        <span class="badge ${badgeColor}">${status}</span>
                        ${status === "Stayed" ? '<button class="review-btn" style="padding: 4px 10px; font-size: 12px; background: var(--button-color); color: white; border: none; border-radius: 6px; cursor: pointer;">Write Review</button>' : ''}
                    </div>

                    <div class="card-buttons mt-auto">
                        <button class="view-details-btn" style="background-color: blue;">View Details</button>
                        <button class="cancel-booking-btn" style="background-color: red;">Cancel</button>
                    </div>
                </div>
            </div>
        `;

        bookingCard.querySelector(".view-details-btn").addEventListener("click", () => {
            openBookingModal(booking);
        });

        bookingCard.querySelector(".cancel-booking-btn").addEventListener("click", () => {
            if (confirm("Are you sure you want to cancel this booking?")) {
                cancelBooking(booking.id);
            }
        });

        const reviewBtn = bookingCard.querySelector(".review-btn");
        if (reviewBtn) {
            reviewBtn.addEventListener("click", () => {
                openReviewModal(booking);
            });
        }

        bookingsList.appendChild(bookingCard);
    });
}

// ===== CANCEL BOOKING =====
function cancelBooking(bookingId) {
    const bookings = JSON.parse(localStorage.getItem("bookings")) || [];
    const updatedBookings = bookings.filter(b => b.id !== bookingId);
    localStorage.setItem("bookings", JSON.stringify(updatedBookings));

    const userData = localStorage.getItem("currentUser");
    const user = JSON.parse(userData);
    const userBookings = updatedBookings.filter(b => b.userId === user.username);

    displayBookings(userBookings);
    alert("Booking cancelled successfully");
}

// ===== OPEN BOOKING MODAL =====
// ===== CURRENT IMAGE INDEX FOR BOOKING CAROUSEL =====
let currentBookingImageIndex = 0;
let currentBookingImages = [];

function openBookingModal(booking) {
    const modal = document.getElementById("bookingModal");
    const country = booking.country.charAt(0).toUpperCase() + booking.country.slice(1);
    const status = getBookingStatus(booking);

    document.getElementById("bookingModalTitle").textContent = booking.propertyTitle;
    document.getElementById("bookingModalDesc").textContent = `Your reservation for this beautiful property in ${booking.city}. Check-in: ${booking.checkInDate || booking.bookingDate} | Check-out: ${booking.checkOutDate || 'N/A'}`;
    document.getElementById("bookingModalLocation").textContent = booking.city;
    document.getElementById("bookingModalCountry").textContent = country;
    document.getElementById("bookingModalPrice").textContent = `€${booking.price} / night`;
    document.getElementById("bookingModalGuests").textContent = `${booking.guests || 1} guest(s)`;
    document.getElementById("bookingModalOwner").textContent = booking.owner;

    // Setup image carousel
    currentBookingImages = booking.images || [booking.image] || ["https://picsum.photos/400/300?random=99"];
    currentBookingImageIndex = 0;
    
    // Display first image
    document.getElementById("bookingModalImage").src = currentBookingImages[0];
    updateBookingImageCounter();

    // Create thumbnail gallery
    const thumbnailGallery = document.getElementById("bookingThumbnailGallery");
    thumbnailGallery.innerHTML = "";

    currentBookingImages.forEach((img, index) => {
        const li = document.createElement("li");
        li.className = "thumbnail";
        if (index === 0) li.classList.add("active");
        
        li.innerHTML = `<img src="${img}" alt="Image ${index + 1}">`;
        li.addEventListener("click", () => {
            currentBookingImageIndex = index;
            displayBookingMainImage();
            updateBookingThumbnailActive();
            updateBookingImageCounter();
        });
        
        thumbnailGallery.appendChild(li);
    });

    const cancelBtn = document.getElementById("bookingModalCancelBtn");
    cancelBtn.textContent = status === "Stayed" ? "Write Review" : "Cancel Booking";
    cancelBtn.style.backgroundColor = status === "Stayed" ? "var(--button-color)" : "#dc3545";

    cancelBtn.onclick = () => {
        if (status === "Stayed") {
            closeBookingModal();
            openReviewModal(booking);
        } else {
            if (confirm("Are you sure you want to cancel this booking?")) {
                cancelBooking(booking.id);
                closeBookingModal();
            }
        }
    };

    modal.classList.add("show");
}

// ===== DISPLAY BOOKING MAIN IMAGE =====
function displayBookingMainImage() {
    document.getElementById("bookingModalImage").src = currentBookingImages[currentBookingImageIndex];
}

// ===== UPDATE BOOKING THUMBNAIL ACTIVE STATE =====
function updateBookingThumbnailActive() {
    document.querySelectorAll("#bookingThumbnailGallery .thumbnail").forEach((thumb, index) => {
        thumb.classList.toggle("active", index === currentBookingImageIndex);
    });
}

// ===== UPDATE BOOKING IMAGE COUNTER =====
function updateBookingImageCounter() {
    document.getElementById("bookingImageCounter").textContent = `${currentBookingImageIndex + 1}/${currentBookingImages.length}`;
}

// ===== CLOSE BOOKING MODAL =====
function closeBookingModal() {
    const modal = document.getElementById("bookingModal");
    modal.classList.remove("show");
}

// ===== OPEN REVIEW MODAL =====
function openReviewModal(booking) {
    const reviewText = prompt(`Write your review for "${booking.propertyTitle}":\n\n(Leave empty to skip)`);
    if (reviewText !== null && reviewText.trim()) {
        const reviews = JSON.parse(localStorage.getItem("reviews")) || [];
        reviews.push({
            id: Date.now(),
            propertyId: booking.propertyId,
            propertyTitle: booking.propertyTitle,
            userId: booking.userId,
            review: reviewText,
            date: new Date().toLocaleDateString()
        });
        localStorage.setItem("reviews", JSON.stringify(reviews));
        alert("✅ Review submitted! Thank you for your feedback.");
    }
}

// ===== MODAL CLOSE BUTTON =====
document.addEventListener("DOMContentLoaded", () => {
    const closeBtn = document.querySelector(".booking-modal-close-btn");
    const modal = document.getElementById("bookingModal");

    if (closeBtn) {
        closeBtn.addEventListener("click", closeBookingModal);
    }

    if (modal) {
        modal.addEventListener("click", (e) => {
            if (e.target === modal) {
                closeBookingModal();
            }
        });
    }
});
