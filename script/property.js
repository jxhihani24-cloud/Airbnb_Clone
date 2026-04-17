// ===== MIGRATE OLD DATA TO NEW STORAGE ===== //
const storage = window.AppStorage;

function getCurrentSessionUser() {
    return storage
        ? storage.getCurrentUser()
        : JSON.parse(localStorage.getItem('currentUser') || 'null');
}

function getStoredProperties() {
    return storage
        ? storage.getLS('properties', [])
        : JSON.parse(localStorage.getItem('properties') || '[]');
}

function setStoredProperties(properties) {
    if (storage) storage.setLS('properties', properties);
    else localStorage.setItem('properties', JSON.stringify(properties));
}

document.addEventListener('DOMContentLoaded', () => {
    const oldProperties = localStorage.getItem('myProperties');
    
    if (oldProperties) {
            try {
                let allProperties = getStoredProperties();
                const oldData = JSON.parse(oldProperties);
                const user = getCurrentSessionUser();
                
                if (user && user.username) {
                    oldData.forEach(prop => {
                        if (!prop.owner) {
                            prop.owner = user.username || "Unknown";
                            prop.ownerName = ((user.firstName || "") + " " + (user.lastName || "")).trim() || "Anonymous";
                            prop.createdAt = prop.createdAt || new Date().toISOString();
                        }
                    });
                    
                    allProperties = [...oldData, ...allProperties];
                    setStoredProperties(allProperties);
                    localStorage.removeItem('myProperties');
                    
                    console.log('✅ Data migrated successfully!');
                }
            } catch (error) {
                console.error('Error during data migration:', error);
            }
    }
});

// ===== CHECK IF USER IS LOGGED IN ===== //
function checkUserLogin() {
    const currentUser = getCurrentSessionUser();
    if (!currentUser) {
        alert('❌ You must be logged in to post properties!');
        window.location.href = 'login.html';
        return null;
    }
    return currentUser;
}

// ===== GET ONLY CURRENT USER'S PROPERTIES ===== //
function getMyProperties() {
    const currentUser = getCurrentSessionUser();
    if (!currentUser) return [];
    
    return getStoredProperties().filter(prop => prop.owner === currentUser.username);
}

