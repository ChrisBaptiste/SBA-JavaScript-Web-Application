// index.js
// Main application logic and event listeners

// Importing necessary functions and variables from other modules.
import { fetchSimulatedFlights, getWeather, fetchActivities } from './api.js';
import { initializeMap, updateMapMarkers } from './map.js';
import {
    budgetSlider,
    budgetValueDisplay,
    searchButton,
    itineraryDiv,
    displayResults,
    updateBudgetValueDisplay,
    showLoadingMessage,
    showErrorMessage // Importing error display function
} from './ui.js';

// --- Global State ---
let map; // Variable to hold the map instance after initialization.

// --- Main Search Logic ---
// Defining the async function that handles the search process.
const handleSearch = async () => {
    // Getting the current budget value.
    const budget = parseInt(budgetSlider.value, 10);
    // Showing a loading message.
    showLoadingMessage();

    // Clearing previous map markers if the map exists.
    if (map) {
         // Calling updateMapMarkers with empty results to clear markers.
        updateMapMarkers([]);
    } else {
        console.warn("Map not initialized yet, cannot clear markers.");
    }


    // Trying to fetch and display results.
    try {
        // Fetching simulated flight data based on budget.
        const potentialTrips = await fetchSimulatedFlights(budget);

        // Checking if destinations were found.
        if (!potentialTrips || potentialTrips.length === 0) {
            // Showing an error message if no trips found.
             showErrorMessage(`No destinations found within your budget of $${budget}. Try increasing your budget.`);
            return; // Exiting function.
        }

        // Fetching weather and activities for each potential trip.
        const resultsPromises = potentialTrips.map(async (trip) => {
            try {
                const [weather, activities] = await Promise.all([
                    getWeather(trip.lat, trip.lon),
                    fetchActivities(trip.lat, trip.lon)
                ]);
                // Returning combined trip data.
                return { ...trip, weather, activities, imagePath: trip.imagePath };
            } catch (error) {
                console.error(`Failed processing destination ${trip.city}:`, error);
                // Returning partial data on error.
                 return {
                     ...trip,
                     weather: { description: "Data unavailable", temp: "N/A", icon: '01d' },
                     activities: [],
                     imagePath: trip.imagePath
                 };
            }
        });

        // Waiting for all data fetching to complete.
        const results = (await Promise.all(resultsPromises)).filter(r => r !== null);

        // Displaying the results in the UI.
        displayResults(results);

        // Updating the map markers with the results.
        if (map) {
            updateMapMarkers(results);
        } else {
            console.warn("Map not initialized yet, cannot update markers.");
        }

    } catch (error) {
        // Handling errors during the search process.
        console.error("Search Handler Error:", error);
        showErrorMessage('An error occurred during the search. Please try again later.');
    }
};

// --- Initialization and Event Listeners ---

// Defining a function to run when the page is fully loaded.
const initializeApp = () => {
    console.log("Initializing app...");
    // Initializing the map and storing the instance.
    map = initializeMap('map'); // 'map' is the ID of the map container div.

    // Checking if map initialization failed.
    if (!map) {
        console.error("App initialization failed because map could not be created.");
        // Error message is already shown by initializeMap in this case.
        return; // Stop further initialization.
    }

    // Setting up the budget slider listener.
    if (budgetSlider) {
        // Setting initial display value.
        updateBudgetValueDisplay(budgetSlider.value);
        // Adding listener for slider input changes.
        budgetSlider.addEventListener('input', (e) => {
            updateBudgetValueDisplay(e.target.value);
        });
    } else {
        console.error("Budget slider element not found.");
    }

    // Setting up the search button listener.
    if (searchButton) {
        searchButton.addEventListener('click', handleSearch);
    } else {
        console.error("Search button element not found.");
    }

    console.log("App initialized successfully.");
};

// Running the initializeApp function once the DOM content is loaded.
// Using DOMContentLoaded 
document.addEventListener('DOMContentLoaded', initializeApp);