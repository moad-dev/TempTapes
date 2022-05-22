const {ipcRenderer} = require("electron");
const {createGroup, deleteGroup, editGroup} = require("../js/Road.js");
const {createEvent, deleteEvent, editEvent, mergeEvents, deleteAllEvents, InitEvents} = require("../js/Event.js");
const {initTimeline, updateRange, updateCurrentTime, getCurrentDate, getEndDate, getStartDate} = require("../js/timeline.js");
const {setScale, getScale} = require('../js/timescale.js');

let DateLines = require("../js/Date.js");
const {incrementCurrentDate, decrementCurrentDate} = require("./timeline");
let Dates;
let availableRoads;
let j;
setScale(2);


let is_events_request_processing;
function init_events_status(size)
{
    is_events_request_processing = [];
    for(let i = 0; i < size; i++)
        is_events_request_processing.push(false);
}
function set_events_status(value)
{
    for(let i = 0; i < is_events_request_processing.length; i++)
        is_events_request_processing[i] = value;
}
function check_events_status()
{
    for(let i = 0; i < is_events_request_processing.length; i++)
        if(is_events_request_processing[i] == true)
            return true;
    return false;
}


const addText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText += text;
};
function getEvents()
{
    set_events_status(true);
    deleteAllEvents()
    availableRoads.forEach(road => {
        ipcRenderer.send(
            "asynchronous-message",
            JSON.stringify({
                command: "get events",
                path_id: road.path_id,
                first_date: getCurrentDate(),
                end_date: getEndDate()
            })
        );
    });
}
function makePath()
{
    let name = document.getElementById('makePathName').value;
    let color = document.getElementById('makePathColorPeeker').value;
    let icon = document.getElementById('makePathIcon').value;
    if(!name || !icon) {
        console.log("error: path name, icon, color cannot be null");
    } else {
        ipcRenderer.send(
            "asynchronous-message",
            JSON.stringify({
                command: "make path",
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
            "asynchronous-message",
            JSON.stringify({
                command: "edit path",
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
            "asynchronous-message",
            JSON.stringify({
                command: "delete path",
                path_id: id
            })
        );
    }
}

function currentDateChanged()
{
    if(!check_events_status()){
        updateCurrentTime();
        Dates.deleteDates();
        Dates = new DateLines(getCurrentDate(), getEndDate(), getScale());
        Dates.createDates(j + 1);
        getEvents();
    }
}
ipcRenderer.on("asynchronous-reply", (event, reply) => {
    reply = JSON.parse(reply);
    switch (reply["command"]) {
        case "send root roads":
            if(availableRoads) {
                availableRoads.forEach((elem) => {
                    deleteGroup(elem["path_id"]);
                    deleteAllEvents();
                    Dates.deleteDates();
                });
            }
            j = -reply["roads"].length / 2 + 0.5;
            Dates = new DateLines(getCurrentDate(), getEndDate(), getScale());
            availableRoads = reply["roads"];
            reply["roads"].forEach(road => {
                createGroup(
                    road.color,
                    road.icon,
                    road.path_id,
                    road.name,
                    j++
                );
            });
            Dates.createDates(j + 1);
            InitEvents(reply["roads"].length);
            init_events_status(reply["roads"].length);
            setScale(2)
            Dates.deleteDates();
            Dates = new DateLines(getCurrentDate(), getEndDate(), getScale());
            Dates.createDates(j + 1);
            getEvents();
            break;
        case "send events":
            reply["events"].forEach(event => {
                createEvent(
                    event.event_id,
                    event.icon,
                    event.color,
                    "group " + event.path_id,
                    event.date,
                    Dates.mode
                );
            });
            let index = availableRoads.map( el => el.path_id ).indexOf(reply["path_id"]);
            mergeEvents(index+1);
            is_events_request_processing[index] = false;
            break;
        case "path added":
            ipcRenderer.send(
                "asynchronous-message",
                JSON.stringify({command: "get root roads"})
            );
            break;
        case "path deleted":
            ipcRenderer.send(
                "asynchronous-message",
                JSON.stringify({command: "get root roads"})
            );
            break;
        case "path edited":
            ipcRenderer.send(
                "asynchronous-message",
                JSON.stringify({command: "get root roads"})
            );
            break;
        case "send images":
            let icons_make = document.getElementById("makePathIcon");
            let icons_edit = document.getElementById("editPathIcon");
            icons_make.innerHTML = "";
            icons_edit.innerHTML = "";
            reply["images"].forEach(function(image) {
                let option = document.createElement("option");
                option.innerHTML = image;
                icons_make.appendChild(option);
                option = document.createElement("option");
                option.innerHTML = image;
                icons_edit.appendChild(option);
            });
            break;
    }
});

window.addEventListener("DOMContentLoaded", () => {

    ipcRenderer.send(
        "asynchronous-message",
        JSON.stringify({command: "get images"})
    );

    ipcRenderer.send(
        "asynchronous-message",
        JSON.stringify({command: "get root roads"})
    );
    window.addEventListener("wheel", onScroll, false);
    //скролл событий
    let lastScrollTop = 0;
    function detectMouseWheelDirection( e )
    {
        var delta = null,
            direction = false;
        if ( !e ) { // if the event is not provided, we get it from the window object
            e = window.event;
        }
        if ( e.wheelDelta ) { // will work in most cases
            delta = e.wheelDelta / 60;
        }
        if ( delta !== null ) {
            direction = delta > 0 ? 'up' : 'down';
        }
        return direction;
    }
    function onScroll(e) {
        var scrollDirection = detectMouseWheelDirection( e );
        if(!check_events_status())
        {
            if (scrollDirection === "up"){
                // downscroll code
                incrementCurrentDate();
                if (getCurrentDate() <= getEndDate())
                {
                    Dates.deleteDates();
                    Dates = new DateLines(getCurrentDate(), getEndDate(), getScale());
                    Dates.createDates(j + 1);
                    getEvents();
                }
            } else {
                // upscroll code
                decrementCurrentDate();
                if (getCurrentDate() >= getStartDate())
                {
                    Dates.deleteDates();
                    Dates = new DateLines(getCurrentDate(), getEndDate(), getScale());
                    Dates.createDates(j + 1);
                    getEvents();
                }
            }
        }
    }

    initTimeline('2022-05-17', '2022-05-21');

    document
        .getElementById("makePathSubmit")
        .addEventListener("click", function(e) {
            var parentModal = this.closest('.modal');
            var overlay = document.querySelector('.js-overlay-modal');
            parentModal.classList.remove('active');
            overlay.classList.remove('active');
            makePath();
        });

    document
        .getElementById("deletePathBtn")
        .addEventListener("click", () => {
            let paths = document.getElementById("deletePathId");
            paths.innerHTML = "";
            availableRoads.forEach(function(path) {
                let option = document.createElement("option");
                option.innerHTML = path.name;
                option.value = path.path_id;
                paths.appendChild(option);
            });
        });
    document
        .getElementById("deletePathSubmit")
        .addEventListener("click", function(e) {
            var parentModal = this.closest('.modal');
            var overlay = document.querySelector('.js-overlay-modal');
            parentModal.classList.remove('active');
            overlay.classList.remove('active');
            deletePath();
        });

    document
        .getElementById("editPathPath")
        .addEventListener("change", () => {
            let path = availableRoads.filter(
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
            let paths = document.getElementById("editPathPath");
            paths.innerHTML = "";
            availableRoads.forEach(function(path) {
                let option = document.createElement("option");
                option.innerHTML = path.name;
                option.value = path.path_id;
                paths.appendChild(option);
            });
            if(!(availableRoads === undefined || availableRoads.length == 0)) {
                let path = availableRoads[0];
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
            var parentModal = this.closest('.modal');
            var overlay = document.querySelector('.js-overlay-modal');
            parentModal.classList.remove('active');
            overlay.classList.remove('active');
            editPath();
        });

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
        .addEventListener("input", currentDateChanged);
    // TODO переключение масштаба

    function selectScale(symbol, scale) {
        document.getElementById("select-scale").innerHTML = symbol;
    }

    document
        .getElementById("select-scale-day")
        .addEventListener("click", () => {
            selectScale("Д", "day");
            setScale(2);
            updateRange();
            Dates.deleteDates();
            Dates = new DateLines(getCurrentDate(), getEndDate(), getScale());
            Dates.createDates(j + 1);
            getEvents();
        });
    document
        .getElementById("select-scale-month")
        .addEventListener("click", () => {
            selectScale("М", "month");
            setScale(1);
            updateRange();
            Dates.deleteDates();
            Dates = new DateLines(getCurrentDate(), getEndDate(), getScale());
            Dates.createDates(j + 1);
            getEvents();
        });
    document
        .getElementById("select-scale-year")
        .addEventListener("click", () => {
            selectScale("Г", "year");
            setScale(0);
            updateRange();
            Dates.deleteDates();
            Dates = new DateLines(getCurrentDate(), getEndDate(), getScale());
            Dates.createDates(j + 1);
            getEvents();
        });


    // Графическая часть
    //
    //
    /*~~~~~~~~~~~~~~
    Модальные окна
    ~~~~~~~~~~~~~~*/

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
});
