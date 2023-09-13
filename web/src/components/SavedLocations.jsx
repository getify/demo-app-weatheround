import { useRef, forwardRef } from 'react'
import {
  formatLocation,
  locationKey
} from 'src/hooks/useGetLocation.js'


SavedLocations = forwardRef(SavedLocations)


export default SavedLocations


// *******************

function SavedLocations(
  {
    savedLocs,
    selectSavedLocation,
    removeSavedLocation
  },
  locationsListExternalRef
) {
  const locList = []
  for (let loc of Object.values(savedLocs)) {
    const formattedLoc = formatLocation(loc)

    locList.push(
      <li key={locationKey(loc)}>
        <button
          type="button"
          className="icon-btn unpin-location"
          onClick={() => removeSavedLocation(loc)}
        >
          unpin location
        </button>

        <span
          className="saved-location-text"
          title={formattedLoc}
        >
          {formattedLoc}
        </span>

        <button
          type="button"
          className="icon-btn select"
          onClick={() => selectSavedLocation(loc)}
        >
          select location
        </button>
      </li>
    )
  }

  return (
    <div
      id="saved-locations-list"
      className="hidden"
      ref={setListElRef}
    >
      {
        locList.length > 0 ?
          (
            <ul>
              {locList}
            </ul>
          ) :

          (
            <p>..none pinned yet..</p>
          )
      }
    </div>
  )


  // *******************

  function setListElRef(el) {
    locationsListExternalRef.current = el
  }
}
