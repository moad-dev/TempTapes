// Главный модуль фронтенд части, js код для работы с html элементами
//
//

const {ipcRenderer} = require("electron");
const {
    initTimeline,
    updateRange,
    updateCurrentDate,
    adjustDate,
    getCurrentDate,
    getEndDate,
    getStartDate,
    incrementCurrentDate,
    decrementCurrentDate
} = require("./timeline");
const {stackClick} = require("./Event.js")
const timescale = require('./timescale.js');
const frontendEvents = require("./frontendEvents.js");
const cacheModule = require("./cacheModule.js");
// Сеттеры для обработчиков событий кликов по элементам интерфейса three.js
const {
    setEventClickHandler,
    setPathClickHandler,
    setStackClickHandler
} = require("./setup");
const {getScale} = require("./timescale");
const sideMenu = require("./view/sideMenu");
const {getLastValue, setLastValue} = require("./view/horizontallScrollBar");

// const addText = (selector, text) => {
//     const element = document.getElementById(selector);
//     if (element) element.innerText += text;
// };

window.addEventListener("DOMContentLoaded", () => {

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //            Модальные окна
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    const modalWindow = require("./view/modalWindow.js");

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // Контекстное меню для событий и дорог
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    const contextMenu = require("./view/contextMenu.js");

    //~~~~~~~~~~~~~~~~~~~~~~~~~~
    //      Side menu
    //~~~~~~~~~~~~~~~~~~~~~~~~~~
    const sideMenu = require("./view/sideMenu");

    //~~~~~~~~~~~~~~~~~~~~~~~~~~
    // Инициализация приложения
    //~~~~~~~~~~~~~~~~~~~~~~~~~~

    timescale.setScale(2);

    initTimeline('2022-01-01', '2022-05-21');

    ipcRenderer.send(
        "get images", "{}"
    );

    ipcRenderer.send(
        "get root roads", "{}"
    );

    //~~~~~~~~~~~~~~~~~~~~~~~~~~
    // Обработчики событий html
    //~~~~~~~~~~~~~~~~~~~~~~~~~~

    // ~~~~~~~~~~~~~~~~ Скролл событий

    window.addEventListener("wheel", onScroll, false);
    let lastScrollTop = 0;
    function detectMouseWheelDirection( e )
    {
        var delta = null,
            direction = false;
        if ( !e ) { // если event не был передан, получим его из window object
            e = window.event;
        }
        if ( e.wheelDelta ) {
            delta = e.wheelDelta / 60;
        }
        if ( delta !== null ) {
            direction = delta > 0 ? 'up' : 'down';
        }
        return direction;
    }
    function onScroll(e) {
        if(!cacheModule.isEventsTransfering())
        {
            var scrollDirection = detectMouseWheelDirection( e );
            if (scrollDirection === "up"){
                incrementCurrentDate();
                if (getCurrentDate() <= getEndDate())
                {
                    frontendEvents.getEvents();
                }
            } else {
                decrementCurrentDate();
                if (getCurrentDate() >= getStartDate())
                {
                    frontendEvents.getEvents();
                }
            }
        }
    }

    // ~~~~~~~~~ Обработчики событий элементов управления событиями и дорогами

    document
        .getElementById("makePathSubmit")
        .addEventListener("click", function(e) {
            modalWindow.closeParentModal(this);
            frontendEvents.makePath();
        });
    document
        .getElementById("deletePathBtn")
        .addEventListener("click", () => {
            let paths = document.getElementById("deletePathId");
            paths.innerHTML = "";
            cacheModule.getCache()["roads"].forEach(function(path) {
                let option = document.createElement("option");
                option.innerHTML = path.name;
                option.value = path.path_id;
                paths.appendChild(option);
            });
        });
    document
        .getElementById("deletePathSubmit")
        .addEventListener("click", function(e) {
            modalWindow.closeParentModal(this);
            frontendEvents.deletePath();
        });

    document
        .getElementById("editPathPath")
        .addEventListener("change", () => {
            let path = cacheModule.getCache()["roads"].filter(
                obj => {
                    return obj.path_id == document.getElementById("editPathPath").value;
                })[0];
            document.getElementById("editPathName").value = path.name;
            document.getElementById("editPathColorPeeker").value = path.color;
            document.getElementById("editPathIcon").childNodes.forEach(elem => {
                elem.removeAttribute("selected");
            });
            document.getElementById("editPathIcon").childNodes.forEach(elem => {
                if(elem.innerHTML == path.icon) {
                    elem.setAttribute('selected', 'selected');
                }
            });
        });
    document
        .getElementById("editPathBtn")
        .addEventListener("click", () => {
            let cachedRoads = cacheModule.getCache()["roads"];
            let paths = document.getElementById("editPathPath");
            paths.innerHTML = "";
            cachedRoads.forEach(function(path) {
                let option = document.createElement("option");
                option.innerHTML = path.name;
                option.value = path.path_id;
                paths.appendChild(option);
            });
            if(!(cachedRoads === undefined || cachedRoads.length == 0)) {
                let path = cachedRoads[0];
                document.getElementById("editPathName").value = path.name;
                document.getElementById("editPathColorPeeker").value = path.color;
                document.getElementById("editPathIcon").childNodes.forEach(elem => {
                    elem.removeAttribute("selected");
                });
                document.getElementById("editPathIcon").childNodes.forEach(elem => {
                    if(elem.innerHTML == path.icon) {
                        elem.setAttribute('selected', 'selected');
                    }
                });
            }
        });
    document
        .getElementById("editPathSubmit")
        .addEventListener("click", function(e) {
            modalWindow.closeParentModal(this);
            frontendEvents.editPath();
        });

    document
        .getElementById("makeEventSubmit")
        .addEventListener("click", function(e) {
            modalWindow.closeParentModal(this);
            frontendEvents.makeEvent();
        });

    document
        .getElementById("editEventSubmit")
        .addEventListener("click", function(e) {
            modalWindow.closeParentModal(this);
            frontendEvents.editEvent();
        });
    document
        .getElementById("deleteEventSubmit")
        .addEventListener("click", function(e) {
            modalWindow.closeParentModal(this);
            frontendEvents.deleteEvent();
        });

    setStackClickHandler(function (event, obj){
        stackClick(obj, getScale());
    });

    // ~~~~~~~~~~~~~ Обработчики событий для вызова контекстного меню

    // меню дороги
    setPathClickHandler(function (event, id) {
        if((event || window.event).which == 3) // если ПКМ
        {
        }
    });

    // меню события
    setEventClickHandler(function (event, id) {
        let selected_event = cacheModule.findEventInCache(id);
        if((event || window.event).which == 3) // если ПКМ
        {
            // Устанавливаем начальные значения выбранного элемента в модальных окнах
            if(selected_event) {
                document.getElementById("editEventName").value = selected_event.name;
                document.getElementById("editEventColorPeeker").value = selected_event.color;
                document.getElementById("editEventDate").value = selected_event.date;
                document.getElementById("editEventDescription").value = selected_event.description;
                document.getElementById("editEventIcon").childNodes.forEach(elem => {
                    elem.removeAttribute("selected");
                });
                document.getElementById("editEventIcon").childNodes.forEach(elem => {
                    if(elem.innerHTML == selected_event.icon) {
                        elem.setAttribute('selected', 'selected');
                    }
                });
                path_name = cacheModule.getCache()["roads"]
                    .filter(obj => { return obj.path_id == selected_event.path_id; })[0]
                    .name;
                document.getElementById("editEventPath").childNodes.forEach(elem => {
                    elem.removeAttribute("selected");
                });
                document.getElementById("editEventPath").childNodes.forEach(elem => {
                    if(elem.innerHTML == path_name) {
                        elem.setAttribute('selected', 'selected');
                    }
                });
                document.getElementById("editEventId").value = id;
                document.getElementById("deleteEventId").value = id;

                // Включаем контекстное меню
                contextMenu.toggleMenuOn(document.getElementById("eventsContextMenu"), event);
            }
        }
        if ((event || window.event).which == 1) // если ЛКМ
        {
            let selected_event = cacheModule.findEventInCache(id);

            if (selected_event.tags == null)
                ipcRenderer.send(
                    "get event tags", JSON.stringify({"event_id": selected_event["event_id"]})
                );
            else {
                sideMenu.show();
                sideMenu.showEventDetails(selected_event);
            }
        }
    });

    // ~~~~~~~~~~~~~~~ Обработчики событий для timeline

    document
        .getElementById("timelineStart")
        .addEventListener("change", updateRange);

    document
        .getElementById("timelineCurrent")
        .addEventListener("change", () => {
            updateRange();
            frontendEvents.getEvents();
        });

    document
        .getElementById("timelineEnd")
        .addEventListener("change", updateRange);

    document
        .getElementById("timelineRange")
        .addEventListener("input",
        function() {
            if(!cacheModule.isEventsTransfering()){
                updateCurrentDate();
                frontendEvents.getEvents();
            }
        });

    // Переключение масштаба

    function selectScale(symbol, scale) {
        if(!cacheModule.isEventsTransfering()){
            document.getElementById("select-scale").innerHTML = symbol;
            timescale.setScale(scale);
            updateRange();
            adjustDate();
            frontendEvents.getEvents();
        }
    }
    document
        .getElementById("select-scale-day")
        .addEventListener("click", () => {
            selectScale("Д", 2);
        });
    document
        .getElementById("select-scale-month")
        .addEventListener("click", () => {
            selectScale("М", 1);
        });
    document
        .getElementById("select-scale-year")
        .addEventListener("click", () => {
            selectScale("Г", 0);
        });

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //         Горизонтальный скролл
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    document
        .getElementById("scrollBar")
        .addEventListener("input",
            function() {
                let lastScrollValue = getLastValue();
                let currentScrollValue = document.getElementById("scrollBar").value;
                let camera = window.camera;
                if (Number(lastScrollValue) < Number(currentScrollValue))
                {
                    camera.position.x += 1;
                    setLastValue(currentScrollValue);
                }
                else
                {
                    camera.position.x -= 1;
                    setLastValue(currentScrollValue);
                }
            });
});
