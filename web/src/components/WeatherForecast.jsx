import { Link, routes } from '@redwoodjs/router'
import { useState, useEffect, useRef } from 'react'
import { cancelEvt } from 'src/lib/util.js'

export default WeatherForecast


// *******************

function WeatherForecast({
  futureWeather,
  setForecastDate
}) {
  const forecastDays = [];
  for (let forecast of futureWeather) {
    forecastDays.push(
      <WeatherForecastDay
        forecast={forecast}
        setForecastDate={setForecastDate}
        key={forecast.date.timestamp}
      />
    )
  }

  return (
    <div id="daily-forecast">{forecastDays}</div>
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
  setForecastDate
}) {
  return (
    <div className="forecast-day">
      <div className="weather-date">
        {date.day} {date.date}
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
          {sunrise.time}
        </div>
        <div
          className="sunset"
          title="Daily Sunset"
        >
          <i className="icon weather wi-sunset" />
          {sunset.time}
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
