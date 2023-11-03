import { useState, useEffect, useRef } from 'react'
import {
  detectLocaleInfo,
  getAbortController,
  unwrapCancelable,
  getDeferred,
  signalAbortPr
} from 'src/lib/util.js'
import {
  setDefaultWeatherUnits,
  getSavedDefaultWeatherUnits
} from 'src/hooks/useGetWeather.js'
import JSONStore from 'src/lib/json-store.js'


// https://worldpopulace.com/countries-that-use-fahrenheit
const fahrenheitCountries = [
  'US', 'BS', 'KY', 'LR', 'PW', 'FM', 'MH'
]

// https://en.wikipedia.org/wiki/Miles_per_hour
const mphCountries = [
  'US', 'GB', 'BS', 'AG', 'BZ', 'DM', 'GD', 'LR', 'MH', 'FM', 'PW',
  'KN', 'LC', 'VC', 'WS', 'AS', 'AI', 'VG', 'IO', 'KY', 'FK', 'MS',
  'SH', 'TC', 'GG', 'IM', 'JE', 'GU', 'MP', 'PR', 'VI'
]

// initially detect user locale info (lang, timezone)
let {
  localLanguage,
  localTimezoneName
} = detectLocaleInfo()


export {
  updateLocaleInfo,
  localTimezoneName,
  fahrenheitCountries,
  mphCountries,
  useGetLocation,
  formatLocation,
  getLocationStatus,
  isLocationSaved,
  saveLocation,
  discardSavedLocation,
  getSavedLocations,
  locationKey
}


// *******************

function useGetLocation({
  searchText,
  reset = false,
  canceled = false
}) {
  // note: `let`s here for gc cleanup
  let controller = new AbortController()
  let {
    pr: locPr,
    resolve: resolveLocPr,
    reject: cancelLocPr
  } = getDeferred()

  const reqState = useRef({
    initialReq: true,
    searchText,
    onCancel: null
  })
  const [ loc, updateLocSlot ] = useState(locPr)
  const performLocationLookup = (
    !canceled &&
    (
      reqState.current.initialReq ||
      searchText !== reqState.current.searchText ||
      reset
    )
  )
  const currentLoc = (
    performLocationLookup ? locPr :
    canceled ? null :
    loc
  )
  const { found: locFound } = getLocationStatus(currentLoc)

  // cancel previous location lookup?
  if (
    // previous location lookup pending?
    reqState.current.onCancel &&

    // need to cancel it?
    (
      canceled ||
      performLocationLookup ||
      !searchText
    )
  ) {
    reqState.current.onCancel()
  }

  useEffect(() => {
    if (performLocationLookup) {
      reqState.current.initialReq = false
      reqState.current.searchText = searchText
      reqState.current.onCancel = cancelLocationLookup

      unwrapCancelable(
        getLocation(searchText, controller.signal)
      )
      .then(
        v => {
          resolveLocPr(v)
          updateLocSlot(v)
        },
        cancelLocPr
      )
      .catch(() => {})
      .finally(() => {
        cleanup()
        reqState.current.onCancel = null
      })
    }
  })

  return [ currentLoc, locFound ]


  // *******************

  function cancelLocationLookup() {
    // location lookup still pending?
    if (cancelLocPr) {
      reqState.current.searchText = reqState.current.onCancel = null

      const reason = 'cancelling location lookup'
      controller.abort(reason)
      cancelLocPr(reason)
      cleanup()
    }
  }

  // cleanup promise/cancellation references
  function cleanup() {
    resolveLocPr = cancelLocPr = locPr = controller = null
  }
}

function getLocation(searchText, signal) {
  const controller = getAbortController(signal)

  return {
    pr: (async function getLocation(){
      updateLocaleInfo()

      let loc
      if (searchText != null && searchText != '') {
        return unwrapCancelable(
          searchLocation(searchText, signal)
        )
      }
      else {
        let position = null
        try {
          position = await unwrapCancelable(
            getGeoPosition(controller.signal)
          )
        } catch (err) {
          console.error(err)
        }

        return unwrapCancelable(
          position != null ?
            getLocationByGeoCoords(
              position.coords.latitude,
              position.coords.longitude,
              controller.signal
            ) :

            getLocationByIP(controller.signal)
        )
      }
    })(),

    controller
  }
}

function getGeoPosition(signal) {
  const controller = getAbortController(signal)

  return {
    pr: (
      (!navigator.geolocation) ?
        Promise.reject(
          new Error('geolocation not supported')
        ) :

        new Promise((res, rej) => {
          controller.signal.addEventListener(
            'abort',
            () => rej(controller.signal.reason)
          )
          navigator.geolocation.getCurrentPosition(res, rej)
        })
    ),

    controller
  }
}

