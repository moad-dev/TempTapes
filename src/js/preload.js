const {ipcRenderer} = require("electron");
const {createGroup, deleteGroup, editGroup} = require("../js/Road.js");
const {createEvent, deleteEvent, editEvent} = require("../js/Event.js");

const addText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText += text;
};

ipcRenderer.on("asynchronous-reply", (event, reply) => {
    reply = JSON.parse(reply);
    switch (reply["command"]) {
        case "send root roads":
            var j = -reply["roads"].length / 2 + 0.5;
            reply["roads"].forEach(road => {
                createGroup(
                    road.color,
                    road.icon,
                    road.path_id,
                    road.name,
                    j++
                );
                // addText("test", road["name"] + "\n");
            });
            break;
    }
});

window.addEventListener("DOMContentLoaded", () => {
    ipcRenderer.send(
        "asynchronous-message",
        JSON.stringify({command: "get root roads"})
    );
});
