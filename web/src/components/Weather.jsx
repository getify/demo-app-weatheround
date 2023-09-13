import { useState, useEffect } from 'react'
import {
  useGetWeather,
  setDefaultWeatherUnits,
  getWeatherStatus
} from 'src/hooks/useGetWeather.js'
import WeatherUnitsControl from 'src/components/WeatherUnitsControl.jsx'
import CurrentWeather from 'src/components/CurrentWeather.jsx'
import WeatherForecast from 'src/components/WeatherForecast.jsx'
import HourlyForecast from 'src/components/HourlyForecast.jsx'


export default Weather


// *******************

function Weather({
  loc,
  locFound,
  activateWeather,
  cancelWeather,
  canceled = false
}) {
  // note: `let`s here are intentional
  let [ temperatureUnit, setTemperatureUnit ] = useState(null)
  let [ speedUnit, setSpeedUnit ] = useState(null)

  const [ forecastDate, setForecastDate ] = useState(null)
  const [ weatherToken, updateWeatherToken ] =
    useState(Math.random())
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

  // useEffect(() => { console.log('render') })

  return (
    <>
      <WeatherUnitsControl
        temperatureUnit={temperatureUnit}
        speedUnit={speedUnit}
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
                          />
                        ) :

                        (
                          <>
                            <CurrentWeather
                              currentWeather={weather.current}
                              setForecastDate={setForecastDate}
                              lastUpdate={weather.lastUpdate}
                            />

                            <WeatherForecast
                              futureWeather={weather.future}
                              setForecastDate={setForecastDate}
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

  function doToggleUnit(evt) {
    if (evt.target.matches('[name=pickTemperatureUnit]')) {
      activateWeather()
      setDefaultWeatherUnits(
        evt.target.value,
        speedUnit,
        /*override=*/true
      )
      setTemperatureUnit(evt.target.value)
    }
    else if (evt.target.matches('[name=pickSpeedUnit]')) {
      activateWeather()
      setDefaultWeatherUnits(
        temperatureUnit,
        evt.target.value,
        /*override=*/true
      )
      setSpeedUnit(evt.target.value)
    }
  }

  function doRefresh() {
    activateWeather()
    updateWeatherToken(Math.random())
  }
}