function getLocationByGeoCoords(lat, lng, signal) {
  const controller = getAbortController(signal)

  return {
    pr: (async function getLocationByGeoCoords(){
      const resp = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}`,
        { signal: controller.signal }
      )

      return processLocation(resp, signal)
    })(),

    controller
  }
}

function getLocationByIP(signal) {
  const controller = getAbortController(signal)

  return {
    pr: (async function getLocationByIP(){
      const resp = await fetch(
        'https://api.bigdatacloud.net/data/reverse-geocode-client',
        { signal: controller.signal }
      )

      return processLocation(resp)
    })(),

    controller
  }
}

function searchLocation(searchText, signal) {
  const controller = getAbortController(signal)

  return {
    pr: (async function searchLocation(){
      const resp = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${searchText}&count=1&language=${localLanguage}`,
        { signal: controller.signal }
      )

      if (!resp.ok) {
        throw new Error('failed api response')
      }

      const json = await resp.json()
      if (!json) {
        throw new Error('invalid api response')
      }

      if (
        Array.isArray(json.results) &&
        json.results.length > 0 &&
        json.results[0].latitude != null &&
        json.results[0].longitude != null
      ) {
        const searchTextLowercase = searchText.toLowerCase()
        const locCandidate = await unwrapCancelable(getLocationByGeoCoords(
          json.results[0].latitude,
          json.results[0].longitude,
          signal
        ))

        // search result doesn't seem to match search-text?
        if (!(
          locCandidate.city.trim().toLowerCase() == searchTextLowercase ||
          locCandidate.postcode.trim().toLowerCase() == searchTextLowercase
        )) {
          return unwrapCancelable(
            searchLocationAlternate(searchText, controller.signal)
          )
        }

        return locCandidate
      }
    })(),

    controller
  }
}

function searchLocationAlternate(searchText, signal) {
  const controller = getAbortController(signal)

  return {
    pr: (async function searchLocationAlternate(){
      const resp = await fetch(
        `https://geocode.maps.co/search?q=${searchText}`,
        { signal: controller.signal }
      )

      if (!resp.ok) {
        throw new Error('failed api response')
      }

      const json = await resp.json()
      if (!json) {
        throw new Error('invalid api response')
      }

      if (
        Array.isArray(json) &&
        json.length > 0 &&
        json[0].lat != null &&
        json[0].lon != null
      ) {
        return unwrapCancelable(getLocationByGeoCoords(
          json[0].lat,
          json[0].lon,
          signal
        ))
      }
    })(),

    controller
  }
}

async function processLocation(resp, signal) {
  if (!resp.ok) {
    throw new Error('failed api response')
  }

  const json = await resp.json()
  if (!json) {
    throw new Error('invalid api response')
  }

  const { country, territory } = (
    json.principalSubdivisionCode
    .match(/^(?<country>.+)-(?<territory>.+)$/)
    .groups
  )

  const timezoneName = (
    (json.localityInfo?.informative?.find(entry => (
      entry.description == 'time zone'
    ))?.name) ||

    localTimezoneName
  )

  const loc = await prepareLocation({
    lat: json.latitude,
    lng: json.longitude,
    postcode: json.postcode,
    city: json.city,
    territory,
    country,
    timezoneName,
  })

  await setDefaultWeatherUnits(
    loc.temperatureUnit,
    loc.speedUnit,
    /*override=*/false
  )

  return loc
}

async function prepareLocation(loc) {
  const {
    temperatureUnit: defaultTemperatureUnit,
    speedUnit: defaultSpeedUnit
  } = await getSavedDefaultWeatherUnits()

  // default temperature unit
  const temperatureUnit = (
    defaultTemperatureUnit ||
    (
      fahrenheitCountries.includes(loc.country) ?
        'fahrenheit' :
        'celsius'
    )
  )

  // default speed unit
  const speedUnit = (
    defaultSpeedUnit ||
    (
      mphCountries.includes(loc.country) ?
        'mph' :
        'kmh'
    )
  )

  return {
    temperatureUnit,
    speedUnit,
    saved: (await isLocationSaved(loc)),
    ...loc
  }
}

function formatLocation(loc) {
  if (
    loc.postcode != null &&
    loc.city != null &&
    loc.territory != null &&
    loc.country != null
  ) {
    return `${loc.city}, ${loc.territory} ${loc.postcode} ${loc.country}`
  }
}

function getLocationStatus(loc) {
  const pending = (loc instanceof Promise)
  const found = (!pending && loc?.country != null)
  return { pending, found }
}

async function isLocationSaved(loc) {
  const savedLocations = await getSavedLocations()
  return (
    savedLocations[locationKey(loc)] != null
  )
}

async function saveLocation(loc) {
  loc.saved = true

  const savedLocations = await getSavedLocations()
  savedLocations[locationKey(loc)] = {
    saved: true,
    lat: loc.lat,
    lng: loc.lng,
    city: loc.city,
    territory: loc.territory,
    postcode: loc.postcode,
    country: loc.country,
    timezoneName: loc.timezoneName
  }
  return storeSavedLocations(savedLocations)
}

async function discardSavedLocation(loc) {
  loc.saved = false

  const savedLocations = await getSavedLocations()
  delete savedLocations[locationKey(loc)]
  return storeSavedLocations(savedLocations)
}

async function getSavedLocations() {
  return (await JSONStore.getItem('saved-locations')) || {}
}

async function storeSavedLocations(savedLocations) {
  return JSONStore.setItem('saved-locations', savedLocations)
}

function locationKey(loc) {
  return (
    loc != null ?
      JSON.stringify({
      city: loc.city,
      territory: loc.territory,
      postcode: loc.postcode,
      country: loc.country
    }) :

    null
  )
}

function updateLocaleInfo() {
  // re-detect user locale info (lang, timezone), in
  // case it has changed
  ({
    localLanguage,
    localTimezoneName
  } = detectLocaleInfo())
}
