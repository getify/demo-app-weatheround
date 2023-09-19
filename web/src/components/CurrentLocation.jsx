import { Link, routes } from '@redwoodjs/router'
import { useState, useEffect, useRef } from 'react'
import { cancelEvt } from 'src/lib/util.js'
import {
  formatLocation,
  getLocationStatus,
  saveLocation,
  discardSavedLocation,
  getSavedLocations,
  locationKey
} from 'src/hooks/useGetLocation.js'
import SavedLocations from 'src/components/SavedLocations.jsx'


export default CurrentLocation


// *******************

function CurrentLocation({
  loc,
  activateLocation,
  cancelLocation,
  resetLocation,
  canceled = false
}) {
  const { pending, found } = getLocationStatus(loc)
  const [ savedLocs, updateSavedLocs ] = useState(getSavedLocations)
  const formattedLoc = (
    found ? formatLocation(loc) : ''
  )
  const hasSavedLocations = Object.values(savedLocs).length > 0
  const savedLocationsListRef = useRef()
  const toggleSavedLocationsBtnRef = useRef()

  let savedLocationsShown = false

  // useEffect(() => { console.log('render') })

  return (
    <div id="current-location">
      {
        (pending && !canceled) ?
          (
            <button
              type="button"
              className="icon-btn cancel"
              onClick={cancelLocation}
              title="Cancel location search"
            >
              cancel search
            </button>
          ) :

          (
            <button
              type="button"
              className="icon-btn reset"
              onClick={doResetLocation}
              title="clear current location"
            >
              clear location
            </button>
          )
      }

      {
        pending ? (
          <>
            <i
              className="icon wait"
              title="please wait"
            >
              please wait
            </i>

            <span id="location-text">
              Finding location...
            </span>
          </>
        ) :

        found ? (
          <>
            {
              loc.saved ?
                null :

                (
                  <button
                    type="button"
                    className="icon-btn pin-location"
                    onClick={doSaveLocation}
                    title="pin location"
                  >
                    pin location
                  </button>
                )
            }

            <span
              id="location-text"
              title={formattedLoc}
            >
              {formattedLoc}
            </span>
          </>
        ) :

        canceled ?
          (
            <span id="location-text">
              ............
            </span>
          ) :

          (
            <span id="location-text">
              Not found...
            </span>
          )
      }

      {
        hasSavedLocations ?
          (
            <button
              type="button"
              className="icon-btn expand-down"
              onClick={doToggleSavedLocations}
              title="show/hide pinned locations"
              ref={toggleSavedLocationsBtnRef}
            >
              toggle locations
            </button>
          ) :

          null
      }

      <SavedLocations
        savedLocs={savedLocs}
        selectSavedLocation={doSelectSavedLocation}
        removeSavedLocation={doRemoveSavedLocation}
        ref={savedLocationsListRef}
      />
    </div>
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
      // saved-locations popup visible?
      savedLocationsShown &&

      (
        (
          evt.type === 'keydown' &&
          evt.key === 'Escape'
        ) ||

        (
          evt.type === 'click' &&

          // event outside the saved-locations popup?
          !evt.target.closest('#saved-locations-list')
        )
      )
    ) {
      cancelEvt(evt)
      doHideSavedLocations()
    }
  }

  function doSaveLocation() {
    saveLocation(loc)
    updateSavedLocs({ ...getSavedLocations() })
  }

  function doToggleSavedLocations() {
    if (savedLocationsShown) {
      doHideSavedLocations()
    }
    else {
      savedLocationsListRef.current?.classList.remove('hidden')
      toggleSavedLocationsBtnRef.current?.classList.remove('expand-down')
      toggleSavedLocationsBtnRef.current?.classList.add('hide-up')
      savedLocationsShown = true
      bindPopupEvents()
    }
  }

  function doHideSavedLocations() {
    savedLocationsListRef.current?.classList.add('hidden')
    toggleSavedLocationsBtnRef.current?.classList.remove('hide-up')
    toggleSavedLocationsBtnRef.current?.classList.add('expand-down')
    savedLocationsShown = false
    unbindPopupEvents()
  }

  function doSelectSavedLocation(locToSelect) {
    activateLocation(locToSelect)
    doHideSavedLocations()
  }

  function doRemoveSavedLocation(locToRemove) {
    discardSavedLocation(locToRemove)

    // keep saved-locations shown?
    const locs = { ...getSavedLocations() }
    updateSavedLocs(locs)

    // need to hide the saved-locations list?
    if (!(
      Object.values(locs).length > 0 &&
      savedLocationsShown
    )) {
      doHideSavedLocations()
    }

    // removing currently selected location?
    if (
      found &&
      locationKey(locToRemove) === locationKey(loc)
    ) {
      // reset location to default
      activateLocation(null)
      doHideSavedLocations()
    }
  }

  function doResetLocation() {
    doHideSavedLocations()
    resetLocation()
  }
}
