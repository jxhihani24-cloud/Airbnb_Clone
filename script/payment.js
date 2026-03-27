// ===== LOAD BOOKING DATA =====
document.addEventListener("DOMContentLoaded", () => {
    const bookingData = JSON.parse(sessionStorage.getItem("pendingBooking"));
    
    if (!bookingData) {
        alert("No booking data found. Redirecting...");
        window.location.href = "listings.html";
        return;
    }

    // Display booking summary
    document.getElementById("paymentPropertyName").textContent = bookingData.propertyTitle;
    document.getElementById("paymentLocation").textContent = `${bookingData.city}, ${bookingData.country}`;
    document.getElementById("paymentCheckIn").textContent = bookingData.checkInDate;
    document.getElementById("paymentCheckOut").textContent = bookingData.checkOutDate;
    document.getElementById("paymentGuests").textContent = bookingData.guests + " guest(s)";

    // Calculate and display prices
    const nights = bookingData.nights;
    const price = bookingData.price;
    const subtotal = nights * price;
    const serviceFee = Math.round(subtotal * 0.1);
    const total = subtotal + serviceFee;

    document.getElementById("paymentSubtotal").textContent = price;
    document.getElementById("paymentNights").textContent = nights;
    document.getElementById("paymentSubtotalAmount").textContent = subtotal;
    document.getElementById("paymentServiceFee").textContent = serviceFee;
    document.getElementById("paymentTotal").textContent = total;
    document.getElementById("cashTotalAmount").textContent = total;

    // Handle payment method selection
    const paymentMethodRadios = document.querySelectorAll("input[name='paymentMethod']");
    paymentMethodRadios.forEach(radio => {
        radio.addEventListener("change", handlePaymentMethodChange);
    });

    // Format card number input
    document.getElementById("cardNumber").addEventListener("input", (e) => {
        let value = e.target.value.replace(/\s/g, "");
        let formattedValue = value.replace(/(.{4})/g, "$1 ").trim();
        e.target.value = formattedValue;
    });

    // Format expiry date input
    document.getElementById("expiryDate").addEventListener("input", (e) => {
        let value = e.target.value.replace(/\D/g, "");
        if (value.length >= 2) {
            value = value.substring(0, 2) + "/" + value.substring(2, 4);
        }
        e.target.value = value;
    });

    // Format CVV input
    document.getElementById("cvv").addEventListener("input", (e) => {
        e.target.value = e.target.value.replace(/\D/g, "").substring(0, 3);
    });

    // Handle form submission
    document.getElementById("paymentForm").addEventListener("submit", handlePaymentSubmit);
});

// ===== HANDLE PAYMENT METHOD CHANGE =====
function handlePaymentMethodChange(e) {
    const method = e.target.value;
    const cardSection = document.getElementById("cardPaymentSection");
    const cashSection = document.getElementById("cashPaymentSection");
    const submitBtn = document.querySelector("button[type='submit']");
    const cardInputs = cardSection.querySelectorAll("input[required]");

    if (method === "card") {
        // Show card section, hide cash section
        cardSection.style.display = "block";
        cashSection.style.display = "none";
        submitBtn.textContent = "Complete Payment";
        submitBtn.style.background = "var(--button-color)";
        
        // Make card inputs required
        cardInputs.forEach(input => {
            input.setAttribute("required", "required");
        });
    } else if (method === "cash") {
        // Hide card section, show cash section
        cardSection.style.display = "none";
        cashSection.style.display = "block";
        submitBtn.textContent = "Confirm Booking (Pay Cash)";
        submitBtn.style.background = "#28a745";
        
        // Remove required from card inputs
        cardInputs.forEach(input => {
            input.removeAttribute("required");
        });
    }
}

// ===== VALIDATE PAYMENT FORM =====
function validatePaymentForm() {
    const method = document.querySelector("input[name='paymentMethod']:checked").value;

    if (method === "card") {
        const cardNumber = document.getElementById("cardNumber").value.replace(/\s/g, "");
        const expiryDate = document.getElementById("expiryDate").value;
        const cvv = document.getElementById("cvv").value;

        if (cardNumber.length !== 16) {
            alert("Please enter a valid 16-digit card number");
            return false;
        }

        if (!expiryDate.match(/^\d{2}\/\d{2}$/)) {
            alert("Please enter expiry date in MM/YY format");
            return false;
        }

        if (cvv.length !== 3) {
            alert("Please enter a valid 3-digit CVV");
            return false;
        }
    }

    return true;
}

// ===== HANDLE PAYMENT SUBMISSION =====
function handlePaymentSubmit(e) {
    e.preventDefault();

    if (!validatePaymentForm()) {
        return;
    }

    const method = document.querySelector("input[name='paymentMethod']:checked").value;

    // Show loading state
    const btn = e.target.querySelector("button[type='submit']");
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = method === "card" ? "Processing..." : "Confirming...";

    // Simulate payment processing
    const processingTime = method === "card" ? 2000 : 1500;
    
    setTimeout(() => {
        // Get form data
        const guestName = document.getElementById("guestName").value;
        const guestEmail = document.getElementById("guestEmail").value;
        const guestPhone = document.getElementById("guestPhone").value;
        const bookingData = JSON.parse(sessionStorage.getItem("pendingBooking"));

        // Create payment record
        const payment = {
            id: Date.now(),
            guestName: guestName,
            guestEmail: guestEmail,
            guestPhone: guestPhone,
            bookingData: bookingData,
            paymentDate: new Date().toLocaleDateString(),
            confirmationNumber: "CONF" + Math.random().toString(36).substring(2, 9).toUpperCase(),
            paymentMethod: method,
            status: method === "card" ? "Completed" : "Pending",
            paymentNotes: method === "cash" ? "To be paid in cash at check-in" : ""
        };

        // Store in localStorage
        const payments = JSON.parse(localStorage.getItem("payments")) || [];
        payments.push(payment);
        localStorage.setItem("payments", JSON.stringify(payments));

        // Store payment info for confirmation page
        sessionStorage.setItem("paymentConfirmation", JSON.stringify(payment));

        // Create the actual booking
        const userData = localStorage.getItem("currentUser");
        const user = JSON.parse(userData);
        const bookings = JSON.parse(localStorage.getItem("bookings")) || [];

        const booking = {
            id: bookingData.bookingId,
            userId: user.username,
            propertyId: bookingData.propertyId,
            propertyTitle: bookingData.propertyTitle,
            city: bookingData.city,
            country: bookingData.country,
            price: bookingData.price,
            owner: bookingData.owner,
            image: bookingData.image,
            bookingDate: new Date().toLocaleDateString(),
            checkInDate: bookingData.checkInDate,
            checkOutDate: bookingData.checkOutDate,
            guests: bookingData.guests,
            status: method === "card" ? "Confirmed" : "Pending Payment",
            paymentStatus: method === "card" ? "Paid" : "Cash Payment Pending",
            paymentMethod: method,
            paymentId: payment.id
        };

        bookings.push(booking);
        localStorage.setItem("bookings", JSON.stringify(bookings));

        // Clear pending booking from session
        sessionStorage.removeItem("pendingBooking");

        // Redirect to confirmation page
        window.location.href = "payment-confirmation.html";
    }, processingTime);
}
