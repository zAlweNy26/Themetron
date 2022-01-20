# Themetron
Tool to customize the themes for any electron-based app.
Since the automatic detection is not perfect, it could happen that some values of the app are wrong. For such situation, you have the option to manually change the values in Themetron's config.json.
## To-do list
- Add electron-updater functionality
- Add custom RPC for Discord
- Remove icon attribute from detected apps
## Things you can do
- Automatically detect electron-based apps
- Manually pick an eventually not detected electron-based app
- Add a custom theme to the list of available themes
- Add the theme to the selected electron-based app
## Contributing
Feel free to make a pull request to add the CSS file relative to an electron-based app that is not present in the list of supported apps.
(To inspect an electron-based app, you can use my other program [electool](https://github.com/zAlweNy26/electool))
## Credits
Thanks to the [debugtron](https://github.com/bytedance/debugtron) repository for the code about reading all installed apps by filtering those electron-based.
Thanks to the [coloris](https://github.com/mdbassit/Coloris) repository for the color picker.