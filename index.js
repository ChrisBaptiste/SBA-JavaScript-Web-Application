// --- Configuration ---
// Storing API keys and configuration details here.
const MAPBOX_TOKEN = 'pk.eyJ1Ijoicm9kZHlyaXp6IiwiYSI6ImNtOHRwbGZ6MTBkZzQycnBrZDc3dDRyemUifQ.1RjyigSlRKpy9GZ6i26Vrw'; // My Mapbox Access Token for map tiles.
const OPENWEATHER_API_KEY = '3e2f7f3c582239708fa167ee6e0fc331'; // My OpenWeatherMap API Key for weather data.
const FOURSQUARE_API_KEY = 'fsq3Hl6zCE5arCY5Cpgr0MqkkhjuscIqOO9mK0UUi95XUxY='; // My Foursquare API Key (v3) for finding places.
// --- End Configuration ---


// --- DOM Elements ---
// Getting references to HTML elements needed for interaction.
const budgetSlider = document.getElementById('budget'); // Reference to the slider input.
const budgetValueDisplay = document.getElementById('budgetValue'); // Reference to the budget value display span.
const searchButton = document.getElementById('searchBtn'); // Reference to the search button.
const mapContainer = document.getElementById('map'); // Reference to the map container div.
const itineraryDiv = document.getElementById('itinerary'); // Reference to the results container div.

// --- Map Initialization ---
let map; // Declaring the map variable to hold the map object.
mapboxgl.accessToken = MAPBOX_TOKEN; // Setting the Mapbox token for the library to use.

// Trying to initialize the map and handling potential errors.
try {
    // Checking if the Mapbox token looks valid.
    if (!MAPBOX_TOKEN || !MAPBOX_TOKEN.startsWith('pk.ey')) {
        throw new Error('Mapbox token is missing or invalid.'); // Throwing an error if the token seems wrong.
    }

    // Creating the Mapbox map instance.
    map = new mapboxgl.Map({
        container: mapContainer, // Specifying the HTML element to contain the map.
        style: 'mapbox://styles/mapbox/streets-v11', // Using the standard Mapbox streets style.
        center: [0, 20], // Setting the initial center coordinates (longitude, latitude).
        zoom: 1.5 // Setting the initial zoom level.
    });

    // Adding navigation controls (zoom, rotation) to the map.
    map.addControl(new mapboxgl.NavigationControl());
    // Adding a fullscreen control button to the map.
    map.addControl(new mapboxgl.FullscreenControl());

    // Running setup code once the map's style has finished loading.
    map.on('load', () => {
        console.log("Map finished loading."); // Logging a message to the console when the map is ready.
        // Adding a GeoJSON data source for destination markers, starting empty.
        map.addSource('destinations', {
            type: 'geojson',
            data: { type: 'FeatureCollection', features: [] } // Initializing with no features.
        });

        // Adding a layer to visually represent the 'destinations' data source as circles.
        map.addLayer({
            id: 'destination-markers', // Naming the layer.
            type: 'circle', // Specifying the layer type as circle.
            source: 'destinations', // Linking to the 'destinations' data source.
            paint: { // Defining the visual appearance of the circles.
                'circle-radius': 8, // Setting the circle size.
                'circle-color': '#E74C3C', // Setting the circle fill color.
                'circle-stroke-width': 1, // Setting the outline width.
                'circle-stroke-color': '#FFFFFF' // Setting the outline color.
            }
        });

        // Adding a click event listener to the destination markers layer.
        map.on('click', 'destination-markers', (e) => {
            // Getting the coordinates from the clicked map feature.
            const coordinates = e.features[0].geometry.coordinates.slice();
            // Getting the properties (like title, price) from the clicked feature.
            const properties = e.features[0].properties;

            // Handling map wrapping for popups near the date line.
            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }

            // Creating and displaying a popup at the clicked marker's location.
            new mapboxgl.Popup()
                .setLngLat(coordinates) // Setting the popup's position.
                .setHTML(`<h4>${properties.title}</h4><p>Approx. Flight: $${properties.price}</p>`) // Setting the popup's content.
                .addTo(map); // Adding the popup to the map.
        });

        // Changing the mouse cursor to a pointer when hovering over markers.
        map.on('mouseenter', 'destination-markers', () => { map.getCanvas().style.cursor = 'pointer'; });
        // Changing the cursor back when the mouse leaves markers.
        map.on('mouseleave', 'destination-markers', () => { map.getCanvas().style.cursor = ''; });
    });

} catch (error) {
    // Handling errors during map initialization.
    console.error("Map Initialization Error:", error);
    // Displaying an error message in the map container if initialization failed.
    mapContainer.innerHTML = `<div class="error"><p>Could not initialize map: ${error.message}</p><p>Please check console for details.</p></div>`;
}

