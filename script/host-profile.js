// Get properties data from parent window or localStorage
let allProperties = [];
const storage = window.AppStorage;

// Function to get all available properties (default + user-added)
function getAllProperties() {
    // Get default properties from window if available, otherwise use fallback
    const defaultProps = window.defaultPropertiesData || getDefaultProperties();

    // Get user-added properties from localStorage
    const userProps = storage
        ? storage.getLS("properties", [])
        : JSON.parse(localStorage.getItem("properties") || "[]");

    // Merge both lists
    return [...defaultProps, ...userProps];
}

// ===== REVIEWS MANAGEMENT =====
function getReviewsByHost(hostUsername) {
    const reviews = storage
        ? storage.getLS("hostReviews", [])
        : JSON.parse(localStorage.getItem("hostReviews") || "[]");
    return reviews.filter(r => r.hostUsername === hostUsername);
}

function getHostAverageRating(hostUsername) {
    const reviews = getReviewsByHost(hostUsername);
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / reviews.length).toFixed(1);
}

function addHostReview(hostUsername, hostName, rating, reviewText) {
    const user = storage
        ? storage.getCurrentUser()
        : JSON.parse(localStorage.getItem("currentUser") || "null");
    if (!user) {
        alert("Please log in to leave a review");
        return false;
    }

    const hostReviews = storage
        ? storage.getLS("hostReviews", [])
        : JSON.parse(localStorage.getItem("hostReviews") || "[]");

    const newReview = {
        id: Date.now(),
        hostUsername: hostUsername,
        hostName: hostName,
        rating: rating,
        text: reviewText,
        reviewer: user.firstName + " " + user.lastName,
        reviewerUsername: user.username,
        date: new Date().toISOString(),
        createdAt: new Date().toISOString()
    };

    hostReviews.push(newReview);
    if (storage) storage.setLS("hostReviews", hostReviews);
    else localStorage.setItem("hostReviews", JSON.stringify(hostReviews));
    return true;
}

