import { useRef, forwardRef } from 'react'
import { cancelEvt } from 'src/lib/util.js'


Search = forwardRef(Search)


export default Search


// *******************

function Search(
  {
    locFound,
    searchText,
    setSelectedLoc,
    setSearchText,
    resetLocState,
    setWeatherCanceled
  },
  searchInputExternalRef
) {
  const searchInputInternalRef = useRef()

  if (
    // location found?
    locFound &&

    // search box still has same value as what was
    // submitted for search?
    searchInputInternalRef.current.value === searchText
  ) {
    // empty the search box
    searchInputInternalRef.current.value = ''
  }

  return (
    <form
      id="main-search"
      onSubmit={doLocationSearch}
    >
      <input
        type="text"
        placeholder="city -or- postal code"
        ref={setSearchInputElRefs}
      />

      <button
        type="submit"
        className="icon-btn search"
        title="search for location"
      >
        search
      </button>
    </form>
  )


  // *******************

  function setSearchInputElRefs(el) {
    searchInputInternalRef.current =
      searchInputExternalRef.current = el
  }

  function doLocationSearch(evt) {
    cancelEvt(evt)

    if (searchInputInternalRef.current.value) {
      setSelectedLoc(null)
      setSearchText(searchInputInternalRef.current.value)
      resetLocState()
      setWeatherCanceled(false)
    }
  }
}
