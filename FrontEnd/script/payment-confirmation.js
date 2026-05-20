document.addEventListener("DOMContentLoaded", () => {
    const currentUser = requireLogin();

    if (!currentUser) {
        return;
    }

    const paymentData = JSON.parse(
        sessionStorage.getItem("paymentConfirmation") || "null"
    );

    if (!paymentData) {
        alert("No confirmation data found. Redirecting...");
        window.location.href = "bookings.html";
        return;
    }

    const booking = paymentData.bookingData;
    const total = paymentData.total;

    const successIcon = document.querySelector(".success-icon");
    const header = document.querySelector(".confirmation-header h1");
    const subtitle = document.querySelector(".confirmation-subtitle");

    if (paymentData.paymentMethod === "card") {
        successIcon.textContent = "✓";
        successIcon.style.background = "linear-gradient(135deg, #198754, #20c997)";
        header.textContent = "Payment Successful!";
        subtitle.textContent = "Your booking has been confirmed";
    } else {
        successIcon.textContent = "⏳";
        successIcon.style.background = "linear-gradient(135deg, #ffc107, #ff9800)";
        header.textContent = "Booking Confirmed!";
        subtitle.textContent = "Payment will be collected at check-in";
    }

    document.getElementById("confirmationNumber").textContent =
        paymentData.confirmationNumber;

    document.getElementById("confirmPropertyName").textContent =
        booking.propertyTitle;

    document.getElementById("confirmLocation").textContent =
        `${booking.city}, ${booking.country}`;

    document.getElementById("confirmCheckIn").textContent =
        formatDate(booking.checkInDate);

    document.getElementById("confirmCheckOut").textContent =
        formatDate(booking.checkOutDate);

    document.getElementById("confirmGuests").textContent =
        booking.guests + " guest(s)";

    document.getElementById("confirmHost").textContent =
        booking.owner || "Host";

    document.getElementById("confirmTotal").textContent =
        total;

    document.getElementById("confirmGuestName").textContent =
        `${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim();

    document.getElementById("confirmGuestEmail").textContent =
        currentUser.email || "-";

    document.getElementById("confirmGuestPhone").textContent =
        currentUser.phoneNumber || "-";

    setupCashNotice(paymentData);
    setupButtons();
});

function setupCashNotice(paymentData) {
    const cashNotice = document.getElementById("cashPaymentNotice");

    if (paymentData.paymentMethod !== "cash") {
        return;
    }

    if (!cashNotice) {
        const nextSteps = document.querySelector(".next-steps");

        const notice = document.createElement("div");
        notice.id = "cashPaymentNotice";
        notice.style.cssText =
            "background:#fff3cd; color:#856404; padding:15px; border-radius:10px; margin:20px 0; border:1px solid #ffeeba;";

        notice.innerHTML = `
            <strong>Cash Payment:</strong>
            Please pay the host at check-in.
        `;

        nextSteps.parentElement.insertBefore(notice, nextSteps);
    }
}

function setupButtons() {
    const bookingsBtn = document.getElementById("viewBookingsBtn");
    const listingsBtn = document.getElementById("backToListingsBtn");

    if (bookingsBtn) {
        bookingsBtn.addEventListener("click", () => {
            sessionStorage.removeItem("paymentConfirmation");
            window.location.href = "bookings.html";
        });
    }

    if (listingsBtn) {
        listingsBtn.addEventListener("click", () => {
            sessionStorage.removeItem("paymentConfirmation");
            window.location.href = "listings.html";
        });
    }
}

function formatDate(value) {
    if (!value) {
        return "N/A";
    }

    return new Date(value).toLocaleDateString();
}