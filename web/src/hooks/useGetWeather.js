import { useState, useEffect, useRef } from 'react'
import {
  buildTimestamp,
  formatDateTimeLocale,
  formatTimeLocale,
  formatDateLocale,
  getISODateStr,
  getTimestampOffsetSeconds,
  getLocaleTimezoneOffset,
  getPrevDayISODateStr,
  getNextDayISODateStr,
  getAbortController,
  unwrapCancelable,
  getDeferred,
  signalAbortPr
} from 'src/lib/util.js'
import {
  updateLocaleInfo,
  localTimezoneName,
  fahrenheitCountries,
  mphCountries,
  formatLocation,
  getLocationStatus
} from 'src/hooks/useGetLocation.js'
import JSONStore from 'src/lib/json-store.js'
// import JSONStore from '@socketsupply/json-store'


// https://open-meteo.com/en/docs#weathervariables
// https://github.com/erikflowers/weather-icons
const weatherConditions = {
  0: {
    label: 'Clear',
    nightClass: 'wi-night-clear',
    dayClass: 'wi-day-sunny'
  },
  1: {
    label: 'Mostly Clear',
    nightClass: 'wi-night-partly-cloudy',
    dayClass: 'wi-day-sunny-overcast'
  },
  2: {
    label: 'Partly Cloudy',
    nightClass: 'wi-night-partly-cloudy',
    dayClass: 'wi-day-cloudy'
  },
  3: {
    label: 'Overcast',
    nightClass: 'wi-night-cloudy',
    dayClass: 'wi-day-cloudy-high'
  },
  45: {
    label: 'Fog',
    nightClass: 'wi-night-fog',
    dayClass: 'wi-day-fog'
  },
  48: {
    label: 'Icy Fog',
    nightClass: 'wi-night-fog',
    dayClass: 'wi-day-fog'
  },
  51: {
    label: 'Light Drizzle',
    nightClass: 'wi-night-sprinkle',
    dayClass: 'wi-day-sprinkle'
  },
  53: {
    label: 'Moderate Drizzle',
    nightClass: 'wi-night-sprinkle',
    dayClass: 'wi-day-sprinkle'
  },
  55: {
    label: 'Heavy Drizzle',
    nightClass: 'wi-night-sprinkle',
    dayClass: 'wi-day-sprinkle'
  },
  56: {
    label: 'Light Freezing Drizzle',
    nightClass: 'wi-night-sleet',
    dayClass: 'wi-day-sleet'
  },
  57: {
    label: 'Heavy Freezing Drizzle',
    nightClass: 'wi-night-sleet',
    dayClass: 'wi-day-sleet'
  },
  61: {
    label: 'Light Rain',
    nightClass: 'wi-night-rain',
    dayClass: 'wi-day-rain'
  },
  63: {
    label: 'Moderate Rain',
    nightClass: 'wi-night-rain',
    dayClass: 'wi-day-rain'
  },
  65: {
    label: 'Heavy Rain',
    nightClass: 'wi-night-rain',
    dayClass: 'wi-day-rain'
  },
  66: {
    label: 'Light Freezing Rain',
    nightClass: 'wi-night-rain-mix',
    dayClass: 'wi-day-rain-mix'
  },
  67: {
    label: 'Heavy Freezing Rain',
    nightClass: 'wi-night-rain-mix',
    dayClass: 'wi-day-rain-mix'
  },
  71: {
    label: 'Light Snow',
    nightClass: 'wi-night-snow',
    dayClass: 'wi-day-snow'
  },
  73: {
    label: 'Moderate Snow',
    nightClass: 'wi-night-snow',
    dayClass: 'wi-day-snow'
  },
  75: {
    label: 'Heavy Snow',
    nightClass: 'wi-night-snow',
    dayClass: 'wi-day-snow'
  },
  77: {
    label: 'Snow',
    nightClass: 'wi-night-snow',
    dayClass: 'wi-day-snow'
  },
  80: {
    label: 'Light Rain Showers',
    nightClass: 'wi-night-showers',
    dayClass: 'wi-day-showers'
  },
  81: {
    label: 'Moderate Rain Showers',
    nightClass: 'wi-night-showers',
    dayClass: 'wi-day-showers'
  },
  82: {
    label: 'Heavy Rain Showers',
    nightClass: 'wi-night-showers',
    dayClass: 'wi-day-showers'
  },
  85: {
    label: 'Light Snow Showers',
    nightClass: 'wi-night-rain-mix',
    dayClass: 'wi-day-rain-mix'
  },
  86: {
    label: 'Heavy Snow Showers',
    nightClass: 'wi-night-rain-mix',
    dayClass: 'wi-day-rain-mix'
  },
  95: {
    label: 'Thunderstorm',
    nightClass: 'wi-night-thunderstorm',
    dayClass: 'wi-day-thunderstorm'
  },
  96: {
    label: 'Thunderstorm, Light Hail',
    nightClass: 'wi-night-hail',
    dayClass: 'wi-day-hail'
  },
  99: {
    label: 'Thunderstorm, Heavy Hail',
    nightClass: 'wi-night-hail',
    dayClass: 'wi-day-hail'
  }
}

