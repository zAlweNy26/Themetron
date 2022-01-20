const path = require('path')
const ps = require("ps-node")
const klawSync = require("klaw-sync")

function findFiles(mainPath, ext) {
    return klawSync(mainPath, {
        nodir: true,
        filter: item => path.extname(item.path) == `.${ext}`,
        traverseAll: true
    })
}

function startInjecting(appName, appValues, themeName, themeValues) {
    switch (process.platform) {
        case "win32":
            return "success"
        case "darwin":
            return "success"
        case "linux":
            return "success"
        default:
            return "This OS platform is not supported !"
    }
}

const inject = (appName, appValues, themeName, themeValues) => {
    return new Promise((resolve, reject) => {
        try {
            ps.lookup({ command: `${appName}.exe`, psargs: 'ux' }, (err, resultList) => {
                if (err) throw "Unable to find this process."
                if (resultList.length) {
                    ps.kill(resultList[0].pid, { signal: 'SIGTERM' }, err => {
                        if (err) throw "Unable to kill this process. Please close it manually."
                        resolve(startInjecting(appName, appValues, themeName, themeValues))
                    })
                } else resolve(startInjecting(appName, appValues, themeName, themeValues))
            })
        } catch (error) { reject(error) }
    })
    /*let res = ""
    findFiles(appValues.mainPath, "exe").forEach(item => {
        try {
            ps.lookup({ command: item.path.replaceAll("\\\\", "\\"), psargs: 'ux' }, (err, resultList) => {
                if (err) throw "Unable to find this process."
                if (resultList.length) {
                    resultList.forEach(pid => {
                        ps.kill(pid, { signal: 'SIGTERM' }, err => {
                            if (err) throw "Unable to kill this process. Please close it manually."
                        })
                    })
                    res = startInjecting()
                } else res = startInjecting()
            })
        } catch (error) { res = error }
    })
    return res*/
}

exports.inject = inject