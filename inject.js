const ps = require("ps-node")

const inject = (appName, appValues, themeName, themeValues) => {
    return new Promise((resolve, reject) => {
        try {
            ps.lookup({ command: `${appName}.exe`, psargs: 'ux' }, (err, resultList) => {
                if (err) throw "Unable to find this process."
                let pf = require(`./platforms/${process.platform}.js`)
                if (resultList.length) {
                    ps.kill(resultList[0].pid, { signal: 'SIGTERM' }, err => {
                        if (err) throw "Unable to kill this process. Please close it manually."
                        resolve(pf.startInjection(appName, appValues, themeName, themeValues))
                    })
                } else resolve(pf.startInjection(appName, appValues, themeName, themeValues))
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