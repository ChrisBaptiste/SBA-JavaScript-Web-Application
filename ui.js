// ui.js
// Handling DOM interactions and UI updates.

// Getting references to specific DOM elements.
export const budgetSlider = document.getElementById('budget');
export const budgetValueDisplay = document.getElementById('budgetValue');
export const searchButton = document.getElementById('searchBtn');
export const mapContainer = document.getElementById('map'); // May be needed for error display
export const itineraryDiv = document.getElementById('itinerary');

// Defining the function to display results in the itinerary section.
export const displayResults = (results) => {
    // Checking if results are valid.
    if (!results || results.length === 0) {
        itineraryDiv.innerHTML = '<div class="error">No destinations found matching your criteria.</div>';
        return;
    }
    // Setting the heading for the results section.
    itineraryDiv.innerHTML = '<h2>✈️ Your Budget-Friendly Trip Options:</h2>';

    // Looping through each result to create its display card.
    results.forEach(place => {
        // Generating HTML for activities list.
        const activitiesHtml = place.activities && place.activities.length > 0
            ? `<h4>Things to Do Nearby:</h4>
               <ul>${place.activities.map(act => `<li>${act.name} (${act.category})</li>`).join('')}</ul>`
            : `<h4>Things to Do Nearby:</h4><p>No specific attractions found via Foursquare.</p>`;

        // Creating the card element.
        const destinationElement = document.createElement('div');
        destinationElement.className = 'destination';

        // Setting the inner HTML for the card, including the image.
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

        // Appending the card to the itinerary div.
        itineraryDiv.appendChild(destinationElement);
    });
};

// Defining function to update the budget value display text.
export const updateBudgetValueDisplay = (value) => {
    if (budgetValueDisplay) {
        budgetValueDisplay.textContent = `$${value}`;
    }
};

// Defining function to show a loading message in the itinerary div.
export const showLoadingMessage = () => {
    if(itineraryDiv) {
        itineraryDiv.innerHTML = '<div class="loading">Searching for affordable destinations... 🌍✈️</div>';
    }
};

// Defining function to show an error message in the itinerary div.
export const showErrorMessage = (message) => {
     if(itineraryDiv) {
        itineraryDiv.innerHTML = `<div class="error"><p>${message}</p></div>`;
     }
}