// --- Budget Slider ---
// Adding an event listener for the 'input' event on the budget slider.
budgetSlider.addEventListener('input', (e) => {
    // Updating the text content of the budget value display span.
    budgetValueDisplay.textContent = `$${e.target.value}`;
});

// --- API Fetching Functions ---

// ** SIMULATED Flight Search **
// Defining an asynchronous function to simulate fetching flight data.
const fetchSimulatedFlights = async (maxBudget) => {
    console.log(`Simulating flight search for budget: $${maxBudget}`); // Logging the budget used for simulation.

    // Defining the list of mock destinations with details.
    const allDestinations = [
        { city: 'Bangkok', country: 'Thailand', price: 450, lat: 13.7563, lon: 100.5018, imagePath: 'moch-Data-Images/Grand-Palace-Thailand.jpg' },
        { city: 'Lisbon', country: 'Portugal', price: 380, lat: 38.7223, lon: -9.1393, imagePath: 'moch-Data-Images/Historic-Castle-Potugal.jpg' },
        { city: 'Medellín', country: 'Colombia', price: 320, lat: 6.2476, lon: -75.5658, imagePath: 'moch-Data-Images/Pablo-Escobar-Museum-Columbia.jpg' },
        { city: 'Ho Chi Minh City', country: 'Vietnam', price: 510, lat: 10.8231, lon: 106.6297, imagePath: 'moch-Data-Images/VietNam-City.jpg' },
        { city: 'Mexico City', country: 'Mexico', price: 250, lat: 19.4326, lon: -99.1332, imagePath: 'moch-Data-Images/Mexico-city.jpg' },
        { city: 'Prague', country: 'Czech Republic', price: 420, lat: 50.0755, lon: 14.4378, imagePath: 'moch-Data-Images/Prague-Czech-Republic.jpg' },
        { city: 'Buenos Aires', country: 'Argentina', price: 600, lat: -34.6037, lon: -58.3816, imagePath: 'moch-Data-Images/Argentina-Skyline.jpg' },
        { city: 'Krakow', country: 'Poland', price: 390, lat: 50.0647, lon: 19.9450, imagePath: 'moch-Data-Images/Poland.jpg' },
        { city: 'Budapest', country: 'Hungary', price: 410, lat: 47.4979, lon: 19.0402, imagePath: 'moch-Data-Images/Hungary.jpg' },
        { city: 'Canggu, Bali', country: 'Indonesia', price: 550, lat: -8.6478, lon: 115.1385, imagePath: 'moch-Data-Images/Bali.jpg' },
        { city: 'Marrakech', country: 'Morocco', price: 350, lat: 31.6295, lon: -7.9811, imagePath: 'moch-Data-Images/morocco.jpg' },
        { city: 'Cairo', country: 'Egypt', price: 480, lat: 30.0444, lon: 31.2357, imagePath: 'moch-Data-Images/Egypt.jpg' },
        { city: 'Castries', country: 'Saint Lucia', price: 700, lat: 14.0101, lon: -60.9861, imagePath: 'moch-Data-Images/Castries-SaintLucia.jpg' }
    ];

    // Simulating network delay using setTimeout within a Promise.
    await new Promise(resolve => setTimeout(resolve, 500)); // Pausing execution for 500ms.

    // Filtering the destinations array based on the provided maxBudget.
    const affordableDestinations = allDestinations.filter(dest => dest.price <= maxBudget);

    console.log(`Found ${affordableDestinations.length} simulated destinations within budget.`); // Logging the count of found destinations.
    return affordableDestinations; // Returning the array of affordable destinations.
};

