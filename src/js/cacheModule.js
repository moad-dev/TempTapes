const {ipcRenderer} = require("electron");

// Происходит когда события загружены и готовы к отрисовке
var onEventsReady = null;
function setOnEventsReady (func) {
    onEventsReady = func;
}
// Происходит когда дороги загружены и готовы к отрисовке
var onRoadsReady = null;
function setOnRoadsReady (func) {
    onRoadsReady = func;
}

const Watcher = require("../js/multipleProcessWatcher.js");
let events_watcher = null;

let lastEndDate = undefined;
let lastStartDate = undefined;
let lastDateMode = undefined;

let cache =
{
    roads: [],
    events_day: {},
    events_month: {},
    events_year: {}
};

// ~~~ Проверить идёт ли передача событий из базы в данный момент (экспорт)
function isEventsTransfering() {
    return events_watcher.any_running();
}

function getEvents(startDate, endDate, dateMode) {
    if(startDate >= lastStartDate && endDate <= lastEndDate && lastDateMode == dateMode) {
        if(onEventsReady) {
            cache["roads"].forEach((road) => {
                onEventsReady(road.path_id);
            });
        }
    }
    else {

        const pullSize = 12;

        switch (dateMode) {
            case 0:
                endDate = endDate.addYears(pullSize);
                startDate = startDate.addYears(-pullSize);
            break;
            case 1:
                endDate = endDate.addMonths(pullSize);
                startDate = startDate.addMonths(-pullSize);
            break;
            case 2:
                endDate = endDate.addDays(pullSize);
                startDate = startDate.addDays(-pullSize);
            break;
        }

        lastEndDate = endDate;
        lastStartDate = startDate;
        lastDateMode = dateMode;

        cache["events_day"] = {};
        cache["events_month"] = {};
        cache["events_year"] = {};
        events_watcher.set_status(true);
        cache["roads"].forEach(road => {
            ipcRenderer.send(
                "get events",
                JSON.stringify({
                    path_id: road.path_id,
                    first_date: startDate.formatted(),
                    end_date: endDate.formatted()
                })
            );
        });
    }
}

function getRoads() {
    ipcRenderer.send(
        "get root roads", "{}"
    );
}

ipcRenderer.on("send events", (event, reply) =>
{
    reply = JSON.parse(reply);
    cache["events_day"][reply["path_id"]] = {};
    cache["events_month"][reply["path_id"]] = {};
    cache["events_year"][reply["path_id"]] = {};
    reply["events"].forEach(event => {
        event.tags = null;
        event.road_name = cache["roads"][reply["path_id"]].name;
        let date_tokens = event.date.split('-');
        let month = date_tokens[0] + '-' + date_tokens[1];
        let year = date_tokens[0];
        if(!cache["events_day"][reply["path_id"]][event.date])
            cache["events_day"][reply["path_id"]][event.date] = [];
        cache["events_day"][reply["path_id"]][event.date].push(event);
        if(!cache["events_month"][reply["path_id"]][month])
            cache["events_month"][reply["path_id"]][month] = [];
        cache["events_month"][reply["path_id"]][month].push(event);
        if(!cache["events_year"][reply["path_id"]][year])
            cache["events_year"][reply["path_id"]][year] = [];
        cache["events_year"][reply["path_id"]][year].push(event);

    });

    if(onEventsReady)
        onEventsReady(reply["path_id"]);

    let index = cache["roads"].map( el => el.path_id ).indexOf(reply["path_id"]);
    events_watcher.process_complete([index]);
});

ipcRenderer.on("send root roads", (event, reply) =>
{
    reply = JSON.parse(reply);
    cache["roads"] = reply["roads"];
    events_watcher = new Watcher(reply["roads"].length);
    if(onRoadsReady)
        onRoadsReady();
});

function findEventInCache(id) {
    for (var road in cache["events_day"]) {
        for(var date in cache["events_day"][road]) {
            let selected_event = cache["events_day"][road][date]
                .filter(obj => { return obj.event_id == id; })[0];
            if(selected_event) {
                return selected_event;
            }
        }
    }
    return null;
}
function editEventInCache(id, event) {
    for (var road in cache["events_day"]) {
        for(var date in cache["events_day"][road]) {
            const index = cache["events_day"][road][date]
                            .findIndex(element => element.event_id == id);
            if(!(index < 0)) {
                cache["events_day"][road][date][index] = event;
                return 0;
            }
        }
    }
    return -1;
}
function removeEventFromCache(id) {
    for (var road in cache["events_day"]) {
        for(var date in cache["events_day"][road]) {
            const index = cache["events_day"][road][date]
                            .findIndex(element => element.event_id == id);
            if(!(index < 0)) {
                if(cache["events_day"][road][date].length == 1)
                    delete cache["events_day"][road][date];
                else
                    cache["events_day"][road][date].splice(index, 1);
                return 0;
            }
        }
    }
    return -1;
}
function iterateDays(path_id, callback) {
    for(let date in cache["events_day"][path_id])
    {
        callback(date);
    }
}
function iterateMonths(path_id, callback) {
    for(let date in cache["events_month"][path_id])
    {
        callback(date);
    }
}
function iterateYears(path_id, callback) {
    for(let date in cache["events_year"][path_id])
    {
        callback(date);
    }
}
function getCache() {
    return cache;
}

module.exports = {
    findEventInCache: findEventInCache,
    editEventInCache: editEventInCache,
    removeEventFromCache: removeEventFromCache,
    getCache: getCache,
    iterateDays: iterateDays,
    iterateMonths: iterateMonths,
    iterateYears: iterateYears,
    setOnRoadsReady: setOnRoadsReady,
    setOnEventsReady: setOnEventsReady,
    isEventsTransfering: isEventsTransfering,
    getEvents: getEvents,
    getRoads: getRoads
}
