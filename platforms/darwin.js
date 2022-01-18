const fs = require("fs")
const path = require("path")
const { readFolderSafe, readFileAsBufferSafe, readPlistFile } = require("./shared.js")

async function readAppByPath(p) {
    const isElectronBased = fs.existsSync(path.join(p, 'Contents/Frameworks/Electron Framework.framework'))
    if (!isElectronBased) return
    const info = await readPlistFile(path.join(p, 'Contents/Info.plist'))
    const icon = await readIcnsAsImageUri(path.join(p, 'Contents/Resources', info.CFBundleIconFile))
    return {
        name: info.CFBundleName,
        version: info.CFBundleVersion,
        themeApplied: "",
        mainPath: path.dirname(exePath),
        exePath: path.resolve(p, 'Contents/MacOS', info.CFBundleExecutable),
        asarPath: ""
    }
}

async function readIcnsAsImageUri(file) {
    let buf = await readFileAsBufferSafe(file)
    if (!buf) return ''
    const totalSize = buf.readInt32BE(4) - 8
    buf = buf.slice(8)
    const icons = []
    let start = 0
    while (start < totalSize) {
        const type = buf.slice(start, start + 4).toString()
        const size = buf.readInt32BE(start + 4)
        const data = buf.slice(start + 8, start + size)
        icons.push({ type, size, data })
        start += size
    }
    icons.sort((a, b) => b.size - a.size)
    const imageData = icons[0].data
    if (imageData.slice(1, 4).toString() === 'PNG') {
        return 'data:image/png;base64,' + imageData.toString('base64')
    } else return ''
}

const detectApps = async () => {
    const dir = '/Applications'
    const appPaths = await readFolderSafe(dir)
    let apps = await Promise.all(appPaths.map((p) => readAppByPath(path.join(dir, p))))
    apps = apps.filter(app => typeof app !== 'undefined').sort((a, b) => (a.name < b.name ? -1 : 1))
    return apps
}

exports.detectApps = detectApps