// note: filled in after first location is determined;
// used by weather API calls
//
// temperature: 'fahrenheit' or 'celsius'
// speed: 'mph' or 'kmh'
let {
  temperatureUnit,
  speedUnit
} = await getSavedDefaultWeatherUnits()


export {
  useGetWeather,
  setDefaultWeatherUnits,
  getWeatherStatus,
  getSavedDefaultWeatherUnits
}


// *******************

function useGetWeather({
  loc,
  date,
  token,
  canceled = false
}) {
  // note: `let`s here for gc cleanup
  let controller = new AbortController()
  let {
    pr: weatherPr,
    resolve: resolveWeatherPr,
    reject: cancelWeatherPr
  } = getDeferred()

  const { found: locFound } = getLocationStatus(loc)
  const reqState = useRef({
    lat: locFound ? loc.lat : null,
    lng: locFound ? loc.lng : null,
    temperatureUnit,
    speedUnit,
    token,
    onCancel: null
  })
  const [ weather, updateWeatherSlot ] = useState(weatherPr)
  const performWeatherLookup = (
    !canceled &&
    locFound &&
    (
      loc.lat !== reqState.current.lat ||
      loc.lng !== reqState.current.lng ||
      temperatureUnit !== reqState.current.temperatureUnit ||
      speedUnit !== reqState.current.speedUnit ||
      date !== reqState.current.date ||
      token !== reqState.current.token
    )
  )
  const currentWeather = (
    performWeatherLookup ? weatherPr :
    canceled ? null :
    weather
  )
  const { found: weatherFound } = getWeatherStatus(
    currentWeather
  )

  if (
    reqState.current.onCancel &&
    (
      canceled ||
      performWeatherLookup ||
      !locFound
    )
  ) {
    reqState.current.onCancel()
  }

  useEffect(() => {
    if (performWeatherLookup) {
      reqState.current.lat = loc.lat
      reqState.current.lng = loc.lng
      reqState.current.temperatureUnit = temperatureUnit
      reqState.current.speedUnit = speedUnit
      reqState.current.date = date
      reqState.current.token = token
      reqState.current.onCancel = cancelWeatherLookup

      unwrapCancelable(
        getWeather({ loc, date, signal: controller.signal })
      )
      .then(
        v => {
          resolveWeatherPr(v)
          updateWeatherSlot(v)
        },
        err => {
          console.log(err.stack)
          if (cancelWeatherPr) cancelWeatherPr()
        }
      )
      .catch(console.error)
      .finally(() => {
        cleanup()
        reqState.current.onCancel = null
      })
    }
  })

  return [ currentWeather, weatherFound ]


  // *******************

  function cancelWeatherLookup() {
    // weather lookup still pending?
    if (cancelWeatherPr) {
      // reset request-state props
      reqState.current.lat = reqState.current.lng =
        reqState.current.temperatureUnit =
        reqState.current.speedUnit = reqState.current.date =
        reqState.current.token = reqState.current.onCancel = null

      const reason = 'cancelling weather lookup'
      controller.abort(reason)
      cancelWeatherPr(reason)
      cleanup()
    }
  }

  // cleanup promise/cancellation references
  function cleanup() {
    resolveWeatherPr = cancelWeatherPr = weatherPr =
      controller = null
  }
}

