// ===== MIGRATE OLD DATA TO NEW STORAGE ===== //
document.addEventListener('DOMContentLoaded', () => {
    const oldProperties = localStorage.getItem('myProperties');
    
    if (oldProperties) {
        let allProperties = JSON.parse(localStorage.getItem('properties')) || [];
        const oldData = JSON.parse(oldProperties);
        const currentUser = localStorage.getItem('currentUser');
        
        if (currentUser) {
            const user = JSON.parse(currentUser);
            
            oldData.forEach(prop => {
                if (!prop.owner) {
                    prop.owner = user.username;
                    prop.ownerName = user.firstName + ' ' + user.lastName;
                    prop.createdAt = new Date().toISOString();
                }
            });
            
            allProperties = [...oldData, ...allProperties];
            localStorage.setItem('properties', JSON.stringify(allProperties));
            localStorage.removeItem('myProperties');
            
            console.log('✅ Data migrated successfully!');
        }
    }
});

// ===== CHECK IF USER IS LOGGED IN ===== //
function checkUserLogin() {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        alert('❌ You must be logged in to post properties!');
        window.location.href = 'login.html';
        return null;
    }
    return JSON.parse(currentUser);
}

// ===== GET ONLY CURRENT USER'S PROPERTIES ===== //
function getMyProperties() {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) return [];
    
    const user = JSON.parse(currentUser);
    const allProperties = JSON.parse(localStorage.getItem('properties')) || [];
    return allProperties.filter(prop => prop.owner === user.username);
}

// ===== RENDER MY PROPERTIES ===== //
function renderMyProperties() {
    const container = document.getElementById("myProperties");
    if (!container) return;

    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        container.innerHTML = "<p style='text-align:center; font-size:18px; color:red;'>Please <a href='login.html'>log in</a> to view properties.</p>";
        return;
    }

    const myProperties = getMyProperties();
    container.innerHTML = "";

    if (myProperties.length === 0) {
        container.innerHTML = "<p style='text-align:center;'>No properties yet. Click + to add one!</p>";
        return;
    }

    myProperties.forEach(item => {
        const img = item.images && item.images.length 
            ? item.images[0] 
            : '../images/Logo.png';
            
        container.innerHTML += `
            <div class="card">
               <div class="image-slider">
                    <img id="img-${item.id}" src="${img}">    
                    <div class="dots">
                    ${(item.images && item.images.length ? item.images : ['../images/Logo.png']).map((_, index) => `
                        <span class="dot ${index === 0 ? 'active' : ''}" 
                              onclick="goToImg(${item.id}, ${index})"></span>
                    `).join('')}
                </div>
            </div>

                <div class="card-info">
                    <h4>${item.title}</h4>
                    <p style="color:var(--text-color);">${item.city}</p>
                    <p style="color:var(--text-color);">€${item.price}</p>
                    <div class="property-actions">
                        <button onclick="editProperty(${item.id})" class="edit-btn">✏️ Edit</button>
                        <button onclick="removeProperty(${item.id})" class="delete-btn">🗑️ Delete</button>
                    </div>
                </div>
            </div>
        `;
    });
}

// ===== POST PROPERTY ===== //
function postProperty() {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        alert('❌ You must be logged in!');
        window.location.href = 'login.html';
        return;
    }

    const user = JSON.parse(currentUser);

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

    let allProperties = JSON.parse(localStorage.getItem('properties')) || [];
    allProperties.push(newListing);
    localStorage.setItem('properties', JSON.stringify(allProperties));

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
    if (!confirm('Delete this property?')) return;
    
    let allProperties = JSON.parse(localStorage.getItem('properties')) || [];
    allProperties = allProperties.filter(item => item.id !== id);
    localStorage.setItem('properties', JSON.stringify(allProperties));
    
    alert('✅ Property deleted!');
    renderMyProperties();
}

// ===== EDIT PROPERTY ===== //
function editProperty(id) {
    let allProperties = JSON.parse(localStorage.getItem('properties')) || [];
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

    let allProperties = JSON.parse(localStorage.getItem('properties')) || [];
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

        localStorage.setItem('properties', JSON.stringify(allProperties));

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
    let allProperties = JSON.parse(localStorage.getItem('properties')) || [];
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
