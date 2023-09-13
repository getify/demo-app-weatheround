import { useEffect } from 'react'


export { useEffectToggle }
export default useEffectToggle


// *******************

function useEffectToggle(fn, applyEffect) {
  useEffect(() => {
    if (applyEffect) {
      return fn()
    }
  },[ applyEffect ])
}
