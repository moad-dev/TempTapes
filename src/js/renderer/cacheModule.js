
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
 * Внутренняя переменная модуля
 * определяет длину одной страницы в днях
 */
let pageLen = undefined;

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
// отслеживает состояние загрузки страниц. Важно, что у каждой страницы есть наблюдатель состояния загрузки дорог.
// Дороги каждой страницы загружаются асинхронно. После загрузки всех дорог одной страницы устанавливается флаг загрузки этой страницы.
let pages_watcher = null;

/* Интерфейс, позволяющий определить идёт ли в данный момент передача событий
 * @returns {Bool} - идёт ли передача
 */
function isEventsTransfering() {
    return pages_watcher.any_running();
}


/*
 * Функция, инициирующая запрос событий от сервера, запрашивает поочерёдно события со всех дорог
 * @param {Number} index - индекс страницы в кэше
 */
function getPage(index) {
    // Если есть фильтры, обращаемся к специальным методам бэка, реализующим загрузку с фильтрами.
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

/* Функция инициализации кэша.
 * срабатывает при первой загрузке или когда пользователь запросил события вне диапазона кэша
 * @param {Date} startDate
 * @param {Date} endDate
 */
function InitEvents(startDate, endDate) {

    isForce = false;

    // Инициализируем наблюдатель за загрузкой страниц, считаем что все страницы загружаются.
    pages_watcher = new Watcher(PAGES_COUNT);
    pages_watcher.set_status(true);
    
    pageLen = daysDiff(startDate, endDate);

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

    console.log("cache initialized");

}


/*
 * метод, который выравнивает текущий список страниц по последним запрошенным датам
 * @param {Number} first_page - индекс левой активной страницы
 * @param {Number} last_page - индекс правой активной страницы
 */
function adjustPages(first_page, last_page) {
    /* 
     * Блок, отвечающий за динамическую подгрузку страниц во время скроллинга.
     * Если в процессе прокрутки левая и правая части списка страниц отличаются на 2 страницы или более,
     *  лишние страницы должны быть убраны, в противоположную часть списка должны быть добавлены новые страницы
     *  и должен быть отправлен запрос серверу о их заполнении.
     *
     * Так как мы не блокируем прокрутку во время подгрузки новых страниц, то в теории про очень быстром плавном
     *  скроллинге страница может не успеть загрузиться, но на практике вряд ли, особенно если страниц 5 или больше
     *
     * З.Ы. Для хранения страниц было бы уместно использовать двусвязный список, но я использовал js массив
     *  может быть потом переделаю.
     * */

    let left_pages = first_page;
    let right_pages = PAGES_COUNT-last_page-1;
    let difference = left_pages - right_pages;
    let direction = difference > 0 ? true : false;
    difference = Math.abs(difference);

    if (difference > 1) {
        difference -= 1;
        if (direction) {
            for (let i = 0; i < difference; i++) {
                cache.pages.shift();
            }
            for (let i = 0; i < difference; i++) {
                let new_page = {
                    events: [],
                    startDate: cache.pages[cache.pages.length-1].endDate.addDays(1),
                    endDate: cache.pages[cache.pages.length-1].endDate.addDays(pageLen+1),
                    watcher: new Watcher(cache.roads.length)
                };
                new_page.watcher.set_status(true);
                cache.pages.push(new_page);
            }
            for (let i = PAGES_COUNT-1; i > PAGES_COUNT-1-difference; i--) {
                // Мы не устанавливаем флаг, что страница находится в состоянии загрузки,
                // значит прокрутка не будет блокирована 
                //pages_watcher.process_incomplete(i);
                getPage(i);
            }
        } else {
            for (let i = 0; i < difference; i++) {
                cache.pages.pop();
            }
            for (let i = 0; i < difference; i++) {
                let new_page = {
                    events: [],
                    startDate: cache.pages[0].startDate.addDays(-pageLen-1),
                    endDate: cache.pages[0].startDate.addDays(-1),
                    watcher: new Watcher(cache.roads.length)
                };
                new_page.watcher.set_status(true);
                cache.pages.unshift(new_page);
            }
            for (let i = 0; i < difference; i++) {
                //    pages_watcher.process_incomplete(i);
                getPage(i);
            }
        }
    }
}


/**
 * Функция-интерфейс
 * получить события от сервера по заданным критериям
 * учитывает состояния фильтров
 * @param {Date} startDate
 * @param {Date} endDate
 */
function getEvents(startDate = lastStartDate, endDate = lastEndDate) {

    // Защита на случай запроса без начальных дат, в теории такого быть не должно
    if(startDate === undefined || endDate === undefined)
        throw new Error("Cache module - Dates were not initialized");

    lastStartDate = startDate;
    lastEndDate = endDate;

    let first_page = undefined;
    let last_page = undefined;

    // Определяем страницы, на которых распологаются нужные нам события
    // first_page - last_page -- это промежуток
    if (cache.pages.length > 0) {
        for (var i = 0; i < PAGES_COUNT; i++) {
            if (startDate < cache.pages[i].endDate) {
                first_page = i;
                break;
            }
        }
        for (var i = PAGES_COUNT-1; i >= 0; i--) {
            if (endDate > cache.pages[i].startDate) {
                last_page = i;
                break;
            }
        }
    }

    if (first_page && last_page && !isForce) {

        // Если нужные страницы были найдены в кэше, выдаём их
        
        // Если мы хотим получить события, handler должен быть задан
        if (! onEventsReady) {
            throw new Error("Cache module - onEventsReady handler was not set");
        }

        // Объединяем все страницы, которые хотя бы частично входят в наш диапазон и возвращаем клиенту
        let events = [];
        for (let i = first_page; i <= last_page; i++) {
            events = events.concat(cache.pages[i].events);
        }

        onEventsReady(events);

        adjustPages(first_page, last_page);

    } else {
        InitEvents(startDate, endDate);
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
 * @param {Number} id
 * @returns {Object} path
 */
function findPathById(id) {
    return cache["roads"].filter( path => { return path.path_id == id; } )[0];
}

/**
 * Интерфейс для других модулей.
 * Получить дорогу по дате
 * @param {String} дата как она хранится в базе
 * @param {Number} scale - масштаб дороги (0 - год, 1 - месяц, 2 - день)
 * @returns {Array} массив событий
 */
function findEventsByDate(date, scale) {

    let cmp = undefined;

    switch (scale) {
        case 0:
            cmp = "date_year";
            break;
        case 1:
            cmp = "date_month";
            break;
        case 2:
            cmp = "date_day";
            break;
    }

    events = [];
    cache.pages.forEach(page => {
        events = events.concat(page.events.filter(event => event[cmp] == date));
    });

    return events;
}

/**
 * Интерфейс для других модулей.
 * Добавить событие в кэш
 * @param {Object} event
 */
function addEventToCache(event) {
    cache.pages.forEach(function (page) {
        if (event.date >= page.startDate.formatted() && event.date <= page.endDate.formatted()) {
            page.events.push(event);
        }
    });
}

/**
 * Интерфейс для других модулей.
 * удалить дорогу из кэша
 * @param {Number} id
 */
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

/**
 * Интерфейс для других модулей.
 * отредактировать событие в кэше
 * @param {Number} id
 * @param {Object} event
 */
function editEventInCache (id, event) {
    removeEventFromCache(id);
    addEventToCache(event);
}

/**
 * Интерфейс для других модулей.
 * найти событие по id
 * @param {Number} id
 */
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
 * 1 аргумент - идентификатор запроса
 * 2 аргумент - callback
 * */
ipcRenderer.on("send events", (event, reply) =>
    {
        reply = JSON.parse(reply);

        cache.pages[reply["page_index"]]["events"] =
                cache.pages[reply["page_index"]]["events"].concat(reply["events"]);

        let index = cache["roads"].map( el => el.path_id ).indexOf(reply["path_id"]);
        cache.pages[reply["page_index"]].watcher.process_complete(index);

        if (!cache.pages[reply["page_index"]].watcher.any_running()) {
            cache.pages[reply["page_index"]]["events"].forEach(function (obj, idx, arr) {
                let event = cache.pages[reply["page_index"]]["events"][idx];
                let tokens = event.date.split('-');
                event.date_year = tokens[0];
                event.date_month = tokens[0] + "-" + tokens[1];
                event.date_day = event.date;
            });
            pages_watcher.process_complete(reply["page_index"]);
        }
        if (!pages_watcher.any_running()) {
            getEvents();
        }
    });

/**
 * Обработчик события получения данных от сервера.
 * сервер вернул дороги, занесём их в кеш и уведомим визуальную часть
 * 1 аргумент - идентификатор запроса
 * 2 аргумент - callback
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
