import { Head } from '@redwoodjs/web'
import { useState, useEffect, useRef } from 'react'
import { useGetLocation, isLocationSaved } from 'src/hooks/useGetLocation.js'
import Search from 'src/components/Search.jsx'
import CurrentLocation from 'src/components/CurrentLocation.jsx'
import Weather from 'src/components/Weather.jsx'


export default HomePage


// *******************

function HomePage() {
  const [ locState, updateLocState ] = useState({
    reset: false,
    canceled: false
  })
  const locCanceled = locState.canceled
  const [ searchText, setSearchText ] = useState(null)
  const [ weatherCanceled, setWeatherCanceled ] = useState(false)
  const [ loc, locFound ] = useGetLocation({
    searchText,
    ...locState
  })
  const [ selectedLoc, setSelectedLoc ] = useState(null)
  const searchInputRef = useRef()

  // hack: quietly (no re-render) reset location
  // state
  locState.reset = locState.canceled = false

  return (
    <>
      <Head>
        <title>WeatheRound</title>
      </Head>

      <Search
        locFound={locFound}
        searchText={searchText}
        setSelectedLoc={setSelectedLoc}
        setSearchText={setSearchText}
        resetLocState={resetLocState}
        setWeatherCanceled={setWeatherCanceled}
        ref={searchInputRef}
      />

      <CurrentLocation
        loc={selectedLoc || loc}
        activateLocation={doActivateLocation}
        cancelLocation={doCancelLocation}
        resetLocation={doResetLocation}
        canceled={locCanceled}
      />

      <Weather
        loc={selectedLoc || loc}
        locFound={locFound}
        activateWeather={doActivateWeather}
        cancelWeather={doCancelWeather}
        canceled={weatherCanceled}
      />
    </>
  )


  // *******************

  function resetLocState() {
    setLocState({
      reset: false,
      canceled: false
    })
  }

  function setLocState({
    reset = false,
    canceled = false
  } = {}) {
    // hack: new object inserted to change the
    // state-slot value and force a re-render
    updateLocState({
      reset,
      canceled
    })
  }

  function doActivateLocation(locToSelect) {
    resetLocState()
    setSelectedLoc(locToSelect)
    setSearchText(null)
    setWeatherCanceled(false)
    clearSearchInput()
  }

  function doCancelLocation() {
    setLocState({ canceled: true })
    setSelectedLoc(null)
    setSearchText(null)
  }

  function doActivateWeather() {
    resetLocState()
    setWeatherCanceled(false)
  }

  function doCancelWeather() {
    resetLocState()
    setWeatherCanceled(true)
  }

  function doResetLocation() {
    setLocState({ reset: true })
    setSelectedLoc(null)
    setSearchText(null)
    setWeatherCanceled(false)
    clearSearchInput()
  }

  function clearSearchInput() {
    searchInputRef.current.value = ''
  }
}
