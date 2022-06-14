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
const {getLastValue, setLastValue} = require("./view/horizontallScrollBar");

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
    formsProcessing.setup();

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // Контекстное меню для событий и дорог
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    const contextMenu = require("./view/contextMenu.js");

    //~~~~~~~~~~~~~~~~~~~~~~~~~~
    //      Side menu
    //~~~~~~~~~~~~~~~~~~~~~~~~~~
    const sideMenu = require("./view/sideMenu.js");

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

    setStackClickHandler(function (event, obj){
        stackClick(obj, getScale());
    });

    // ~~~~~~~~~ Для окна управления профилями

    document
        .querySelector("form[data-action='update profile']")
        .querySelector("select[name=profileSelector]")
        .addEventListener("change", () => {
            let form = document.querySelector("form[data-action='update profile']");
            let profile = form.querySelector("select[name=profileSelector]").value;
            formsProcessing.setForm({
                name: profile
            }, form);
        });

    document
        .getElementById("updateProfileBtn")
        .addEventListener("click", () => {
            let form = document.querySelector("form[data-action='update profile']");
            const profile = cacheModule.getCache()["profile"];
            formsProcessing.setForm({
                profileSelector: profile,
                name: profile,
                delete: false
            }, form);
        });

    // ~~~~~~~~~~~~~ Обработчики событий для вызова контекстного меню

    // меню дороги
    setPathClickHandler(function (event, id) {
        let selected_path = cacheModule.findPathById(id);
        if((event || window.event).which == 3) // если ПКМ
        {
            if(selected_path) {
                // Устанавливаем начальные значения выбранного элемента в модальных окнах
                formsProcessing.setForm({
                    name: selected_path.name,
                    color: selected_path.color,
                    icon: selected_path.icon,
                    path_id: selected_path.path_id
                }, document.querySelector("form[data-action='edit path']"));
                formsProcessing.setForm({
                    path_id: selected_path.path_id
                }, document.querySelector("form[data-action='delete path']"));
                // Включаем контекстное меню
                contextMenu.toggleMenuOn(document.getElementById("pathsContextMenu"), event);
            }
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
                formsProcessing.setForm({
                    name: selected_event.name,
                    color: selected_event.color,
                    date: selected_event.date,
                    description: selected_event.description,
                    transparent: selected_event.color == null,
                    icon: selected_event.icon,
                    path_id: selected_event.path_id,
                    event_id: id
                }, form);
                formsProcessing.setForm({
                    event_id: id
                },document.querySelector("form[data-action='delete event']"))

                // Включаем контекстное меню
                contextMenu.toggleMenuOn(document.getElementById("eventsContextMenu"), event);
            }
        }
        if ((event || window.event).which == 1) // если ЛКМ
        {
            let selected_event = cacheModule.findEventInCache(id);
            sideMenu.show();
            sideMenu.showEventDetails(selected_event);
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

    //~~~~~~~~~~~~~~~~~~~~~~~~~
    // Окно фильтров
    //~~~~~~~~~~~~~~~~~~~~~~~~~

    document
        .getElementById("searchByTagBtn")
        .addEventListener("click", () => {
            sideMenu.show();
            sideMenu.showSearchByTag();
        });

});
