const { ipcRenderer } = require('electron')
const remote = require("@electron/remote")
const path = require("path")

var apps = remote.getGlobal("apps")
var themes = remote.getGlobal("themes")

function setAction(text, color) {
    $("#action").css("color", color)
    $("#action").text(text)
}

$(document).ready(function() {
    Object.keys(apps).forEach(app => {
        $("#apps .menu-list").append(`
            <li>
                <i class="item-remove"></i>
                <span>${app}</span>
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
    let themeName = parent.children("span").text()
    let input = $(`#${menuID} .menu-selected`)
    await ipcRenderer.invoke("delStoreValue", `${menuID}.${themeName.replace(".", "\\.")}`)
    if (parent.children("span").text() == input.val()) input.val(sel)
    setAction(`${menuID == "apps" ? "App" : "Theme"} removed from the list !`, "red")
    parent.remove()
})

$("#root").click(function() {
    $(".dropmenu").removeClass("active")
})

$(".gh-wrapper").on('click', function() {
    remote.shell.openExternal("https://github.com/zAlweNy26/electron-theme-tool")
})

$(".pp-wrapper").on('click', function() {
    remote.shell.openExternal("https://www.paypal.com/paypalme/danyalwe")
})

$(".close-wrapper").on('click', function() {
    remote.getCurrentWindow().close()
})

$(".min-wrapper").on('click', function() {
    remote.getCurrentWindow().minimize()
})

$("#open").on('click', async function() {
    await ipcRenderer.invoke("openInEditor")
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

$(".menu-add").on('click', function() {
    let extFilter
    if (process.platform == "win32") extFilter = { name: 'Windows executable', extensions: ['exe'] }
    else if (process.platform == "darwin") extFilter = { name: 'Linux executable', extensions: ['desktop'] }
    else if (process.platform == "linux") extFilter = { name: 'MacOS executable', extensions: ['app'] }
    let selectedAsar = remote.dialog.showOpenDialogSync(remote.getCurrentWindow(), {
        title: "Select the .exe file of the electron-based app",
        buttonLabel: "Select",
        properties: ['openFile'],
        filters: [extFilter]
    })
    if (selectedAsar != undefined) {
        selectedAsar.forEach(async exePath => {
            let appInfos = await ipcRenderer.invoke("getAppInfo", exePath)
            let appName = Object.keys(appInfos)[0]
            if (appInfos[appName].asarPaths.length == 0) {
                return remote.dialog.showMessageBoxSync(remote.getCurrentWindow(), {
                    title: "No asar package found !",
                    message: `Are you sure that this is an electron-based app ? Because I don't think so.`,
                    type: "error",
                    buttons: ["Ok, sorry"],
                    defaultId: 0,
                    cancelId: 0,
                })
            }
            let alreadyExist = $('#apps .menu-list').find(`li span:contains("${appName}")`)
            if (alreadyExist.length == 0) {
                await ipcRenderer.invoke("setStoreValue", `apps.${appName.replace(".", "\\.")}`, {
                    "version": appInfos[appName].version,
                    "themeApplied": "",
                    "mainPath": appInfos[appName].mainPath,
                    "exePath": appInfos[appName].exePath,
                    "asarPaths": appInfos[appName].asarPaths
                })
                $("#apps .menu-list").append(`
                    <li>
                        <i class="item-remove"></i>
                        <span>${appName}</span>
                    </li>`
                )
                setAction("App added to the list !", "lime")
            } else setAction("This app is already on the list !", "red")
        })
    }
})

$("#save").on('click', async function() { 
    let themeName = $("#theme-name").val()
    if ($("#colors").find("input").filter(function() { return $(this).val() != ''; }).length == 9) {
        if (themeName == '') return setAction("The theme name is missing !", "red")
        else if (Object.keys(themes).includes(themeName)) {
            let override = remote.dialog.showMessageBoxSync(remote.getCurrentWindow(), {
                title: "Override theme",
                message: `Do you want to override the existing ${themeName} ?`,
                detail: "If you click yes, the app will replace the current theme color values with the new one you chose.",
                type: "question",
                buttons: ["Yes", "No"],
                defaultId: 1,
                cancelId: 1,
            }) == 0
            if (!override) return setAction("The theme has not been replaced !", "gold")
        }
        let colors = $("#colors").find("input").map((i, e) => $(e).val()).get()
        $("#themes .menu-list").append(`
            <li>
                <i class="item-remove"></i>
                <span>${themeName}</span>
            </li>`
        )
        await ipcRenderer.invoke("setStoreValue", `themes.${themeName.replace(".", "\\.")}`, JSON.parse(`{
            "primary": "${colors[0]}",
            "secondary": "${colors[1]}",
            "tertiary": "${colors[2]}",
            "dark": "${colors[3]}",
            "light": "${colors[4]}",
            "info": "${colors[5]}",
            "positive": "${colors[6]}",
            "danger": "${colors[7]}",
            "warning": "${colors[8]}"
        }`))
        setAction("Theme saved successfully !", "lime")
    } else setAction("The theme could not be saved because some colors are missing !", "red")
})

$("#apply").on('click', function() {
    let themeName = $("#themes .menu-selected").val()
    let appName = $("#apps .menu-selected").val()
    if (themeName == '' && appName == '') return setAction("Neither the app nor the theme have been selected !", "red")
    else if (themeName == '') return setAction("No theme to set has been selected !", "red")
    else if (appName == '') return setAction("No app has been selected !", "red")
    if (apps[`${appName}`] == undefined) return setAction("No apps found with this name !", "red")
    else if (apps[`${appName}`].themeApplied == themeName) return setAction("This theme has already been set for this app !", "red")
    setAction("Theme injection loading", "gold")
    let dots = [".", "..", "..."], dot = 0
    let injecting = setInterval(() => {
        dot = dot > 2 ? 0 : dot
        setAction(`Theme injection loading${dots[dot++]}`, "gold")
    }, 500)
    ipcRenderer.invoke("setAppTheme", appName, themeName).then(res => {
        clearInterval(injecting)
        if (res == "success") setAction("Theme injected successfully !", "lime")
        else setAction(res/*"There were problems assigning the theme to the app !"*/, "red")
    })
})