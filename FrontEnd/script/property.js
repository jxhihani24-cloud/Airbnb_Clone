function getCurrentSessionUser() {
    return requireLogin();
}

async function getMyProperties() {
    const currentUser = requireLogin();

    if (!currentUser) {
        return [];
    }

    return await apiRequest(`/Properties/mine/${currentUser.id}`);
}

async function renderMyProperties() {
    const container = document.getElementById("myProperties");

    if (!container) {
        return;
    }

    const currentUser = requireLogin();

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

    try {
        const myProperties = await getMyProperties();

        container.innerHTML = "";

        if (!myProperties || myProperties.length === 0) {
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
                                <button onclick="editProperty('${item.id}')" class="btn btn-outline-primary btn-sm w-50" style="border-color:#1b1ee2;font-weight:bold;background-color:#1b1ee2;color:white">
                                    Edit
                                </button>

                                <button onclick="removeProperty('${item.id}')" class="btn btn-outline-danger btn-sm w-50" style="font-weight:bold;background-color:#e0262d;color:white">
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

    } catch (error) {
        alert("❌ " + error.message);
    }
}

async function removeProperty(id) {
    if (!confirm("🗑️ Delete this property? This cannot be undone.")) {
        return;
    }

    if (!confirm("⚠️ This will delete all bookings, reviews, and messages for this property. Are you absolutely sure?")) {
        return;
    }

    try {
        const result = await apiRequest(`/Properties/delete/${id}`, "DELETE");

        alert(result.message);

        await renderMyProperties();

    } catch (error) {
        alert("❌ " + error.message);
    }
}

function editProperty(id) {
    window.location.href = `add-property.html?editId=${id}`;
}

document.addEventListener("DOMContentLoaded", async () => {
    await renderMyProperties();
});