function getForecastDateRange(timezone) {
  const today = getISODateStr(new Date(), timezone)
  return Array.from({ length: 6, }).reduce(
    (dates, _) => [
      ...dates,
      getNextDayISODateStr(dates[dates.length - 1])
    ],
    [ today ]
  )
}

// compute if a DST change occurs during forecast date range
function computeForecastDateRangeDST(timezone) {
  let dstChange = false
  let dstStart = null
  let dstEnd = null

  const forecastDates = getForecastDateRange(timezone)

  for (let date of forecastDates) {
    const startingTZOffsetSeconds = getTimestampOffsetSeconds(
      getLocaleTimezoneOffset(
        `${date}T00:01`,
        timezone
      )
    )
    const endingTZOffsetSeconds = getTimestampOffsetSeconds(
      getLocaleTimezoneOffset(
        `${date}T23:59`,
        timezone
      )
    )

    // TZ offset changes during the day (DST change)?
    if (startingTZOffsetSeconds !== endingTZOffsetSeconds) {
      dstChange = true

      const tzOffsetDelta = endingTZOffsetSeconds - startingTZOffsetSeconds
      if (tzOffsetDelta > 0) {
        dstStart = date
      }
      else {
        dstEnd = date
      }

      break
    }
  }

  return {
    dstChange,
    dstStart,
    dstEnd,
    forecastDates
  }
}

function getWeather({ loc, date, signal }) {
  const controller = getAbortController(signal)

  return {
    pr: (async function getWeather(){
      updateLocaleInfo()

      const forecastDatesDST = computeForecastDateRangeDST(
        loc.timezoneName || localTimezoneName
      )

      let startDayDate = date
      let endDayDate = date

      // requesting hourly forecast data?
      if (date != null) {
        forecastDatesDST.date = date

        // requesting hourly forecast data beyond a
        // future *starting-DST* day
        if (
          forecastDatesDST.dstStart != null &&
          date > forecastDatesDST.dstStart
        ) {
          // include hourly data for the day before the
          // date in question; needed to compensate for
          // off-by-one hourly data due to weather API's
          // non-DST-awareness for forecasts
          startDayDate = getPrevDayISODateStr(date)
        }
        // requesting hourly forecast data at or beyond a
        // future *ending-DST* day
        else if (
          forecastDatesDST.dstEnd != null &&
          date >= forecastDatesDST.dstEnd
        ) {
          // include hourly data for the day after the
          // date in question; needed to compensate for
          // off-by-one hourly data due to weather API's
          // non-DST-awareness for forecasts
          endDayDate = getNextDayISODateStr(date)
        }
      }

      const resp = await fetch(
        date != null ?
          `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lng}&start_date=${startDayDate}&end_date=${endDayDate}&current_weather=true&hourly=weathercode,temperature_2m,precipitation_probability,windspeed_10m,winddirection_10m&temperature_unit=${temperatureUnit}&windspeed_unit=${speedUnit}&timezone=${loc.timezoneName || localTimezoneName}` :

          `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lng}&current_weather=true&daily=weathercode,sunrise,sunset,temperature_2m_max,temperature_2m_min,precipitation_probability_mean,windspeed_10m_max,winddirection_10m_dominant&temperature_unit=${temperatureUnit}&windspeed_unit=${speedUnit}&timezone=${loc.timezoneName || localTimezoneName}&forecast_days=7`
      )

      if (!resp.ok) {
        throw new Error('failed api response')
      }

      const json = await resp.json()
      if (!json) {
        throw new Error('invalid api response')
      }

      return processWeather(loc, json, forecastDatesDST)
    })(),

    controller
  }
}

