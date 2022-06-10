// Модуль взаимодействия с сервером и управления 3д элементами
//
//

const {ipcRenderer} = require("electron");

const {createGroup, deleteGroup, editGroup} = require("./Road.js");

//{createEvents, deleteEvent, editEvent, deleteAllEvents}
const eventModule = require("./Event.js");

const {setScale, getScale} = require('./timescale.js');
const {
    initTimeline, updateRange, updateCurrentDate, adjustDate,
    getCurrentDate, getEndDate, getStartDate, getVisibleDate
} = require("./timeline.js");

const {checkBarVisibility, getLastValue, setLastValue} = require('./view/horizontallScrollBar');
const sideMenu = require("./view/sideMenu");
const formsProcessing = require("./formsProcessing");
//~~~~~~~~~~~~~~~~~~~~~~~~~~
// Инициализация переменных
//~~~~~~~~~~~~~~~~~~~~~~~~~~

let DateLines = require("./Date.js");
let Dates;
const cacheModule = require("./cacheModule.js");
let cache = cacheModule.getCache();
let axisCenter;

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Функции-интерфейсы для фронта
// Инициируют запросы к серверу
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

function getEvents(action_id = null, action_event = null)
{
    eventModule.deleteAllEvents()
    if(action_id)
        if(action_event)
            cacheModule.editEventInCache(action_id, action_event);
        else
            cacheModule.removeEventFromCache(action_id);
    else
        if(action_event)
            cacheModule.addEventToCache(action_event);
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
    setScale(2);
    document.getElementById("select-scale").innerHTML = "Д";
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
    let path_icons_make = document.querySelector("form[data-action='make path']")
                                  .querySelector("select[name=icon]");
    let path_icons_edit = document.querySelector("form[data-action='edit path']")
                                  .querySelector("select[name=icon]");
    let events_icons_make = document.querySelector("form[data-action='make event']")
                                    .querySelector("select[name=icon]");
    let events_icons_edit = document.querySelector("form[data-action='edit event']")
                                    .querySelector("select[name=icon]");

    // Добавляем опции select тегов
    let values = [];
    reply["images"].forEach(function(image) {
        values.push({text: image, value: image})
    });
    formsProcessing.fillSelectTag(path_icons_make, values);
    formsProcessing.fillSelectTag(path_icons_edit, values);
    formsProcessing.fillSelectTag(events_icons_make, values);
    formsProcessing.fillSelectTag(events_icons_edit, values);
});
ipcRenderer.on("send all roads", (event, reply) =>
{
    reply = JSON.parse(reply);
    let events_paths_make = document.querySelector("form[data-action='make event']")
                                    .querySelector("select[name=path_id]");
    let events_paths_edit = document.querySelector("form[data-action='edit event']")
                                    .querySelector("select[name=path_id]");

    // Добавляем опции select тегов
    let values = [];
    reply["roads"].forEach(function(path) {
        values.push({text: path.name, value: path.path_id})
    });
    formsProcessing.fillSelectTag(events_paths_make, values);
    formsProcessing.fillSelectTag(events_paths_edit, values);
});
ipcRenderer.on("event added", (event, reply) =>
{
    reply = JSON.parse(reply);
    getEvents(null, reply["event"]);
});
ipcRenderer.on("event edited", (event, reply) =>
{
    reply = JSON.parse(reply);
    getEvents(reply["event"].event_id, reply["event"]);
});
ipcRenderer.on("event deleted", (event, reply) =>
{
    reply = JSON.parse(reply);
    getEvents(reply["event_id"]);
});

ipcRenderer.on("send event tags", (event, reply) => {
    reply = JSON.parse(reply);
    cacheModule.findEventInCache(reply["event_id"])["tags"] = reply["tags"];
    sideMenu.show();
    sideMenu.showEventDetails(cacheModule.findEventInCache(reply["event_id"]))
});


module.exports = {
    getEvents: getEvents,
    getRoads: getRoads
}
