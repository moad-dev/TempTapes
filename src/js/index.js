// Главный модуль приложения, инициализация электрона и БД
//
//

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//         Для Windows
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

const {ipcMain} = require("electron");
const {app, BrowserWindow} = require("electron");

const path = require("path");
const database = require("../../database/database_module");

function main() {
    window = new BrowserWindow({
        width: 800,
        height: 600,
        minHeight: 600,
        minWidth: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            preload: path.join(process.cwd(), "src/js/renderer/preload.js")
        },
        icon: path.join(process.cwd(), "storage/favicon.png")
    });
    window.loadFile(path.join(process.cwd(), "src/html/index.html"));
    window.removeMenu(true)

    runEventsListeners = require(path.join(
        process.cwd(),
        "src/js/mainEvents.js"
    ));
    runEventsListeners(database, ipcMain);
}
database.Init(main);

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//         Для Linux
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// const {ipcMain} = require("electron");
// const {app, BrowserWindow} = require("electron");
//
// const path = require("path");
// const database = require(path.join(process.cwd(), "database/database_module"));
//
// function main() {
//     function createWindow() {
//         window = new BrowserWindow({
//             width: 800,
//             height: 600,
//             webPreferences: {
//                 nodeIntegration: true,
//                 contextIsolation: false,
//                 preload: path.join(process.cwd(), "src/js/renderer/preload.js")
//             },
//             icon: path.join(process.cwd(), "storage/favicon.png")
//         });
//         window.loadFile(path.join(process.cwd(), "src/html/index.html"));
//         window.removeMenu(true);
//     }
//
//     runEventsListeners = require(path.join(
//         process.cwd(),
//         "src/js/mainEvents.js"
//     ));
//     runEventsListeners(database, ipcMain);
//
//     app.on("ready", createWindow);
// }
// database.Init(main);
