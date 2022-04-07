// import $ from 'jquery';
// global.jQuery = $;
// global.$ = $;
const {app, BrowserWindow} = require('electron')
function createWindow () {
    window = new BrowserWindow({width: 800, height: 600, webPreferences: {nodeIntegration:true, contextIsolation:false}})
    window.loadFile('src/html/index.html')
    // window2 = new BrowserWindow({width: 1000, height: 600, webPreferences: {nodeIntegration:true, contextIsolation:false}})
    // window2.loadFile('src/html/image.html')
}
app.on('ready', createWindow);
