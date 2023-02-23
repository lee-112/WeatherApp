// Initialize API key variable for API call
let apiKey ='';

// Set options object for API call
const options = {
	method: 'GET',
	headers: {
		'X-RapidAPI-Key': apiKey,
		'X-RapidAPI-Host': 'weatherapi-com.p.rapidapi.com'
	}
};

// Get the search elements from the DOM.
const searchInput = document.querySelector('#search-input');
const searchButton = document.getElementById('search-button');

// Update weather data for the given data
const updateWeatherData = async (data) => {
	const weatherDataElement = document.getElementById('weather-data');

	// Add data to HTML element in the form of a string
	weatherDataElement.innerHTML = `
		<p>Location: 
			${data.location.name}, 
			${data.location.region}, 
			${data.location.country}
		</p>
		<p>Local Time: ${data.location.localtime}</p>
    <p>Temperature: ${data.current.temp_c}°C / ${data.current.temp_f}°F</p>
		<p>Condition: ${data.current.condition.text}</p>
		<p>Humidity: ${data.current.humidity}%</p>
		<p>Wind Speed: ${data.current.wind_kph} km/h</p>	
	`;
};

// Asynchronous function to handle submission.
const handleSubmit = async(e) => {
	// Prevent page from refreshing when submitting.
	e.preventDefault();
	try {
		// Get the user input and trim any unnecessary whitespace
		const location = document.getElementById('search-input').value.trim();

		//Fetch the data based on user's location input.
		const response = await fetch(`https://weatherapi-com.p.rapidapi.com/forecast.json?q=${location}&days=3`, options);

		// Convert the fetched data into JSON format
		const data = await response.json();	

		// Call asynchronous function to update the weather data.
		await updateWeatherData(data);

		// Catch any errors
	} catch (error) {
		console.error(error);
	}
};

// Add click and keydown event listener for searching.
searchButton.addEventListener('click', handleSubmit);
searchInput.addEventListener('keydown', (e) => {
	if (e.key === 'Enter')
	handleSubmit(e);
});

// load api key from api-key.txt and assign it to the options object. The ready state is 4 and status is 200 when the response is successfully returned.
const loadApiKey = () => {
	const xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (this.readyState === 4 && this.status === 200) {
			apiKey = this.responseText.trim();
			options.headers['X-RapidAPI-Key'] = apiKey;
		}
	};
	xhr.open('GET', 'api-key.txt', true);
	xhr.send();
};

loadApiKey();
