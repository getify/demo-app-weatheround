import { Head } from '@redwoodjs/web'
import { useState, useEffect, useRef } from 'react'
import HomeContext from 'src/lib/home-context.js'
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

  clearLocState(/*silent=*/true)

  return (
    <>
      <Head>
        <title>WeatheRound</title>
      </Head>

      <HomeContext.Provider
        value={{
          loc: selectedLoc || loc,
          locFound
        }}
      >
        <Search
          searchText={searchText}
          setSearchText={setSearchText}
          setSelectedLoc={setSelectedLoc}
          searchInputExternalRef={searchInputRef}
          clearLocState={clearLocState}
          clearWeatherCanceled={doClearWeatherCanceled}
        />

        <CurrentLocation
          activateLocation={doActivateLocation}
          cancelLocation={doCancelLocation}
          resetLocation={doResetLocation}
          canceled={locCanceled}
        />

        <Weather
          activateWeather={doActivateWeather}
          cancelWeather={doCancelWeather}
          canceled={weatherCanceled}
        />
      </HomeContext.Provider>
    </>
  )


  // *******************

  function clearLocState(silent = false) {
    locState.reset = locState.canceled = false

    if (!silent) {
      setLocState({
        reset: false,
        canceled: false
      })
    }
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
    clearLocState(/*silent=*/false)
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
    clearLocState(/*silent=*/false)
    setWeatherCanceled(false)
  }

  function doCancelWeather() {
    clearLocState(/*silent=*/false)
    setWeatherCanceled(true)
  }

  function doClearWeatherCanceled() {
    setWeatherCanceled(false)
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
