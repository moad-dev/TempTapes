// import $ from 'jquery';
// global.jQuery = $;
// global.$ = $;
const {ipcMain} = require("electron");
const {app, BrowserWindow} = require("electron");

const path = require("path");
const database = require(path.join(process.cwd(), "\\database\\database_module"));

function main(db) {
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
    ipcMain.on("asynchronous-message", (event, request) =>
    {
        var text = "";
        database.getAllPaths((err, rows) => {
            text += "Тропинки\n";
            rows.forEach(row => {
                text +=
                    row.name + "\t" + row.color + "\t" + row.parent_id + "\n";
            });
            event.reply("asynchronous-reply", text);
        });
    });
    // app.on("ready", createWindow);
}
database.Init(main);