async function processWeather(loc, json, forecastDatesDST) {
  const recentTZOffset = getLocaleTimezoneOffset(
    json.current_weather.time,
    json.timezone
  )

  const current = (
    (json.current_weather && json.hourly == null) ?
      {
        isoDate: formatDateLocale(
          buildTimestamp(
            json.current_weather.time,
            recentTZOffset
          ),
          json.timezone
        ).isoDate,
        dayTime: (json.current_weather.is_day === 1),
        conditions: {
          code: json.current_weather.weathercode,

          // condition defaults
          label: 'Unknown',
          nightClass: 'unknown',
          dayClass: 'unknown',

          // override condition defaults (if known)
          ...(weatherConditions[json.current_weather.weathercode] || {})
        },
        temperature: formatTemperature(
          json.current_weather.temperature,
          json.daily_units.temperature_2m_max
        ),
        lowTemp: formatTemperature(
          json.daily.temperature_2m_min[0],
          json.daily_units.temperature_2m_max
        ),
        highTemp: formatTemperature(
          json.daily.temperature_2m_max[0],
          json.daily_units.temperature_2m_max
        ),
        wind: formatWind(
          json.current_weather.windspeed,
          json.current_weather.winddirection,
          speedUnit
        ),
        precipitation: (
          `${json.daily.precipitation_probability_mean[0]}%`
        ),
        sunrise: formatTimeLocale(
          buildTimestamp(json.daily.sunrise[0], recentTZOffset),
          json.timezone
        ),
        sunset: formatTimeLocale(
          buildTimestamp(json.daily.sunset[0], recentTZOffset),
          json.timezone
        )
      } :

      {}
  )

  const future = (
    json.daily ?
      Array.from({ length: 6, }).map((v, i) => {
        const dayTZOffset = getLocaleTimezoneOffset(
          `${json.daily.time[i + 1]}T12:00`,
          json.timezone
        )
        return {
          date: Object.assign(
            {},
            formatDateLocale(
              buildTimestamp(
                `${json.daily.time[i + 1]}T12:00`,
                dayTZOffset
              ),
              json.timezone
            ),
            {
              // override day for tomorrow?
              ...(i === 0 ? { day: 'Tomorrow' } : {})
            }
          ),
          conditions: {
            code: json.daily.weathercode[i + 1],

            // condition defaults
            label: 'Unknown',
            nightClass: 'unknown',
            dayClass: 'unknown',

            // override condition defaults (if known)
            ...(weatherConditions[json.daily.weathercode[i + 1]] || {})
          },
          lowTemp: formatTemperature(
            json.daily.temperature_2m_min[i + 1],
            json.daily_units.temperature_2m_max
          ),
          highTemp: formatTemperature(
            json.daily.temperature_2m_max[i + 1],
            json.daily_units.temperature_2m_max
          ),
          wind: formatWind(
            json.daily.windspeed_10m_max[i + 1],
            json.daily.winddirection_10m_dominant[i + 1],
            json.daily_units.windspeed_10m_max
          ),
          precipitation: (
            `${json.daily.precipitation_probability_mean[i + 1]}%`
          ),
          sunrise: formatTimeLocale(
            buildTimestamp(json.daily.sunrise[i + 1], dayTZOffset),
            json.timezone
          ),
          sunset: formatTimeLocale(
            buildTimestamp(json.daily.sunset[i + 1], dayTZOffset),
            json.timezone
          )
        }
      }) :

      null
  )

  let hourly = null

  // processing hourly forecast data (for a specific day?)
  if (json.hourly) {
    // handle DST change during the forecast range, to
    // fix off-by-one errors?
    //
    // NOTE: weather API does not reflect DST changes in
    // forecast data
    // Ref: https://github.com/open-meteo/open-meteo/issues/490
    if (forecastDatesDST.dstChange) {
      // processing hourly forecast data for a
      // future *starting-DST* day
      if (
        forecastDatesDST.dstStart != null &&
        forecastDatesDST.date === forecastDatesDST.dstStart
      ) {
        json.hourly = Object.fromEntries(
          [ ...Object.entries(json.hourly) ]
          .map(([ key, data ]) => {
            if (key === 'time') {
              return [
                key,
                data
                  // to fix off-by-one error in hour labels, need
                  // to skip the "2am" slot on a DST-start day;
                  // slide all hour labels, from "3am" onward,
                  // upward/earlier by one slot; the hours will
                  // thus be: "00:00", "01:00", "03:00", ...
                  // "23:00", "23:00"
                  .map((v, idx) => (
                    (idx >= 2 && idx < (data.length - 1)) ?
                      data[idx + 1] :
                      v
                  ))

                  // drop the last hour label (duplicated "23:00")
                  .slice(0, -1)
              ]
            }
            else {
              // only need 23 data entries on a DST-start day,
              // since "2am" is skipped
              return [ key, data.slice(0, -1) ]
            }
          })
        )
      }
      // processing hourly forecast data beyond a
      // future *starting-DST* day
      else if (
        forecastDatesDST.dstStart != null &&
        forecastDatesDST.date > forecastDatesDST.dstStart
      ) {
        json.hourly = Object.fromEntries(
          [ ...Object.entries(json.hourly) ]
          .map(([ key, data ]) => {
            if (key === 'time') {
              return [
                key,
                Array.from({ length: 24 })
                  // to fix off-by-one error in all data entries,
                  // slide them all upward/earlier by one slot; the
                  // hours will thus be: "23:00" (day before), "00:00"
                  // (day of), "01:00", ... "22:00"
                  .map((v, idx) => data[idx + 24])
             ]
            }
            else {
              // to fix off-by-one error, get 24 entries
              // from "23:00" the day before, to (and including)
              // "22:00" on the date in question
              return [ key, data.slice(-25, -1) ]
            }
          })
        )
      }
      // processing hourly forecast data for a
      // future *ending-DST* day
      else if (
        forecastDatesDST.dstEnd != null &&
        forecastDatesDST.date === forecastDatesDST.dstEnd
      ) {
        json.hourly = Object.fromEntries(
          [ ...Object.entries(json.hourly) ]
          .map(([ key, data ]) => {
            if (key === 'time') {
              return [
                key,
                data
                  // to fix off-by-one error in hour labels, need
                  // to repeat the "1am" slot on a DST-end day;
                  // slide all hour labels, from "1am" onward,
                  // downward/later by one slot; the hours will
                  // thus be: "00:00", "01:00", "01:00", "02:00",
                  // ... "23:00"
                  .slice(0, 25)
                  .reverse()
                  .map((v, idx) => (
                    (idx < 23) ?
                      data[24 - (idx + 1)] :
                      v
                  ))
                  .reverse()
              ]
            }
            else {
              // actually need 25 data entries on a DST-end day,
              // since "1am" is repeated
              return [ key, data.slice(0, 25) ]
            }
          })
        )
      }
      // processing hourly forecast data beyond a
      // future *ending-DST* day
      else if (
        forecastDatesDST.dstEnd != null &&
        forecastDatesDST.date > forecastDatesDST.dstEnd
      ) {
        json.hourly = Object.fromEntries(
          [ ...Object.entries(json.hourly) ]
          .map(([ key, data ]) => {
            if (key === 'time') {
              return [
                key,
                Array.from({ length: 24 })
                  // to fix off-by-one error in hour labels,
                  // slide them downward/later by one slot; the
                  // hours will thus be: "01:00", "02:00", ...
                  // "23:00", "00:00" (day after)
                  .map((v, idx) => data[24 - (idx + 1)])
                  .reverse()
              ]
            }
            else {
              // to fix off-by-one error, get 24 entries
              // from "01:00" on the date in question, to (and
              // including) "00:00" on the next day
              return [ key, data.slice(1, 25) ]
            }
          })
        )
      }
    }

    hourly = Array.from({ length: json.hourly.time.length })
      .map((v, i) => {
        const hourTZOffset = getLocaleTimezoneOffset(
          json.hourly.time[i],
          json.timezone
        )

        return {
          date: formatDateTimeLocale(
            buildTimestamp(
              json.hourly.time[i],
              hourTZOffset
            ),
            json.timezone
          ),
          conditions: {
            code: json.hourly.weathercode[i],

            // condition defaults
            label: 'Unknown',
            nightClass: 'unknown',
            dayClass: 'unknown',

            // override condition defaults (if known)
            ...(weatherConditions[json.hourly.weathercode[i]] || {})
          },
          temp: formatTemperature(
            json.hourly.temperature_2m[i],
            json.hourly_units.temperature_2m
          ),
          tempUnit: json.hourly_units.temperature_2m,
          wind: formatWind(
            json.hourly.windspeed_10m[i],
            json.hourly.winddirection_10m[i],
            json.hourly_units.windspeed_10m
          ),
          windUnit: json.hourly_units.windspeed_10m,
          precipitation: (
            `${json.hourly.precipitation_probability[i]}%`
          ),
        }
      })
  }

  return {
    temperatureUnit,
    speedUnit,
    tzOffset: recentTZOffset,
    timezone: json.timezone,
    ...loc,
    location: formatLocation(loc),
    lastUpdate: formatDateTimeLocale(
      buildTimestamp(json.current_weather.time, recentTZOffset),
      json.timezone
    ),
    ...( current != null ? { current } : {}),
    ...( future != null ? { future } : {}),
    ...( hourly != null ? { hourly } : {})
  }
}

