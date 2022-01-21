const fs = require("fs")
const path = require("path")
const wvi = require('win-version-info')
const { readFolderSafe, findFiles } = require("./shared.js")
const { HKEY, enumerateValues, enumerateKeys, RegistryValueType } = require("registry-js")

function enumRegeditItems(key, subkey) {
    return enumerateKeys(key, subkey).map(k => enumerateValues(key, subkey + '\\' + k))
}

const items = [
    ...enumRegeditItems(HKEY.HKEY_LOCAL_MACHINE, 'Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall'),
    ...enumRegeditItems(HKEY.HKEY_LOCAL_MACHINE, 'Software\\Wow6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall'),
    ...enumRegeditItems(HKEY.HKEY_CURRENT_USER, 'Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall')
]

async function getAppInfoFromRegeditItemValues(values) {
    if (values.length === 0) return
    let iconPath = ''
    const displayIcon = values.find(v => v && v.type === RegistryValueType.REG_SZ && v.name === 'DisplayIcon')
    if (displayIcon) {
        const icon = displayIcon.data.split(',')[0]
        if (icon.toLowerCase().endsWith('.exe')) {
            if (!isElectronApp(path.dirname(icon))) return
            return getAppInfoByExePath(icon, values)
        } else if (icon.toLowerCase().endsWith('.ico')) iconPath = icon
    }
    let installDir = ''
    const installLocation = values.find(v => v && v.type === RegistryValueType.REG_SZ && v.name === 'InstallLocation')
    if (installLocation && installLocation.data) installDir = installLocation.data
    else if (iconPath) installDir = path.dirname(iconPath)
    if (!installDir) return
    const exeFile = await findExeFile(installDir)
    if (exeFile) return getAppInfoByExePath(exeFile, values)
    else {
        const files = await readFolderSafe(installDir)
        const semverDir = files.find(file => /\d+(\.\d+){0,5}/.test(file))
        if (!semverDir) return
        const exeFile = await findExeFile(path.join(installDir, semverDir))
        if (!exeFile) return
        return getAppInfoByExePath(exeFile, values)
    }
}

function isElectronApp(installDir) {
    return (fs.existsSync(path.join(installDir, 'resources')) &&
        ['electron.asar', 'app.asar', 'app.asar.unpacked'].some((file) =>
            fs.existsSync(path.join(installDir, 'resources', file))
        )
    )
}

async function getAppInfoByExePath(exePath, values) {
    const displayName = values.find(v => v && v.type === RegistryValueType.REG_SZ && v.name === 'DisplayName')
    const displayVersion = values.find(v => v && v.type === RegistryValueType.REG_SZ && v.name === 'DisplayVersion')
    let appName = displayName ? displayName.data : path.basename(exePath, '.exe')
    appName = appName.replace(/\d+(\.\d+){0,5}/, "")
    appName = appName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    let mainPath = path.dirname(exePath)
    let asarPaths = findFiles(mainPath, "asar", false).filter(i => path.basename(path.dirname(i)) == "resources")
    return {
        [appName.trimEnd()]: {
            version: displayVersion ? displayVersion.data : "",
            themeApplied: "",
            mainPath,
            exePath,
            asarPaths
        }
    }
}

async function findExeFile(dir) {
    if (isElectronApp(dir)) {
        const files = await readFolderSafe(dir)
        const exeFiles = files.filter(file => {
            const lc = file.toLowerCase()
            return (lc.endsWith('.exe') && !['uninstall', 'update'].some((keyword) => lc.includes(keyword)))
        })
        if (exeFiles.length) return path.join(dir, exeFiles[0])
    }
}

const detectApps = async () => {
    let apps = await Promise.all(items.map(iv => getAppInfoFromRegeditItemValues(iv)))
    apps = apps.filter(app => typeof app !== 'undefined').sort((a, b) => (a.name < b.name ? -1 : 1))
    return Object.assign({}, ...apps)
}

const readAppByPath = async p => {
    let info = wvi(p)
    let asarPaths = findFiles(path.dirname(p), "asar", false).filter(i => path.basename(path.dirname(i)) == "resources")
    return {
        [info.ProductName.trimEnd()]: {
            version: info.ProductVersion,
            themeApplied: "",
            mainPath: path.dirname(p),
            exePath: p,
            asarPaths
        }
    }
}

const startInjection = (appName, appValues, themeName, themeValues) => {
    
    return "success"
}

exports.detectApps = detectApps
exports.readAppByPath = readAppByPath
exports.startInjection = startInjection