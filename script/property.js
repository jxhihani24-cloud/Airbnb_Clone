// LOAD SAVED DATA
window.myProperties = JSON.parse(localStorage.getItem("myProperties")) || [];

// RENDER MY PROPERTIES
function renderMyProperties() {
    const container = document.getElementById("myProperties");
    if (!container) return;

    container.innerHTML = "";

    if (window.myProperties.length === 0) {
        container.innerHTML = "<p style='text-align:center;'>No properties yet.</p>";
        return;
    }

    window.myProperties.forEach(item => {
    const img = item.images && item.images.length 
        ? item.images[0] 
        : item.img;
        container.innerHTML += `

<div class="card">
   <div class="image-slider">
        <img id="img-${item.id}" src="${item.images && item.images.length ? item.images[0] : item.img}">    
    <div class="dots">
    ${(item.images && item.images.length ? item.images : [item.img]).map((_, index) => `
        <span class="dot ${index === 0 ? 'active' : ''}" 
              onclick="goToImg(${item.id}, ${index})"></span>
    `).join('')}
</div>
</div>

    <div class="card-info">
        <h4>${item.title}</h4>
        <p>${item.city}</p>
        <p>€${item.price}</p>
        <button onclick="removeProperty(${item.id})">Delete</button>
    </div>
</div>
        `;
    });
}

// POST PROPERTY
function postProperty() {
    const title = document.getElementById("title").value;
    const city = document.getElementById("city").value;
    const price = document.getElementById("price").value;
    const imagesInput = document.getElementById("images").value;

    if (!title || !city || !price) {
        alert("Fill all fields");
        return;
    }

    const images = imagesInput
        ? imagesInput.split(",").map(img => img.trim())
        : ["../images/Logo.png"];

    const newListing = {
        id: Date.now(),
        title,
        city,
        price: Number(price),
        images
    };

    window.myProperties.push(newListing);
    localStorage.setItem("myProperties", JSON.stringify(window.myProperties));

    renderMyProperties();

    // CLEAR INPUTS
    document.getElementById("title").value = "";
    document.getElementById("city").value = "";
    document.getElementById("price").value = "";
    document.getElementById("images").value = "";

    toggleModal();
}

// MODAL
function toggleModal() {
    const modal = document.getElementById("modal");
    if (!modal) return;

    modal.style.display =
        modal.style.display === "block" ? "none" : "block";
}

// LOAD PAGE
document.addEventListener("DOMContentLoaded", renderMyProperties);

function removeProperty(id) {
    window.myProperties = window.myProperties.filter(item => item.id !== id);

    localStorage.setItem("myProperties", JSON.stringify(window.myProperties));

    renderMyProperties();
}

function goToImg(id, index) {
    const property = window.myProperties.find(p => p.id === id);
    if (!property || !property.images) return;

    // change image
    document.getElementById(`img-${id}`).src = property.images[index];

    // FIX ACTIVE DOT
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