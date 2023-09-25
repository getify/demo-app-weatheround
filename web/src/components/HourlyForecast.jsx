import { useRef } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  LineController,
  BarController
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Bar, Line } from 'react-chartjs-2';


export default HourlyForecast


// *******************

function HourlyForecast({
  lastUpdate,
  hourlyForecast,
  setForecastDate,
  selectedTimeMode
}) {
  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
    LineController,
    BarController,
    ChartDataLabels
  )

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
    ({ date: { time }}) => formatTimeLabel(time[selectedTimeMode])
  )
  const temperatureData = hourlyForecast.map(
    ({ temp }) => parseInt(temp, 10)
  )
  const minTemperature = Math.min(...temperatureData)
  const maxTemperature = Math.max(...temperatureData)
  const precipitationData = hourlyForecast.map(
    ({ precipitation }) => parseInt(precipitation, 10)
  )
  const maxPrecipitation = Math.max(...precipitationData)
  const windData = hourlyForecast.map(
    ({ wind }) => parseInt(wind, 10)
  )
  const maxWindSpeed = Math.max(...windData)
  const parentWidth = (
    document.querySelector("main").offsetWidth
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
        {hourlyForecast[0].date.day}{' '}
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

      <div className="chartContainer temperature">
        <Bar
          ref={temperatureChartRef}
          datasetIdKey="id"
          data={{
            labels: timeLabels,
            datasets: [
              {
                id: 1,
                data: temperatureData,
                backgroundColor: 'yellow',
                borderWidth: 0,
                barThickness: 25,
                datalabels: {
                  display: true,
                  anchor(context) {
                    return (
                      context.dataset.data[context.dataIndex] < 0 ?
                        'start' :
                        'end'
                    )
                  },
                  align(context) {
                    return (
                      context.dataset.data[context.dataIndex] <= 0 ?
                        'right' :
                        'left'
                    )
                  },
                  color: 'yellow',
                  backgroundColor: 'rgba(50, 53, 47, 0.8)',
                  formatter(value) {
                    return `${value}${hourlyForecast[0].tempUnit}`
                  },
                  labels: {
                    title: {
                      bold: true
                    }
                  }
                }
              }
            ]
          }}
          width={parentWidth}
          height="950"
          options={{
            animation: false,
            events: [],
            layout: {
              autoPadding: true
            },
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                enabled: false
              },
              datalabels: {
                clip: false,
                borderRadius: 6,
                labels: {
                  title: {
                    font: {
                      weight: 'bold'
                    }
                  }
                }
              }
            },
            elements: {
              bar: {
                borderRadius: 10
              }
            },
            indexAxis: 'y',
            scales: {
              x: {
                display: false,
                type: 'linear',
                suggestedMin: minTemperature,
                suggestedMax: maxTemperature
              },
              y: {
                display: true,
                grid: {
                  drawOnChartArea: false
                },
                ticks: {
                  color: 'white'
                }
              }
            }
          }}
        />
      </div>

      <div className="chartContainer precipitation hidden">
        <Bar
          ref={precipitationChartRef}
          datasetIdKey="id"
          data={{
            labels: timeLabels,
            datasets: [
              {
                id: 1,
                data: precipitationData,
                backgroundColor: 'rgba(36, 135, 205)',
                borderWidth: 0,
                barThickness: 25,
                datalabels: {
                  display: true,
                  anchor: 'end',
                  align(context) {
                    return (
                      context.dataset.data[context.dataIndex] > 5 ?
                        'left' :
                        'right'
                    )
                  },
                  color: 'rgba(36, 135, 205)',
                  backgroundColor: 'white',
                  formatter(value) {
                    return `${value}%`
                  }
                }
              }
            ]
          }}
          width={parentWidth}
          height="950"
          options={{
            animation: false,
            events: [],
            layout: {
              autoPadding: true
            },
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                enabled: false
              },
              datalabels: {
                clip: false,
                borderRadius: 6,
                labels: {
                  title: {
                    font: {
                      weight: 'bold'
                    }
                  }
                }
              }
            },
            elements: {
              bar: {
                borderRadius: 10
              }
            },
            indexAxis: 'y',
            scales: {
              x: {
                display: false,
                type: 'linear',
                suggestedMin: 0,
                suggestedMax: maxPrecipitation
              },
              y: {
                display: true,
                grid: {
                  drawOnChartArea: false
                },
                ticks: {
                  color: 'white'
                }
              }
            }
          }}
        />
      </div>

      <div className="chartContainer wind hidden">
        <Bar
          ref={windChartRef}
          datasetIdKey="id"
          data={{
            labels: timeLabels,
            datasets: [
              {
                id: 1,
                data: windData,
                backgroundColor: 'rgba(150, 150, 150)',
                borderWidth: 0,
                barThickness: 25,
                datalabels: {
                  display: true,
                  anchor: 'end',
                  align(context) {
                    return (
                      context.dataset.data[context.dataIndex] > 1 ?
                        'left' :
                        'right'
                    )
                  },
                  color: 'white',
                  backgroundColor: 'rgba(45, 45, 45, 0.7)',
                  formatter(value,context) {
                    return hourlyForecast[context.dataIndex].wind
                  }
                }
              }
            ]
          }}
          width={parentWidth}
          height="950"
          options={{
            animation: false,
            events: [],
            layout: {
              autoPadding: true
            },
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                enabled: false
              },
              datalabels: {
                clip: false,
                borderRadius: 6,
                labels: {
                  title: {
                    font: {
                      weight: 'bold'
                    }
                  }
                }
              }
            },
            elements: {
              bar: {
                borderRadius: 10
              }
            },
            indexAxis: 'y',
            scales: {
              x: {
                display: false,
                type: 'linear',
                suggestedMin: 0,
                suggestedMax: maxWindSpeed
              },
              y: {
                display: true,
                grid: {
                  drawOnChartArea: false
                },
                ticks: {
                  color: 'white'
                }
              }
            }
          }}
        />
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

  function formatTimeLabel(value) {
    const { hour = '', ampm = '' } = (
      value.match(/^(?<hour>\d+):\d+\s*(?<ampm>\w+)/)?.groups || {}
    )
    return `${hour}${ampm[0].toLowerCase()}`
  }

  function doToggleChartShown(evt) {
    if (evt.target.matches('input[type=radio][name=showWhichChart]')) {
      const chartContainers = [
        temperatureChartRef.current.canvas.closest('.chartContainer'),
        precipitationChartRef.current.canvas.closest('.chartContainer'),
        windChartRef.current.canvas.closest('.chartContainer')
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