// ===== RENDER MY PROPERTIES ===== //
function renderMyProperties() {
    const container = document.getElementById("myProperties");
    if (!container) return;

    const currentUser = getCurrentSessionUser();
    if (!currentUser) {
        container.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger text-center">
                    Please <a href="login.html" class="alert-link">log in</a> to view your properties.
                </div>
            </div>
        `;
        return;
    }

    const myProperties = getMyProperties();
    container.innerHTML = "";

    if (myProperties.length === 0) {
        container.innerHTML = `
            <div class="col-12">
                <div class="alert alert-light text-center">
                    No properties yet. Click the <strong>+</strong> button to add one.
                </div>
            </div>
        `;
        return;
    }

    myProperties.forEach(item => {
        const img = item.images && item.images.length
            ? item.images[0]
            : "../images/Logo.png";

        const shortDescription = item.description
            ? item.description.length > 90
                ? item.description.slice(0, 90) + "..."
                : item.description
            : "No description added yet.";

        container.innerHTML += `
            <div class="col-12 col-md-6 col-xl-4">
                <div class="card property-card h-100 border-0 shadow-sm overflow-hidden">
                    <img src="${img}" class="card-img-top property-card-img" alt="${item.title}">

                    <div class="card-body d-flex flex-column">
                        <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
                            <h5 class="card-title mb-0">${item.title}</h5>
                            <span class="badge property-type">${item.propertyType}</span>
                        </div>

                        <p class="text-muted mb-2">${item.city}, ${item.country}</p>

                        <div class="property-meta mb-3">
                            <span>👥 ${item.guests || 0} guests</span>
                            <span>🛏️ ${item.bedrooms || 0} bedrooms</span>
                            <span>🛁 ${item.bathrooms || 0} bathrooms</span>
                        </div>

                        <p class="card-text small flex-grow-1">${shortDescription}</p>

                        <div class="d-flex justify-content-between align-items-center mt-3">
                            <strong class="fs-5">€${item.price}/night</strong>
                        </div>

                        <div class="d-flex gap-2 mt-3">
                            <button onclick="editProperty(${item.id})" class="btn btn-outline-primary btn-sm w-50" style="border-color:#1b1ee2;font-weight:bold;background-color:#1b1ee2;color:white">
                                Edit
                                    </button>
                            <button onclick="removeProperty(${item.id})" class="btn btn-outline-danger btn-sm w-50" style="font-weight:bold;background-color:#e0262d;color:white">
                                Delete </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
}

// ===== POST PROPERTY ===== //
function postProperty() {
    const currentUser = getCurrentSessionUser();
    if (!currentUser) {
        alert('❌ You must be logged in!');
        window.location.href = 'login.html';
        return;
    }

    const user = currentUser;

    const title = document.getElementById("title").value.trim();
    const city = document.getElementById("city").value.trim();
    const country = document.getElementById("country").value.trim();
    const propertyType = document.getElementById("propertyType").value;
    const price = document.getElementById("price").value.trim();
    const guests = document.getElementById("guests").value.trim();
    const bedrooms = document.getElementById("bedrooms").value.trim();
    const bathrooms = document.getElementById("bathrooms").value.trim();
    const description = document.getElementById("description").value.trim();
    const amenitiesInput = document.getElementById("amenities").value.trim();
    const imagesInput = document.getElementById("images").value.trim();

    if (!title || !city || !country || !propertyType || !price) {
        alert("❌ Please fill in all required fields!");
        return;
    }

    const images = imagesInput
        ? imagesInput.split(",").map(img => img.trim()).filter(Boolean)
        : ["../images/Logo.png"];

    const amenities = amenitiesInput
        ? amenitiesInput.split(",").map(item => item.trim()).filter(Boolean)
        : [];

    const newListing = {
        id: Date.now(),
        title: title,
        city: city,
        country: country,
        propertyType: propertyType,
        price: Number(price),
        guests: guests ? Number(guests) : 0,
        bedrooms: bedrooms ? Number(bedrooms) : 0,
        bathrooms: bathrooms ? Number(bathrooms) : 0,
        description: description,
        amenities: amenities,
        images: images,
        owner: user.username,
        ownerName: user.firstName + ' ' + user.lastName,
        createdAt: new Date().toISOString()
    };

    let allProperties = getStoredProperties();
    allProperties.push(newListing);
    setStoredProperties(allProperties);

    alert('✅ Property posted!');
    clearPropertyForm();
    //toggleModal();
    const modal = bootstrap.Modal.getInstance(document.getElementById('addPropertyModal'));
modal.hide();
    renderMyProperties();
}

function clearPropertyForm() {
    document.getElementById("title").value = "";
    document.getElementById("city").value = "";
    document.getElementById("country").value = "";
    document.getElementById("propertyType").value = "";
    document.getElementById("price").value = "";
    document.getElementById("guests").value = "";
    document.getElementById("bedrooms").value = "";
    document.getElementById("bathrooms").value = "";
    document.getElementById("description").value = "";
    document.getElementById("amenities").value = "";
    document.getElementById("images").value = "";
}

// ===== MODAL TOGGLE ===== //
function toggleModal() {
    const modal = document.getElementById("modal");
    if (!modal) return;

    modal.classList.toggle("show");
}

// ===== REMOVE PROPERTY ===== //
function removeProperty(id) {
    if (!confirm('🗑️ Delete this property? This cannot be undone.')) return;
    if (!confirm('⚠️ This will delete all bookings, reviews, and messages for this property. Are you absolutely sure?')) return;
    
    try {
        // Use cascading delete from storage-utils
        if (window.AppStorage && typeof window.AppStorage.removeProperty === 'function') {
            window.AppStorage.removeProperty(id);
        } else {
            // Fallback if storage-utils not loaded
            let allProperties = getStoredProperties();
            allProperties = allProperties.filter(item => item.id !== id);
            setStoredProperties(allProperties);
        }
        
        alert('✅ Property and all related data deleted!');
        renderMyProperties();
    } catch (error) {
        console.error('Error deleting property:', error);
        alert('❌ Error deleting property. Please try again.');
    }
}

// ===== EDIT PROPERTY ===== //
function editProperty(id) {
    let allProperties = getStoredProperties();
    const property = allProperties.find(prop => prop.id === id);

    if (!property) return;

    document.getElementById("title").value = property.title || "";
    document.getElementById("city").value = property.city || "";
    document.getElementById("country").value = property.country || "";
    document.getElementById("propertyType").value = property.propertyType || "";
    document.getElementById("price").value = property.price || "";
    document.getElementById("guests").value = property.guests || "";
    document.getElementById("bedrooms").value = property.bedrooms || "";
    document.getElementById("bathrooms").value = property.bathrooms || "";
    document.getElementById("description").value = property.description || "";
    document.getElementById("amenities").value = property.amenities ? property.amenities.join(", ") : "";
    document.getElementById("images").value = property.images ? property.images.join(", ") : "";

    const postBtn = document.querySelector('.modal-content button');
    postBtn.textContent = 'Update';
    postBtn.onclick = () => updateProperty(id);

    //toggleModal();
    const modal = bootstrap.Modal.getInstance(document.getElementById('addPropertyModal'));
modal.hide();
}

// ===== UPDATE PROPERTY ===== //
function updateProperty(id) {
    const title = document.getElementById("title").value.trim();
    const city = document.getElementById("city").value.trim();
    const country = document.getElementById("country").value.trim();
    const propertyType = document.getElementById("propertyType").value;
    const price = document.getElementById("price").value.trim();
    const guests = document.getElementById("guests").value.trim();
    const bedrooms = document.getElementById("bedrooms").value.trim();
    const bathrooms = document.getElementById("bathrooms").value.trim();
    const description = document.getElementById("description").value.trim();
    const amenitiesInput = document.getElementById("amenities").value.trim();
    const imagesInput = document.getElementById("images").value.trim();

    if (!title || !city || !country || !propertyType || !price) {
        alert("❌ Please fill in all required fields!");
        return;
    }

    const images = imagesInput
        ? imagesInput.split(",").map(img => img.trim()).filter(Boolean)
        : ["../images/Logo.png"];

    const amenities = amenitiesInput
        ? amenitiesInput.split(",").map(item => item.trim()).filter(Boolean)
        : [];

    let allProperties = getStoredProperties();
    const idx = allProperties.findIndex(prop => prop.id === id);

    if (idx !== -1) {
        allProperties[idx].title = title;
        allProperties[idx].city = city;
        allProperties[idx].country = country;
        allProperties[idx].propertyType = propertyType;
        allProperties[idx].price = Number(price);
        allProperties[idx].guests = guests ? Number(guests) : 0;
        allProperties[idx].bedrooms = bedrooms ? Number(bedrooms) : 0;
        allProperties[idx].bathrooms = bathrooms ? Number(bathrooms) : 0;
        allProperties[idx].description = description;
        allProperties[idx].amenities = amenities;
        allProperties[idx].images = images;

        setStoredProperties(allProperties);

        alert('✅ Updated!');

        const postBtn = document.querySelector('.modal-content button');
        postBtn.textContent = 'Post';
        postBtn.onclick = postProperty;

        clearPropertyForm();
        //toggleModal();
        const modal = bootstrap.Modal.getInstance(document.getElementById('addPropertyModal'));
modal.hide();
        renderMyProperties();
    }
}

// ===== IMAGE SLIDER ===== //
function goToImg(id, index) {
    let allProperties = getStoredProperties();
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

// ===== INIT PROPERTY PAGE ===== //
document.addEventListener("DOMContentLoaded", () => {
    renderMyProperties();
});

// EDIT PROPERTY //
function editProperty(id) {
    localStorage.setItem("editingPropertyId", id);
    window.location.href = "add-property.html";
}