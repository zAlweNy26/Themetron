const Store = require('electron-store')

class DataStore extends Store {
    constructor (settings) {
        super(settings)
        this.apps = this.get('apps') || []
    }
    saveApps() {
        this.set('apps', this.apps)
        return this
    }
    getApps() {
        this.apps = this.get('apps') || []
        return this
    }
    addApp(app) {
        this.apps = [...this.apps, app ]
        return this.saveApps()
    }
    deleteApp(app) {
        this.apps = this.apps.filter(a => a != app)
        return this.saveApps()
    }
}

module.exports = DataStore