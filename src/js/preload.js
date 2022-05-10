const {ipcRenderer} = require("electron");
const {createGroup, deleteGroup, editGroup} = require("../js/Road.js");
const {createEvent, deleteEvent, editEvent} = require("../js/Event.js");

let availableRoads;

const addText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText += text;
};

ipcRenderer.on("asynchronous-reply", (event, reply) => {
    reply = JSON.parse(reply);
    availableRoads = reply["roads"];
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
            });
            break;
        case "send events":
            reply["events"].forEach(event => {
                console.log(event);
                createEvent(
                    event.event_id,
                    event.icon,
                    "group " + event.path_id,
                    "line 2"
                );
            });
            break;
    }
});

window.addEventListener("DOMContentLoaded", () => {
    ipcRenderer.send(
        "asynchronous-message",
        JSON.stringify({command: "get root roads"})
    );

    document.getElementById("getEventsBtn").addEventListener("click", () => {
        availableRoads.forEach(road => {
            ipcRenderer.send(
                "asynchronous-message",
                JSON.stringify({
                    command: "get events",
                    path_id: road.path_id,
                    first_date: "2020-01-01",
                    end_date: "2022-01-01"
                })
            );
        });
    });
});
