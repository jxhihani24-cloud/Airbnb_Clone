document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("addPropertyForm");
    if (!form) return;

    form.addEventListener("submit", function (e) {
        e.preventDefault();
        postPropertyFromPage();
    });
});

function postPropertyFromPage() {
    const currentUser = localStorage.getItem("currentUser");

    if (!currentUser) {
        alert("❌ You must be logged in to post properties!");
        window.location.href = "login.html";
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
        ownerName: user.firstName + " " + user.lastName,
        createdAt: new Date().toISOString()
    };

    let allProperties = JSON.parse(localStorage.getItem("properties")) || [];
    allProperties.push(newListing);
    localStorage.setItem("properties", JSON.stringify(allProperties));

    alert("✅ Property posted successfully!");
    window.location.href = "property.html";
}

document.addEventListener("DOMContentLoaded", () => {

    const cancelBtn = document.getElementById("cancelAddProperty");

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