// import $ from 'jquery';
// global.jQuery = $;
// global.$ = $;
const {app, BrowserWindow} = require('electron')
function createWindow () {
    window = new BrowserWindow({width: 800, height: 600, minHeight: 600, minWidth: 800, webPreferences: {nodeIntegration:true, contextIsolation:false}})
    window.loadFile('src/html/index.html')

}
app.on('ready', createWindow);
