const { app, BrowserWindow, ipcMain } = require('electron')
const fs = require("fs-extra")
const Store = require('electron-store')
//const { autoUpdater } = require('electron-updater')
const path = require('path')

require('@electron/remote/main').initialize()

const store = new Store({clearInvalidConfig: true, watch: true})

//const DataStore = require('./storage.js')
//const appsData = new DataStore({ name: "ThemetronInfos" })

global.apps = []
global.themes = []

try {
    require('electron-reloader')(module)
} catch (err) { console.error(err) }

const createWindow = () => {
    const win = new BrowserWindow({
        width: 550,
        height: 320,
        resizable: false,
        frame: false,
        transparent: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            devTools: true, // change to false in production
            spellcheck: false,
            preload: path.join(__dirname, 'preload.js')
        }
    })
    require('@electron/remote/main').enable(win.webContents)
    win.loadFile('app/index.html')
    win.on('closed', () => {
        mainWindow = null
    })
}
function uniqueObjectsInArray(arr1, arr2) {
    let c = arr1.concat(arr2)
    for(let i = 0; i < c.length; ++i) {
        for(let j = i + 1; j < c.length; ++j) {
            if (JSON.stringify(c[i]) === JSON.stringify(c[j])) c.splice(j--, 1)
        }
    }
    return c
}

app.whenReady().then(async () => {
    let apps = await require(`./platforms/${process.platform}.js`).detectApps()
    if (!store.has("apps")) {
        global.apps = apps
        store.set("apps", apps)
    } else {
        store.set("apps", uniqueObjectsInArray(store.get("apps"), apps))
        global.apps = store.get("apps")
    }
    if (!store.has("themes")) {
        global.themes = [
            {
                "name": "Dark-Cyan",
                "dark": "#252525",
                "light": "#FFFFFF",
                "primary": "#00CCAA",
                "secondary": null,
                "tertiary": null,
                "danger": "#FF0000",
                "positive": "#00FF15",
                "warning": "#FFD500"
            }
        ]
        store.set("themes", global.themes)
    } else global.themes = store.get("themes")
    createWindow()
    //autoUpdater.checkForUpdatesAndNotify()
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

ipcMain.handle('getStoreValue', (event, key) => {
	return store.get(key)
})

ipcMain.handle('setStoreValue', (event, key, value) => {
	return store.set(key, value)
})

ipcMain.handle('delStoreValue', (event, key) => {
	return store.delete(key)
})