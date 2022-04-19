// import $ from 'jquery';
// global.jQuery = $;
// global.$ = $;

const {app, BrowserWindow} = require("electron");

const path = require("path");
const database = require(path.join(process.cwd(), "\\database\\database_module"));

function main(db) {
    function createWindow() {
        window = new BrowserWindow({
            width: 800,
            height: 600,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            }
        });
        console.log('suck')

        window.loadFile(path.join(process.cwd(), "\\src\\html\\index.html"));
    }
    app.on("ready", createWindow);
}

database.Init(main);
