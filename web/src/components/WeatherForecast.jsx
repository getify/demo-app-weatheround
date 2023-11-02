export default WeatherForecast


// *******************

function WeatherForecast({
  futureWeather,
  setForecastDate,
  selectedTimeMode
}) {
  const forecastDays = [];
  for (let forecast of futureWeather) {
    forecastDays.push(
      <WeatherForecastDay
        forecast={forecast}
        setForecastDate={setForecastDate}
        key={forecast.date.timestamp}
        selectedTimeMode={selectedTimeMode}
      />
    )
  }

  return (
    <div id="daily-forecast">
      {forecastDays}
    </div>
  )
}

function WeatherForecastDay({
  forecast: {
    date,
    conditions,
    temperature,
    lowTemp,
    highTemp,
    wind,
    precipitation,
    sunrise,
    sunset
  },
  setForecastDate,
  selectedTimeMode
}) {
  return (
    <div className="forecast-day">
      <div className="weather-date">
        {date.dow} {date.date}
      </div>

      <div className="temperature">
        <span
          className="low"
          title="Forecasted Low Temperature"
        >
          <i className="icon weather temperature-low" />
          {lowTemp}
        </span>
        <span
          className="high"
          title="Forecasted High Temperature"
        >
          <i className="icon weather temperature-high" />
          {highTemp}
        </span>
      </div>
      <div className="conditions">
        <i
          className={`icon weather ${conditions.dayClass}`}
          title={`Forecasted Conditions: ${conditions.label}`}
        >
          {conditions.label}
        </i>

        {conditions.label}
      </div>
      <div className="wind-precipitation">
        <div
          className="wind"
          title="Forecasted Average Windspeed"
        >
          <i className="icon weather wind" />
          {wind}
        </div>
        <div
          className="precipitation"
          title="Forecasted Chance of Precipitation"
        >
          <i className="icon weather precipitation" />
          {precipitation}
        </div>
      </div>
      <div className="sunrise-sunset">
        <div
          className="sunrise"
          title="Daily Sunrise"
        >
          <i className="icon weather wi-sunrise" />
          {sunrise.time[selectedTimeMode]}
        </div>
        <div
          className="sunset"
          title="Daily Sunset"
        >
          <i className="icon weather wi-sunset" />
          {sunset.time[selectedTimeMode]}
        </div>
      </div>
      <button
        type="button"
        className="icon-text-btn hourly-forecast"
        onClick={() => setForecastDate(date.isoDate)}
      >
        hourly forecast
      </button>
    </div>
  )
}
