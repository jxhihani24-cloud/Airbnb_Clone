// ===== LOAD BOOKING DATA =====
document.addEventListener("DOMContentLoaded", () => {
    const storage = window.AppStorage;
    const bookingData = storage
        ? storage.getSS("pendingBooking", null)
        : JSON.parse(sessionStorage.getItem("pendingBooking") || "null");
    
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

// ===== LUHN ALGORITHM FOR CARD VALIDATION =====
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

// ===== VALIDATE CARD EXPIRY =====
function validateCardExpiry(expiryDate) {
    const [month, year] = expiryDate.split('/');
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;
    
    const expYear = parseInt(year, 10);
    const expMonth = parseInt(month, 10);
    
    // Check if year is valid (not in past)
    if (expYear < currentYear) return false;
    // Check if month is valid (not in past for current year)
    if (expYear === currentYear && expMonth < currentMonth) return false;
    // Check month is between 01-12
    if (expMonth < 1 || expMonth > 12) return false;
    
    return true;
}

// ===== VALIDATE PAYMENT FORM =====
function validatePaymentForm() {
    const method = document.querySelector("input[name='paymentMethod']:checked").value;

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

// ===== HANDLE PAYMENT SUBMISSION =====
function handlePaymentSubmit(e) {
    const storage = window.AppStorage;
    e.preventDefault();

    if (!validatePaymentForm()) return;

    const method = document.querySelector("input[name='paymentMethod']:checked").value;

    // Show loading state
    const btn = e.target.querySelector("button[type='submit']");
    btn.disabled = true;
    btn.textContent = method === "card" ? "Processing..." : "Confirming...";

    // Simulate payment processing
    const processingTime = method === "card" ? 2000 : 1500;
    
    setTimeout(() => {
        // Get form data
        const guestName = document.getElementById("guestName").value;
        const guestEmail = document.getElementById("guestEmail").value;
        const guestPhone = document.getElementById("guestPhone").value;
        const bookingData = storage
            ? storage.getSS("pendingBooking", null)
            : JSON.parse(sessionStorage.getItem("pendingBooking") || "null");

        if (!bookingData) {
            alert("Booking data expired. Please try booking again.");
            window.location.href = "listings.html";
            return;
        }

        // Check if property is still available for selected dates
        const allBookings = storage
            ? storage.getLS("bookings", [])
            : JSON.parse(localStorage.getItem("bookings") || "[]");
        
        if (storage && storage.checkDateOverlap) {
            if (storage.checkDateOverlap(bookingData.propertyId, bookingData.checkInDate, bookingData.checkOutDate, allBookings)) {
                alert("❌ This property is no longer available for the selected dates. Someone else booked it!");
                window.location.href = "listings.html";
                return;
            }
        }

        // Create payment record
        const payment = {
            id: Date.now(),
            guestName: guestName,
            guestEmail: guestEmail,
            guestPhone: guestPhone,
            bookingData: bookingData,
            paymentDate: new Date().toISOString(),
            confirmationNumber: "CONF" + Math.random().toString(36).substring(2, 9).toUpperCase(),
            paymentMethod: method,
            status: method === "card" ? "Completed" : "Pending",
            paymentNotes: method === "cash" ? "To be paid in cash at check-in" : ""
        };

        // Store in localStorage
        const payments = storage
            ? storage.getLS("payments", [])
            : JSON.parse(localStorage.getItem("payments") || "[]");
        payments.push(payment);
        if (storage) storage.setLS("payments", payments);
        else localStorage.setItem("payments", JSON.stringify(payments));

        // Store payment info for confirmation page
        if (storage) storage.setSS("paymentConfirmation", payment);
        else sessionStorage.setItem("paymentConfirmation", JSON.stringify(payment));

        // Create the actual booking
        const user = storage
            ? storage.getCurrentUser()
            : JSON.parse(localStorage.getItem("currentUser") || "null");
        const bookings = storage
            ? storage.getLS("bookings", [])
            : JSON.parse(localStorage.getItem("bookings") || "[]");

        if (!user) {
            alert("Session expired. Please log in again.");
            window.location.href = "login.html";
            return;
        }

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
            bookingDate: new Date().toISOString(),
            checkInDate: bookingData.checkInDate,
            checkOutDate: bookingData.checkOutDate,
            guests: bookingData.guests,
            status: method === "card" ? "Confirmed" : "Pending Payment",
            paymentStatus: method === "card" ? "Paid" : "Cash Payment Pending",
            paymentMethod: method,
            paymentId: payment.id
        };

        bookings.push(booking);
        if (storage) storage.setLS("bookings", bookings);
        else localStorage.setItem("bookings", JSON.stringify(bookings));

        // Send welcome message from host
        sendHostWelcomeMessage(booking, user);

        // Clear pending booking from session
        sessionStorage.removeItem("pendingBooking");

        // Redirect to confirmation page
        window.location.href = "payment-confirmation.html";
    }, processingTime);
}

// ===== SEND HOST WELCOME MESSAGE =====
function sendHostWelcomeMessage(booking, user) {
    const storage = window.AppStorage;
    const conversations = storage
        ? storage.getLS("conversations", [])
        : JSON.parse(localStorage.getItem("conversations") || "[]");
    
    // Check if conversation already exists
    const existingConv = conversations.find(c => 
        c.userId === user.username && c.propertyId === booking.propertyId
    );
    
    if (existingConv) {
        // Add welcome message to existing conversation
        addWelcomeMessageToConversation(existingConv, booking);
    } else {
        // Create new conversation with welcome message
        const newConversation = {
            id: Date.now(),
            userId: user.username,
            propertyId: booking.propertyId,
            hostName: booking.owner,
            propertyTitle: booking.propertyTitle,
            messages: []
        };
        
        addWelcomeMessageToConversation(newConversation, booking);
        conversations.unshift(newConversation);
    }
    
    if (storage) storage.setLS("conversations", conversations);
    else localStorage.setItem("conversations", JSON.stringify(conversations));
}

function addWelcomeMessageToConversation(conversation, booking) {
    // Get personalized welcome messages based on the booking
    const welcomeMessages = [
        `Hi there! 🎉 Welcome to ${conversation.propertyTitle}! I'm ${conversation.hostName}, your host. Your booking for ${booking.checkInDate} to ${booking.checkOutDate} is confirmed. I can't wait to welcome you! 🏠✨`,
        `Hello! Thank you for choosing ${conversation.propertyTitle}. I'm ${conversation.hostName} and I'm excited to host you from ${booking.checkInDate} to ${booking.checkOutDate}. If you have any questions before your arrival, feel free to ask! 😊`,
        `Welcome to ${conversation.propertyTitle}! I'm ${conversation.hostName}, and I'm thrilled you're staying with us for ${booking.guests} guest${booking.guests > 1 ? 's' : ''}. The property is ready for you - let me know if you need any special arrangements! 🌟`,
        `Hi! Thanks for booking ${conversation.propertyTitle}. I'm ${conversation.hostName}, your host. Your stay from ${booking.checkInDate} to ${booking.checkOutDate} is all set. Can't wait to meet you and make your stay unforgettable! 🏡`,
        `Hello from ${conversation.propertyTitle}! I'm ${conversation.hostName} and I'm so excited you're coming to stay with us. Your booking is confirmed for ${booking.checkInDate}. Feel free to reach out with any questions! 🎉`
    ];
    
    const randomMessage = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
    
    const now = new Date();
    const timestamp = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const date = now.toISOString();
    
    const welcomeMessage = {
        sender: conversation.hostName,
        text: randomMessage,
        timestamp: timestamp,
        date: date,
        isHostMessage: true
    };
    
    conversation.messages.push(welcomeMessage);
}
