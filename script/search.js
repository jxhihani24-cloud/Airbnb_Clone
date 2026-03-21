document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.querySelector("input[placeholder='Search location...']");
    const priceInput = document.querySelector("input[placeholder='Max price']");

    function filterListings() {
        let filtered = window.listings;

        // FILTER BY CITY
        if (searchInput.value.trim() !== "") {
            const value = searchInput.value.toLowerCase();
            filtered = filtered.filter(item =>
                item.city.toLowerCase().includes(value)
            );
        }

        // FILTER BY PRICE
        if (priceInput.value !== "") {
            const maxPrice = parseFloat(priceInput.value);
            filtered = filtered.filter(item =>
                item.price <= maxPrice
            );
        }

        window.renderListings(filtered);
    }

    // EVENTS
    if (searchInput) searchInput.addEventListener("input", filterListings);
    if (priceInput) priceInput.addEventListener("input", filterListings);
});