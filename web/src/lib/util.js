import { localTimezoneName } from 'src/hooks/useGetLocation.js'

export {
  detectLocaleInfo,
  parseTimestamp,
  formatDateTimeLocale,
  formatTimeLocale,
  formatDateLocale,
  getISOTimestampOffset,
  getLocaleTimezoneOffset,
  getAbortController,
  unwrapCancelable,
  getDeferred,
  cancelEvt,
  signalAbortPr,
  removeObjProps
}


// *******************

function detectLocaleInfo() {
  return {
    localLanguage: (
      (navigator.language ?? 'en-US')
      .match(/^(?<lang>.+)(?:-.+)$/)?.groups?.lang ?? 'en'
    ),
    localTimezoneName: Intl.DateTimeFormat().resolvedOptions().timeZone
  }
}

function parseTimestamp(isoDateTime, tzOffset) {
  return new Date(Date.parse(`${isoDateTime}:00.000${tzOffset}`))
}

function getDOWStr(timestamp, timezone) {
  return timestamp.toLocaleString(
    navigator.language ?? 'en-US',
    {
      timeZone: timezone,
      weekday: 'long'
    }
  )
}

function formatDateTimeLocale(timestamp, timezone) {
  return {
    ...formatDateLocale(timestamp, timezone),
    ...formatTimeLocale(timestamp, timezone),
    timestamp: timestamp.getTime()
  }
}

function formatTimeLocale(timestamp, timezone) {
  const localTime = timestamp.toLocaleTimeString(
    navigator.language ?? 'en-US',
    {
      hour: 'numeric',
      minute: 'numeric',
      timeZone: localTimezoneName,
      timeZoneName: 'short'
    }
  )
  const remoteTime = timestamp.toLocaleTimeString(
    navigator.language ?? 'en-US',
    {
      hour: 'numeric',
      minute: 'numeric',
      timeZone: timezone,
      timeZoneName: 'short'
    }
  )

  return {
    time: {
      local: localTime,
      remote: remoteTime
    },
    timestamp: timestamp.getTime()
  }
}

function formatDateLocale(timestamp, timezone) {
  const day = getDOWStr(timestamp, timezone)
  const date = timestamp.toLocaleDateString(
    navigator.language ?? 'en-US',
    {
      month: 'numeric',
      day: 'numeric',
      timeZone: timezone
    }
  )

  const dateStr = timestamp.toLocaleDateString(
    'en-US',
    {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      timeZone: timezone
    }
  )
  const isoDate = toLocaleISODateStr(dateStr)

  return {
    day,
    date,
    isoDate,
    timestamp: timestamp.getTime()
  }
}

function getISOTimestampOffset(utcOffsetSeconds) {
  const isNegOffset = utcOffsetSeconds < 0
  const offsetHours = Math.abs(Math.floor(utcOffsetSeconds / 3600))
  const offsetMinutes = (Math.abs(utcOffsetSeconds) / 60) - (offsetHours * 60)
  return `${isNegOffset ? '-' : '+'}${String(offsetHours).padStart(2, '0')}:${String(offsetMinutes).padStart(2, '0')}`
}

function getLocaleTimezoneOffset(isoDateTimeStr, timezone) {
  const dateTimeRE = /^(?<year>\d{4})-(?<month>\d{1,2})-(?<day>\d{1,2})(?:[\sT](?<hour>\d{1,2}):(?<minute>\d{1,2}))?(?::(?<second>\d{1,2}))?(?:.(?<microsecond>\d{3}))?(?:\s*(?<ampm>am|pm|AM|PM))?/
  let {
    year = 1970,
    month = 1,
    day = 1,
    hour = 12,
    minute = 0,
    ampm = ''
  } = (
    isoDateTimeStr.match(dateTimeRE)?.groups ?? {}
  );
  [ year, month, day, hour, minute ] =
    [ year, month, day, hour, minute ].map(Number)
  if (ampm == '') {
    ampm = (hour < 12) ? 'AM' : 'PM'
  }
  hour = ((hour + 11) % 12 + 1)
  const localeStr = (
    new Date(Date.parse(
      `${year}/${month}/${day} ${hour}:${String(minute).padStart(2, '0')} ${ampm}`
    ))
    .toLocaleString(
      navigator.language ?? 'en-US',
      {
        timeZone: timezone,
        timeZoneName: 'longOffset'
      }
    )
  )
  return localeStr.match(/[+\-][\d:]+$/)?.[0] ?? '+0:00'
}

function toLocaleISODateStr(localeDateStr) {
  let {
    month = 1,
    day = 1,
    fullYear = 1970
  } = (
    localeDateStr.match(/^(?<month>\d{1,2}).(?<day>\d{1,2}).(?<fullYear>\d{4})$/)?.groups ?? {}
  );
  [ fullYear, month, day ] = [ fullYear, month, day ].map(Number)
  return `${fullYear}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
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
