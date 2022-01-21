const fs = require("fs")
const path = require("path")
const { readFolderSafe, readPlistFile } = require("./shared.js")

async function readAppByPath(p) {
    const isElectronBased = fs.existsSync(path.join(p, 'Contents/Frameworks/Electron Framework.framework'))
    if (!isElectronBased) return
    const info = await readPlistFile(path.join(p, 'Contents/Info.plist'))
    return {
        [info.CFBundleName]: {
            version: info.CFBundleVersion,
            themeApplied: "",
            mainPath: path.dirname(exePath),
            exePath: path.resolve(p, 'Contents/MacOS', info.CFBundleExecutable),
            asarPath: ""
        }
    }
}

const detectApps = async () => {
    const dir = '/Applications'
    const appPaths = await readFolderSafe(dir)
    let apps = await Promise.all(appPaths.map((p) => readAppByPath(path.join(dir, p))))
    apps = apps.filter(app => typeof app !== 'undefined').sort((a, b) => (a.name < b.name ? -1 : 1))
    return Object.assign({}, ...apps)
}

const startInjection = () => {
    return "success"
}

exports.detectApps = detectApps
exports.startInjection = startInjection
