import { localTimezoneName } from 'src/hooks/useGetLocation.js'

export {
  parseTimestamp,
  formatDateTimeLocale,
  formatTimeLocale,
  formatDateLocale,
  getISOTimestampOffset,
  getAbortController,
  unwrapCancelable,
  getDeferred,
  cancelEvt,
  signalAbortPr,
  removeObjProps
}


// *******************

function parseTimestamp(isoDateTime, tzOffset) {
  return new Date(Date.parse(`${isoDateTime}:00.000${tzOffset}`))
}

function getDOWStr(timestamp, timezone) {
  return timestamp.toLocaleString(navigator.language, { timeZone: timezone, weekday: 'long' })
}

function formatDateTimeLocale(timestamp, timezone) {
  const time = timestamp.toLocaleTimeString(navigator.language, { hour: 'numeric', minute: 'numeric', timeZone: timezone, timeZoneName: 'short' })
  return {
    ...formatDateLocale(timestamp, timezone),
    ...formatTimeLocale(timestamp, timezone),
    timestamp: timestamp.getTime()
  }
}

function formatTimeLocale(timestamp, timezone) {
  let time = timestamp.toLocaleTimeString(navigator.language, { hour: 'numeric', minute: 'numeric', timeZone: timezone, timeZoneName: 'short' })
  if (timezone != localTimezoneName) {
    const localTime = timestamp.toLocaleTimeString(navigator.language, { hour: 'numeric', minute: 'numeric', timeZone: localTimezoneName, timeZoneName: 'short' })
    time = `${time} (${localTime})`
  }
  return {
    time,
    timestamp: timestamp.getTime()
  }
}

function formatDateLocale(timestamp, timezone) {
  const day = getDOWStr(timestamp, timezone)
  const date = timestamp.toLocaleDateString(
    navigator.language,
    {
      month: 'numeric',
      day: 'numeric',
      timeZone: timezone
    }
  )

  try {
    var dateStr = timestamp.toLocaleDateString(
      'en-US',
      {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        timeZone: timezone
      }
    )

    var isoDate = toLocaleISODateStr(dateStr)
  }
  catch (err) {
    console.log('language',navigator.language)
    console.log('timestamp',timestamp)
    console.log('timezone',timezone)
    console.log('dateStr',dateStr)
    console.log(err)
  }
  return {
    day,
    date,
    isoDate,
    timestamp: timestamp.getTime()
  }
}

function getISOTimestampOffset(utfOffsetSeconds) {
  const isNegOffset = utfOffsetSeconds < 0
  const offsetHours = Math.abs(Math.floor(utfOffsetSeconds / 3600))
  const offsetMinutes = (Math.abs(utfOffsetSeconds) / 60) - (offsetHours * 60)
  return `${isNegOffset ? '-' : '+'}${String(offsetHours).padStart(2, '0')}:${String(offsetMinutes).padStart(2, '0')}`
}

function toLocaleISODateStr(localeDateStr) {
  let [ , month, day, fullYear, ] = (
    localeDateStr.match(/^(\d{1,2}).(\d{1,2}).(\d{4})$/)
  )
  month = Number(month)
  day = Number(day)
  fullYear = Number(fullYear)
  return `${fullYear}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`
}

function getAbortController(signal) {
  const controller = new AbortController()

  if (signal) {
    // signal already aborted?
    if (signal.aborted) {
      controller.abort(signal.reason)
    }
    // listen for future abort signal
    else {
      signal.addEventListener('abort', () => (
        controller.abort(signal.reason)
      ))
    }
  }

  return controller
}

function unwrapCancelable(cancelable) {
  return cancelable.pr
}

function getDeferred() {
  let resolve, reject
  const pr = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })
  // silence uncaught-exceptions warning
  pr.catch(() => {})
  return { pr, resolve, reject }
}

function cancelEvt(evt) {
  if (evt) {
    evt.preventDefault()
    evt.stopPropagation()
    const realEvt = evt.nativeEvent || evt
    realEvt?.stopImmediatePropagation()
  }
}

function signalAbortPr(signal) {
  const pr = (
    signal.aborted ?
      Promise.reject(signal.reason) :

      new Promise((res, rej) => {
        signal.addEventListener(
          'abort',
          () => rej(signal.reason)
        )
      })
  )

  // silence uncaught-exceptions warning
  pr.catch(() => {})
  return pr
}

function removeObjProps(obj) {
  for (let prop of Object.keys(obj)) {
    delete obj[prop]
  }
}
