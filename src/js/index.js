// import $ from 'jquery';
// global.jQuery = $;
// global.$ = $;
const {ipcMain} = require("electron");
const {app, BrowserWindow} = require("electron");

const path = require("path");
const database = require(path.join(process.cwd(), "/database/database_module"));

function main() {
    function createWindow() {
        window = new BrowserWindow({
            width: 800,
            height: 600,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                preload: path.join(process.cwd(), "src/js/preload.js")
            }
        });
        window.loadFile(path.join(process.cwd(), "src/html/index.html"));
    }

    runEventsListeners = require(path.join(
        process.cwd(),
        "src/js/mainEvents.js"
    ));
    runEventsListeners(database, ipcMain);

    app.on("ready", createWindow);
}
database.Init(main);
