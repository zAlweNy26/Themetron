const { ipcRenderer } = require('electron')
const remote = require("@electron/remote")
const fs = require("fs")
const path = require("path")
const klawSync = remote.require("klaw-sync")

var apps = remote.getGlobal("apps")
var themes = remote.getGlobal("themes")

function setAction(text, color) {
    $("#action").css("color", color)
    $("#action").text(text)
}

$(document).ready(function() {
    apps.forEach(app => {
        $("#apps .menu-list").append(`
            <li>
                <i class="item-remove"></i>
                <span>${app.name}</span>
            </li>`
        )
    })
    Object.keys(themes).forEach(theme => {
        $("#themes .menu-list").append(`
            <li>
                <i class="item-remove"></i>
                <span>${theme}</span>
            </li>`
        )
    })
    /*window.api.getApps().then(apps => {
        apps.forEach(app => {
            $('#apps').append($('<option>', {
                value: app.id,
                text: app.name
            }))
        })
    })*/
})

$(".menu-list").on('click', 'li', function(e) {
    let menuID = $(this).parent().parent().attr("id")
    if ($(e.target).is("i")) return
    $(`#${menuID} .menu-selected`).val($(this).children("span").text())
    let single = menuID.charAt(0).toUpperCase() + menuID.slice(1, -1)
    setAction(`${single} selected !`, "lime")
})

$(".menu-list").on('click', 'li .item-remove', async function() {
    let parent = $(this).parent()
    let menuID = $(parent).parent().parent().attr("id")
    let sel = menuID == "apps" ? "Select an app" : "Select a theme"
    let input = $(`#${menuID} .menu-selected`)
    await ipcRenderer.invoke("delStoreValue", `${menuID}.${input.val()}`)
    if (parent.children("span").text() == input.val()) input.val(sel)
    setAction(`${menuID == "apps" ? "App" : "Theme"} removed from the list !`, "red")
    parent.remove()
})

$("#root").click(function() {
    $(".dropmenu").removeClass("active")
});

$(".gh-wrapper").on('click', function() {
    remote.shell.openExternal("https://github.com/zAlweNy26/electron-theme-tool")
})

$(".pp-wrapper").on('click', function() {
    remote.shell.openExternal("https://www.paypal.com/paypalme/danyalwe")
})

$(".close-wrapper").on('click', function() {
    remote.getCurrentWindow().close()
    //window.api.close()
})

$(".min-wrapper").on('click', function() {
    remote.getCurrentWindow().minimize()
})

$(".menu-add").on('click', function() {
    let selectedAsar = remote.dialog.showOpenDialogSync(remote.getCurrentWindow(), {
        title: "Select the .exe file of the electron-based app",
        buttonLabel: "Select",
        properties: ['openFile'],
        filters: [{ name: 'Electron executable', extensions: ['exe'] }]
    })
    if (selectedAsar != undefined) {
        selectedAsar.forEach(async exePath => {
            let baseName = path.basename(exePath).split(".")[0]
            let alreadyExist = $('#apps .menu-list').find(`li span:contains("${baseName}")`)
            if (alreadyExist.length == 0) {
                await ipcRenderer.invoke("setStoreValue", `apps.${baseName}`, {
                    "version": "",
                    "themeApplied": "",
                    "mainPath": path.dirname(exePath),
                    "exePath": exePath,
                    "asarPath": ""
                })
                $("#apps .menu-list").append(`
                    <li>
                        <i class="item-remove"></i>
                        <span>${baseName}</span>
                    </li>`
                )
                setAction("App added to the list !", "lime")
            } else setAction("This app is already on the list !", "red")
        })
    }
})

$(".dropmenu").on('click', function(e) {
    let menuID = $(this).attr("id")
    if ($(`#${menuID} .menu-list`).children().length > 0) {
        e.stopPropagation()
        $(this).toggleClass("active")
    } else if (menuID == "apps") {
        $(`#apps .menu-selected`).attr('value', "No apps found")
        $(`#apps .menu-selected`).attr('data', "")
    } else if (menuID == "themes") {
        $(`#themes .menu-selected`).attr('value', "No themes found")
        $(`#themes .menu-selected`).attr('data', "")
    }
})

$("#apply").on('click', function() {
    let theme = {
        themeName: $("#themes .menu-selected").val(),
        themeIndex: $("#themes .menu-selected").attr("data")
    }
    let app = {
        appName: $("#apps .menu-selected").val(),
        mainPath: $("#apps .menu-selected").attr("data")
    }
    let appsJson = JSON.parse(fs.readFileSync(path.join(__dirname.replace("app", ""), "apps.json"), 'utf8'))
    if (appsJson[app.appName] == undefined) return setAction("No apps found with this name !", "red")
    if (appsJson[app.appName].themeApplied == theme.themeName) 
        return setAction("This theme has already been set for this app !", "red")
    
    // applica il tema all'app e scriverlo nel json
})

$("#save").on('click', function() { 
    if ($("#colors").find("input").filter(function() { return $(this).val() != ''; }).length == 9) {
        let override = false
        if ($("#theme-name").val() == '') 
            return setAction("The theme name is missing !", "red")
        else if (Object.keys(themes).includes($("#theme-name").val())) {
            override = remote.dialog.showMessageBoxSync(remote.getCurrentWindow(), {
                title: "Override theme",
                message: `Do you want to override the existing ${$("#theme-name").val()} ?`,
                detail: "If you click yes, the app will replace the current theme color values with the new one you chose.",
                type: "question",
                buttons: ["Yes", "No"],
                defaultId: 1,
                cancelId: 1,
            }) == 0
        }
        if (!override) return
        $("#colors").find("input").filter(function() { return console.log($(this).val()); })
        // salvare tema nel json
        setAction("Theme saved successfully !", "lime")
    } else setAction("The theme could not be saved because some colors are missing !", "red")
})