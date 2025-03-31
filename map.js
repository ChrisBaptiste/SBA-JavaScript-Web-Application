// map.js
// Handling Mapbox initialization and updates.

// Importing the Mapbox token.
import { MAPBOX_TOKEN } from './config.js';

let mapInstance = null; // Variable to hold the initialized map object.

// Defining a function to initialize the Mapbox map.
export const initializeMap = (containerId) => {
    // Setting the Mapbox access token.
    mapboxgl.accessToken = MAPBOX_TOKEN;

    // Trying to create the map instance.
    try {
        // Checking if the token is valid.
        if (!MAPBOX_TOKEN || !MAPBOX_TOKEN.startsWith('pk.ey')) {
            throw new Error('Mapbox token is missing or invalid.');
        }

        // Creating the map object.
        mapInstance = new mapboxgl.Map({
            container: containerId, // Using the provided container ID.
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [0, 20],
            zoom: 1.5
        });

        // Adding map controls.
        mapInstance.addControl(new mapboxgl.NavigationControl());
        mapInstance.addControl(new mapboxgl.FullscreenControl());

        // Setting up sources and layers once the map loads.
        mapInstance.on('load', () => {
            console.log("Map finished loading.");
            // Adding the GeoJSON source for destinations.
            mapInstance.addSource('destinations', {
                type: 'geojson',
                data: { type: 'FeatureCollection', features: [] }
            });

            // Adding the layer to display destination markers.
            mapInstance.addLayer({
                id: 'destination-markers',
                type: 'circle',
                source: 'destinations',
                paint: {
                    'circle-radius': 8,
                    'circle-color': '#E74C3C',
                    'circle-stroke-width': 1,
                    'circle-stroke-color': '#FFFFFF'
                }
            });

            // Adding click listener for popups on markers.
            mapInstance.on('click', 'destination-markers', (e) => {
                const coordinates = e.features[0].geometry.coordinates.slice();
                const properties = e.features[0].properties;
                // Handling map wrapping.
                while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                }
                // Creating and showing the popup.
                new mapboxgl.Popup()
                    .setLngLat(coordinates)
                    .setHTML(`<h4>${properties.title}</h4><p>Approx. Flight: $${properties.price}</p>`)
                    .addTo(mapInstance);
            });

            // Adding hover effects for markers.
            mapInstance.on('mouseenter', 'destination-markers', () => { mapInstance.getCanvas().style.cursor = 'pointer'; });
            mapInstance.on('mouseleave', 'destination-markers', () => { mapInstance.getCanvas().style.cursor = ''; });
        });

        return mapInstance; // Returning the created map instance.

    } catch (error) {
        // Handling map initialization errors.
        console.error("Map Initialization Error:", error);
        const mapContainer = document.getElementById(containerId);
        if (mapContainer) {
            mapContainer.innerHTML = `<div class="error"><p>Could not initialize map: ${error.message}</p><p>Please check console.</p></div>`;
        }
        return null; // Returning null if initialization failed.
    }
};

// Defining the function to update the markers on the map.
export const updateMapMarkers = (results) => {
    // Checking if the map instance and the 'destinations' source exist.
    if (!mapInstance || !mapInstance.getSource('destinations')) {
        console.warn("Map or destination source not ready for updating markers.");
        return; // Exiting if map isn't ready.
    }

    // Converting results to GeoJSON features.
    const features = results.map(place => ({
        type: 'Feature',
        geometry: {
            type: 'Point',
            coordinates: [place.lon, place.lat]
        },
        properties: {
            title: `${place.city}, ${place.country}`,
            price: place.price
        }
    }));

    // Setting the data for the map source.
    mapInstance.getSource('destinations').setData({
        type: 'FeatureCollection',
        features: features
    });

    // Adjusting the map view to fit the markers.
    if (features.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        features.forEach(feature => {
            bounds.extend(feature.geometry.coordinates);
        });
        // Fitting the map to the bounds.
        mapInstance.fitBounds(bounds, {
            padding: 60,
            maxZoom: 10
        });
    } else {
        // Resetting view if no features.
        mapInstance.flyTo({ center: [0, 20], zoom: 1.5 });
    }
};