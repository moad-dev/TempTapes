
/**
 * Клиентский модуль.
 * Кеш событий и дорог
 *  1.  интерфейсы для запроса событий и дорог от сервера
 *  2.  интерфейсы для редактирования кеша
 *  3.  интерфейся для поиска по кешу
 *  4.  интерфейся для итерации по кешу
 */


const {ipcRenderer} = require("electron");


/** 
 * Внутрення константа модуля. Количество секунд в одном дне
 * @constant {number} 
 */
const ONE_DAY = 1000 * 60 * 60 * 24;

/** 
 * Внутренняя функция модуля. Вычисляет количество *полных* дней между датами. 
 * @param {Date} date_start - Начальная дата.
 * @param {Date} date_end - Конечная дата.
 * @returns {number} - Количество дней.
 */
function daysDiff(date_start, date_end) {
    return (date_end - date_start) / ONE_DAY;
}

/** 
 * Внутренние переменные. Хранят последние даты
 * для получения событий
 * @variable {Date}
 * @variable {Date}
    */
let lastEndDate = undefined;
let lastStartDate = undefined;

/**
 * Внутренняя константа модуля.
 * определяет общее число страниц в кеше
 * @constant {number}
 */
PAGES_COUNT = 5;

/**
 * Интерфейс для определения обработчика события
 * после загрузки событий 
 * @param {function}
 */
var onEventsReady = null;
function setOnEventsReady (func) {
    onEventsReady = func;
}

/**
 * Интерфейс для определения обработчика события
 * после загрузки дорог
 * @param {function}
 */
var onRoadsReady = null;
function setOnRoadsReady (func) {
    onRoadsReady = func;
}

/**
 * Интерфейс для определения обработчика события
 * перед загрузкой дорог
 * @param {function}
 */
var beforeRoadsReady = null;
function setBeforeRoadsReady (func) {
    beforeRoadsReady = func;
}

/**
 * Параметр, определяющий должны ли события
 * быть загржены принудительно, т.е.
 * должен ли кэш быть обновлён
 */
var isForce = false;
function force() {
    isForce = true;
}


/**
 * Структура кэша.
 * roads {Object} - дороги
 * pages {Object} - "Страницы" - последовательность асинхронно запрашиваемых блоков событий из определённого периода времени. содержат: массив событий, начальная дата, конечная дата
 * profile {String} - текущий профиль пользователя
 * filter - фильтры (они же теги), применяемые для уточнения получаемых событий
 */
let cache =
    {
        roads: [],
        pages: [],
        profile: "",
        filter: {
            filters: [],
            mode: "any",
        },
    };


const Watcher = require("./multipleProcessWatcher.js");

// Объект для отслеживания состояния процесса передачи событий от базы кэшу
let pages_watcher = null;

/* Интерфейс, позволяющий определить идёт ли в данный момент передача событий
 * @return {Bool} - идёт ли передача
 */
function isEventsTransfering() {
    return pages_watcher.any_running();
}


/*
 * Функция, инициирующая запрос событий от сервера, запрашивает поочерёдно события со всех дорог
 * @param {Number} index - индекс страницы в кэше
 */
function getPage(index) {
    if(cache["filter"]["filters"].length == 0) {
        cache["roads"].forEach(road => {
            ipcRenderer.send(
                "get events",
                JSON.stringify({
                    path_id: road.path_id,
                    first_date: cache.pages[index].startDate.formatted(),
                    end_date: cache.pages[index].endDate.formatted(),
                    page_index: index,
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
                            first_date: cache.pages[index].startDate.formatted(),
                            end_date: cache.pages[index].endDate.formatted(),
                            page_index: index,
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
                                first_date: cache.pages[index].startDate.formatted(),
                                end_date: cache.pages[index].endDate.formatted(),
                                page_index: index,
                                tags: cache["filter"]["filters"]
                            })
                        );
                    });
                break;
        }
    }
}

function InitEvents(startDate, endDate) {

    isForce = false;

    pages_watcher = new Watcher(PAGES_COUNT);
    pages_watcher.set_status(true);
    
    let pageLen = daysDiff(startDate, endDate);

    cache.pages = [];
    cache.pages.length = PAGES_COUNT;

    let center = Math.floor(PAGES_COUNT / 2.0);

    for (let i = 0; i < PAGES_COUNT; i++) {
        let start = startDate.addDays((i-center)*pageLen);
        let end = endDate.addDays((i-center)*pageLen - 1);
        cache.pages[i] = {};
        cache.pages[i].events = [];
        cache.pages[i].startDate = start;
        cache.pages[i].endDate = end;
        cache.pages[i].watcher = new Watcher(cache.roads.length);
        cache.pages[i].watcher.set_status(true);
        getPage(i);
    }

}

/**
 * Функция-интерфейс
 * получить события от сервера по заданным критериям
 * учитывает состояния фильтров
 */
