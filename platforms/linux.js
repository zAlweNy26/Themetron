const fs = require("fs")
const ini = require("ini")
const path = require("path")
const { readFolderSafe, readFileSafe } = require("./shared.js")

const desktopFilesDir = '/usr/share/applications'

async function readAppInfo(desktopFile) {
    const content = await readFileSafe(desktopFile)
    const entry = ini.parse(content)['Desktop Entry']
    if (!entry || !entry.Exec) return
    let exePath = ''
    if (entry.Exec.startsWith('"')) exePath = entry.Exec.replace(/^"(.*)".*/, '$1')
    else exePath = entry.Exec.split(/\s+/)[0]
    if (!exePath.startsWith('/')) return
    if (!fs.existsSync(path.join(exePath, '../resources/electron.asar'))) return
    let appName = entry ? entry.Name : path.basename(exePath)
    appName = appName.replace(/\d+(\.\d+){0,5}/, "")
    appName = appName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    return {
        [appName.trimEnd()]: {
            version: "",
            themeApplied: "",
            mainPath: path.dirname(exePath),
            exePath,
            asarPath: ""
        }
    }
}

const detectApps = async () => {
    const files = await readFolderSafe(desktopFilesDir)
    let apps = await Promise.all(
        files.map((file) => {
            if (!file.endsWith('.desktop')) return
            return readAppInfo(path.join(desktopFilesDir, file))
        })
    )
    apps = apps.filter(app => typeof app !== 'undefined').sort((a, b) => (a.name < b.name ? -1 : 1))
    return Object.assign({}, ...apps)
}

exports.detectApps = detectApps
