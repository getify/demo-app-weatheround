import { useRef, useContext } from 'react'
import HomeContext from 'src/lib/home-context.js'
import { cancelEvt } from 'src/lib/util.js'


export default Search


// *******************

function Search({
    searchText,
    setSelectedLoc,
    setSearchText,
    searchInputExternalRef,
    clearLocState,
    clearWeatherCanceled
}) {
  const { locFound } = useContext(HomeContext)
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
      clearLocState(/*silent=*/false)
      clearWeatherCanceled()
    }
  }
}