function displayHostReviews(hostUsername) {
    const reviews = getReviewsByHost(hostUsername);
    const reviewsList = document.getElementById("hostReviewsList");
    reviewsList.innerHTML = "";

    if (reviews.length === 0) {
        reviewsList.innerHTML = "<p style='opacity: 0.7; text-align: center;'>No reviews yet. Be the first to review this host!</p>";
        return;
    }

    reviews.forEach(review => {
        const stars = "★".repeat(review.rating) + "☆".repeat(5 - review.rating);
        const reviewEl = document.createElement("div");
        reviewEl.style.cssText = "background: rgba(255,255,255,0.05); padding: 14px; border-radius: 10px; border: 1px solid var(--border-color);";
        reviewEl.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                <div>
                    <p style="margin: 0; font-weight: 600;">${review.reviewer}</p>
                    <span style="font-size: 12px; opacity: 0.7;">${storage ? storage.toDisplayDate(review.date) : review.date}</span>
                </div>
                <span style="color: var(--button-color); font-size: 14px;">${stars}</span>
            </div>
            <p style="margin: 8px 0 0 0; font-size: 14px; line-height: 1.5;">${review.text}</p>
        `;
        reviewsList.appendChild(reviewEl);
    });
}

// Get host ID from URL parameters
function getHostIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("host");
}

// Display host profile
function displayHostProfile(hostId) {
    // Get all properties - try to get from window first, then use fallback
    allProperties = getAllProperties();

    if (allProperties.length === 0) {
        // Fallback: use the properties defined in parent window or a default list
        allProperties = window.propertiesData || getDefaultProperties();
    }

    // Find all properties by this host
    const hostProperties = allProperties.filter(p => p.owner === hostId);

    if (hostProperties.length === 0) {
        document.querySelector(".container").innerHTML = "<p style='text-align:center; font-size:18px;'>Host not found or has no properties.</p>";
        return;
    }

    // Get unique host information from first property
    const hostInfo = hostProperties[0];

    // Update host profile
    document.getElementById("hostName").textContent = hostInfo.ownerName;
    document.getElementById("totalProperties").textContent = hostProperties.length;

    // Generate avatar with initials
    const initials = hostInfo.ownerName.split(' ').map(n => n[0]).join('');
    document.getElementById("hostAvatar").textContent = initials;

    // Set some stats (can be hardcoded or dynamic)
    const hostReviews = getReviewsByHost(hostId);
    const avgHostRating = getHostAverageRating(hostId);

    document.getElementById("totalReviews").textContent = hostReviews.length;
    document.getElementById("avgRating").textContent = avgHostRating > 0 ? avgHostRating : "0";

    // Display host reviews
    displayHostReviews(hostId);

    // Set description
    const descriptions = {
        alice: "Passionate about sharing beautiful Parisian apartments with travelers from around the world.",
        bob: "Experienced host with premium properties in the heart of New York City.",
        carol: "Traditional Japanese hospitality specialist with authentic property experiences.",
        dave: "Beach lover offering stunning tropical getaways in beautiful Bali.",
        eve: "Mountain enthusiast providing luxury Alpine experiences in Switzerland.",
        frank: "Luxury property curator specializing in high-end Parisian accommodations.",
        grace: "Penthouse specialist offering stunning New York skyline views.",
        haru: "Traditional Ryokan expert preserving authentic Japanese culture and hospitality.",
        ivan: "Villa expert creating memorable tropical experiences in Ubud.",
        julia: "Swiss hospitality professional with premium Alpine properties.",
        kadek: "Balinese host dedicated to providing authentic tropical island experiences.",
        lukas: "Mountain specialist offering cozy Alpine cabin retreats.",
        michael: "Urban explorer providing modern city living experiences.",
        yuki: "Tokyo local sharing authentic Japanese city living.",
        david: "New York specialist offering contemporary urban apartments.",
        marie: "Parisian expert with stunning Eiffel Tower view properties.",
        john: "Manhattan luxury specialist delivering premium penthouse experiences.",
        carol: "Japanese culture enthusiast sharing traditional experiences.",
        made: "Balinese luxury villa expert creating premium tropical getaways.",
        luca: "Swiss Alpine specialist offering exclusive mountain retreats.",
        emma: "London host providing charming central city accommodations.",
        marco: "Roman history enthusiast offering authentic Italian experiences.",
        sofia: "Barcelona beach expert providing Mediterranean getaways.",
        liam: "Sydney waterfront specialist offering ocean view luxury.",
        noah: "Vancouver nature lover providing forest retreat experiences.",
        ana: "Rio hospitality expert offering vibrant beachfront experiences.",
        chai: "Thai island specialist providing tropical villa experiences.",
        ahmed: "Dubai luxury specialist offering premium Marina properties.",
        nikos: "Greek island expert providing stunning Santorini experiences.",
        youssef: "Moroccan culture enthusiast sharing traditional Riad experiences."
    };

    document.getElementById("hostDescription").textContent = descriptions[hostId] || "Professional host dedicated to providing excellent guest experiences.";

    // Display host properties
    displayHostProperties(hostProperties);
}

// Display properties for this host
function displayHostProperties(properties) {
    const container = document.getElementById("hostProperties");
    container.innerHTML = "";

    properties.forEach(property => {
        const img = property.images && property.images.length ? property.images[0] : "https://picsum.photos/400/300?random=99";

        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <img src="${img}" alt="${property.title}">
            <div class="card-info">
                <h4>${property.title}</h4>
                <p><strong>Location:</strong> ${property.city}</p>
                <p><strong>Price:</strong> €${property.price} / night</p>
                <div class="card-buttons">
                    <button class="view-details-btn" style="background-color: #666;">View Details</button>
                    <button class="book-btn" style="background-color:var(--button-color)">📅 Book Now</button>
                </div>
            </div>
        `;

        // View details button
        card.querySelector(".view-details-btn").addEventListener("click", (e) => {
            e.stopPropagation();
            // Redirect to listings page with this property ID
            window.location.href = `listings.html?id=${property.id}`;
        });

        // Book button
        card.querySelector(".book-btn").addEventListener("click", (e) => {
            e.stopPropagation();
            window.location.href = `listings.html?id=${property.id}`;
        });

        container.appendChild(card);
    });
}

