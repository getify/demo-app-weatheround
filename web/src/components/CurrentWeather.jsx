import { Link, routes } from '@redwoodjs/router'
import { useState, useEffect, useRef } from 'react'
import { cancelEvt } from 'src/lib/util.js'


export default CurrentWeather


// *******************

function CurrentWeather({
  lastUpdate,
  currentWeather: {
    isoDate,
    dayTime,
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
    <div id="current-weather">
      <div className="weather-date">
        Today {lastUpdate.date}
      </div>

      <div
        id="last-update"
        title="Last Updated"
      >
        {lastUpdate.time}
      </div>

      <div className="temperature">
        <span
          className="current"
          title="Current Temperature"
        >
          {temperature}
        </span>
        <span
          className="low"
          title="Low Temperature"
        >
          <i className="icon weather temperature-low" />
          {lowTemp}
        </span>
        <span
          className="high"
          title="High Temperature"
        >
          <i className="icon weather temperature-high" />
          {highTemp}
        </span>
      </div>
      <div className="conditions">
        <i
          className={
            `icon weather ${
              dayTime ?
                conditions.dayClass :
                conditions.nightClass
              }`
          }
          title={`Current Conditions: ${conditions.label}`}
        >
          {conditions.label}
        </i>

        {conditions.label}
      </div>
      <div className="wind-precipitation">
        <div
          className="wind"
          title="Average Windspeed"
        >
          <i className="icon weather wind" />
          {wind}
        </div>
        <div
          className="precipitation"
          title="Chance of Precipitation"
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
        onClick={() => setForecastDate(isoDate)}
      >
        hourly forecast
      </button>
    </div>
  )
}
