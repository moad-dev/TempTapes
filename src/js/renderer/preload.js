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
    modalWindow.setup();

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //  Обработка форм отправки запросов
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    const formsProcessing = require("./formsProcessing.js");

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

    // document
    //     .getElementById("makePathSubmit")
    //     .addEventListener("click", function(e) {
    //         modalWindow.closeParentModal(this);
    //         frontendEvents.makePath();
    //     });
    document
        .getElementById("deletePathBtn")
        .addEventListener("click", () => {
            let paths = document.querySelector("form[data-action='delete path']")
                                .querySelector("select[name='path_id']");
            paths.innerHTML = "";
            cacheModule.getCache()["roads"].forEach(function(path) {
                let option = document.createElement("option");
                option.innerHTML = path.name;
                option.value = path.path_id;
                paths.appendChild(option);
            });
        });

    document
        .querySelector("form[data-action='edit path']")
        .querySelector("select[name=path_id]")
        .addEventListener("change", () => {
            let form = document.querySelector("form[data-action='edit path']");
            let path = cacheModule.getCache()["roads"].filter(
                obj => {
                    return obj.path_id == form.querySelector("select[name=path_id]").value;
                })[0];
            form.querySelector("input[name=name]").value = path.name;
            form.querySelector("input[name=color]").value = path.color;
            form.querySelector("input[name=icon]").childNodes.forEach(elem => {
                elem.removeAttribute("selected");
            });
            form.querySelector("input[name=icon]").childNodes.forEach(elem => {
                if(elem.innerHTML == path.icon) {
                    elem.setAttribute('selected', 'selected');
                }
            });
        });
    document
        .getElementById("editPathBtn")
        .addEventListener("click", () => {
            let cachedRoads = cacheModule.getCache()["roads"];
            let form = document.querySelector("form[data-action='edit path']");
            let paths_select = form.querySelector("select[name=path_id]");
            paths_select.innerHTML = "";
            cachedRoads.forEach(function(path) {
                let option = document.createElement("option");
                option.innerHTML = path.name;
                option.value = path.path_id;
                paths_select.appendChild(option);
            });
            if(!(cachedRoads === undefined || cachedRoads.length == 0)) {
                let path = cachedRoads[0];
                form.querySelector("input[name=name]").value = path.name;
                form.querySelector("input[name=color]").value = path.color;
                form.querySelector("input[name=icon]").childNodes.forEach(elem => {
                    elem.removeAttribute("selected");
                });
                form.querySelector("input[name=icon]").childNodes.forEach(elem => {
                    if(elem.innerHTML == path.icon) {
                        elem.setAttribute('selected', 'selected');
                    }
                });
            }
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
                let form = document.querySelector("form[data-action='edit event']");
                form.querySelector("input[name=name]").value = selected_event.name;
                form.querySelector("input[name=color]").value = selected_event.color;
                form.querySelector("input[name=date]").value = selected_event.date;
                form.querySelector("input[name=description]").value = selected_event.description;
                form.querySelector("input[name=transparent]").checked = selected_event.color == null;
                form.querySelector("select[name=icon]").childNodes.forEach(elem => {
                    elem.removeAttribute("selected");
                });
                form.querySelector("select[name=icon]").childNodes.forEach(elem => {
                    if(elem.innerHTML == selected_event.icon) {
                        elem.setAttribute('selected', 'selected');
                    }
                });
                path_name = cacheModule.getCache()["roads"]
                    .filter(obj => { return obj.path_id == selected_event.path_id; })[0]
                    .name;
                form.querySelector("select[name=path_id]").childNodes.forEach(elem => {
                    elem.removeAttribute("selected");
                });
                form.querySelector("select[name=path_id]").childNodes.forEach(elem => {
                    if(elem.innerHTML == path_name) {
                        elem.setAttribute('selected', 'selected');
                    }
                });
                form.querySelector("input[name=event_id]").value = id;
                document.querySelector("form[data-action='delete event']")
                        .querySelector("input[name=event_id]").value = id;

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
