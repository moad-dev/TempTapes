const {ipcRenderer} = require("electron");
const {createGroup, deleteGroup, editGroup} = require("../js/Road.js");
const {createEvent, deleteEvent, editEvent, mergeEvents} = require("../js/Event.js");

let DateLines = require("../js/Date.js");
let Dates;
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
            Dates = new DateLines("2020-01-01", "2021-03-01", 0)
            reply["roads"].forEach(road => {
                createGroup(
                    road.color,
                    road.icon,
                    road.path_id,
                    road.name,
                    j++
                );
            });
            Dates.createDates(j + 1);
            break;
        case "send events":
            reply["events"].forEach(event => {
                createEvent(
                    event.event_id,
                    event.icon,
                    event.color,
                    "group " + event.path_id,
                    event.date,
                    Dates.mode
                );
            });
            console.log(reply)
            mergeEvents(reply["path_id"]);
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
                    end_date: "2021-03-01"
                })
            );
        });
    });
});
