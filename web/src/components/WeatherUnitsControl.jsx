import { useRef } from 'react'
import { cancelEvt } from 'src/lib/util.js'
import ToggleControl from 'src/components/ToggleControl.jsx'


export default WeatherUnitsControl


// *******************

function WeatherUnitsControl({
  temperatureUnit,
  speedUnit,
  selectedTimeMode,
  toggleUnit
}) {

  const weatherUnitsSelectorRef = useRef()

  let weatherUnitsShown = !(
    weatherUnitsSelectorRef.current?.matches('.hidden')
  )

  return (
    <>
      <button
        type="button"
        id="toggle-weather-units-btn"
        className="icon-btn weather-units"
        onClick={doToggleWeatherUnitsSelector}
        title="configure default weather units"
        aria-controls="weather-units-selector"
      >
        change weather units
      </button>

      <div
        id="weather-units-selector"
        className="hidden"
        ref={weatherUnitsSelectorRef}
        aria-expanded="false"
      >
        {
          !!temperatureUnit ?
            (
              <ToggleControl
                name="pickTemperatureUnit"
                currentValue={temperatureUnit}
                elementKey="temperatureUnitSelector"
                description="Select default temperature unit"
                onChangeCapture={doToggleUnit}
                option1={{
                  title: 'Select Fahrenheit',
                  label: '°F',
                  value: 'fahrenheit',
                  description: 'Fahrenheit'
                }}
                option2={{
                  title: 'Select Celsius',
                  label: '°C',
                  value: 'celsius',
                  description: 'Celsius'
                }}
              />
            ) :

            null
        }

        {
          !!speedUnit ?
            (
              <ToggleControl
                name="pickSpeedUnit"
                currentValue={speedUnit}
                elementKey="speedUnitSelector"
                description="Select default windspeed unit"
                onChangeCapture={doToggleUnit}
                option1={{
                  title: 'Select miles per hour',
                  label: 'mph',
                  value: 'mph',
                  description: 'mph'
                }}
                option2={{
                  title: 'Select kilometers per hour',
                  label: 'km/h',
                  value: 'kmh',
                  description: 'km/h'
                }}
              />
            ) :

            null
        }

        {
          !!selectedTimeMode ?
            (
              <ToggleControl
                name="pickTimeMode"
                currentValue={selectedTimeMode}
                elementKey="timeModeSelector"
                description="Select which type of timezone to display"
                onChangeCapture={doToggleUnit}
                option1={{
                  title: 'Select local time',
                  label: (
                    <>
                      <i className="icon clock" /> local
                    </>
                  ),
                  value: 'local',
                  description: 'Use local device timezone'
                }}
                option2={{
                  title: 'Select remote time',
                  label: 'remote',
                  value: 'remote',
                  description: 'Use remote location timezone'
                }}
              />
            ) :

            null
        }
      </div>
    </>
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
      // weather-units popup visible?
      weatherUnitsShown &&

      (
        (
          evt.type === 'keydown' &&
          evt.key === 'Escape'
        ) ||

        (
          evt.type === 'click' &&

          // event outside the weather-units popup?
          !evt.target.closest('#weather-units-selector')
        )
      )
    ) {
      cancelEvt(evt)
      doHideWeatherUnitsSelector()
    }
  }

  function doToggleUnit(evt) {
    doHideWeatherUnitsSelector()
    toggleUnit(evt)
  }

  function doToggleWeatherUnitsSelector() {
    if (weatherUnitsShown) {
      doHideWeatherUnitsSelector()
    }
    else {
      weatherUnitsSelectorRef.current.classList.remove('hidden')
      weatherUnitsSelectorRef.current.setAttribute('aria-expanded', 'true')
      weatherUnitsShown = true
      bindPopupEvents()
    }
  }

  function doHideWeatherUnitsSelector() {
    weatherUnitsSelectorRef.current.classList.add('hidden')
    weatherUnitsSelectorRef.current.setAttribute('aria-expanded', 'false')
    weatherUnitsShown = false
    unbindPopupEvents()
  }
}
