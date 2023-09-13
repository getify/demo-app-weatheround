// import fs from 'socket:fs'

let dataCache
// const storeFilePath = './.store.json'
const storeName = 'store.json'

const publicAPI = {
  getItem, setItem, removeItem, clear
}
export default publicAPI
export {
  getItem, setItem, removeItem, clear
}

readStore()

function getItem(name) {
  return dataCache[name]
}

function setItem(name, value) {
  dataCache[name] = value
  return writeStore() && value
}

function removeItem(name) {
  delete dataCache[name]
  return writeStore()
}

function clear() {
  dataCache = {}
  return writeStore()
}

function readStore() {
  try {
    // const contents = fs.readFileSync(storeFilePath,'utf-8')
    const contents = localStorage.getItem(storeName)
    if (contents == null) {
      throw new Error('store not found')
    }
    dataCache = JSON.parse(contents)
  } catch {
    clear()
  }
}

function writeStore() {
  try {
    // fs.writeFileSync(
    //   storeFilePath,
    //   JSON.stringify(dataCache),
    //   'utf-8'
    // )
    localStorage.setItem(
      storeName,
      JSON.stringify(dataCache)
    )
    return true
  } catch {
    dataCache = {}
    return false
  }
}
