import { useState, useRef, useContext } from 'react'
import HomeContext from 'src/lib/home-context.js'
import {
  useGetWeather,
  setDefaultWeatherUnits,
  getWeatherStatus
} from 'src/hooks/useGetWeather.js'
import WeatherUnitsControl from 'src/components/WeatherUnitsControl.jsx'
import CurrentWeather from 'src/components/CurrentWeather.jsx'
import WeatherForecast from 'src/components/WeatherForecast.jsx'
import HourlyForecast from 'src/components/HourlyForecast.jsx'
import JSONStore from 'src/lib/json-store.js'


let timeMode = await getSavedTimeMode()


export default Weather


// *******************

function Weather({
  activateWeather,
  cancelWeather,
  canceled = false
}) {
  const {
    loc,
    locFound
  } = useContext(HomeContext)

  // note: `let`s here are intentional
  let [ temperatureUnit, setTemperatureUnit ] = useState(null)
  let [ speedUnit, setSpeedUnit ] = useState(null)
  let [ forecastDate, setForecastDate ] = useState(null)

  const [ selectedTimeMode, updateTimeMode ] = useState(timeMode)
  const locState = useRef(loc)

  // location has changed?
  if (loc !== locState.current) {
    locState.current = loc

    // reset forecast date (close hourly view)
    setForecastDate(forecastDate = null)
  }

  const [ weatherToken, updateWeatherToken ] = useState(Math.random())
  const [ weather ] = useGetWeather({
    loc,
    token: weatherToken,
    date: forecastDate,
    canceled
  })
  const { pending, found } = getWeatherStatus(weather)

  // initial default temperature/speed units determined?
  if (
    !canceled &&
    locFound &&
    (
      (
        temperatureUnit == null &&
        loc.temperatureUnit != null
      ) ||
      (
        speedUnit == null &&
        loc.speedUnit != null
      )
    )
  ) {
    setTemperatureUnit(temperatureUnit = loc.temperatureUnit)
    setSpeedUnit(speedUnit = loc.speedUnit)
  }

  return (
    <>
      <WeatherUnitsControl
        temperatureUnit={temperatureUnit}
        speedUnit={speedUnit}
        selectedTimeMode={selectedTimeMode}
        toggleUnit={doToggleUnit}
      />

      {
        locFound ? (
          <>
            {
              !pending || canceled ?
                (
                  <button
                    id="refresh-weather-btn"
                    type="button"
                    className="icon-btn refresh-weather"
                    onClick={doRefresh}
                    title="refresh weather information"
                  >
                    refresh weather
                  </button>
                ) :

                null
            }

            {
              pending ?
                (
                  <h3>
                    <button
                      type="button"
                      className="icon-btn cancel"
                      onClick={cancelWeather}
                      title="Cancel weather update"
                    >
                      cancel weather update
                    </button>
                    {' '}
                    Retrieving weather...
                  </h3>
                ) :

              found ?
                (
                  <>
                    {
                      weather.hourly != null ?
                        (
                          <HourlyForecast
                            lastUpdate={weather.lastUpdate}
                            hourlyForecast={weather.hourly}
                            setForecastDate={setForecastDate}
                            selectedTimeMode={selectedTimeMode}
                          />
                        ) :

                        (
                          <>
                            <CurrentWeather
                              currentWeather={weather.current}
                              setForecastDate={setForecastDate}
                              lastUpdate={weather.lastUpdate}
                              selectedTimeMode={selectedTimeMode}
                            />

                            <WeatherForecast
                              futureWeather={weather.future}
                              setForecastDate={setForecastDate}
                              selectedTimeMode={selectedTimeMode}
                            />
                          </>
                        )
                    }

                    <h5>
                      <a href="https://open-meteo.com/" target="_blank">
                        Weather data provided by Open-Meteo.com
                      </a>
                    </h5>
                  </>
                ) :

              canceled ?
                (
                  <p>..no weather info..</p>
                ) :

                (
                  <p>..weather info unavailable..</p>
                )
            }
          </>
        ) :

        null
      }
    </>
  )


  // *******************

  async function doToggleUnit(evt) {
    if (evt.target.matches('[name=pickTemperatureUnit]')) {
      setForecastDate(forecastDate = null)
      activateWeather()
      await setDefaultWeatherUnits(
        evt.target.value,
        speedUnit,
        /*override=*/true
      )
      setTemperatureUnit(evt.target.value)
    }
    else if (evt.target.matches('[name=pickSpeedUnit]')) {
      setForecastDate(forecastDate = null)
      activateWeather()
      await setDefaultWeatherUnits(
        temperatureUnit,
        evt.target.value,
        /*override=*/true
      )
      setSpeedUnit(evt.target.value)
    }
    else if (evt.target.matches('[name=pickTimeMode]')) {
      setForecastDate(forecastDate = null)
      activateWeather()
      storeSavedTimeMode(evt.target.value)
      updateTimeMode(evt.target.value)
    }
  }

  function doRefresh() {
    activateWeather()
    updateWeatherToken(Math.random())
  }
}

async function getSavedTimeMode() {
  const timeMode = await JSONStore.getItem('default-time-mode')
  return timeMode || 'remote'
}

async function storeSavedTimeMode(newTimeMode) {
  if (newTimeMode != null) {
    await JSONStore.setItem(
      'default-time-mode',
      timeMode = newTimeMode
    )
  }
}
