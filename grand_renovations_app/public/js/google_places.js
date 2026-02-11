(function () {
    // If Google Maps is already loaded, do nothing
    if (window.google && window.google.maps) return;

    // Ensure key is available from Frappe boot
    if (!window.frappe || !frappe.boot || !frappe.boot.google_maps_key) {
        console.error("Google Maps API key not found in frappe.boot");
        return;
    }

    // Expose key globally (optional but useful)
    window.GOOGLE_MAPS_API_KEY = frappe.boot.google_maps_key;

    let script = document.createElement("script");
    script.src =
        "https://maps.googleapis.com/maps/api/js?key=" +
        window.GOOGLE_MAPS_API_KEY +
        "&libraries=places";

    script.async = true;
    script.defer = true;

    document.head.appendChild(script);
})();
