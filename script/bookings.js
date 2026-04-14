function getBookingStatus(booking) {
    if (!booking.checkOutDate) return "Confirmed";
    const storage = window.AppStorage;
    const checkOutDate = new Date(storage ? storage.toISODate(booking.checkOutDate) : booking.checkOutDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return checkOutDate < today ? "Stayed" : "Confirmed";
}

document.addEventListener("DOMContentLoaded", () => {
    const storage = window.AppStorage;
    const user = storage
        ? storage.getCurrentUser()
        : JSON.parse(localStorage.getItem("currentUser") || "null");
    if (!user) {
        alert("Please log in to view bookings.");
        window.location.href = "login.html";
        return;
    }

    const bookings = storage
        ? storage.getLS("bookings", [])
        : JSON.parse(localStorage.getItem("bookings") || "[]");
    const userBookings = bookings.filter(b => b.userId === user.username);

    const bookingsList = document.getElementById("bookingsList");
    const filterContainer = document.createElement("div");
    filterContainer.style.cssText = "display:flex; gap:10px; justify-content:center; flex-wrap:wrap; margin-bottom:20px;";

    const filterButtons = [
        { label: "All", status: null },
        { label: "Confirmed", status: "Confirmed" },
        { label: "Stayed", status: "Stayed" }
    ];

    filterButtons.forEach((btn, i) => {
        const button = document.createElement("button");
        button.textContent = btn.label;
        button.className = "filter-btn";
        button.style.cssText = "padding:8px 16px; border-radius:8px; border:1px solid var(--border-color); cursor:pointer; font-weight:500; transition:0.2s;";
        button.style.background = i === 0 ? "var(--button-color)" : "var(--card-bg)";
        button.style.color = i === 0 ? "white" : "var(--text-color)";

        button.addEventListener("click", () => {
            document.querySelectorAll(".filter-btn").forEach(b => {
                b.style.background = "var(--card-bg)";
                b.style.color = "var(--text-color)";
            });
            button.style.background = "var(--button-color)";
            button.style.color = "white";
            const filtered = btn.status ? userBookings.filter(b => getBookingStatus(b) === btn.status) : userBookings;
            displayBookings(filtered);
        });

        filterContainer.appendChild(button);
    });

    bookingsList.parentElement.insertBefore(filterContainer, bookingsList);
    displayBookings(userBookings);
});

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
                    <h6 class="card-title mb-2">${booking.propertyTitle}</h6>

                    <div class="detail-label">Location</div>
                    <div class="detail-value">${booking.city}, ${booking.country.charAt(0).toUpperCase() + booking.country.slice(1)}</div>

                    <div class="detail-label">Price</div>
                    <div class="detail-value" style="color:red; font-weight:700;">€${booking.price}/night</div>

                    <div class="detail-label">Check-in</div>
                    <div class="detail-value">${window.AppStorage ? window.AppStorage.toDisplayDate(booking.checkInDate || booking.bookingDate) : (booking.checkInDate || booking.bookingDate)}</div>

                    <div class="detail-label">Check-out</div>
                    <div class="detail-value">${booking.checkOutDate ? (window.AppStorage ? window.AppStorage.toDisplayDate(booking.checkOutDate) : booking.checkOutDate) : 'N/A'}</div>

                    <div class="detail-label">Guests</div>
                    <div class="detail-value">${booking.guests || 1} guest(s)</div>

                    <div class="detail-label">Host</div>
                    <div class="detail-value">${booking.owner}</div>

                    <div class="mt-auto pt-3">
                        <span class="badge ${badgeColor} mb-2">${status}</span>
                        <div class="card-buttons" style="display:flex; gap:8px;">
                            <button class="view-details-btn" style="background-color:blue; flex:1;">View Details</button>
                            <button class="cancel-booking-btn" style="background-color:red; flex:1;">Cancel</button>
                        </div>
                        ${status === "Stayed" ? '<button class="review-btn" style="width:100%; margin-top:8px; padding:8px; background:var(--button-color); color:white; border:none; border-radius:8px; cursor:pointer; font-weight:500;">⭐ Write a Review</button>' : ''}
                    </div>
                </div>
            </div>
        `;

        bookingCard.querySelector(".view-details-btn").addEventListener("click", () => openBookingModal(booking));
        bookingCard.querySelector(".cancel-booking-btn").addEventListener("click", () => {
            if (confirm("Are you sure you want to cancel this booking?")) cancelBooking(booking.bookingId);
        });

        const reviewBtn = bookingCard.querySelector(".review-btn");
        if (reviewBtn) reviewBtn.addEventListener("click", () => openStarReviewModal(booking));

        bookingsList.appendChild(bookingCard);
    });
}

function cancelBooking(bookingId) {
    const storage = window.AppStorage;
    const bookings = storage
        ? storage.getLS("bookings", [])
        : JSON.parse(localStorage.getItem("bookings") || "[]");
    const updated = bookings.filter(b => b.bookingId !== bookingId);
    if (storage) storage.setLS("bookings", updated);
    else localStorage.setItem("bookings", JSON.stringify(updated));
    const user = storage
        ? storage.getCurrentUser()
        : JSON.parse(localStorage.getItem("currentUser") || "null");
    displayBookings(updated.filter(b => b.userId === user.username));
    alert("Booking cancelled successfully");
}

// ===== STAR REVIEW MODAL =====
function openStarReviewModal(booking) {
    // Remove existing modal if any
    const existing = document.getElementById("starReviewModal");
    if (existing) existing.remove();

    const modal = document.createElement("div");
    modal.id = "starReviewModal";
    modal.style.cssText = "position:fixed; inset:0; background:rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center; z-index:9999;";

    modal.innerHTML = `
        <div style="background:var(--card-bg, #1e1e1e); border-radius:16px; padding:28px; width:90%; max-width:420px; border:1px solid var(--border-color);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                <h3 style="margin:0; font-size:18px; color:var(--text-color);">Review "${booking.propertyTitle}"</h3>
                <span id="closeStarModal" style="cursor:pointer; font-size:22px; color:var(--text-color); opacity:0.6;">&times;</span>
            </div>

            <p style="font-size:13px; opacity:0.6; margin-bottom:16px;">You stayed here — share your experience!</p>

            <div style="display:flex; gap:8px; justify-content:center; margin-bottom:12px;" id="starRow">
                ${[1,2,3,4,5].map(n => `
                    <span data-value="${n}" style="font-size:36px; cursor:pointer; opacity:0.3; transition:opacity 0.15s; color:var(--button-color);">★</span>
                `).join("")}
            </div>
            <p id="starLabel" style="text-align:center; font-size:13px; opacity:0.5; margin-bottom:16px;">Select a rating</p>

            <textarea id="starReviewText" placeholder="Write your review..." style="width:100%; min-height:100px; padding:10px; border-radius:8px; border:1px solid var(--border-color); background:var(--card-bg); color:var(--text-color); font-size:14px; resize:vertical;"></textarea>

            <button id="submitStarReview" style="width:100%; margin-top:14px; padding:12px; background:var(--button-color); color:white; border:none; border-radius:10px; font-size:15px; font-weight:600; cursor:pointer;">Submit Review</button>
        </div>
    `;

    document.body.appendChild(modal);

    let selectedRating = 0;
    const stars = modal.querySelectorAll("#starRow span");

    stars.forEach(star => {
        star.addEventListener("mouseenter", () => {
            const val = parseInt(star.dataset.value);
            stars.forEach((s, i) => s.style.opacity = i < val ? "1" : "0.3");
        });
        star.addEventListener("mouseleave", () => {
            stars.forEach((s, i) => s.style.opacity = i < selectedRating ? "1" : "0.3");
        });
        star.addEventListener("click", () => {
            selectedRating = parseInt(star.dataset.value);
            stars.forEach((s, i) => s.style.opacity = i < selectedRating ? "1" : "0.3");
            modal.querySelector("#starLabel").textContent = selectedRating + " star" + (selectedRating !== 1 ? "s" : "");
            modal.querySelector("#starLabel").style.opacity = "1";
        });
    });

    modal.querySelector("#closeStarModal").addEventListener("click", () => modal.remove());
    modal.addEventListener("click", e => { if (e.target === modal) modal.remove(); });

    modal.querySelector("#submitStarReview").addEventListener("click", () => {
        const reviewText = modal.querySelector("#starReviewText").value.trim();
        if (selectedRating === 0) { alert("Please select a star rating."); return; }
        if (!reviewText) { alert("Please write a review."); return; }

        const storage = window.AppStorage;
        const currentUser = storage
            ? storage.getCurrentUser()
            : JSON.parse(localStorage.getItem("currentUser") || "null");
        const reviews = storage
            ? storage.getLS("reviews", [])
            : JSON.parse(localStorage.getItem("reviews") || "[]");

        reviews.push({
            id: Date.now(),
            propertyId: booking.propertyId,
            rating: selectedRating,
            text: reviewText,
            reviewer: currentUser.firstName + " " + currentUser.lastName,
            reviewerUsername: currentUser.username,
            date: new Date().toISOString(),
            createdAt: new Date().toISOString()
        });

        if (storage) storage.setLS("reviews", reviews);
        else localStorage.setItem("reviews", JSON.stringify(reviews));
        modal.remove();
        alert("✅ Review submitted! Thank you.");
    });
}

// ===== BOOKING DETAIL MODAL =====
let currentBookingImageIndex = 0;
let currentBookingImages = [];

function openBookingModal(booking) {
    const modal = document.getElementById("bookingModal");
    const country = booking.country.charAt(0).toUpperCase() + booking.country.slice(1);
    const status = getBookingStatus(booking);

    document.getElementById("bookingModalTitle").textContent = booking.propertyTitle;
    document.getElementById("bookingModalDesc").textContent = `Your reservation in ${booking.city}. Check-in: ${booking.checkInDate || booking.bookingDate} | Check-out: ${booking.checkOutDate || 'N/A'}`;
    document.getElementById("bookingModalLocation").textContent = booking.city;
    document.getElementById("bookingModalCountry").textContent = country;
    document.getElementById("bookingModalPrice").textContent = `€${booking.price} / night`;
    document.getElementById("bookingModalGuests").textContent = `${booking.guests || 1} guest(s)`;
    document.getElementById("bookingModalOwner").textContent = booking.owner;

    currentBookingImages = booking.images || [booking.image] || ["https://picsum.photos/400/300?random=99"];
    currentBookingImageIndex = 0;
    document.getElementById("bookingModalImage").src = currentBookingImages[0];
    updateBookingImageCounter();

    const thumbnailGallery = document.getElementById("bookingThumbnailGallery");
    thumbnailGallery.innerHTML = "";
    currentBookingImages.forEach((img, index) => {
        const li = document.createElement("li");
        li.className = "thumbnail";
        if (index === 0) li.classList.add("active");
        li.innerHTML = `<img src="${img}" alt="Image ${index + 1}">`;
        li.addEventListener("click", () => {
            currentBookingImageIndex = index;
            document.getElementById("bookingModalImage").src = currentBookingImages[index];
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
            openStarReviewModal(booking);
        } else {
            if (confirm("Are you sure you want to cancel this booking?")) {
                cancelBooking(booking.bookingId);
                closeBookingModal();
            }
        }
    };

    modal.classList.add("show");
}

function updateBookingThumbnailActive() {
    document.querySelectorAll("#bookingThumbnailGallery .thumbnail").forEach((thumb, index) => {
        thumb.classList.toggle("active", index === currentBookingImageIndex);
    });
}

function updateBookingImageCounter() {
    document.getElementById("bookingImageCounter").textContent = `${currentBookingImageIndex + 1}/${currentBookingImages.length}`;
}

function closeBookingModal() {
    document.getElementById("bookingModal").classList.remove("show");
}

document.addEventListener("DOMContentLoaded", () => {
    const closeBtn = document.querySelector(".booking-modal-close-btn");
    const modal = document.getElementById("bookingModal");
    if (closeBtn) closeBtn.addEventListener("click", closeBookingModal);
    if (modal) modal.addEventListener("click", e => { if (e.target === modal) closeBookingModal(); });
});