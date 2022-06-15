/**
 * Клиентский модуль.
 * Кеш событий и дорог
 *  1.  интерфейсы для запроса событий и дорог от сервера
 *  2.  интерфейсы для редактирования кеша
 *  3.  интерфейся для поиска по кешу
 *  4.  интерфейся для итерации по кешу
 */

const {ipcRenderer} = require("electron");

// Происходит когда события загружены и готовы к отрисовке
var onEventsReady = null;
function setOnEventsReady (func) {
    onEventsReady = func;
}
// Происходит перед тем как события загружены и готовы к отрисовке
var beforeEventsReady = null;
function setBeforeEventsReady (func) {
    beforeEventsReady = func;
}
// Происходит когда дороги загружены и готовы к отрисовке
var onRoadsReady = null;
function setOnRoadsReady (func) {
    onRoadsReady = func;
}
// Происходит перед тем как дороги загружены в кеш
var beforeRoadsReady = null;
function setBeforeRoadsReady (func) {
    beforeRoadsReady = func;
}

// Должны ли мы обновить кеш принудительно
var isForce = false;
function force() {
    isForce = true;
}

// Объект для отслеживания состояния процесса передачи событий от базы кешу
const Watcher = require("./multipleProcessWatcher.js");
let events_watcher = null;

// Последние критерии для запроса событий из базы
let lastEndDate = undefined;
let lastStartDate = undefined;
let lastDateMode = undefined;

let cache =
{
    roads: [],
    events_day: {},
    events_month: {},
    events_year: {},
    profile: "",
    filter: {
        filters: [],
        mode: "any",
    },
};

// Проверить идёт ли передача событий из базы в данный момент
function isEventsTransfering() {
    return events_watcher.any_running();
}

/**
 * Функция-интерфейс
 * получить события от сервера по заданным критериям
 * учитывает состояния фильтров
*/
function getEvents(startDate = lastStartDate, endDate = lastEndDate, dateMode = lastDateMode) {

    if(startDate === undefined || endDate === undefined || dateMode === undefined || isEventsTransfering())
        return;

    if(startDate >= lastStartDate && endDate <= lastEndDate && lastDateMode == dateMode && isForce == false) {
        if(beforeEventsReady)
            beforeEventsReady();
        cache["roads"].forEach((road) => {
            if(onEventsReady)
                onEventsReady(road.path_id);
        });
    }
    else {

        isForce = false;

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

        if(beforeEventsReady)
            beforeEventsReady();

        if(cache["filter"]["filters"].length == 0) {
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
        } else {
            switch (cache["filter"]["mode"]) {
                case "any":
                    cache["roads"].forEach(road => {
                        ipcRenderer.send(
                            "get events by tags any",
                            JSON.stringify({
                                path_id: road.path_id,
                                first_date: startDate.formatted(),
                                end_date: endDate.formatted(),
                                tags: cache["filter"]["filters"]
                            })
                        );
                    });
                break;
                case "all":
                    cache["roads"].forEach(road => {
                        ipcRenderer.send(
                            "get events by tags all",
                            JSON.stringify({
                                path_id: road.path_id,
                                first_date: startDate.formatted(),
                                end_date: endDate.formatted(),
                                tags: cache["filter"]["filters"]
                            })
                        );
                    });
                break;
            }
        }
    }
}

/**
 * Функция-интерфейс
 * получить внешние дороги от сервера
*/
function getRoads() {
    ipcRenderer.send(
        "get root roads", "{}"
    );
}

/**
 * Обработчик события получения данных от сервера.
 * сервер вернул события, занесём их в кеш и уведомим визуальную часть
*/
ipcRenderer.on("send events", (event, reply) =>
{
    reply = JSON.parse(reply);
    cache["events_day"][reply["path_id"]] = {};
    cache["events_month"][reply["path_id"]] = {};
    cache["events_year"][reply["path_id"]] = {};
    reply["events"].forEach(event => {
        addEventToCache(event);
    });

    if(onEventsReady)
        onEventsReady(reply["path_id"]);

    let index = cache["roads"].map( el => el.path_id ).indexOf(reply["path_id"]);
    events_watcher.process_complete([index]);
});

