/**
 * Модуль для работы отрисовкой событий
 *  1.  Создание, удаление, редактирование событий
 *  2.  Обработка клика на стек событий
 *  3.  Обработка выделения событий
 * @module Event
 */

const cacheModule = require("./cacheModule.js");

/**
 * Внутренняя функция модуля
 * позволяет сгрппировать массив объектов по ключу
 */
var groupBy = function(xs, key) {
  return xs.reduce(function(rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};

/**
 * Внешняя переменная модуля. Кэш событий на все деления на дорожку, а также на такое же расстояние перед и за ней.
 * @constant {number}
 */
let cache = cacheModule.getCache();


/**
 * Внутренняя переменная модуля. Видимые стеки событий.
 */
let availableStacks = [];


/**
 * Внутренняя переменная модуля. Видимые события.
 */
let availableEvents = [];

const makeMaterialWithShader = require("./view/iconShader.js");


/**
 * Внутренняя функция модуля. Используется для создания объекта plane события и,
 * если это стек записать данные событий в него.
 * @param {Date} startDate - Начальная дата на дорожке.
 * @param {Date} endDate - Конечная возможная дата для отслеживания конца итерирования цикла.
 * @param {Number} dateMode - Выбранный масштаб на дорожке.
 * @param {Number} road - Выбранная дорога для отрисвоки событий на ней.
 */
function createEvents(startDate, endDate, dateMode, events)
{
    let selectedGroup = scene.getObjectByName("Dates");
    let whichLine = null;
    let findLine  = null;
    let dateValidation = null;

    switch (dateMode){
        case 0:
            findLine = function (dd, mm, yy, i) {
                selectedGroup.traverse(function (child) {
                    if (yy == child.name)
                    {
                        whichLine = "line " + i;
                    }
                    i++;
                })
            }
            dateValidation = function (dd, mm, yy) {
                date = yy + '-01-01';
                if(date < startDate || date > endDate)
                    return false;
                return true;
            }
            events.forEach((obj, idx, array) => {
                let tokens = obj.date.split('-');
                events[idx].date = tokens[0];
            });
            break;
        case 1:
            findLine = function (dd, mm, yy, i) {
                selectedGroup.traverse(function (child) {
                    if ((mm + '.' + yy) == child.name)
                    {
                        whichLine = "line " + i;
                    }
                    i++;
                })
            }
            dateValidation = function (dd, mm, yy) {
                date = yy + "-" + mm + "-01";
                if(date < startDate || date > endDate)
                    return false;
                return true;
            }
            events.forEach((obj, idx, array) => {
                let tokens = obj.date.split('-');
                events[idx].date = tokens[0] + "-" + tokens[1];
            });
            break;
        case 2:
            findLine = function (dd, mm, yy, i) {
                selectedGroup.traverse(function (child) {
                    if ((dd + '.' + mm + '.' + yy) == child.name)
                    {
                        whichLine = "line " + i;
                    }
                    i++;
                })
            }
            dateValidation = function (dd, mm, yy) {
                date = yy + "-" + mm + "-" + dd;
                if(date < startDate || date > endDate)
                    return false;
                return true;
            }
            break;
    }


    grouped_events_path = groupBy(events, "path_id");

    for (let road in grouped_events_path) {

        grouped_events_date = groupBy(grouped_events_path[road], "date")

        for (let date in grouped_events_date) {

            let events = grouped_events_date[date];
            let date_tokens = date.split('-');
            let yy = date_tokens[0], mm = date_tokens[1], dd = date_tokens[2];
            let i = -1;

            if(!dateValidation(dd, mm, yy))
                continue;

            findLine(dd, mm, yy, i);

            const loader = new THREE.TextureLoader();
            const geometry = new THREE.PlaneGeometry( 0.75, 0.75 );
            let color = cacheModule.findPathById(road).color;

            if (events.length > 1)
            {
                const material = makeMaterialWithShader('../../storage/img/stack.png', color, loader);
                const plane = new THREE.Mesh( geometry, material );
                let tr = new THREE.Vector3();
                scene.getObjectByName(whichLine).getWorldPosition(tr);
                plane.position.set(
                    scene.getObjectByName("group " + road).position.x,
                    tr.y + 1,
                    tr.z
                )
                plane.name = "stack";
                plane.about = {
                    path_id: road,
                    date: date
            };
            scene.add( plane );
            availableStacks.push(plane);
            }
            else
            {
                let material = null;
                if (events[0].color == null)
                {
                    material = new THREE.MeshBasicMaterial({map: loader.load('../../storage/img/' + events[0].icon), opacity: 1, transparent: true});
                }
                else
                {
                    material = makeMaterialWithShader(events[0].icon, events[0].color, loader);
                    // material = new THREE.MeshBasicMaterial({color: events[0].color, map: loader.load('../../storage/img/' + events[0].icon)});
                }
                const plane = new THREE.Mesh( geometry, material );
                let tr = new THREE.Vector3();
                scene.getObjectByName(whichLine).getWorldPosition(tr);
                plane.position.set(
                    scene.getObjectByName("group " + road).position.x,
                    tr.y + 1,
                    tr.z
                )
                plane.name = "event " + events[0].event_id;
                scene.add( plane );
                availableEvents.push(plane);
            }
        }
    }
}


/**
 * Внутренняя функция модуля. Используется для редактирования объекта plane события
 * @param {Number} id - Идентификатор события.
 * @param {String} ico - Названия иконки события.
 * @param {String} color - Цвет события в 16ричной форме.
 * @param {String} groupName - Название выбранной дороги для редактирования событий на ней.
 * @param {String} whichLine - Название выбранной засечки для редактирования событий на ней.
 */
function editEvent(id, ico, color,  groupName, whichLine)
{
    const loader = new THREE.TextureLoader();
    let selectedPlane = scene.getObjectByName("event " + id);
    let tr = new THREE.Vector3();
    scene.getObjectByName(whichLine).getWorldPosition(tr);
    if (color == null)
    {
        selectedPlane.material = new THREE.MeshBasicMaterial({map: loader.load('../../storage/img/' + ico), opacity: 1, transparent: true})
    }
    else
    {
        selectedPlane.material = new THREE.MeshBasicMaterial({color: color, map: loader.load('../../storage/img/' + ico)})
    }
    selectedPlane.material = new THREE.MeshBasicMaterial({color: color, map: loader.load('../../storage/img/' + ico)})
    selectedPlane.position.set(scene.getObjectByName(groupName).position.x, tr.y + 1, tr.z)
}


/**
 * Внутренняя функция модуля. Используется для удаления объекта plane события
 * @param {Number} id - Идентификатор события.
 * @param {String} ico - Названия иконки события.
 * @param {String} color - Цвет события в 16ричной форме.
 * @param {String} groupName - Название выбранной дороги для редактирования событий на ней.
 * @param {String} whichLine - Название выбранной засечки для редактирования событий на ней.
 */
function deleteObject(object)
{
    if(object) {
        if (object.geometry) {
            object.geometry.dispose()
        }
        if (object.material) {
            if(material.uniforms) {
                material.uniforms.ico.value.dispose();
            }
            if (object.material.length) {
                for (let i = 0; i < object.material.length; ++i) {
                    object.material[i].dispose()
                }
            }
            else {
                object.material.dispose()
            }
        }
        scene.remove( object );
    }
}


/**
 * Внутренняя функция модуля. Используется для удаления объекта plane события.
 * @param {Number} id - Идентификатор события.
 */
function deleteEvent(id) {
    deleteObject(scene.getObjectByName("event " + id));
}


/**
 * Внутренняя функция модуля. Используется для удаления всех видимых событий и стеков.
 */
function deleteAllEvents()
{
    availableEvents.forEach(function (event){
        deleteObject(event);
    });
    availableEvents = [];
    availableStacks.forEach(function (stack){
        deleteObject(stack);
    });
    availableStacks = [];
}


/**
 * Внутренняя функция модуля. Используется для обработки события клик на стек.
 * @param {Object} plane - Ссылка на стек, по которому щёлкнули.
 * @param {Number} scale - Выбранный мастшаб.
 */
function stackClick(plane, scale)
{
    let selectedStack = null;
    availableStacks.forEach(function (stack){
       if (stack == plane)
       {
           selectedStack = stack;
       }
    });

    let events = cacheModule.findEventsByDate(selectedStack.about["date"], scale).filter(event => event.path_id == selectedStack.about.path_id);

    let axisOffset = 0;
    let step = {x: 0.85, y: 1};
    let side = Math.ceil(Math.sqrt(events.length));
    side = side + Math.ceil(1/3*(side));
    let start_point = {x: -side/2 * step.x + step.x/2, y: step.y};
    events.forEach(function (event){
        let eventObj = scene.getObjectByName("event " + event.event_id);
        if (eventObj)
        {
            availableEvents.splice(availableEvents.indexOf(eventObj), 1);
            deleteObject(eventObj);
        }
        else
        {
            let material = null;
            const loader = new THREE.TextureLoader();
            const geometry = new THREE.PlaneGeometry( 0.75, 0.75 );
            if (event.color == null)
            {
                material = new THREE.MeshBasicMaterial({map: loader.load('../../storage/img/' + event.icon), opacity: 1, transparent: true});
            }
            else
            {
                material = makeMaterialWithShader(event.icon, event.color, loader);
            }
            const plane = new THREE.Mesh( geometry, material );
            plane.position.set(
                selectedStack.position.x + start_point.x + (axisOffset % side) * step.x,
                selectedStack.position.y + start_point.y + Math.floor((axisOffset / side)) * step.y,
                selectedStack.position.z
            );
            plane.name = "event " + event.event_id;
            scene.add( plane );
            availableEvents.push(plane);
        }
        axisOffset++;
    });
}
module.exports.createEvents = createEvents
module.exports.editEvent = editEvent
module.exports.deleteEvent = deleteEvent
module.exports.deleteAllEvents = deleteAllEvents
module.exports.stackClick = stackClick
