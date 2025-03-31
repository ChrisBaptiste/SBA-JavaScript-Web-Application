// api.js
// Handling all external API requests.

// Importing API keys from the configuration file.
import { OPENWEATHER_API_KEY, FOURSQUARE_API_KEY } from './config.js';

// ** Using Moch Data to simulate flights for now. there was no free flight api's **
// Defining an asynchronous function to simulate fetching flight data based on budget.
export const fetchSimulatedFlights = async (maxBudget) => {
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

    // Simulating network delay.
    await new Promise(resolve => setTimeout(resolve, 500));

    // Filtering the destinations based on the budget.
    const affordableDestinations = allDestinations.filter(dest => dest.price <= maxBudget);

    console.log(`Found ${affordableDestinations.length} simulated destinations within budget.`); // Logging the count.
    return affordableDestinations; // Returning the filtered list.
};

// Defining an async function to fetch weather data.
export const getWeather = async (lat, lon) => {
    // Checking if the OpenWeatherMap API key is valid.
    if (!OPENWEATHER_API_KEY || OPENWEATHER_API_KEY === 'YOUR_OPENWEATHERMAP_API_KEY') {
        console.warn("OpenWeatherMap API Key missing. Skipping weather fetch.");
        return { description: "Weather data unavailable", temp: "N/A", icon: '01d' }; // Returning default info.
    }

    // Constructing the API request URL.
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`;

    // Trying to fetch the weather data.
    try {
        const response = await fetch(url);
        // Checking for successful response.
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Weather API HTTP error! Status: ${response.status}`, errorText);
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json(); // Parsing the response.
        // Returning formatted weather data.
        return {
            description: data.weather[0]?.description || 'Not available',
            temp: data.main?.temp?.toFixed(1) || 'N/A',
            icon: data.weather[0]?.icon || '01d'
        };
    } catch (error) {
        // Handling fetch errors.
        if (!error.message.includes('HTTP error')) {
             console.error("Weather API Fetch Error:", error);
        }
        return { description: "Weather data unavailable", temp: "N/A", icon: '01d' }; // Returning default info on error.
    }
};

// Defining an async function to fetch nearby activities from Foursquare.
export const fetchActivities = async (lat, lon) => {
    // Checking if the Foursquare API key is valid.
    if (!FOURSQUARE_API_KEY || FOURSQUARE_API_KEY === 'YOUR_FOURSQUARE_API_KEY') {
        console.warn("Foursquare API Key missing. Skipping activities fetch.");
        return []; // Returning empty array if no key.
    }

    // Setting Foursquare API parameters.
    const limit = 5;
    const radius = 5000;
    const fields = 'fsq_id,name,categories,location';
    const url = `https://api.foursquare.com/v3/places/search?ll=${lat}%2C${lon}&radius=${radius}&categories=16000&limit=${limit}&fields=${fields}&sort=DISTANCE`;

    // Setting fetch options including authorization header.
    const options = {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            Authorization: FOURSQUARE_API_KEY
        }
    };

    // Trying to fetch the Foursquare data.
    try {
        const response = await fetch(url, options);
        // Checking for successful response.
        if (!response.ok) {
             const errorText = await response.text();
             console.error(`Foursquare API HTTP error! Status: ${response.status}`, errorText);
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json(); // Parsing the response.
        // Processing the results.
        const venues = data.results || [];
        // Mapping results to a simpler format.
        return venues.map(venue => ({
            name: venue.name || 'Unknown place',
            category: venue.categories[0]?.name || 'Place',
        }));
    } catch (error) {
        // Handling fetch errors.
         if (!error.message.includes('HTTP error')) {
             console.error("Foursquare API Fetch Error:", error);
         }
        return []; // Returning empty array on error.
    }
};