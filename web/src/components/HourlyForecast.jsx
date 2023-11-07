import { useState, useRef } from 'react'
import HorzBarChart from 'src/components/HorzBarChart.jsx'


export default HourlyForecast


// *******************

function HourlyForecast({
  lastUpdate,
  hourlyForecast,
  setForecastDate,
  selectedTimeMode
}) {
  const [ activeChart, setActiveChart ] = useState('temperature')
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
  const precipitationData = hourlyForecast.map(
    ({ precipitation }) => parseInt(precipitation, 10)
  )
  const windData = hourlyForecast.map(
    ({ wind }) => parseInt(wind, 10)
  )
  const chartData = (
    activeChart === 'temperature' ? temperatureData :
    activeChart === 'precipitation' ? precipitationData :
    activeChart === 'wind' ? windData :
    []
  )
  const chartCfg = (
    activeChart === 'temperature' ? {
      '--cfg-row-label-color': 'rgba(0, 0, 0, 0)',
      '--cfg-bar-color': 'yellow',
      '--cfg-bar-label-color': 'rgba(50, 53, 47, 0.8)',
      '--cfg-bar-label-text-color': 'yellow'
    } :

    activeChart === 'precipitation' ? {
      '--cfg-row-label-color': 'rgba(0, 0, 0, 0)',
      '--cfg-bar-color': 'rgba(36, 135, 205)',
      '--cfg-bar-label-color': 'white',
      '--cfg-bar-label-text-color': 'rgba(36, 135, 205)'
    } :

    activeChart === 'wind' ? {
      '--cfg-row-label-color': 'rgba(0, 0, 0, 0)',
      '--cfg-bar-color': 'rgba(150, 150, 150)',
      '--cfg-bar-label-color': 'rgba(45, 45, 45, 0.7)',
      '--cfg-bar-label-text-color': 'white'
    } :

    {}
  )

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

      <HorzBarChart
        chartType={activeChart}
        rowLabels={timeLabels}
        rowData={chartData}
        formatRowLabel={formatRowLabel}
        formatBarLabel={formatBarLabel}
        chartCfg={chartCfg}
      />

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

  function formatTimeLabel(value) {
    const { hour = '', ampm = '' } = (
      value.match(/^(?<hour>\d+):\d+\s*(?<ampm>\w+)/)?.groups || {}
    )
    return `${hour}${ampm[0].toLowerCase()}`
  }

  function formatRowLabel(label, idx) {
    return `${label}: ${formatBarLabel(label, idx)}`
  }

  function formatBarLabel(label, idx) {
    return (
      activeChart === 'temperature' ?
        `${temperatureData[idx]}${hourlyForecast[0].tempUnit}` :
      activeChart === 'precipitation' ?
        `${precipitationData[idx]}%` :
      activeChart === 'wind' ?
        hourlyForecast[idx].wind :

      ''
    )
  }

  function doToggleChartShown(evt) {
    if (evt.target.matches('input[type=radio][name=showWhichChart]')) {
      setActiveChart(evt.target.value)
    }
  }
}