// Defining an async function to fetch weather data from OpenWeatherMap.
const getWeather = async (lat, lon) => {
    // Checking if the OpenWeatherMap API key is available.
    if (!OPENWEATHER_API_KEY || OPENWEATHER_API_KEY === 'YOUR_OPENWEATHERMAP_API_KEY') { // Using placeholder text for check.
        console.warn("OpenWeatherMap API Key missing. Skipping weather fetch."); // Logging a warning.
        return { description: "Weather data unavailable", temp: "N/A", icon: '01d' }; // Returning default weather info.
    }

    // Constructing the URL for the OpenWeatherMap API request.
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`; // Requesting metric units.

    // Trying to fetch data from the API.
    try {
        const response = await fetch(url); // Making the network request.
        // Checking if the response status indicates success.
        if (!response.ok) {
            const errorText = await response.text(); // Reading the error response body.
            console.error(`Weather API HTTP error! Status: ${response.status}`, errorText); // Logging the specific error.
            throw new Error(`HTTP error! Status: ${response.status}`); // Throwing an error.
        }
        const data = await response.json(); // Parsing the JSON response body.
        // Returning an object with formatted weather data.
        return {
            description: data.weather[0]?.description || 'Not available', // Getting weather description.
            temp: data.main?.temp?.toFixed(1) || 'N/A', // Getting temperature and formatting it.
            icon: data.weather[0]?.icon || '01d' // Getting the weather icon code.
        };
    } catch (error) {
        // Handling errors during the fetch process.
        if (!error.message.includes('HTTP error')) { // Avoiding double logging for HTTP errors.
             console.error("Weather API Fetch Error:", error);
        }
        return { description: "Weather data unavailable", temp: "N/A", icon: '01d' }; // Returning default info on error.
    }
};

// Defining an async function to fetch nearby activities from Foursquare.
const fetchActivities = async (lat, lon) => {
    // Checking if the Foursquare API key is available.
    if (!FOURSQUARE_API_KEY || FOURSQUARE_API_KEY === 'YOUR_FOURSQUARE_API_KEY') { // Using placeholder text for check.
        console.warn("Foursquare API Key missing. Skipping activities fetch."); // Logging a warning.
        return []; // Returning an empty array if no key.
    }

    // Defining parameters for the Foursquare API request.
    const limit = 5; // Setting the maximum number of results.
    const radius = 5000; // Setting the search radius in meters.
    const fields = 'fsq_id,name,categories,location'; // Specifying the desired data fields.

    // Constructing the Foursquare API (v3) URL.
    const url = `https://api.foursquare.com/v3/places/search?ll=${lat}%2C${lon}&radius=${radius}&categories=16000&limit=${limit}&fields=${fields}&sort=DISTANCE`; // Using category 16000 (Arts & Entertainment) and sorting by distance.

    // Preparing options for the fetch request, including authorization header.
    const options = {
        method: 'GET',
        headers: {
            Accept: 'application/json', // Specifying the desired response format.
            Authorization: FOURSQUARE_API_KEY // Providing the API key in the header.
        }
    };

    // Trying to fetch data from the API.
    try {
        const response = await fetch(url, options); // Making the network request.
        // Checking if the response status indicates success.
        if (!response.ok) {
             const errorText = await response.text(); // Reading the error response body.
             console.error(`Foursquare API HTTP error! Status: ${response.status}`, errorText); // Logging the specific error.
            throw new Error(`HTTP error! Status: ${response.status}`); // Throwing an error.
        }
        const data = await response.json(); // Parsing the JSON response body.
        // Extracting the results array from the response data.
        const venues = data.results || [];
        // Mapping the raw venue data to a simpler format.
        return venues.map(venue => ({
            name: venue.name || 'Unknown place', // Getting the venue name.
            category: venue.categories[0]?.name || 'Place', // Getting the primary category name.
        }));
    } catch (error) {
        // Handling errors during the fetch process.
         if (!error.message.includes('HTTP error')) { // Avoiding double logging for HTTP errors.
             console.error("Foursquare API Fetch Error:", error);
         }
        return []; // Returning an empty array on error.
    }
};


