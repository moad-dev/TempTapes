const {ipcRenderer} = require("electron");

const addText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText += text;
};

window.addEventListener("DOMContentLoaded", () => {

    ipcRenderer.on("asynchronous-reply", (event, text) => {
        addText("test", text);
    });

    ipcRenderer.send("asynchronous-message", "ping");
    ipcRenderer.send("asynchronous-message", "ping");
    ipcRenderer.send("asynchronous-message", "ping");
});