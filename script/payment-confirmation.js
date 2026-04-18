document.addEventListener("DOMContentLoaded", () => {
    const storage = window.AppStorage;
    const currentUser = storage
        ? storage.getCurrentUser()
        : JSON.parse(localStorage.getItem("currentUser") || "null");

    if (!currentUser) {
        alert("Please log in to view booking confirmation.");
        window.location.href = "login.html";
        return;
    }

    const paymentData = storage
        ? storage.getSS("paymentConfirmation", null)
        : JSON.parse(sessionStorage.getItem("paymentConfirmation") || "null");
    
    if (!paymentData) {
        alert("No confirmation data found. Redirecting...");
        window.location.href = "bookings.html";
        return;
    }

    if (!paymentData.bookingData || paymentData.bookingData.userId !== currentUser.username) {
        alert("This confirmation does not belong to your account.");
        sessionStorage.removeItem("paymentConfirmation");
        window.location.href = "bookings.html";
        return;
    }

    const booking = paymentData.bookingData;
    const nights = booking.nights;
    const price = booking.price;
    const subtotal = nights * price;
    const serviceFee = Math.round(subtotal * 0.1);
    const total = subtotal + serviceFee;

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

    document.getElementById("confirmationNumber").textContent = paymentData.confirmationNumber;
    document.getElementById("confirmPropertyName").textContent = booking.propertyTitle;
    document.getElementById("confirmLocation").textContent = `${booking.city}, ${booking.country}`;
    document.getElementById("confirmCheckIn").textContent = storage ? storage.toDisplayDate(booking.checkInDate) : booking.checkInDate;
    document.getElementById("confirmCheckOut").textContent = storage ? storage.toDisplayDate(booking.checkOutDate) : booking.checkOutDate;
    document.getElementById("confirmGuests").textContent = booking.guests + " guest(s)";
    document.getElementById("confirmHost").textContent = booking.owner;
    document.getElementById("confirmTotal").textContent = total;

    document.getElementById("confirmGuestName").textContent = paymentData.guestName;
    document.getElementById("confirmGuestEmail").textContent = paymentData.guestEmail;
    document.getElementById("confirmGuestPhone").textContent = paymentData.guestPhone;

    const cashNotice = document.getElementById("cashPaymentNotice");
    if (paymentData.paymentMethod === "cash") {
        if (!cashNotice) {
            const nextSteps = document.querySelector(".next-steps");
            const notice = document.createElement("div");
            notice.id = "cashPaymentNotice";
            notice.className = "cash-payment-notice";
            notice.innerHTML = `
                <h4>💰 Cash Payment Outstanding</h4>
                <p>You will pay the total amount of <strong>€${total}</strong> directly to the host at check-in.</p>
                <div class="cash-notice-details">
                    <p><strong>Important:</strong> Please have the exact amount ready when you arrive.</p>
                    <p>The host will contact you at <strong>${paymentData.guestPhone}</strong> or email you at <strong>${paymentData.guestEmail}</strong> to confirm payment details.</p>
                </div>
            `;
            nextSteps.parentElement.insertBefore(notice, nextSteps);
        }
    }

    sessionStorage.removeItem("paymentConfirmation");
});
