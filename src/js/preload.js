const {ipcRenderer} = require("electron");
const {createGroup, deleteGroup, editGroup} = require("../js/Road.js");
const {
    createEvent,
    deleteEvent,
    editEvent,
    mergeEvents
} = require("../js/Event.js");
const {
    initTimeline,
    updateRange,
    updateCurrentTime,
    getCurrentDate,
    getEndDate,
    getStartDate
} = require("../js/timeline.js");

let DateLines = require("../js/Date.js");
let Dates;
let availableRoads;
let j;
const addText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText += text;
};

ipcRenderer.on("asynchronous-reply", (event, reply) => {
    reply = JSON.parse(reply);
    switch (reply["command"]) {
        case "send root roads":
            j = -reply["roads"].length / 2 + 0.5;
            Dates = new DateLines(getStartDate(), getEndDate(), 2);
            availableRoads = reply["roads"];
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
                console.log(event);
                createEvent(
                    event.event_id,
                    event.icon,
                    event.color,
                    "group " + event.path_id,
                    event.date,
                    Dates.mode
                );
            });
            mergeEvents(reply["path_id"]);
            break;
    }
});

window.addEventListener("DOMContentLoaded", () => {
    ipcRenderer.send(
        "asynchronous-message",
        JSON.stringify({command: "get root roads"})
    );

    initTimeline(new Date(2022, 5, 17), new Date(2022, 5, 21));

    document.getElementById("getEventsBtn").addEventListener("click", () => {
        availableRoads.forEach(road => {
            ipcRenderer.send(
                "asynchronous-message",
                JSON.stringify({
                    command: "get events",
                    path_id: road.path_id,
                    first_date: getStartDate(),
                    end_date: getEndDate()
                })
            );
        });
    });

    document
        .getElementById("timelineStart")
        .addEventListener("change", updateRange);

    document
        .getElementById("timelineCurrent")
        .addEventListener("change", updateRange);

    document
        .getElementById("timelineEnd")
        .addEventListener("change", updateRange);

    document
        .getElementById("timelineRange")
        .addEventListener("change", updateCurrentTime);
    // TODO переключение масштаба

    function selectScale(symbol, scale) {
        document.getElementById("select-scale").innerHTML = symbol;
    }

    document
        .getElementById("select-scale-day")
        .addEventListener("click", () => {
            selectScale("Д", "day");
            Dates.deleteDates();
            Dates = new DateLines(getStartDate(), getEndDate(), 2);
            Dates.createDates(j + 1);
        });
    document
        .getElementById("select-scale-month")
        .addEventListener("click", () => {
            selectScale("М", "month");
            Dates.deleteDates();
            Dates = new DateLines(getStartDate(), getEndDate(), 1);
            Dates.createDates(j + 1);
        });
    document
        .getElementById("select-scale-year")
        .addEventListener("click", () => {
            selectScale("Г", "year");
            Dates.deleteDates();
            Dates = new DateLines(getStartDate(), getEndDate(), 0);
            Dates.createDates(j + 1);
        });
});
