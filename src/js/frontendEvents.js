// Модуль взаимодействия с сервером и управления 3д элементами
//
//

const {ipcRenderer} = require("electron");

const {createGroup, deleteGroup, editGroup} = require("../js/Road.js");
const {createEvents, deleteEvent, editEvent, deleteAllEvents} = require("../js/Event.js");

const {setScale, getScale} = require('../js/timescale.js');
const {
    initTimeline, updateRange, updateCurrentDate, adjustDate,
    getCurrentDate, getEndDate, getStartDate, getVisibleDate
} = require("../js/timeline.js");

//~~~~~~~~~~~~~~~~~~~~~~~~~~
// Инициализация переменных
//~~~~~~~~~~~~~~~~~~~~~~~~~~

let DateLines = require("../js/Date.js");
let Dates;
const cacheModule = require("../js/cacheModule.js");
let cache = cacheModule.getCache();
let axisCenter;
const Watcher = require("../js/multipleProcessWatcher.js");
let events_watcher = null;

//~~~~~~~~~~
// Геттеры
//~~~~~~~~~~

function getCache() {
    return cache;
}

function isEventsTransfering() {
    return events_watcher.any_running();
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Функции-интерфейсы для фронта
// Инициируют запросы к серверу
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

function getEvents()
{
    deleteAllEvents()
    cache["events_day"] = {};
    cache["events_month"] = {};
    cache["events_year"] = {};
    Dates.deleteDates();
    Dates = new DateLines(getCurrentDate(), getEndDate(), getScale());
    Dates.createDates(axisCenter + 1);
    events_watcher.set_status(true);
    console.log(getVisibleDate);
    cache["roads"].forEach(road => {
        ipcRenderer.send(
            "get events",
            JSON.stringify({
                path_id: road.path_id,
                first_date: getCurrentDate(),
                end_date: getVisibleDate()
            })
        );
    });
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
    let color = document.getElementById('makeEventColorPeeker').value;
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

function cmdEditEvent()
{
    let name = document.getElementById('editEventName').value;
    let color = document.getElementById('editEventColorPeeker').value;
    let icon = document.getElementById('editEventIcon').value;
    let date = document.getElementById('editEventDate').value;
    let description = document.getElementById('editEventDescription').value;
    let path_id = document.getElementById('editEventPath').value;
    let event_id = document.getElementById('editEventId').value;
    console.log(name, color, icon, date, description, path_id, event_id);
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

function cmdDeleteEvent()
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
    axisCenter = -reply["roads"].length / 2 + 0.5;
    Dates = new DateLines(getCurrentDate(), getEndDate(), getScale());
    cache["roads"] = reply["roads"];
    reply["roads"].forEach(road => {
        createGroup(
            road.color,
            road.icon,
            road.path_id,
            road.name,
            axisCenter++
        );
    });
    Dates.createDates(axisCenter + 1);
    events_watcher = new Watcher(reply["roads"].length);
    setScale(2)
    getEvents();
    ipcRenderer.send("get all roads", "{}");
});
ipcRenderer.on("send events", (event, reply) =>
{
    reply = JSON.parse(reply);
    let path_index = cache["roads"].map( el => el.path_id ).indexOf(reply["path_id"]);
    cache["events_day"][reply["path_id"]] = {};
    cache["events_month"][reply["path_id"]] = {};
    cache["events_year"][reply["path_id"]] = {};
    reply["events"].forEach(event => {
        let date_tokens = event.date.split('-');
        let month = date_tokens[0] + '-' + date_tokens[1];
        let year = date_tokens[0];
        if(!cache["events_day"][reply["path_id"]][event.date])
            cache["events_day"][reply["path_id"]][event.date] = [];
        cache["events_day"][reply["path_id"]][event.date].push(event);
        if(!cache["events_month"][reply["path_id"]][month])
            cache["events_month"][reply["path_id"]][month] = [];
        cache["events_month"][reply["path_id"]][month].push(month);
        if(!cache["events_year"][reply["path_id"]][year])
            cache["events_year"][reply["path_id"]][year] = [];
        cache["events_year"][reply["path_id"]][year].push(year);

    });
    createEvents(Dates.mode, reply["path_id"])
    let index = cache["roads"].map( el => el.path_id ).indexOf(reply["path_id"]);
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
    getCache: getCache,
    isEventsTransfering: isEventsTransfering,
    getEvents: getEvents,
    makePath: makePath,
    editPath: editPath,
    deletePath: deletePath,
    makeEvent: makeEvent,
    cmdEditEvent: cmdEditEvent,
    cmdDeleteEvent: cmdDeleteEvent
}
