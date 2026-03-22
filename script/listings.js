// ===== DISPLAY ALL PROPERTIES (EXCEPT OWN) ===== //
function displayAllListings() {
    const container = document.querySelector('.listings-grid');
    if (!container) return;

    const currentUser = localStorage.getItem('currentUser');
    const allProperties = JSON.parse(localStorage.getItem('properties')) || [];
    
    // Filter: only show properties from OTHER users
    let otherUsersProperties = allProperties;
    
    if (currentUser) {
        const user = JSON.parse(currentUser);
        otherUsersProperties = allProperties.filter(prop => prop.owner !== user.username);
    }

    container.innerHTML = "";

    if (otherUsersProperties.length === 0) {
        container.innerHTML = "<p style='text-align:center; font-size:18px;'>No properties available right now.</p>";
        return;
    }

    otherUsersProperties.forEach(property => {
        const img = property.images && property.images.length 
            ? property.images[0] 
            : '../images/Logo.png';

        container.innerHTML += `
            <div class="card">
                <div class="image-slider">
                    <img id="img-${property.id}" src="${img}">    
                    <div class="dots">
                    ${(property.images && property.images.length ? property.images : ['../images/Logo.png']).map((_, index) => `
                        <span class="dot ${index === 0 ? 'active' : ''}" 
                              onclick="goToListingImg(${property.id}, ${index})"></span>
                    `).join('')}
                    </div>
                </div>

                <div class="card-info">
                    <h4>${property.title}</h4>
                    <p><strong>Location:</strong> ${property.city}</p>
                    <p><strong>Price:</strong> €${property.price} / night</p>
                    <p style="font-size:12px; color:gray;">By: ${property.ownerName}</p>
                    <button onclick="bookProperty(${property.id})" class="book-btn">📅 Book Now</button>
                </div>
            </div>
        `;
    });
}

// ===== IMAGE SLIDER FOR LISTINGS ===== //
function goToListingImg(id, index) {
    const allProperties = JSON.parse(localStorage.getItem('properties')) || [];
    const property = allProperties.find(p => p.id === id);
    if (!property || !property.images) return;

    document.getElementById(`img-${id}`).src = property.images[index];

    const slider = document.getElementById(`img-${id}`).parentElement;
    const dots = slider.querySelectorAll(".dot");

    dots.forEach((dot, i) => {
        if (i === index) {
            dot.classList.add("active");
        } else {
            dot.classList.remove("active");
        }
    });
}

// ===== BOOK PROPERTY ===== //
function bookProperty(propertyId) {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        alert('❌ Please log in to book a property!');
        window.location.href = 'login.html';
        return;
    }

    const allProperties = JSON.parse(localStorage.getItem('properties')) || [];
    const property = allProperties.find(p => p.id === propertyId);
    
    if (!property) return;

    alert(`✅ Booking request sent for "${property.title}" in ${property.city}!\n\nContact owner: ${property.ownerName}`);
}

// ===== LOAD ON PAGE LOAD ===== //
document.addEventListener('DOMContentLoaded', displayAllListings);