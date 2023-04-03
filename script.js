/**
 * The API key used for accessing the weatherapi.com API.
 * Make sure to replace the empty string with a valid API key before making any request.
*/
let apiKey ='';

/**
 * Options object that can be used to make GET requests to the weatherapi.com API.
 * It includes the necessary headers, including the API key.
*/
const options = {
	method: 'GET',
	headers: {
		'X-RapidAPI-Key': apiKey,
		'X-RapidAPI-Host': 'weatherapi-com.p.rapidapi.com'
	}
};

/**
 * Returns an array of formatted times in the given timezone ID for the next 7 hours based on the epoch time provided in the data object.
 * @param {Object} data - The object containing the timezone and epoch time data.  
 * @param {Array} formattedTime - The array to store the formatted times.  
 * @returns {Array} The array of formatted times.
*/
const getTimeZoneStringID = (data, formattedTime) => {
  for (let i = 0; i < 7; i++) {
    let date = new Date(data.location.localtime_epoch * 1000);
    date.setHours(date.getHours() + i);
    let formatter = new Intl.DateTimeFormat([], {
      timeZone: data.location.tz_id,
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
    let formatTime = formatter.format(date);
    formattedTime[i] = formatTime;
  }
  return formattedTime;
}

/** 
 * Returns an array of hourly conditions and their corresponding weather images for the next 7 hours based on the epoch time provided in the data object. 
 * @param {Object} data - The object containing the weather forecast data.  
 * @param {Array} weatherImages - The array to store the weather images.  
 * @param {Array} weatherHourly - The array to store the hourly conditions.  
 * @returns {Array} An array containing the weather images and hourly conditions for the next 7 hours.
*/
const getHourlyConditions = (data, weatherImages, weatherHourly) => {
  for (let [i,j,k] = [0,0,0]; i < 24 && j < 7; i++) {
    if (data.location.localtime_epoch<=data.forecast.forecastday[k].hour[i].time_epoch) {
      weatherImages[j] = data.forecast.forecastday[k].hour[i].condition.icon;
      weatherHourly[j] = data.forecast.forecastday[k].hour[i].condition.text;
      j++;
    }
    [i,k] = (j < 7 && i == 23) ? [0,1] : [i,k];
  }
  return [weatherImages, weatherHourly];
}

/** 
 * Creates the HTML code for the background image based on the current weather conditions in the data object.  
 * @param {Object} data - The object containing the current weather conditions data.  
 * @returns {string} The HTML code for the background image.
*/
const createBackgroundImageHTML = (data) => {
  const backgroundImageHTML = `
    <section 
      class="card rounded" style="background-image: url('/assets/background/${data.current.is_day}/${data.current.condition.code}.png'); background-position: 100%; background-size: cover;"> <img 
        src="/assets/background/${data.current.is_day}/${data.current.condition.code}.png" style="display:none" onerror=" this.onerror=null; this.style.display='none'; this.parentNode.style.backgroundImage='url(/assets/background/${data.current.is_day}/default.png)';">
  `;
  return backgroundImageHTML;
}

/**
 * Creates the HTML for the hourly weather forecast section.
 *
 * @param {object} data - The weather data object returned from the API.
 * @param {string} backgroundImageHTML - The HTML string for the background image.
 * @returns {string} - The HTML string for the hourly forecast section.
*/
const createHourlyForecastHTML = (data, backgroundImageHTML) => {
  let weatherImages = new Array(7);
  let weatherHourly = new Array(7);
  let formattedTime = new Array(7);

  formattedTime = getTimeZoneStringID(data, formattedTime);
  [weatherImages, weatherHourly] = getHourlyConditions(data, weatherImages, weatherHourly);

  const hourlyForecastHTML = `
    <section class="card weatherForecast my-4" ${backgroundImageHTML}
      <section class="card-header p-3"><h2 class="m-0"> Hourly Forecast</h2></section>
      <section class="card-body d-flex flex-row weatherForecast text-white pt-0 pb-3 px-2">
        ${(() => {
          let cards = '';
          for(let i=0; i<7; i++) {
            cards += `
              <div class="card align-items-center text-center mx-2">
                <p class="fs-5 m-0"><b>${formattedTime[i]}</b></p>
                <p class="fs-1 mt-2 mb-0">${Math.round(data.forecast.forecastday[0].hour[i].temp_f)}°</p>
                <img src="${weatherImages[i]}" width="64" height="64">
                <p class="text-capitalize text-wrap mb-2">${weatherHourly[i]}</p>
              </div>
            `;
          }
          return cards;
        })()}
      </section>
    </section> 
  `;
  return hourlyForecastHTML;
}

/** 
 * Creates the HTML code for the daily weather forecast based on the forecast data and background image HTML.  
 * @param {Object} data - The object containing the weather forecast data.  
 * @param {string} backgroundImageHTML - The HTML code for the background image.  
 * @returns {string} The HTML code for the daily weather forecast.
*/
const createDailyForecastHTML = (data, backgroundImageHTML) => {
  const dailyForecastHTML = `
    <section class="card weatherForecast mt-4" ${backgroundImageHTML}
      <section class="card-header p-3"><h2 class="m-0"> 3-Day Forecast</h2></section>
      <section class="card-body d-flex flex-row weatherForecast pt-0 pb-3 px-2">
        ${(() => {
          let cards = '';
          for(let i=0; i<3; i++) {
            cards += `
              <div class="card align-items-center mx-2">
                <p class="my-auto fs-5"><b>
                  ${new Date(data.forecast.forecastday[i].date).toLocaleString('en-US', { weekday: 'short', day: 'numeric' })}
                </b></p>
                <p class="fs-2 mt-3 mb-1">
                  <b>${Math.round(data.forecast.forecastday[i].day.maxtemp_f)}°</b> | 
                  ${Math.round(data.forecast.forecastday[i].day.mintemp_f)}°
                </p>
                <img src="${data.forecast.forecastday[i].day.condition.icon}"
                  width="64" height="64"
                />
                <p class="text-capitalize mb-2">
                  ${data.forecast.forecastday[i].day.condition.text}
                </p>
              </div> 
            `;
          }
          return cards;
        })()}
      </section>
    </section>
  `;
  return dailyForecastHTML;
}

/** 
 * Creates the HTML for the current weather section.
 * @param data - the weather data object.
 * @param backgroundImageHTML - the HTML for the background image section.
 * @returns {string} the HTML for the current weather section.
*/
const createCurrentWeatherHTML = (data, backgroundImageHTML) => {
  currentWeatherHTML = `
    ${backgroundImageHTML}
      <section class="card-header currentWeather-header rounded-top fs-3 fw-bold">
        ${data.location.name}, ${data.location.region}, ${data.location.country}
        <p class="fs-6 fw-normal mb-2">Last Update: ${data.current.last_updated}</p>
      </section>
      <section class="card-body d-flex flex-column text-center">
        <h1 class="m-0">${data.location.name}</h2>
        <h1 class="h1-currentWeather fw-light">${Math.round(data.current.temp_f)}°</h1>
        <h3 class="text-capitalize mb-0">${data.current.condition.text}
          <img src="${data.current.condition.icon}" width="64" height="64">
        </h3>
        ${data.alerts && data.alerts.alert.length > 0 && data.alerts.alert[0].event
          ? `<div class="d-flex justify-content-center fs-6">
              <i class="my-2 alert alert-warning bi bi-exclamation-triangle-fill">
                ${data.alerts.alert[0].event}
              </i>
            </div>`
          : ''
        }
        <div class="card currentWeather-bodyInfo flex-column mx-auto my-4">
          <div class="card-body p-3">
            <div class="row align-items-center">
              <div class="col-6 p-0">
                <span class="m-0 bi bi-sunset"> Sunset</span>
                <p class="m-0">${data.forecast.forecastday[0].astro.sunset}</p>
              </div>
              <div class="col-6 p-0">
                <p class="m-0">Sunrise <span class="m-0 bi bi-sunrise-fill"></span></p>
                <span>${data.forecast.forecastday[0].astro.sunrise}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section class="card-footer currentWeather-footer rounded-bottom">
        <div class="row flex-row-reverse flex-sm-row justify-content-between">
          <div class="col-12 col-sm-6">
            <div class="d-flex flex-wrap py-3 px-2">
              <div class="flex-grow-0 bi bi-thermometer"> High | Low</div>
              <div class="flex-grow-1"></div>
              <div class="flex-grow-0">
                ${Math.round(data.forecast.forecastday[0].day.maxtemp_f)}° | 
                ${Math.round(data.forecast.forecastday[0].day.mintemp_f)}°
              </div>
            </div>
          </div>
          <div class="col-12 col-sm-6">
            <div class="d-flex flex-wrap py-3 px-2">
              <div class="flex-grow-0 bi bi-wind"> Wind</div>
              <div class="flex-grow-1"></div>
              <div class="flex-grow-0">
                ${Math.round(data.current.wind_mph)} mph, ${data.current.wind_dir}
              </div>
            </div>
          </div>
        </div>
        <div class="row flex-row-reverse flex-sm-row justify-content-between">
          <div class="col-12 col-sm-6">
            <div class="d-flex flex-wrap py-3 px-2 border-top">
              <div class="flex-grow-0 bi bi-moisture"> Humidity</div>
              <div class="flex-grow-1"></div>
              <div class="flex-grow-0">
                ${data.current.humidity}%
              </div>
            </div>
          </div>
          <div class="col-12 col-sm-6">
            <div class="d-flex flex-wrap py-3 px-2 border-top">
              <div class="flex-grow-0 bi bi-droplet-half"> Precipitation</div>
              <div class="flex-grow-1"></div>
              <div class="flex-grow-0">
                ${data.current.precip_in}%
              </div>
            </div>
          </div>
        </div>
      </section>
    </section> 
  `;
  return currentWeatherHTML;
}

/** 
 * Updates the weather data by creating HTML code for current weather, hourly forecast, and daily forecast.  
 * @async 
 * @function updateWeatherData 
 * @param {Object} data - The weather data obtained from the API.  
 * @returns {void}
*/
const updateWeatherData = async (data) => {
  const backgroundImageHTML = createBackgroundImageHTML(data);
  const hourlyForecastHTML  = createHourlyForecastHTML(data, backgroundImageHTML);
  const dailyForecastHTML   = createDailyForecastHTML(data, backgroundImageHTML);
  const currentWeatherHTML  = createCurrentWeatherHTML(data, backgroundImageHTML);
  const updatedWeatherData  = document.querySelector('main .container');
	updatedWeatherData.innerHTML = `
		<div class="row mx-auto my-4 text-shadow">
			<div class="col currentWeather text-white px-0">
        ${currentWeatherHTML}
        ${hourlyForecastHTML} 
        ${dailyForecastHTML}
			</div>
		</div>
	`;
};

/**
 * Handles the form submission when a location is searched for weather data.
 * @param {Event} e - The event object representing the form submission
 * @returns {void}
*/
const handleSubmit = async(e) => {
	e.preventDefault();
	try {
		const location = document.getElementById('search-input').value.trim();
		const response = await fetch(
      `https://weatherapi-com.p.rapidapi.com/forecast.json?q=${location}&days=3&alerts=yes`,
      options
    );
		const data = await response.json();	
		await updateWeatherData(data);
	} catch (error) {
		console.error(error);
	}
};

/**
 * Add an event listener to the search button element to handle submit event.
 * @param {object} e - The event object.
 * @returns {void}
*/
const searchButton = document.getElementById('search-button');
searchButton.addEventListener('click', handleSubmit);

/** 
 * Add an event listener to the search input element to handle keydown event.  
 * If the key pressed is "Enter", handleSubmit function will be called.  
 * @param {object} e - The event object.  
 * @returns {void}
*/
const searchInput = document.querySelector('#search-input');
searchInput.addEventListener('keydown', (e) => {
	if (e.key === 'Enter')
	  handleSubmit(e);
});

/** 
 * Loads the API key from a text file and sets it as the value for the apiKey variable.
 * The function also sets the API key as the value for the X-RapidAPI-Key header in the options object.
*/
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
