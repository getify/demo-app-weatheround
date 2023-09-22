import { Link, routes } from '@redwoodjs/router'
import { useRef } from 'react'
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
  setForecastDate,
  selectedTimeMode
}) {
  const lastUpdatePopupRef = useRef()

  // note: `let` here is intentional
  let lastUpdatePopupShown = false

  return (
    <div
      id="current-weather"
      className={dayTime ? 'day' : 'night'}
    >
      <div className="weather-date">
        Today {lastUpdate.date}
      </div>

      <button
        type="button"
        className="icon-btn cloud-clock"
        id="show-last-update-btn"
        title="Show Last Update Time"
        onClick={doToggleLastUpdated}
        aria-controls="last-update-popup"
      >
        show last update time
      </button>

      <div
        id="last-update-popup"
        className="hidden"
        aria-expanded="false"
        title="Time of last weather update"
        ref={lastUpdatePopupRef}
      >
        {lastUpdate.time[selectedTimeMode]}
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
        onClick={() => setForecastDate(isoDate)}
      >
        hourly forecast
      </button>
    </div>
  )


  // *******************

  function bindPopupEvents() {
    document.addEventListener('click', eventOutsidePopup, true)
    document.addEventListener('keydown', eventOutsidePopup, true)
  }

  function unbindPopupEvents() {
    document.removeEventListener('click', eventOutsidePopup, true)
    document.removeEventListener('keydown', eventOutsidePopup, true)
  }

  function eventOutsidePopup(evt) {
    if (
      // last-update popup visible?
      lastUpdatePopupShown &&

      (
        (
          evt.type === 'keydown' &&
          evt.key === 'Escape'
        ) ||

        (
          evt.type === 'click' &&

          // event outside the saved-locations popup?
          !evt.target.closest('#last-update-popup')
        )
      )
    ) {
      cancelEvt(evt)
      doHideLastUpdatePopup()
    }
  }

  function doToggleLastUpdated() {
    if (lastUpdatePopupShown) {
      doHideLastUpdatePopup()
    }
    else {
      lastUpdatePopupRef.current?.classList.remove('hidden')
      lastUpdatePopupShown = true
      bindPopupEvents()
    }
  }

  function doHideLastUpdatePopup() {
    lastUpdatePopupRef.current?.classList.add('hidden')
    lastUpdatePopupShown = false
    unbindPopupEvents()
  }
}
