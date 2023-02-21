let apiKey ='';
const options = {
	method: 'GET',
	headers: {
		'X-RapidAPI-Key': apiKey,
		'X-RapidAPI-Host': 'weatherapi-com.p.rapidapi.com'
	}
};
const searchButton = document.getElementById('search-button');
const searchInput = document.querySelector('#search-input');


const updateWeatherData = async (data) => {
	const weatherDataElement = document.getElementById('weather-data');
	weatherDataElement.innerHTML = `
		<p>Location: 
			${data.location.name}, 
			${data.location.region}, 
			${data.location.country}
		</p>
		<p>Local Time: ${data.location.localtime}</p>
		<p>Temperature: ${data.current.temp_f}°F</p>
		<p>Condition: ${data.current.condition.text}</p>
		<p>Humidity: ${data.current.humidity}%</p>
		<p>Wind Speed: ${data.current.wind_kph} km/h</p>	
	`;
};


const handleSubmit = async(e) => {
	e.preventDefault();
	try {
		const location = document.getElementById('search-input').value.trim();
		const response = await fetch(`https://weatherapi-com.p.rapidapi.com/forecast.json?q=${location}&days=3`, options);
		const data = await response.json();	
		await updateWeatherData(data);
	} catch (error) {
		console.error(error);
	}
};


searchButton.addEventListener('click', handleSubmit);
searchInput.addEventListener('keydown', (e) => {
	if (e.key === 'Enter')
	handleSubmit(e);
});


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