// --- Main Search Logic ---
// Defining the async function that handles the search process when the button is clicked.
const handleSearch = async () => {
    // Getting the current budget value from the slider and converting it to an integer.
    const budget = parseInt(budgetSlider.value, 10);
    // Displaying a loading message in the itinerary section.
    itineraryDiv.innerHTML = '<div class="loading">Searching for affordable destinations... 🌍✈️</div>';

    // Clearing existing markers from the map if the map and source are ready.
    if (map && map.getSource('destinations')) {
        map.getSource('destinations').setData({ type: 'FeatureCollection', features: [] }); // Setting data to an empty feature collection.
    }

    // Trying to execute the search and display flow.
    try {
        // Fetching the list of potential destinations based on the budget (simulated).
        const potentialTrips = await fetchSimulatedFlights(budget);

        // Checking if any destinations were found.
        if (!potentialTrips || potentialTrips.length === 0) {
            // Displaying an error message if no destinations are found within budget.
            itineraryDiv.innerHTML = `
                <div class="error">
                  <p>No destinations found within your budget of $${budget}. 💸</p>
                  <p>Try increasing your budget or check back later.</p>
                </div>`;
            return; // Exiting the function early.
        }

        // Creating an array of promises to fetch weather and activities for each trip concurrently.
        const resultsPromises = potentialTrips.map(async (trip) => {
            // Trying to fetch data for a single trip.
            try {
                // Using Promise.all to fetch weather and activities simultaneously.
                const [weather, activities] = await Promise.all([
                    getWeather(trip.lat, trip.lon),
                    fetchActivities(trip.lat, trip.lon)
                ]);
                console.log(`Data for ${trip.city}:`, { weather, activities }); // Logging fetched data for debugging.
                // Returning a new object containing all trip info plus weather, activities, and image path.
                return { ...trip, weather, activities, imagePath: trip.imagePath };
            } catch (error) {
                // Handling errors during fetching for a single destination.
                console.error(`Failed to process destination ${trip.city}:`, error);
                // Returning partial data (including image path) even if APIs fail.
                 return {
                     ...trip,
                     weather: { description: "Data unavailable", temp: "N/A", icon: '01d' },
                     activities: [],
                     imagePath: trip.imagePath
                 };
            }
        });

        // Waiting for all the fetch promises to resolve.
        const results = (await Promise.all(resultsPromises)).filter(r => r !== null); // Filtering out any null results (should be minimal now).

        // Displaying the processed results in the itinerary section.
        displayResults(results);

        // Updating the markers on the map based on the results.
        updateMapMarkers(results);

    } catch (error) {
        // Handling any unexpected errors during the overall search process.
        console.error("Search Handler Error:", error);
        // Displaying a generic error message to the user.
        itineraryDiv.innerHTML = `
            <div class="error">
              <p>⚠️ An error occurred during the search.</p>
              <p>Please try again later.</p>
            </div>`;
    }
};

// --- UI Update Functions ---

