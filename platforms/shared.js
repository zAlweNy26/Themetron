const fs = require("fs")
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

const readFileAsBufferSafe = async (p) => {
    try {
        return await fs.promises.readFile(p)
    } catch (err) {
        return ''
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

exports.readFileSafe = readFileSafe
exports.readPlistFile = readPlistFile
exports.readFolderSafe = readFolderSafe
exports.readFileAsBufferSafe = readFileAsBufferSafe

/*var filesFound = [], folderFound = []

const searchFor = (startPath, filter) => {
    if (!fs.existsSync(startPath)) return
    let files = fs.readdirSync(startPath)
    for (let i = 0; i < files.length; i++) {
        let name = path.join(startPath, files[i])
        let stat = fs.statSync(name)
        filter.forEach(v => {
            if (!v.startsWith(".") && path.basename(name) == v) folderFound.push(name)
            else if (v.startsWith(".") && path.extname(name) == v) filesFound.push(name)
            else if (stat.isDirectory()) searchFor(name, [v])
        })
    }
}

searchFor('C:\\Users\\danyn\\AppData\\Local\\Microsoft\\Teams', [".asar", "resources"])*/