const fs = require("fs-extra")
const path = require("path")
const asar = require("asar")
const { fdir } = require("fdir")
const { readFile: readPlist } = require("simple-plist")

const readFileSafe = async (p) => {
    try {
        return await fs.promises.readFile(p, { encoding: 'utf8' })
    } catch (err) {
        return ''
    }
}

const readFolderSafe = async (p) => {
    try {
        return await fs.promises.readdir(p)
    } catch (err) {
        return []
    }
}

const readPlistFile = async (path) => {
    return new Promise((resolve, reject) => {
        readPlist(path, (error, data) => {
            if (error) {
                reject(error)
            } else {
                resolve(data)
            }
        })
    })
}

const findFiles = (mainPath, ext, noDir = false) => {
    const crawler = new fdir().crawlWithOptions(mainPath, {
        includeBasePath: true,
        includeDirs: !noDir,
        filters: [(path, isDirectory) => path.endsWith(`.${ext}`)]
    }).sync()
    return crawler
}

const startInjection = (appName, appValues, themeName, themeValues) => {
    let res = "success"
    appValues.asarPaths.forEach(ap => {
        try {
            if (!fs.existsSync(ap)) throw "The asar file path does not exist !"
            //fs.renameSync(ap, `${ap}.backup`)
            //asar.extractAll(ap, path.join(path.dirname(ap), `${path.basename(ap).split(".")[0]}_unpacked`))
            //fs.copySync(ap, `${ap}.backup`)
            //fs.renameSync(`${ap}.tmp`, ap)
        } catch (error) { res = error }
    })
    return res
}

exports.findFiles = findFiles
exports.readFileSafe = readFileSafe
exports.readPlistFile = readPlistFile
exports.readFolderSafe = readFolderSafe
exports.startInjection = startInjection