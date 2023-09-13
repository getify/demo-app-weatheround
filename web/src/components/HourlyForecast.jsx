export default HourlyForecast


// *******************

function HourlyForecast({
  lastUpdate,
  hourlyForecast,
  setForecastDate
}) {
  const forecastHours = [];
  for (let forecast of hourlyForecast) {
    forecastHours.push(
      <WeatherForecastHour
        forecast={forecast}
        key={forecast.date.timestamp}
      />
    )
  }

  return (
    <div id="hourly-forecast">
      <p>
        <button
          type="button"
          onClick={() => setForecastDate(null)}
        >
          &lt;&lt;{' '}back
        </button>
      </p>

      <div>
        <strong>
          Last Update: {lastUpdate.date}
          {' '}{lastUpdate.time}
        </strong>
      </div>

      <div>
        <strong>
          {hourlyForecast[0].date.day}{' '}
          {hourlyForecast[0].date.date}{' '}
        </strong>
      </div>

      {forecastHours}

      <hr />

      <p>
        <button
          type="button"
          onClick={() => setForecastDate(null)}
        >
          &lt;&lt;{' '}back
        </button>
      </p>
    </div>
  )
}

function WeatherForecastHour({
  forecast: {
    date,
    conditions,
    temperature,
    temp,
    wind,
    precipitation
  }
}) {
  return (
    <>
      <hr />
      <div>
        <div className="time">
          <strong>{date.time}</strong>
        </div>
        <div className="conditions">
          <strong>Conditions:</strong> {conditions.label}
        </div>
        <div className="temp">
          <strong>Temp:</strong> {temp}
        </div>
        <div className="wind">
          <strong>Wind:</strong> {wind}
        </div>
        <div className="precipitation">
          <strong>Precipitation:</strong> {precipitation}
        </div>
      </div>
    </>
  )
}