/**
 * Обработчик события получения данных от сервера.
 * сервер вернул дороги, занесём их в кеш и уведомим визуальную часть
*/
ipcRenderer.on("send root roads", (event, reply) =>
{
    if(beforeRoadsReady)
        beforeRoadsReady();

    lastEndDate = undefined;
    lastStartDate = undefined;

    reply = JSON.parse(reply);
    cache["roads"] = reply["roads"];
    events_watcher = new Watcher(reply["roads"].length);

    cache["profile"] = reply["profile"];

    if(onRoadsReady)
        onRoadsReady();
});

/**
 * Внутрення функция модуля.
 * Добавляем событие в кеш.
*/
function addEventToCache(event) {
    let date_tokens = event.date.split('-');
    let month = date_tokens[0] + '-' + date_tokens[1];
    let year = date_tokens[0];
    if(!cache["events_day"][event.path_id][event.date])
        cache["events_day"][event.path_id][event.date] = [];
    cache["events_day"][event.path_id][event.date].push(event);
    if(!cache["events_month"][event.path_id][month])
        cache["events_month"][event.path_id][month] = [];
    cache["events_month"][event.path_id][month].push(event);
    if(!cache["events_year"][event.path_id][year])
        cache["events_year"][event.path_id][year] = [];
    cache["events_year"][event.path_id][year].push(event);
}
/**
 * Внутрення функция модуля.
 * Редактируем событие в кеше.
*/
function editEventInCache(id, event) {
    removeEventFromCache(id);
    addEventToCache(event);
}
/**
 * Внутрення функция модуля.
 * Удаляем событие из кеша.
*/
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
            }
        }
    }
    for (var road in cache["events_month"]) {
        for(var date in cache["events_month"][road]) {
            const index = cache["events_month"][road][date]
                .findIndex(element => element.event_id == id);
            if(!(index < 0)) {
                if(cache["events_month"][road][date].length == 1)
                    delete cache["events_month"][road][date];
                else
                    cache["events_month"][road][date].splice(index, 1);
            }
        }
    }
    for (var road in cache["events_year"]) {
        for(var date in cache["events_year"][road]) {
            const index = cache["events_year"][road][date]
                .findIndex(element => element.event_id == id);
            if(!(index < 0)) {
                if(cache["events_year"][road][date].length == 1)
                    delete cache["events_year"][road][date];
                else
                    cache["events_year"][road][date].splice(index, 1);
            }
        }
    }
    return -1;
}

/**
 * Интерфейсы для других модулей.
 * Итерируем даты в кеше.
*/
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

/**
 * Интерфейс для других модулей.
 * Получить объект кеша.
*/
function getCache() {
    return cache;
}

/**
 * Внутрення функция модуля.
 * Ищем событие в кеше.
*/
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
/**
 * Интерфейс для других модулей.
 * Получить дорогу по path_id
*/
function findPathById(id) {
    return cache["roads"].filter( path => { return path.path_id == id; } )[0];
}

module.exports = {

    addEventToCache: addEventToCache,
    editEventInCache: editEventInCache,
    removeEventFromCache: removeEventFromCache,
    findEventInCache: findEventInCache,
    findPathById: findPathById,

    setOnRoadsReady: setOnRoadsReady,
    setOnEventsReady: setOnEventsReady,
    setBeforeRoadsReady: setBeforeRoadsReady,
    setBeforeEventsReady: setBeforeEventsReady,

    getEvents: getEvents,
    getRoads: getRoads,

    iterateDays: iterateDays,
    iterateMonths: iterateMonths,
    iterateYears: iterateYears,

    force: force,

    isEventsTransfering: isEventsTransfering,

    getCache: getCache,
}
