// Модуль взаимодействия с сервером и управления 3д элементами
//
//

const {ipcRenderer} = require("electron");

const {createGroup, deleteGroup, editGroup} = require("../js/Road.js");
const {createEvent, deleteEvent, editEvent, mergeEvents, deleteAllEvents, InitEvents} = require("../js/Event.js");

const {setScale, getScale} = require('../js/timescale.js');
const {
    initTimeline, updateRange, updateCurrentDate, adjustDate,
    getCurrentDate, getEndDate, getStartDate,
} = require("../js/timeline.js");

//~~~~~~~~~~~~~~~~~~~~~~~~~~
// Инициализация переменных
//~~~~~~~~~~~~~~~~~~~~~~~~~~

let DateLines = require("../js/Date.js");
let Dates;
let cache = {roads: [], events: []};
let j;
const Watcher = require("../js/multipleProcessWatcher.js");
let events_watcher = null;

//~~~~~~~~~~
// Геттеры
//~~~~~~~~~~

function getCache() {
    return cache;
}

function getWatcher() {
    return events_watcher;
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Функции-интерфейсы для фронта
// Инициируют запросы к серверу
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

function getEvents()
{
    Dates.deleteDates();
    Dates = new DateLines(getCurrentDate(), getEndDate(), getScale());
    Dates.createDates(j + 1);
    events_watcher.set_status(true);
    deleteAllEvents()
    cache["roads"].forEach(road => {
        ipcRenderer.send(
            "get events",
            JSON.stringify({
                path_id: road.path_id,
                first_date: getCurrentDate(),
                end_date: getEndDate()
            })
        );
    });
}

function makePath()
{
    let name = document.getElementById('makePathName').value;
    let color = document.getElementById('makePathColorPeeker').value;
    let icon = document.getElementById('makePathIcon').value;
    if(!name || !icon) {
        console.log("error: path name, icon, color cannot be null");
    } else {
        ipcRenderer.send(
            "make path",
            JSON.stringify({
                name: name,
                color: color,
                icon: icon,
                parent_id: null
            })
        );
    }
}
function editPath()
{
    let path_id = document.getElementById('editPathPath').value;
    let name = document.getElementById('editPathName').value;
    let color = document.getElementById('editPathColorPeeker').value;
    let icon = document.getElementById('editPathIcon').value;
    if(!name || !icon || !color || !path_id) {
        console.log("error: path name, icon, color cannot be null");
    } else {
        ipcRenderer.send(
            "edit path",
            JSON.stringify({
                name: name,
                color: color,
                icon: icon,
                parent_id: null,
                path_id: path_id
            })
        );
    }
}
function deletePath()
{
    let id = document.getElementById('deletePathId').value;
    if(!id) {
        console.log("error: path id cannot be null");
    } else {
        ipcRenderer.send(
            "delete path",
            JSON.stringify({
                path_id: id
            })
        );
    }
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Обработчики событий сообщений от сервера
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

ipcRenderer.on("send root roads", (event, reply) =>
{
    reply = JSON.parse(reply);
    if(cache["roads"]) {
        cache["roads"].forEach((elem) => {
            deleteGroup(elem["path_id"]);
            deleteAllEvents();
            Dates.deleteDates();
        });
    }
    j = -reply["roads"].length / 2 + 0.5;
    Dates = new DateLines(getCurrentDate(), getEndDate(), getScale());
    cache["roads"] = reply["roads"];
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
    InitEvents(reply["roads"].length);
    events_watcher = new Watcher(reply["roads"].length);
    setScale(2)
    getEvents();
});
ipcRenderer.on("send events", (event, reply) =>
{
    reply = JSON.parse(reply);
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
    let index = cache["roads"].map( el => el.path_id ).indexOf(reply["path_id"]);
    mergeEvents(index+1);
    events_watcher.process_complete([index]);
});
ipcRenderer.on("path added", (event, reply) =>
{
    reply = JSON.parse(reply);
    ipcRenderer.send(
        "get root roads", "{}"
    );
});
ipcRenderer.on("path deleted", (event, reply) =>
{
    reply = JSON.parse(reply);
    ipcRenderer.send(
        "get root roads", "{}"
    );
});
ipcRenderer.on("path edited", (event, reply) =>
{
    reply = JSON.parse(reply);
    ipcRenderer.send(
        "get root roads", "{}"
    );
});
ipcRenderer.on("send images", (event, reply) =>
{
    reply = JSON.parse(reply);
    let icons_make = document.getElementById("makePathIcon");
    let icons_edit = document.getElementById("editPathIcon");
    icons_make.innerHTML = "";
    icons_edit.innerHTML = "";
    reply["images"].forEach(function(image) {
        let option = document.createElement("option");
        option.innerHTML = image;
        icons_make.appendChild(option);
        option = document.createElement("option");
        option.innerHTML = image;
        icons_edit.appendChild(option);
    });
});


module.exports = {
    getCache: getCache,
    getWatcher: getWatcher,
    getEvents: getEvents,
    makePath: makePath,
    editPath: editPath,
    deletePath: deletePath
}
