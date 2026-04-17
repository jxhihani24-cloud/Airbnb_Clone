document.addEventListener("DOMContentLoaded", () => {
    const storage = window.AppStorage;
    const form = document.getElementById("addPropertyForm");
    const cancelBtn = document.getElementById("cancelAddProperty");
    const editId = localStorage.getItem("editingPropertyId");

     if (editId) {
    const pageTitle = document.getElementById("pageTitle");
    const formTitle = document.getElementById("formTitle");
    const submitBtn = document.getElementById("submitBtn");
    const tit=document.getElementById("tit");
    const P=document.getElementById("par");

    if (pageTitle) pageTitle.textContent = "Edit Property";
    if (formTitle) formTitle.textContent = "Edit Property Details";
    if (submitBtn) submitBtn.textContent = "Update Property";
    if(tit) tit.textContent="Hostera - Edit Property";
    if(P) P.textContent="Make changes to your property."
}

    // If editing, preload the form
    if (editId) {
        const properties = storage
            ? storage.getLS("properties", [])
            : JSON.parse(localStorage.getItem("properties") || "[]");
        const property = properties.find(p => p.id == editId);

        if (property) {
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
        }
    }

    if (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault();
            postPropertyFromPage();
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener("click", () => {
            const confirmCancel = confirm(
                "Are you sure you want to cancel?\nYour property details will not be saved."
            );

            if (confirmCancel) {
                localStorage.removeItem("editingPropertyId");
                window.location.href = "property.html";
            }
        });
    }
});

function postPropertyFromPage() {
    const storage = window.AppStorage;
    const currentUser = storage
        ? storage.getCurrentUser()
        : JSON.parse(localStorage.getItem("currentUser") || "null");

    if (!currentUser) {
        alert("❌ You must be logged in to post properties!");
        window.location.href = "login.html";
        return;
    }

    const user = currentUser;
    const editId = localStorage.getItem("editingPropertyId");

    const title = storage && storage.sanitizeInput 
        ? storage.sanitizeInput(document.getElementById("title").value.trim())
        : document.getElementById("title").value.trim();
    const city = storage && storage.sanitizeInput
        ? storage.sanitizeInput(document.getElementById("city").value.trim())
        : document.getElementById("city").value.trim();
    const country = storage && storage.sanitizeInput
        ? storage.sanitizeInput(document.getElementById("country").value.trim())
        : document.getElementById("country").value.trim();
    const propertyType = document.getElementById("propertyType").value;
    const price = document.getElementById("price").value.trim();
    const guests = document.getElementById("guests").value.trim();
    const bedrooms = document.getElementById("bedrooms").value.trim();
    const bathrooms = document.getElementById("bathrooms").value.trim();
    const description = storage && storage.sanitizeInput
        ? storage.sanitizeInput(document.getElementById("description").value.trim())
        : document.getElementById("description").value.trim();
    const amenitiesInput = document.getElementById("amenities").value.trim();
    const imagesInput = document.getElementById("images").value.trim();

    if (!title || !city || !country || !propertyType || !price) {
        alert("❌ Please fill in all required fields!");
        return;
    }

    const amenities = amenitiesInput
    ? amenitiesInput.split(",").map(item => {
        const trimmed = item.trim();
        return storage && storage.sanitizeInput ? storage.sanitizeInput(trimmed) : trimmed;
    }).filter(Boolean)
    : [];

const images = imagesInput
    ? imagesInput.split(",").map(img => img.trim()).filter(Boolean)
    : ["../images/Logo.png"];

    let allProperties = storage
        ? storage.getLS("properties", [])
        : JSON.parse(localStorage.getItem("properties") || "[]");

    if (editId) {
        const existingProperty = allProperties.find(p => p.id == editId);

        if (!existingProperty) {
            alert("❌ Property not found!");
            localStorage.removeItem("editingPropertyId");
            return;
        }

        const updatedListing = {
            ...existingProperty,
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
            images: images
        };

        allProperties = allProperties.map(p =>
            p.id == editId ? updatedListing : p
        );

        if (storage) storage.setLS("properties", allProperties);
        else localStorage.setItem("properties", JSON.stringify(allProperties));
        localStorage.removeItem("editingPropertyId");

        alert("✅ Property updated successfully!");
        window.location.href = "property.html";
        return;
    }

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
        ownerName: user.firstName + " " + user.lastName,
        createdAt: new Date().toISOString()
    };

    allProperties.push(newListing);
    if (storage) storage.setLS("properties", allProperties);
    else localStorage.setItem("properties", JSON.stringify(allProperties));

    alert("✅ Property posted successfully!");
    window.location.href = "property.html";
}