// Defining the function to display the search results in the itinerary div.
const displayResults = (results) => {
    // Checking if the results array is valid and not empty.
    if (!results || results.length === 0) {
        itineraryDiv.innerHTML = '<div class="error">No destinations found matching your criteria.</div>'; // Displaying message if no results.
        return; // Exiting the function.
    }
    // Clearing previous results and setting the main heading for the results section.
    itineraryDiv.innerHTML = '<h2>✈️ Your Budget-Friendly Trip Options:</h2>';

    // Looping through each destination object in the results array.
    results.forEach(place => {
        // Generating the HTML string for the activities list.
        const activitiesHtml = place.activities && place.activities.length > 0
            // Creating a list if activities exist.
            ? `<h4>Things to Do Nearby:</h4>
               <ul>${place.activities.map(act => `<li>${act.name} (${act.category})</li>`).join('')}</ul>`
            // Displaying a message if no activities were found.
            : `<h4>Things to Do Nearby:</h4><p>No specific attractions found via Foursquare.</p>`;

        // Creating a new div element for the destination card.
        const destinationElement = document.createElement('div');
        destinationElement.className = 'destination'; // Assigning the CSS class.

        // Setting the inner HTML structure for the destination card.
        destinationElement.innerHTML = `
            <div class="destination-image-container">
                 <img src="${place.imagePath}" alt="${place.city}, ${place.country}" class="destination-image" loading="lazy">
            </div>
            <div class="destination-content">
                <h3>${place.city}, ${place.country}</h3>
                <div class="details">
                    <p>✈️ Approx. Flight: <strong>$${place.price}</strong></p>
                </div>
                <div class="weather-info">
                    <p>☁️ Weather: ${place.weather.description}, ${place.weather.temp}°C</p>
                </div>
                <div class="activities">
                    ${activitiesHtml}
                </div>
             </div>
        `;

        // Appending the newly created card element to the itinerary div.
        itineraryDiv.appendChild(destinationElement);
    });
};


// Defining the function to update the markers on the Mapbox map.
const updateMapMarkers = (results) => {
    // Checking if the map object and the 'destinations' source are available.
    if (!map || !map.getSource('destinations')) {
        console.warn("Map or destination source not ready for updating markers.");
        return; // Exiting if the map is not ready.
    }

    // Converting the results array into an array of GeoJSON Feature objects.
    const features = results.map(place => ({
        type: 'Feature', // Specifying the GeoJSON object type.
        geometry: { // Defining the geometry (location).
            type: 'Point', // Specifying the geometry type.
            coordinates: [place.lon, place.lat] // Providing longitude and latitude.
        },
        properties: { // Adding associated data for popups, etc.
            title: `${place.city}, ${place.country}`,
            price: place.price
        }
    }));

    // Setting the data for the 'destinations' source on the map.
    map.getSource('destinations').setData({
        type: 'FeatureCollection', // Specifying the GeoJSON collection type.
        features: features // Providing the array of features.
    });

    // Adjusting the map view if there are features to show.
    if (features.length > 0) {
        // Creating a LngLatBounds object to encompass all features.
        const bounds = new mapboxgl.LngLatBounds();
        // Extending the bounds to include each feature's coordinates.
        features.forEach(feature => {
            bounds.extend(feature.geometry.coordinates);
        });
        // Animating the map to fit the calculated bounds.
        map.fitBounds(bounds, {
            padding: 60, // Adding padding around the bounds.
            maxZoom: 10 // Setting a maximum zoom level limit.
        });
    } else {
         // Resetting the map view if there are no features.
         map.flyTo({center: [0, 20], zoom: 1.5});
    }
};

// --- Event Listeners ---
// Attaching an event listener to the search button to call handleSearch on click.
searchButton.addEventListener('click', handleSearch);

// --- Initial Setup ---
// Setting the initial display value for the budget slider text.
budgetValueDisplay.textContent = `$${budgetSlider.value}`;