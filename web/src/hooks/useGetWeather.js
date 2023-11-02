import { useState, useEffect, useRef } from 'react'
import {
  buildTimestamp,
  formatDateTimeLocale,
  formatTimeLocale,
  formatDateLocale,
  getISOTimestampOffset,
  getTimestampOffsetSeconds,
  getLocaleTimezoneOffset,
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

function getWeather({ loc, date, signal}) {
  const controller = getAbortController(signal)

  return {
    pr: (async function getWeather(){
      updateLocaleInfo()

      const nextDayDate = date != null ?
        getNextDayISODateStr(date) :
        null

      const resp = await fetch(
        date != null ?
          `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lng}&start_date=${date}&end_date=${nextDayDate}&current_weather=true&hourly=weathercode,temperature_2m,precipitation_probability,windspeed_10m,winddirection_10m&temperature_unit=${temperatureUnit}&windspeed_unit=${speedUnit}&timezone=${loc.timezoneName || localTimezoneName}` :

          `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lng}&current_weather=true&daily=weathercode,sunrise,sunset,temperature_2m_max,temperature_2m_min,precipitation_probability_mean,windspeed_10m_max,winddirection_10m_dominant&temperature_unit=${temperatureUnit}&windspeed_unit=${speedUnit}&timezone=${loc.timezoneName || localTimezoneName}&forecast_days=7`
      )

      if (!resp.ok) {
        throw new Error('failed api response')
      }

      const json = await resp.json()
      if (!json) {
        throw new Error('invalid api response')
      }

      return processWeather(loc, json, signal)
    })(),

    controller
  }
}

async function processWeather(loc, json, signal) {
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

  // compute base offset for this day's set of hourly
  // data note: weather API does not reflect DST changes
  // hour-by-hour
  // Ref: https://github.com/open-meteo/open-meteo/issues/490#issuecomment-1787264107
  const baseHourlyTZOffset = json.hourly ?
    getLocaleTimezoneOffset(
      json.hourly.time[0],
      json.timezone
    ) :
    null
  const baseHourlyTZOffsetSeconds = json.hourly ?
    getTimestampOffsetSeconds(baseHourlyTZOffset) :
    0
  let DSTstarted = false
  let DSTended = false
  const hourly = (
    json.hourly ?
      Array.from({ length: 25, }).map((v, i) => {
        const hourTZOffset = getLocaleTimezoneOffset(
          json.hourly.time[i],
          json.timezone
        )

        // DST change hasn't been detected yet?
        if (!DSTstarted && !DSTended) {
          // compute each hour's offset, to detect if
          // there's been a DST change mid-day
          const hourTZOffsetSeconds =
            getTimestampOffsetSeconds(hourTZOffset)
          const tzDelta = hourTZOffsetSeconds - baseHourlyTZOffsetSeconds
          DSTstarted = tzDelta > 0
          DSTended = tzDelta < 0
        }

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
      }) :

      null
  )

  // pulling hourly entries, but NOT for the DST-end day?
  if (hourly && !DSTended) {
    // discard the unnecessary final (25th) hourly entry
    hourly.length = 24
  }

  if (DSTstarted) {
    // on DST-start day, only need to render 23 clock hours
    // (because 2am is "skipped"); compensate for off-by-one
    // error in time labels by shifting labels up one slot,
    // from "3am" onward
    for (const [ idx, entry ] of Object.entries(hourly)) {
      if (idx > 1 && idx < (hourly.length - 1)) {
        entry.date = hourly[Number(idx) + 1].date
      }
    }

    // discard the final (24th) entry, which is technically now
    // duplicative of midnite the following day
    hourly.length = 23
  }
  else if (DSTended) {
    // when DST ends, actually need to render 25 clock hours
    // (because 1am is "repeated"); compensate for off-by-one
    // error in time labels by shifting labels down one slot,
    // from "1am" onward; the 25th entry ("11pm" slot) is
    // actually the first entry from the *next* day
    for (const [ idx, entry ] of Object.entries([ ...hourly ].reverse())) {
      if (idx < (hourly.length - 2)) {
        entry.date = hourly[24 - (Number(idx) + 1)].date
      }
    }
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
