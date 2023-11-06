import { useRef } from 'react'


export default HourlyForecast


// *******************

function HourlyForecast({
  lastUpdate,
  hourlyForecast,
  setForecastDate,
  selectedTimeMode
}) {
  const displayTimezone = (
    (
      hourlyForecast[0].date.time.local !=
      hourlyForecast[0].date.time.remote
    ) ?
      (
        hourlyForecast[0].date.time[selectedTimeMode].match(/([^\s]+)$/)?.[1]
      ) :

      null
  )
  const timeLabels = hourlyForecast.map(
    ({ date: { time } }) => formatTimeLabel(time[selectedTimeMode])
  )
  const temperatureData = hourlyForecast.map(
    ({ temp }) => parseInt(temp, 10)
  )
  const minTemperature = Math.min(...temperatureData)
  const maxTemperature = Math.max(...temperatureData)
  const temperatureSpan = computeSpanByZero(
    minTemperature,
    maxTemperature
  )
  const precipitationData = hourlyForecast.map(
    ({ precipitation }) => parseInt(precipitation, 10)
  )
  const minPrecipitation = Math.min(...precipitationData)
  const maxPrecipitation = Math.max(...precipitationData)
  const precipitationSpan = computeSpanByZero(
    minPrecipitation,
    maxPrecipitation
  )
  const windData = hourlyForecast.map(
    ({ wind }) => parseInt(wind, 10)
  )
  const minWindSpeed = Math.min(...windData)
  const maxWindSpeed = Math.max(...windData)
  const windSpeedSpan = computeSpanByZero(
    minWindSpeed,
    maxWindSpeed
  )
  const temperatureChartRef = useRef()
  const precipitationChartRef = useRef()
  const windChartRef = useRef()

  return (
    <div id="hourly-forecast">
      <p>
        <button
          type="button"
          className="icon-text-btn back"
          onClick={() => setForecastDate(null)}
        >
          back
        </button>
      </p>

      <h2>
        {hourlyForecast[0].date.dow}{' '}
        {hourlyForecast[0].date.date}
        {
          displayTimezone != null ? ` (${displayTimezone})` : null
        }
      </h2>

      <div
        id="select-hourly-chart"
        className="multiToggleControl"
        onChangeCapture={doToggleChartShown}
      >
        <label title='Show hourly temperatures'>
          Temperature
          <input
            type="radio"
            name='showWhichChart'
            value='temperature'
            defaultChecked={true}
            aria-description='Select hourly temperatures chart'
          />
        </label>

        <label title='Show hourly precipitation'>
          Precipitation
          <input
            type="radio"
            name='showWhichChart'
            value='precipitation'
            defaultChecked={false}
            aria-description='Select hourly precipitation chart'
          />
        </label>

        <label title='Show hourly wind speeds'>
          Wind
          <input
            type="radio"
            name='showWhichChart'
            value='wind'
            defaultChecked={false}
            aria-description='Select hourly wind chart'
          />
        </label>
      </div>

      <div className="chart-container temperature">
        <ol
          className="horz-bar-chart"
          style={{
            '--cfg-bar-scale-factor':
              `calc((0.9 * var(--content-width)) / max(1, ${temperatureSpan}))`,
            '--cfg-row-gap-scale': '3',
            '--cfg-column-gap-scale': '5',
            '--cfg-label-internal-padding-scale': '0.8',
            '--cfg-bar-height': 'calc(4.5 * var(--vh-unit))',
            '--cfg-label-font-scale': '1.2',
            '--cfg-label-font-weight': 'bold',
            '--cfg-row-label-color': 'rgba(0, 0, 0, 0)',
            '--cfg-bar-color': 'yellow',
            '--cfg-bar-label-color': 'rgba(50, 53, 47, 0.8)',
            '--cfg-bar-label-text-color': 'yellow',
            '--cfg-min-value': minTemperature
          }}
          ref={temperatureChartRef}
        >
          {
            timeLabels.map((label, idx) => (
              <li
                aria-label={
                  `${label}: ${temperatureData[idx]}${hourlyForecast[0].tempUnit}`
                }
                title={
                  `${label}: ${temperatureData[idx]}${hourlyForecast[0].tempUnit}`
                }
                data-bar-label={label}
                key={idx}
              >
                <i
                  aria-hidden="hidden"
                  data-value-label={
                    `${temperatureData[idx]}${hourlyForecast[0].tempUnit}`
                  }
                  style={{
                    '--cfg-value': temperatureData[idx]
                  }}
                ></i>
              </li>
            ))
          }
        </ol>
      </div>

      <div className="chart-container precipitation hidden">
        <ol
          className="horz-bar-chart"
          style={{
            '--cfg-bar-scale-factor':
              `calc((0.9 * var(--content-width)) / max(1, ${precipitationSpan}))`,
            '--cfg-row-gap-scale': '3',
            '--cfg-column-gap-scale': '5',
            '--cfg-label-internal-padding-scale': '0.8',
            '--cfg-bar-height': 'calc(4.5 * var(--vh-unit))',
            '--cfg-label-font-scale': '1.2',
            '--cfg-label-font-weight': 'bold',
            '--cfg-row-label-color': 'rgba(0, 0, 0, 0)',
            '--cfg-bar-color': 'rgba(36, 135, 205)',
            '--cfg-bar-label-color': 'white',
            '--cfg-bar-label-text-color': 'rgba(36, 135, 205)',
            '--cfg-min-value': minPrecipitation
          }}
          ref={precipitationChartRef}
        >
          {
            timeLabels.map((label, idx) => (
              <li
                aria-label={
                  `${label}: ${precipitationData[idx]}%`
                }
                title={
                  `${label}: ${precipitationData[idx]}%`
                }
                data-bar-label={label}
                key={idx}
              >
                <i
                  aria-hidden="hidden"
                  data-value-label={
                    `${precipitationData[idx]}%`
                  }
                  style={{
                    '--cfg-value': precipitationData[idx]
                  }}
                ></i>
              </li>
            ))
          }
        </ol>
      </div>

      <div className="chart-container wind hidden">
        <ol
          className="horz-bar-chart"
          style={{
            '--cfg-bar-scale-factor':
              `calc((0.9 * var(--content-width)) / max(1, ${windSpeedSpan}))`,
            '--cfg-row-gap-scale': '3',
            '--cfg-column-gap-scale': '5',
            '--cfg-label-internal-padding-scale': '0.8',
            '--cfg-bar-height': 'calc(4.5 * var(--vh-unit))',
            '--cfg-label-font-scale': '1.2',
            '--cfg-label-font-weight': 'bold',
            '--cfg-row-label-color': 'rgba(0, 0, 0, 0)',
            '--cfg-bar-color': 'rgba(150, 150, 150)',
            '--cfg-bar-label-color': 'rgba(45, 45, 45, 0.7)',
            '--cfg-bar-label-text-color': 'white',
            '--cfg-min-value': minWindSpeed
          }}
          ref={windChartRef}
        >
          {
            timeLabels.map((label, idx) => (
              <li
                aria-label={
                  `${label}: ${hourlyForecast[idx].wind}`
                }
                title={
                  `${label}: ${hourlyForecast[idx].wind}`
                }
                data-bar-label={label}
                key={idx}
              >
                <i
                  aria-hidden="hidden"
                  data-value-label={
                    hourlyForecast[idx].wind
                  }
                  style={{
                    '--cfg-value': windData[idx]
                  }}
                ></i>
              </li>
            ))
          }
        </ol>
      </div>

      <p>
        <button
          type="button"
          className="icon-text-btn back"
          onClick={() => setForecastDate(null)}
        >
          back
        </button>
      </p>
    </div>
  )


  // *******************

  function computeSpanByZero(minValue, maxValue) {
    return Math.max(
      Math.abs(minValue),
      Math.abs(maxValue),
      Math.abs(maxValue - minValue)
    )
  }

  function formatTimeLabel(value) {
    const { hour = '', ampm = '' } = (
      value.match(/^(?<hour>\d+):\d+\s*(?<ampm>\w+)/)?.groups || {}
    )
    return `${hour}${ampm[0].toLowerCase()}`
  }

  function doToggleChartShown(evt) {
    if (evt.target.matches('input[type=radio][name=showWhichChart]')) {
      const chartContainers = [
        temperatureChartRef.current.closest('.chart-container'),
        precipitationChartRef.current.closest('.chart-container'),
        windChartRef.current.closest('.chart-container')
      ]

      for (let container of chartContainers) {
        container.classList.add('hidden')
        if (container.classList.contains(evt.target.value)) {
          container.classList.remove('hidden')
        }
      }
    }
  }
}