function getEvents(startDate = lastStartDate, endDate = lastEndDate) {

    if(startDate === undefined || endDate === undefined)
        return;

    lastStartDate = startDate;
    lastEndDate = endDate;

    let first_page = undefined;
    let last_page = undefined;

    if (cache.pages.length > 0) {
        for (var i = 0; i < PAGES_COUNT; i++) {
            if (startDate <= cache.pages[i].startDate) {
                first_page = i;
                break;
            }
        }
        for (var i = PAGES_COUNT-1; i >= 0; i--) {
            if (endDate >= cache.pages[i].endDate) {
                last_page = i;
                break;
            }
        }
    }

    if (first_page && last_page && !isForce) {
        if (!pages_watcher.any_running() && onEventsReady) {
            let events = [];
            for (let i = last_page; i <= first_page; i++) {
                events = events.concat(cache.pages[i].events);
            }
            onEventsReady(events);

            /* TODO TODO TODO */



            return events;

        }
    } else {
        InitEvents(startDate, endDate);

        return [];
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
 * Интерфейс для других модулей.
 * Получить объект кеша.
 */
function getCache() {
    return cache;
}

/**
 * Интерфейс для других модулей.
 * Получить дорогу по path_id
 */
function findPathById(id) {
    return cache["roads"].filter( path => { return path.path_id == id; } )[0];
}

function findEventsByDate(date, scale) {

    let dateTokens = date.split('-'); // Y-M-D
    let cmp = undefined;

    switch (scale) {
        case 0:
            cmp = function (Y, M, D, date) {
                let tokens = date.split('-'); 
                return Y == tokens[0];
            }
            break;
        case 1:
            cmp = function (Y, M, D, date) {
                let tokens = date.split('-'); 
                return Y == tokens[0] && M == tokens[1];
            }
            break;
        case 2:
            cmp = function (Y, M, D, date) {
                console.log(Y,M,D,date);
                let tokens = date.split('-'); 
                return Y == tokens[0] && M == tokens[1] && D == tokens[2];
            }
            break;
    }

    events = [];

    cache.pages.forEach(function (page) {
        page.events.forEach( function (event) {
            if ( cmp(dateTokens[0], dateTokens[1], dateTokens[2], event.date) ) {
                events.push(event);
            }
        });
    });

    return events;
}

function addEventToCache(event) {
    cache.pages.forEach(function (page) {
        if (event.date >= page.startDate.formatted() && event.date <= page.endDate.formatted()) {
            page.events.push(event);
        }
    });
}

function removeEventFromCache(id) {
    Array.prototype.removeIf = function(expression) {
       var res = [];
        for(var idx=0; idx<this.length; idx++)
        {
          var currentItem = this[idx];
            if(!expression(currentItem))
            {
                res.push(currentItem);
            }
        }
        return res;
    }

    let event = findEventInCache(id);

    cache.pages.forEach(function (page) {
        if (event.date >= page.startDate.formatted() && event.date <= page.endDate.formatted()) {
            page.events = page.events.removeIf(function (ev) {
                return ev.event_id == event.event_id; });
        }
    });
}

function editEventInCache (id, event) {
    removeEventFromCache(id);
    addEventToCache(event);
}

function findEventInCache(id) {
    let event = undefined;
    cache.pages.forEach(function (page) {
        let events = page.events.filter(function (ev, idx) {return ev.event_id == id;});
        if (events.length != 0) {
            event = events[0];
        }
    });
    return event;
}

/**
 * Обработчик события получения данных от сервера.
 * сервер вернул события, занесём их в кеш и уведомим визуальную часть
 * */
ipcRenderer.on("send events", (event, reply) =>
    {
        reply = JSON.parse(reply);

        cache.pages[reply["page_index"]]["events"] =
                cache.pages[reply["page_index"]]["events"].concat(reply["events"]);

        let index = cache["roads"].map( el => el.path_id ).indexOf(reply["path_id"]);
        cache.pages[reply["page_index"]].watcher.process_complete(index);

        if (!cache.pages[reply["page_index"]].watcher.any_running()) {
            pages_watcher.process_complete(reply["page_index"]);
        }
        if (!pages_watcher.any_running()) {
            getEvents();
        }
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
        cache["profile"] = reply["profile"];

        if(onRoadsReady)
            onRoadsReady();
    });


module.exports = {

    addEventToCache: addEventToCache,
    removeEventFromCache: removeEventFromCache,
    editEventInCache: editEventInCache,
    findEventInCache: findEventInCache,
    findEventsByDate: findEventsByDate,
    findPathById: findPathById,

    setOnRoadsReady: setOnRoadsReady,
    setBeforeRoadsReady: setBeforeRoadsReady,
    setOnEventsReady: setOnEventsReady,

    getEvents: getEvents,
    getRoads: getRoads,

    force: force,

    isEventsTransfering: isEventsTransfering,

    getCache: getCache,
}
