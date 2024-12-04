mapboxgl.accessToken = mapToken;

const map = new mapboxgl.Map({
    container: 'map', // container ID,
    style: 'mapbox://styles/mapbox/dark-v11',
    center: campground.geometry.coordinates, // starting position [lng, lat]. Note that lat must be set between -90 and 90
    zoom: 4 // starting zoom
});


// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());

new mapboxgl.Marker()
    .setLngLat(campground.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({offset:15})
        .setHTML(
            `<h2>${campground.title}</h2>
            <p>${campground.location}</p>`
        )
    )
    .addTo(map)