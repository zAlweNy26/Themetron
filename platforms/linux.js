const fs = require("fs-extra")
const ini = require("ini")
const path = require("path")
const { readFolderSafe, readFileSafe, findFiles } = require("./shared.js")

const desktopFilesDir = '/usr/share/applications'

const readAppByPath = async desktopFile => {
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
    let mainPath = path.dirname(exePath)
    let asarPaths = findFiles(mainPath, "asar", true)
    return {
        [appName.trimEnd()]: {
            version: "",
            themeApplied: "",
            mainPath,
            exePath,
            asarPaths
        }
    }
}

const detectApps = async () => {
    const files = await readFolderSafe(desktopFilesDir)
    let apps = await Promise.all(
        files.map((file) => {
            if (!file.endsWith('.desktop')) return
            return readAppByPath(path.join(desktopFilesDir, file))
        })
    )
    apps = apps.filter(app => typeof app !== 'undefined').sort((a, b) => (a.name < b.name ? -1 : 1))
    return Object.assign({}, ...apps)
}

const startInjection = () => {
    return "success"
}

exports.detectApps = detectApps
exports.readAppByPath = readAppByPath
exports.startInjection = startInjection
