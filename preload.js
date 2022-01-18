//const { contextBridge, ipcRenderer } = require("electron")
//const DataStore = require('./storage.js')

//const appsData = new DataStore({ name: "Apps" })

/*var detectedApps

try {
    detectedApps = require(`./platforms/${process.platform}.js`).detectApps()
} catch (err) {
    console.log("Platform not supported !")
}

contextBridge.exposeInMainWorld("api", {
    close: () => {
        ipcRenderer.invoke("closeApp")
    },
    getApps: () => {
        // fare controllo con il datastore
        return detectedApps
    }
})*/