// Fallback function with default properties (same as in listings.js)
function getDefaultProperties() {
    return [
        { id: 1, title: "Cozy Apartment in Paris", city: "Paris", country: "france", owner: "alice", ownerName: "Alice Dubois", price: 120, images: ["https://picsum.photos/400/300?random=1", "https://picsum.photos/400/300?random=1a", "https://picsum.photos/400/300?random=1b", "https://picsum.photos/400/300?random=1c"] },
        { id: 2, title: "Modern Loft in New York", city: "New York", country: "usa", owner: "bob", ownerName: "Bob Carter", price: 150, images: ["https://picsum.photos/400/300?random=2", "https://picsum.photos/400/300?random=2a", "https://picsum.photos/400/300?random=2b"] },
        { id: 3, title: "Traditional House in Tokyo", city: "Tokyo", country: "japan", owner: "carol", ownerName: "Carol Tanaka", price: 100, images: ["https://picsum.photos/400/300?random=3", "https://picsum.photos/400/300?random=3a", "https://picsum.photos/400/300?random=3b", "https://picsum.photos/400/300?random=3c", "https://picsum.photos/400/300?random=3d"] },
        { id: 4, title: "Beach House in Bali", city: "Bali", country: "indonesia", owner: "dave", ownerName: "Dave Santoso", price: 180, images: ["https://picsum.photos/400/300?random=4", "https://picsum.photos/400/300?random=4a"] },
        { id: 5, title: "Mountain Cabin in Switzerland", city: "Zermatt", country: "switzerland", owner: "eve", ownerName: "Eve Meier", price: 220, images: ["https://picsum.photos/400/300?random=5", "https://picsum.photos/400/300?random=5a"] },
        { id: 6, title: "Luxury Apartment in Paris", city: "Paris", country: "france", owner: "frank", ownerName: "Frank Dupont", price: 200, images: ["https://picsum.photos/400/300?random=6", "https://picsum.photos/400/300?random=6a"] },
        { id: 7, title: "Penthouse in New York", city: "New York", country: "usa", owner: "grace", ownerName: "Grace Miller", price: 300, images: ["https://picsum.photos/400/300?random=7", "https://picsum.photos/400/300?random=7a"] },
        { id: 8, title: "Ryokan in Kyoto", city: "Kyoto", country: "japan", owner: "haru", ownerName: "Haru Sato", price: 130, images: ["https://picsum.photos/400/300?random=8", "https://picsum.photos/400/300?random=8a"] },
        { id: 9, title: "Villa in Ubud", city: "Ubud", country: "indonesia", owner: "ivan", ownerName: "Ivan Wijaya", price: 210, images: ["https://picsum.photos/400/300?random=9", "https://picsum.photos/400/300?random=9a"] },
        { id: 10, title: "Chalet in Geneva", city: "Geneva", country: "switzerland", owner: "julia", ownerName: "Julia Keller", price: 250, images: ["https://picsum.photos/400/300?random=10", "https://picsum.photos/400/300?random=10a"] },
        { id: 11, title: "Beach House", city: "Bali", country: "indonesia", owner: "kadek", ownerName: "Kadek Putra", price: 120, images: ["https://tinyurl.com/4sz54rfv", "https://tinyurl.com/4sz54rfv", "https://tinyurl.com/4sz54rfv"] },
        { id: 12, title: "Mountain Cabin", city: "Zermatt", country: "switzerland", owner: "lukas", ownerName: "Lukas Steiner", price: 90, images: ["https://tinyurl.com/h8nbnw6z", "https://tinyurl.com/h8nbnw6z", "https://tinyurl.com/h8nbnw6z"] },
        { id: 13, title: "City Apartment", city: "New York", country: "usa", owner: "michael", ownerName: "Michael Johnson", price: 150, images: ["https://th.bing.com/th/id/R.884ee6730df0d9a1450e15cff40d6582?rik=7cKmbRU%2BNHh92w&pid=ImgRaw&r=0", "https://th.bing.com/th/id/R.884ee6730df0d9a1450e15cff40d6582?rik=7cKmbRU%2BNHh92w&pid=ImgRaw&r=0"] },
        { id: 14, title: "Apartment in Tokyo", city: "Tokyo", country: "japan", owner: "yuki", ownerName: "Yuki Nakamura", price: 80, images: ["https://tinyurl.com/bdetzwrv", "https://tinyurl.com/bdetzwrv"] },
        { id: 15, title: "Skyscraper Studio Apartment", city: "New York", country: "usa", owner: "david", ownerName: "David Smith", price: 145, images: ["images/skyscraper.webp", "https://images/skyscraper.webp"] },
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
}

// Initialize page
document.addEventListener("DOMContentLoaded", () => {
    const hostId = getHostIdFromURL();

    if (!hostId) {
        document.querySelector(".container").innerHTML = "<p style='text-align:center; font-size:18px;'>No host specified. Please go back and select a host.</p>";
        return;
    }

    displayHostProfile(hostId);

    // Setup host review modal
    let currentHostIdForReview = hostId;
    let currentHostNameForReview = "";

    // Get host name from the page
    setTimeout(() => {
        currentHostNameForReview = document.getElementById("hostName").textContent;

        // Review button
        const hostReviewBtn = document.getElementById("hostReviewBtn");
        if (hostReviewBtn) {
            hostReviewBtn.addEventListener("click", () => {
                openHostReviewModal(hostId, currentHostNameForReview);
            });
        }
    }, 100);

    // Close review modal buttons
    const reviewModalClose = document.querySelector(".host-review-modal-close");
    if (reviewModalClose) {
        reviewModalClose.addEventListener("click", closeHostReviewModal);
    }

    const hostReviewModal = document.getElementById("hostReviewModal");
    if (hostReviewModal) {
        hostReviewModal.addEventListener("click", (e) => {
            if (e.target.id === "hostReviewModal") {
                closeHostReviewModal();
            }
        });
    }

    // Star rating for host review
    let hostSelectedRating = 0;
    document.querySelectorAll("#hostStarRating .host-star").forEach(star => {
        star.addEventListener("click", function() {
            hostSelectedRating = parseInt(this.dataset.value);
            document.querySelectorAll("#hostStarRating .host-star").forEach((s, index) => {
                s.style.opacity = index < hostSelectedRating ? "1" : "0.3";
            });
            document.getElementById("hostSelectedRating").textContent = hostSelectedRating + " star" + (hostSelectedRating !== 1 ? "s" : "");
            document.getElementById("hostSelectedRating").style.color = "var(--button-color)";
        });

        star.addEventListener("mouseenter", function() {
            const hoverRating = parseInt(this.dataset.value);
            document.querySelectorAll("#hostStarRating .host-star").forEach((s, index) => {
                s.style.opacity = index < hoverRating ? "0.8" : "0.3";
            });
        });

        star.addEventListener("mouseleave", function() {
            document.querySelectorAll("#hostStarRating .host-star").forEach((s, index) => {
                s.style.opacity = index < hostSelectedRating ? "1" : "0.3";
            });
        });
    });

    // Submit host review
    const submitHostReviewBtn = document.getElementById("submitHostReviewBtn");
    if (submitHostReviewBtn) {
        submitHostReviewBtn.addEventListener("click", () => {
            if (hostSelectedRating === 0) {
                alert("Please select a rating");
                return;
            }

            const reviewText = document.getElementById("hostReviewText").value.trim();
            if (!reviewText) {
                alert("Please write a review");
                return;
            }

            if (addHostReview(currentHostIdForReview, currentHostNameForReview, hostSelectedRating, reviewText)) {
                alert("✅ Review submitted successfully!");
                closeHostReviewModal();
                // Refresh reviews
                displayHostReviews(currentHostIdForReview);
                const hostReviews = getReviewsByHost(currentHostIdForReview);
                document.getElementById("totalReviews").textContent = hostReviews.length;
                const avgHostRating = getHostAverageRating(currentHostIdForReview);
                document.getElementById("avgRating").textContent = avgHostRating > 0 ? avgHostRating : "0";
            }
        });
    }
});

// ===== HOST REVIEW MODAL FUNCTIONS =====
function openHostReviewModal(hostId, hostName) {
    document.getElementById("hostSelectedRating").textContent = "Select a rating";
    document.getElementById("hostReviewText").value = "";
    document.querySelectorAll("#hostStarRating .host-star").forEach(star => {
        star.style.opacity = "0.3";
    });
    document.getElementById("hostReviewModal").classList.add("show");
}

function closeHostReviewModal() {
    document.getElementById("hostReviewModal").classList.remove("show");
}
