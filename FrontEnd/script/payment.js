document.addEventListener("DOMContentLoaded", () => {
    const currentUser = requireLogin();

    if (!currentUser) {
        return;
    }

    const bookingData = JSON.parse(sessionStorage.getItem("pendingBooking") || "null");

    if (!bookingData) {
        alert("No booking data found. Redirecting...");
        window.location.href = "listings.html";
        return;
    }

    document.getElementById("paymentPropertyName").textContent = bookingData.propertyTitle;
    document.getElementById("paymentLocation").textContent = `${bookingData.city}, ${bookingData.country}`;
    document.getElementById("paymentCheckIn").textContent = formatDate(bookingData.checkInDate);
    document.getElementById("paymentCheckOut").textContent = formatDate(bookingData.checkOutDate);
    document.getElementById("paymentGuests").textContent = bookingData.guests + " guest(s)";

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

    document.querySelectorAll("input[name='paymentMethod']").forEach(radio => {
        radio.addEventListener("change", handlePaymentMethodChange);
    });

    document.getElementById("cardNumber").addEventListener("input", (e) => {
        let value = e.target.value.replace(/\s/g, "");
        e.target.value = value.replace(/(.{4})/g, "$1 ").trim();
    });

    document.getElementById("expiryDate").addEventListener("input", (e) => {
        let value = e.target.value.replace(/\D/g, "");
        if (value.length >= 2) {
            value = value.substring(0, 2) + "/" + value.substring(2, 4);
        }
        e.target.value = value;
    });

    document.getElementById("cvv").addEventListener("input", (e) => {
        e.target.value = e.target.value.replace(/\D/g, "").substring(0, 3);
    });

    document.getElementById("paymentForm").addEventListener("submit", handlePaymentSubmit);
});

function handlePaymentMethodChange(e) {
    const method = e.target.value;
    const cardSection = document.getElementById("cardPaymentSection");
    const cashSection = document.getElementById("cashPaymentSection");
    const submitBtn = document.querySelector("button[type='submit']");
    const cardInputs = cardSection.querySelectorAll("input[required]");

    if (method === "card") {
        cardSection.style.display = "block";
        cashSection.style.display = "none";
        submitBtn.textContent = "Complete Payment";
        submitBtn.style.background = "var(--button-color)";

        cardInputs.forEach(input => input.setAttribute("required", "required"));
    }

    if (method === "cash") {
        cardSection.style.display = "none";
        cashSection.style.display = "block";
        submitBtn.textContent = "Confirm Booking (Pay Cash)";
        submitBtn.style.background = "#28a745";

        cardInputs.forEach(input => input.removeAttribute("required"));
    }
}

function luhnCheck(cardNumber) {
    let sum = 0;
    let isEven = false;

    for (let i = cardNumber.length - 1; i >= 0; i--) {
        let n = parseInt(cardNumber.charAt(i), 10);

        if (isEven) {
            n *= 2;
            if (n > 9) n -= 9;
        }

        sum += n;
        isEven = !isEven;
    }

    return sum % 10 === 0;
}

function validateCardExpiry(expiryDate) {
    const [month, year] = expiryDate.split("/");
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;

    const expYear = parseInt(year, 10);
    const expMonth = parseInt(month, 10);

    if (expMonth < 1 || expMonth > 12) return false;
    if (expYear < currentYear) return false;
    if (expYear === currentYear && expMonth < currentMonth) return false;

    return true;
}

function validatePaymentForm() {
    const selectedMethod = document.querySelector("input[name='paymentMethod']:checked");

    if (!selectedMethod) {
        alert("Please select a payment method.");
        return false;
    }

    const method = selectedMethod.value;

    if (method === "card") {
        const cardNumber = document.getElementById("cardNumber").value.replace(/\s/g, "");
        const expiryDate = document.getElementById("expiryDate").value;
        const cvv = document.getElementById("cvv").value;

        if (cardNumber.length !== 16) {
            alert("❌ Please enter a valid 16-digit card number");
            return false;
        }

        if (!luhnCheck(cardNumber)) {
            alert("❌ Card number failed validation. Please check and try again.");
            return false;
        }

        if (!expiryDate.match(/^\d{2}\/\d{2}$/)) {
            alert("❌ Please enter expiry date in MM/YY format");
            return false;
        }

        if (!validateCardExpiry(expiryDate)) {
            alert("❌ Card expiry date is invalid or expired");
            return false;
        }

        if (cvv.length !== 3) {
            alert("❌ Please enter a valid 3-digit CVV");
            return false;
        }
    }

    return true;
}

async function handlePaymentSubmit(e) {
    e.preventDefault();

    if (!validatePaymentForm()) {
        return;
    }

    const currentUser = requireLogin();

    if (!currentUser) {
        return;
    }

    const bookingData = JSON.parse(sessionStorage.getItem("pendingBooking") || "null");

    if (!bookingData) {
        alert("Booking data expired. Please try booking again.");
        window.location.href = "listings.html";
        return;
    }

    const selectedMethod = document.querySelector("input[name='paymentMethod']:checked");
    const method = selectedMethod.value;

    const btn = e.target.querySelector("button[type='submit']");
    btn.disabled = true;
    btn.textContent = method === "card" ? "Processing..." : "Confirming...";

    try {
        const result = await apiRequest("/Bookings/create", "POST", {
            propertyId: bookingData.propertyId,
            checkInDate: cleanDate(bookingData.checkInDate),
            checkOutDate: cleanDate(bookingData.checkOutDate),
            guests: Number(bookingData.guests),
            paymentMethod: method
        });

        sessionStorage.setItem("paymentConfirmation", JSON.stringify({
            confirmationNumber: result.bookingId,
            bookingData,
            paymentMethod: method,
            total: result.total
        }));

        sessionStorage.removeItem("pendingBooking");

        alert(result.message);

        window.location.href = "payment-confirmation.html";

    } catch (error) {
        btn.disabled = false;
        btn.textContent = method === "card" ? "Complete Payment" : "Confirm Booking (Pay Cash)";
        alert("❌ " + error.message);
    }
}

function cleanDate(value) {
    if (!value) return "";

    if (typeof value === "string" && value.includes("T")) {
        return value.split("T")[0];
    }

    return value;
}

function formatDate(value) {
    if (!value) return "N/A";
    return new Date(value).toLocaleDateString();
}