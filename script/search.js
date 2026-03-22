document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.querySelector("input[placeholder='Search location...']");
    const priceInput = document.querySelector("input[placeholder='Max price']");

    function filterListings() {
        let filtered = [...window.listings];

        // FILTER BY CITY
        if (searchInput && searchInput.value.trim() !== "") {
            const value = searchInput.value.toLowerCase();
            filtered = filtered.filter(item =>
                item.city.toLowerCase().includes(value)
            );
        }

         // FILTER BY PRICE
        if (priceInput && priceInput.value !== "") {
            const maxPrice = parseFloat(priceInput.value);
            filtered = filtered.filter(item =>
                item.price <= maxPrice
            );
        }


        window.renderListings(filtered);
    }

// ===== READ FROM URL (homepage search) =====
    const params = new URLSearchParams(window.location.search);

    const cityFromURL = params.get("city");
    const priceFromURL = params.get("price");

    if (cityFromURL && searchInput) {
        searchInput.value = cityFromURL;
    }

    if (priceFromURL && priceInput) {
        priceInput.value = priceFromURL;
    }

    // Apply filters if anything came from URL
    if (cityFromURL || priceFromURL) {
        filterListings();
    }

    // ===== EVENTS =====
    if (searchInput) searchInput.addEventListener("input", filterListings);
    if (priceInput) priceInput.addEventListener("input", filterListings);
});