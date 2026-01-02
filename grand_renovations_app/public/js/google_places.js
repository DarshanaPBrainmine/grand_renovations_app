(function () {
    if (window.google) return;

    let script = document.createElement("script");
    script.src =
        "https://maps.googleapis.com/maps/api/js?key=REMOVED&libraries=places";
    script.async = true;
    document.head.appendChild(script);
})();
