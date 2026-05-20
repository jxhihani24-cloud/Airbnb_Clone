document.addEventListener("DOMContentLoaded", async () => {
    const form = document.getElementById("addPropertyForm");
    const cancelBtn = document.getElementById("cancelAddProperty");

    const params = new URLSearchParams(window.location.search);
    const editId = params.get("editId");

    const currentUser = requireLogin();

    if (!currentUser) {
        return;
    }

    if (editId) {
        setupEditMode();

        try {
            const property = await apiRequest(`/Properties/${editId}`);

            document.getElementById("title").value = property.title || "";
            document.getElementById("city").value = property.city || "";
            document.getElementById("country").value = property.country || "";
            document.getElementById("propertyType").value = property.propertyType || "";
            document.getElementById("price").value = property.price || "";
            document.getElementById("guests").value = property.guests || "";
            document.getElementById("bedrooms").value = property.bedrooms || "";
            document.getElementById("bathrooms").value = property.bathrooms || "";
            document.getElementById("description").value = property.description || "";

        } catch (error) {
            alert("❌ " + error.message);
            window.location.href = "property.html";
            return;
        }
    }

    if (form) {
        form.addEventListener("submit", async function (e) {
            e.preventDefault();

            if (editId) {
                await updatePropertyFromPage(editId);
            } else {
                await postPropertyFromPage();
            }
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener("click", () => {
            const confirmCancel = confirm(
                "Are you sure you want to cancel?\nYour property details will not be saved."
            );

            if (confirmCancel) {
                window.location.href = "property.html";
            }
        });
    }
});

function setupEditMode() {
    const pageTitle = document.getElementById("pageTitle");
    const formTitle = document.getElementById("formTitle");
    const submitBtn = document.getElementById("submitBtn");
    const tit = document.getElementById("tit");
    const p = document.getElementById("par");

    if (pageTitle) pageTitle.textContent = "Edit Property";
    if (formTitle) formTitle.textContent = "Edit Property Details";
    if (submitBtn) submitBtn.textContent = "Update Property";
    if (tit) tit.textContent = "Hostera - Edit Property";
    if (p) p.textContent = "Make changes to your property.";
}

async function collectPropertyFormData() {
    const title = document.getElementById("title").value.trim();
    const city = document.getElementById("city").value.trim();
    const country = document.getElementById("country").value.trim();
    const propertyType = document.getElementById("propertyType").value;
    const price = Number(document.getElementById("price").value);
    const guests = Number(document.getElementById("guests").value);
    const bedrooms = Number(document.getElementById("bedrooms").value);
    const bathrooms = Number(document.getElementById("bathrooms").value);
    const description = document.getElementById("description").value.trim();

    if (!title || !city || !country || !propertyType || !price || !guests || !bedrooms || !bathrooms || !description) {
        alert("❌ Please fill in all required fields.");
        return null;
    }

    const imageFiles = document.getElementById("images").files;

    let images = [];

    if (imageFiles.length > 0) {
        for (const file of imageFiles) {
            const uploadedImageUrl = await uploadImage(file);
            images.push(uploadedImageUrl);
        }
    } else {
        images = ["../images/Logo.png"];
    }

    return {
        title,
        city,
        country,
        propertyType,
        price,
        guests,
        bedrooms,
        bathrooms,
        description,
        images
    };
}

async function postPropertyFromPage() {
    const currentUser = requireLogin();

    if (!currentUser) {
        return;
    }

    try {
        const propertyData = await collectPropertyFormData();

        if (!propertyData) {
            return;
        }

        const result = await apiRequest("/Properties/create", "POST", propertyData);

        alert(result.message);

        window.location.href = "property.html";

    } catch (error) {
        alert("❌ " + error.message);
    }
}

async function updatePropertyFromPage(editId) {
    const currentUser = requireLogin();

    if (!currentUser) {
        return;
    }

    try {
        const propertyData = await collectPropertyFormData();

        if (!propertyData) {
            return;
        }

        const result = await apiRequest(`/Properties/update/${editId}`, "PUT", propertyData);

        alert(result.message);

        window.location.href = "property.html";

    } catch (error) {
        alert("❌ " + error.message);
    }
}