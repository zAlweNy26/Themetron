const { app, BrowserWindow, ipcMain } = require('electron')
const Store = require('electron-store')
//const { autoUpdater } = require('electron-updater') // TODO : set it up before production
const path = require('path')

require('@electron/remote/main').initialize()

const store = new Store({clearInvalidConfig: true, watch: true})

global.apps = []
global.themes = []

try { require('electron-reloader')(module) } catch (err) { console.error(err) } // TODO : remove it in production

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
            devTools: true, // TODO : change to false in production
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

app.whenReady().then(async () => {
    let apps = await require(`./platforms/${process.platform}.js`).detectApps()
    if (!store.has("apps")) {
        global.apps = apps
        store.set("apps", apps)
    } else {
        store.set("apps", Object.assign({}, store.get("apps"), apps))
        global.apps = store.get("apps")
    }
    if (!store.has("themes")) {
        global.themes = {
            "Dark-Cyan": {
                "primary": "#00CCAA",
                "secondary": "",
                "tertiary": "",
                "dark": "#252525",
                "light": "#FFFFFF",
                "info": "",
                "positive": "#00FF15",
                "danger": "#FF0000",
                "warning": "#FFD500"
            }
        }
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
	store.set(key, value)
})

ipcMain.handle('delStoreValue', (event, key) => {
    store.delete(key)
})

ipcMain.handle('setAppTheme', (event, app, theme) => {
    let appValues = store.get(`apps.${app}`)
    let themeValues = store.get(`themes.${theme}`)
    console.log(appValues)
    console.log(themeValues)
    // TODO : applica il tema all'app e POI scriverlo nel json
    // return true se è andato tutto ok, altrimenti false
    // store.set(`apps.${app}.themeApplied`, theme)
    return true
})