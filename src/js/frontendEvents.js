// Модуль взаимодействия с сервером и управления 3д элементами
//
//

const {ipcRenderer} = require("electron");

const {createGroup, deleteGroup, editGroup} = require("../js/Road.js");

//{createEvents, deleteEvent, editEvent, deleteAllEvents}
const eventModule = require("../js/Event.js");

const {setScale, getScale} = require('../js/timescale.js');
const {
    initTimeline, updateRange, updateCurrentDate, adjustDate,
    getCurrentDate, getEndDate, getStartDate, getVisibleDate
} = require("../js/timeline.js");

const {checkBarVisibility, getLastValue, setLastValue} = require('../js/horizontallScrollBar');
//~~~~~~~~~~~~~~~~~~~~~~~~~~
// Инициализация переменных
//~~~~~~~~~~~~~~~~~~~~~~~~~~

let DateLines = require("../js/Date.js");
let Dates;
const cacheModule = require("../js/cacheModule.js");
let cache = cacheModule.getCache();
let axisCenter;

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Функции-интерфейсы для фронта
// Инициируют запросы к серверу
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

function getEvents()
{
    eventModule.deleteAllEvents()
    Dates.deleteDates();
    Dates = new DateLines(getCurrentDate(), getEndDate(), getScale());
    Dates.createDates(axisCenter + 1);

    cacheModule.getEvents(getCurrentDate(true), getVisibleDate(true), Dates.mode);
}

function getRoads() {
    if(cache["roads"]) {
        cache["roads"].forEach((elem) => {
            deleteGroup(elem["path_id"]);
            eventModule.deleteAllEvents();
            Dates.deleteDates();
        });
    }

    cacheModule.getRoads();
}

function makePath()
{
    let name = document.getElementById('makePathName').value;
    let color = document.getElementById('makePathColorPeeker').value;
    let icon = document.getElementById('makePathIcon').value;
    if(!name || !icon || !color) {
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

function makeEvent()
{
    let name = document.getElementById('makeEventName').value;
    let color = null;
    if (document.getElementById('makeEventColorTransparent').checked == false)
    {
        color = document.getElementById('makeEventColorPeeker').value;
    }
    let icon = document.getElementById('makeEventIcon').value;
    let date = document.getElementById('makeEventDate').value;
    let description = document.getElementById('makeEventDescription').value;
    let path_id = document.getElementById('makeEventPath').value;
    if(!name || !icon || !date || !path_id) {
        console.log("make event error: name, icon, date, path_id cannot be null");
    } else {
        ipcRenderer.send(
            "make event",
            JSON.stringify({
                name: name,
                color: color,
                icon: icon,
                date: date,
                description: description,
                path_id: path_id
            })
        );
    }
}

function editEvent()
{
    let name = document.getElementById('editEventName').value;
    let color = null;
    if (document.getElementById('editEventColorTransparent').checked == false)
    {
        color = document.getElementById('editEventColorPeeker').value;
    }
    let icon = document.getElementById('editEventIcon').value;
    let date = document.getElementById('editEventDate').value;
    let description = document.getElementById('editEventDescription').value;
    let path_id = document.getElementById('editEventPath').value;
    let event_id = document.getElementById('editEventId').value;
    if(!name || !icon || !date || !path_id || !event_id) {
        console.log("edit event error: name, icon, date, path_id cannot be null");
    } else {
        ipcRenderer.send(
            "edit event",
            JSON.stringify({
                name: name,
                color: color,
                icon: icon,
                date: date,
                description: description,
                path_id: path_id,
                event_id: event_id
            })
        );
    }
}

function deleteEvent()
{
    let id = document.getElementById('deleteEventId').value;
    if(!id) {
        console.log("delete event error: event id cannot be null");
    } else {
        ipcRenderer.send(
            "delete event",
            JSON.stringify({
                event_id: id
            })
        );
    }
}


//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Обработчики событий сообщений от сервера
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

function onRoadsReady() {
    checkBarVisibility(cache);
    axisCenter = -cache["roads"].length / 2 + 0.5;
    Dates = new DateLines(getCurrentDate(), getEndDate(), getScale());
    cache["roads"].forEach(road => {
        createGroup(
            road.color,
            road.icon,
            road.path_id,
            road.name,
            axisCenter++
        );
    });
    Dates.createDates(axisCenter + 1);
    setScale(2)
    getEvents();
    ipcRenderer.send("get all roads", "{}");
}
cacheModule.setOnRoadsReady(onRoadsReady);

function onEventsReady(path_id) {
    eventModule.createEvents(getCurrentDate(false), getVisibleDate(false),  Dates.mode, path_id);
}
cacheModule.setOnEventsReady(onEventsReady);

ipcRenderer.on("path added", (event, reply) =>
{
    reply = JSON.parse(reply);
    getRoads();
});
ipcRenderer.on("path deleted", (event, reply) =>
{
    reply = JSON.parse(reply);
    getRoads();
});
ipcRenderer.on("path edited", (event, reply) =>
{
    reply = JSON.parse(reply);
    getRoads();
});
ipcRenderer.on("send images", (event, reply) =>
{
    reply = JSON.parse(reply);
    let path_icons_make = document.getElementById("makePathIcon");
    let path_icons_edit = document.getElementById("editPathIcon");
    let events_icons_make = document.getElementById("makeEventIcon");
    let events_icons_edit = document.getElementById("editEventIcon");
    path_icons_make.innerHTML = "";
    path_icons_edit.innerHTML = "";
    events_icons_make.innerHTML = "";
    events_icons_edit.innerHTML = "";
    reply["images"].forEach(function(image) {
        let option = document.createElement("option");
        option.innerHTML = image;
        path_icons_make.appendChild(option);
        option = document.createElement("option");
        option.innerHTML = image;
        path_icons_edit.appendChild(option);
        option = document.createElement("option");
        option.innerHTML = image;
        events_icons_make.appendChild(option);
        option = document.createElement("option");
        option.innerHTML = image;
        events_icons_edit.appendChild(option);
    });
});
ipcRenderer.on("send all roads", (event, reply) =>
{
    reply = JSON.parse(reply);
    let events_paths_make = document.getElementById("makeEventPath");
    let events_paths_edit = document.getElementById("editEventPath");
    events_paths_make.innerHTML = "";
    events_paths_edit.innerHTML = "";
    reply["roads"].forEach(function(path) {
        let option = document.createElement("option");
        option.innerHTML = path.name;
        option.value = path.path_id;
        events_paths_make.appendChild(option);
        option = document.createElement("option");
        option.innerHTML = path.name;
        option.value = path.path_id;
        events_paths_edit.appendChild(option);
    });
});
ipcRenderer.on("event added", (event, reply) =>
{
    reply = JSON.parse(reply);
    getEvents();
});
ipcRenderer.on("event edited", (event, reply) =>
{
    reply = JSON.parse(reply);
    getEvents();
});
ipcRenderer.on("event deleted", (event, reply) =>
{
    reply = JSON.parse(reply);
    getEvents();
});


module.exports = {
    getEvents: getEvents,
    getRoads: getRoads,
    makePath: makePath,
    editPath: editPath,
    deletePath: deletePath,
    makeEvent: makeEvent,
    editEvent: editEvent,
    deleteEvent: deleteEvent
}
