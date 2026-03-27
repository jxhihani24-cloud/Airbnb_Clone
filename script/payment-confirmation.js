// ===== LOAD CONFIRMATION DATA =====
document.addEventListener("DOMContentLoaded", () => {
    const paymentData = JSON.parse(sessionStorage.getItem("paymentConfirmation"));
    
    if (!paymentData) {
        alert("No confirmation data found. Redirecting...");
        window.location.href = "bookings.html";
        return;
    }

    const booking = paymentData.bookingData;
    const nights = booking.nights;
    const price = booking.price;
    const subtotal = nights * price;
    const serviceFee = Math.round(subtotal * 0.1);
    const total = subtotal + serviceFee;

    // Update header based on payment method
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

    // Populate confirmation details
    document.getElementById("confirmationNumber").textContent = paymentData.confirmationNumber;
    document.getElementById("confirmPropertyName").textContent = booking.propertyTitle;
    document.getElementById("confirmLocation").textContent = `${booking.city}, ${booking.country}`;
    document.getElementById("confirmCheckIn").textContent = booking.checkInDate;
    document.getElementById("confirmCheckOut").textContent = booking.checkOutDate;
    document.getElementById("confirmGuests").textContent = booking.guests + " guest(s)";
    document.getElementById("confirmHost").textContent = booking.owner;
    document.getElementById("confirmTotal").textContent = total;

    // Guest information
    document.getElementById("confirmGuestName").textContent = paymentData.guestName;
    document.getElementById("confirmGuestEmail").textContent = paymentData.guestEmail;
    document.getElementById("confirmGuestPhone").textContent = paymentData.guestPhone;

    // Show/hide cash payment notice
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

    // Clear session data
    sessionStorage.removeItem("paymentConfirmation");
});
