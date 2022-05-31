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
const timescale = require('../js/timescale.js');
const frontendEvents = require("../js/frontendEvents.js");
const cacheModule = require("../js/cacheModule.js");
// Сеттеры для обработчиков событий кликов по элементам интерфейса three.js
const {
    setEventClickHandler,
    setPathClickHandler,
} = require("./setup");

// const addText = (selector, text) => {
//     const element = document.getElementById(selector);
//     if (element) element.innerText += text;
// };

window.addEventListener("DOMContentLoaded", () => {

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

    // Скролл событий
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
        if(!frontendEvents.isEventsTransfering())
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
            closeParentModal(this);
            frontendEvents.makePath();
        });
    document
        .getElementById("deletePathBtn")
        .addEventListener("click", () => {
            let paths = document.getElementById("deletePathId");
            paths.innerHTML = "";
            frontendEvents.getCache()["roads"].forEach(function(path) {
                let option = document.createElement("option");
                option.innerHTML = path.name;
                option.value = path.path_id;
                paths.appendChild(option);
            });
        });
    document
        .getElementById("deletePathSubmit")
        .addEventListener("click", function(e) {
            closeParentModal(this);
            frontendEvents.deletePath();
        });

    document
        .getElementById("editPathPath")
        .addEventListener("change", () => {
            let path = frontendEvents.getCache()["roads"].filter(
                obj => {
                    return obj.path_id == document.getElementById("editPathPath").value;
                })[0];
            document.getElementById("editPathName").value = path.name;
            document.getElementById("editPathColorPeeker").value = path.color;
            document.getElementById("editPathIcon").childNodes.forEach(elem => {
                if(elem.innerHTML == path.icon) {
                    elem.setAttribute('selected', 'selected');
                }
            });
        });
    document
        .getElementById("editPathBtn")
        .addEventListener("click", () => {
            let cachedRoads = frontendEvents.getCache()["roads"];
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
                    if(elem.innerHTML == path.icon) {
                        elem.setAttribute('selected', 'selected');
                    }
                });
            }
        });
    document
        .getElementById("editPathSubmit")
        .addEventListener("click", function(e) {
            closeParentModal(this);
            frontendEvents.editPath();
        });

    document
        .getElementById("makeEventSubmit")
        .addEventListener("click", function(e) {
            closeParentModal(this);
            frontendEvents.makeEvent();
        });

    document
        .getElementById("editEventSubmit")
        .addEventListener("click", function(e) {
            closeParentModal(this);
            frontendEvents.cmdEditEvent();
        });
    document
        .getElementById("deleteEventSubmit")
        .addEventListener("click", function(e) {
            closeParentModal(this);
            frontendEvents.cmdDeleteEvent();
        });

    // ~~~~~~~~~~~~~ Обработчики событий для вызова контекстного меню

    // меню дороги
    setPathClickHandler(function (event, id) {
        if((event || window.event).which == 3) // если ПКМ
        {
            console.log(id);
        }
    });
    // меню события
    setEventClickHandler(function (event, id) {
        if((event || window.event).which == 3) // если ПКМ
        {
            // Устанавливаем начальные значения выбранного элемента в модальных окнах
            let selected_event = cacheModule.findEventInCache(id);
            if(selected_event) {
                document.getElementById("editEventName").value = selected_event.name;
                document.getElementById("editEventColorPeeker").value = selected_event.color;
                document.getElementById("editEventDate").value = selected_event.date;
                document.getElementById("editEventDescription").value = selected_event.description;
                document.getElementById("editEventIcon").childNodes.forEach(elem => {
                    if(elem.innerHTML == selected_event.icon) {
                        elem.setAttribute('selected', 'selected');
                    }
                });
                path_name = frontendEvents.getCache()["roads"]
                    .filter(obj => { return obj.path_id == selected_event.path_id; })[0]
                    .name;
                document.getElementById("editEventPath").childNodes.forEach(elem => {
                    if(elem.innerHTML == path_name) {
                        elem.setAttribute('selected', 'selected');
                    }
                });
                document.getElementById("editEventId").value = id;
                document.getElementById("deleteEventId").value = id;

                // Включаем контекстное меню
                toggleMenuOn(document.getElementById("eventsContextMenu"), event);
            }
        }
    });

    // ~~~~~~~~~~~~~~~ Обработчики событий для timeline

    document
        .getElementById("timelineStart")
        .addEventListener("change", updateRange);

    document
        .getElementById("timelineCurrent")
        .addEventListener("change", updateRange);

    document
        .getElementById("timelineEnd")
        .addEventListener("change", updateRange);

    document
        .getElementById("timelineRange")
        .addEventListener("input",
        function() {
            if(!frontendEvents.isEventsTransfering()){
                updateCurrentDate();
                frontendEvents.getEvents();
            }
        });

    // Переключение масштаба

    function selectScale(symbol, scale) {
        if(!frontendEvents.isEventsTransfering()){
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

    //~~~~~~~~~~~~~~~~
    // Модальные окна
    //~~~~~~~~~~~~~~~~

    /* Записываем в переменные массив элементов-кнопок и подложку.
      Подложке зададим id, чтобы не влиять на другие элементы с классом overlay*/
    var modalButtons = document.querySelectorAll('.js-open-modal'),
       overlay      = document.querySelector('.js-overlay-modal'),
       closeButtons = document.querySelectorAll('.js-modal-close');

    /* Перебираем массив кнопок */
    modalButtons.forEach(function(item){

      /* Назначаем каждой кнопке обработчик клика */
      item.addEventListener('click', function(e) {

         /* Предотвращаем стандартное действие элемента. Так как кнопку разные
            люди могут сделать по-разному. Кто-то сделает ссылку, кто-то кнопку.
            Нужно подстраховаться. */
         e.preventDefault();

         /* При каждом клике на кнопку мы будем забирать содержимое атрибута data-modal
            и будем искать модальное окно с таким же атрибутом. */
         var modalId = this.getAttribute('data-modal'),
             modalElem = document.querySelector('.modal[data-modal="' + modalId + '"]');

         /* После того как нашли нужное модальное окно, добавим классы
            подложке и окну чтобы показать их. */
         modalElem.classList.add('active');
         overlay.classList.add('active');
      }); // end click

    }); // end foreach

    closeButtons.forEach(function(item){

      item.addEventListener('click', function(e) {
         var parentModal = this.closest('.modal');
         parentModal.classList.remove('active');
         overlay.classList.remove('active');
      });

    }); // end foreach

    document.body.addEventListener('keyup', function (e) {
        var key = e.keyCode;

        if (key == 27) {

            document.querySelector('.modal.active').classList.remove('active');
            document.querySelector('.overlay').classList.remove('active');
        };
    }, false);

    overlay.addEventListener('click', function() {
        document.querySelector('.modal.active').classList.remove('active');
        this.classList.remove('active');
    });

    function closeParentModal(child) {
        var parentModal = child.closest('.modal');
        var overlay = document.querySelector('.js-overlay-modal');
        parentModal.classList.remove('active');
        overlay.classList.remove('active');
    }

    function showModal(modalId) {
        overlay = document.querySelector('.js-overlay-modal');
        modalElem = document.querySelector('.modal[data-modal="' + modalId + '"]');
        overlay.classList.add('active');
        modalElem.classList.add('active');
    }

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // Контекстное меню для событий и дорог
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    function getPosition(e) {
        var posx = 0;
        var posy = 0;
        if (!e) var e = window.event;
        if (e.pageX || e.pageY) {
            posx = e.pageX;
            posy = e.pageY;
            } else if (e.clientX || e.clientY) {
            posx = e.clientX + document.body.scrollLeft +
                               document.documentElement.scrollLeft;
            posy = e.clientY + document.body.scrollTop +
                               document.documentElement.scrollTop;
        }
        return { x: posx, y: posy }
    }
    function positionMenu(menu, e) {
      menuPosition = getPosition(e);
      menuPositionX = menuPosition.x + "px";
      menuPositionY = menuPosition.y + "px";

      menu.style.left = menuPositionX;
      menu.style.top = menuPositionY;
    }
    function toggleMenuOn(menu, e) {
        positionMenu(menu, e);
        menu.classList.add("context-menu--active");
    }
    function toggleMenuOff() {
        let menus = document.querySelectorAll('.context-menu');
        menus.forEach(menu => {
            menu.classList.remove("context-menu--active");
        });
    }
    document.body.addEventListener('keyup', function (e) {
        var key = e.keyCode;
        if (key == 27) {
            toggleMenuOff();
        };
    }, false);
    document.addEventListener( "click", function(e) {
        var button = e.which || e.button;
        if ( button === 1 ) { toggleMenuOff(); }
    });
});
