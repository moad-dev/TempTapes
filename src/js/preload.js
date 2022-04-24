const {ipcRenderer} = require("electron");

const addText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText += text;
};

ipcRenderer.on("asynchronous-reply", (event, reply) => {
    reply = JSON.parse(reply);
    switch (reply["command"]) {
        case "send roads":
            reply["roads"].forEach(road => {
                addText("test", road["name"] + "\n");
            });
            break;
    }
});

window.addEventListener("DOMContentLoaded", () => {
    ipcRenderer.send(
        "asynchronous-message",
        JSON.stringify({command: "get roads"})
    );
});