function isToday() {
  return false
}

function isTomorrow() {
  return false
}

function formatTemperature(temperature, unit) {
  return `${Math.round(temperature)}${unit}`
}

function formatWind(speed, direction, unit) {
  // adapted from: https://stackoverflow.com/a/36475516
  const dir = (
    direction > 337.5 ? 'N'  :
    direction > 292.5 ? 'NW' :
    direction > 247.5 ? 'W'  :
    direction > 202.5 ? 'SW' :
    direction > 157.5 ? 'S'  :
    direction > 122.5 ? 'SE' :
    direction > 67.5  ? 'E'  :
    direction > 22.5  ? 'NE' :
    'N'
  )

  if (unit === 'kmh') {
    unit = 'km/h'
  }
  else if (unit === 'mp/h') {
    unit = 'mph'
  }

  return `${Math.round(speed)}${unit} ${dir}`
}

async function setDefaultWeatherUnits(temperature, speed, override = false) {
  if (temperatureUnit == null || override) {
    temperatureUnit = temperature
  }
  if (speedUnit == null || override) {
    speedUnit = speed
  }
  return storeSavedDefaultWeatherUnits()
}

function getWeatherStatus(weather) {
  const pending = (weather instanceof Promise)
  const found = (!pending && weather?.location != null)
  return { pending, found }
}

async function getSavedDefaultWeatherUnits() {
  const units = await JSONStore.getItem('default-weather-units')
  return units || {
    temperatureUnit: null,
    speedUnit: null
  }
}

async function storeSavedDefaultWeatherUnits() {
  if (temperatureUnit != null || speedUnit != null) {
    return JSONStore.setItem('default-weather-units', {
      temperatureUnit,
      speedUnit
    })
  }
}
