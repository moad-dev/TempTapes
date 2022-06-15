/**
 * Модуль для работы с боковым меню
 * Изменяет отображение бокового меню
 * @module view/sideMenu
 */
const cacheModule = require("../cacheModule.js");
const cache = cacheModule.getCache();
const {ipcRenderer} = require("electron");

/*
 * ID элементов, которые явдяются общими контейнерами,
 * предсталвяющими собой разные боковые меню
*/
const menuOptions = ["sidemenu__details", "sidemenu__searchByTag"];

/**
 * Внутренняя функция модуля. Вычисление хэш-суммы с помощью алгоритма djb2 (Bernstein hash).
 * Используется для раскраски тэгов в меню.
 * @param {string} str - Входная строка.
 * @returns {number} - Вычисленное хэш-значение.
 */
function hashCode(str) {
    var hash = 5381;

    for (var i = 0; i < str.length; i++)
        hash = ((hash << 5) + hash) ^ str.charCodeAt(i);

    return hash >>> 0;
}


/**
 * Внутренняя функция модуля.
 * Вычисляет цвет тэга исходя из его названия.
 * @param {string} str - Название тэга.
 * @returns {string} - Вычисленный цвет в цветовой модели HSL.
 */
function pickColor(str) {
    return `hsl(${hashCode(str) % 360}, 100%, 40%)`;
}


/**
 * Внутренняя функция модуля.
 * Создание DOM элемента для тэга
 * @param {name} str - название тэга,
 * @param {name} event_id - id события.
 * @returns {HTMLElement} - DOM элемент тэга.
 */
function createTagElement(name, event_id) {
    const tagElement = document.createElement("div");
          tagElement.className = "tagElement";
    const tag = document.createElement("span");
          tag.className = "tag";
          tag.textContent = name;
          tag.style.background = pickColor(name);
    const deleteTag = document.createElement("img");
          deleteTag.className = "tag__cross";
          deleteTag.src = '../../storage/svg/delete_cross.svg';

    tag.addEventListener("click", function(event) {
        addFilter(name);
        show();
        showSearchByTag();
    });
    deleteTag.addEventListener("click", function(event) {
        ipcRenderer.send(
            "unset event tag", JSON.stringify({event_id: event_id, tag: name})
        );
    });

    tagElement.appendChild(tag);
    tagElement.appendChild(deleteTag);

    return tagElement;
}

/** Открывает боковое меню. */
function show() {
    const left = document.getElementById("left");
    const right = document.getElementById("right");
    left.style.display = "";
    right.classList.add("right");
    menuOptions.forEach((container) => {
        document.getElementById(container).style.display = "none";
    });
}

/** Закрывает боковое меню. */
function close() {
    const left = document.getElementById("left");
    const right = document.getElementById("right");
    left.style.display = "none";
    right.classList.remove("right");
}

/**
 * Показывает информацию о событии в боковом меню.
 * @param {Object} event - Объект события для показа.
 */
function showEventDetails(event) {
    const sideMenu = document.getElementById("sidemenu__details");
    sideMenu.style.display = "";
    sideMenu.querySelector(".image")
            .querySelector("img").src = "../../storage/img/" + event.icon;
    sideMenu.querySelector(".head").innerHTML = event.name + " — " + cacheModule.findPathById(event.path_id).name;
    sideMenu.querySelector(".date").innerHTML = event.date;
    sideMenu.querySelector(".description").innerHTML = event.description;
    sideMenu.querySelector("input[name='event_id']").value = event.event_id;
    ipcRenderer.send(
        "get event tags", JSON.stringify({"event_id": event["event_id"]})
    );
}

ipcRenderer.on("send event tags", (event, reply) => {
    reply = JSON.parse(reply);
    const tagsContainer = document.getElementById("left")
                                  .querySelector(".tagsContainer");
    tagsContainer.innerHTML = "";
    for (var tag of reply["tags"]) {
        tagsContainer.appendChild(
            createTagElement(tag, reply["event_id"]),
        );
    }
});

/* Обработчик события нажатия на ESC (закрывает меню) */
window.addEventListener('keyup', function (e) {
    var key = e.keyCode;

    if (key == 27) {
        close();
    };
}, false);

/**
 * Блок работы с фильтрами
 *
 */

/**
* Показывает интерфейс фильтров в боковом меню.
* @param {Object} event - Объект события для показа.
*/
function showSearchByTag() {
    const sideMenu = document.getElementById("sidemenu__searchByTag");
    sideMenu.style.display = "";
}

/**
 * Внутренняя функция модуля.
 * Создание DOM элемента для фильтра
 * @param {name} str - название фильтра,
 * @returns {HTMLElement} - DOM элемент тэга.
*/
function createFilterElement(name) {
    const tagElement = document.createElement("div");
       tagElement.className = "tagElement";
    const tag = document.createElement("span");
       tag.className = "tag";
       tag.textContent = name;
       tag.style.background = pickColor(name);
    const deleteTag = document.createElement("img");
       deleteTag.className = "tag__cross";
       deleteTag.src = '../../storage/svg/delete_cross.svg';

    deleteTag.addEventListener("click", function(event) {
     tagElement.remove();
     // Убираем из кеша фильтр, относящийся к удалённому элементу
     cache["filter"]["filters"] = cache["filter"]["filters"].filter(item => item !== name);
     // Получаем события по обновлённым фильтрам
     cacheModule.force();
     cacheModule.getEvents();
    });

    tagElement.appendChild(tag);
    tagElement.appendChild(deleteTag);

    return tagElement;
}

/**
* Добавляет фильтр в кеш и на страницу
* @param {str} filter - имя фильтра
*/
function addFilter(filter) {
    const tagsContainer = document.getElementById("sidemenu__searchByTag")
                                  .querySelector("div[class=tagsContainer]");
    if(!cache["filter"]["filters"].includes(filter)) {
        cache["filter"]["filters"].push(filter);
        const filterElement = createFilterElement(filter);
        tagsContainer.appendChild(filterElement);

        // Получаем события по обновлённым фильтрам
        cacheModule.force();
        cacheModule.getEvents();
    }
}

// Добавляем поведение кнопке добавления фильтра
document.getElementById("sidemenu__searchByTag")
        .querySelector("input[name=addFilter]")
        .addEventListener('click', function(e) {
            const filter = document.getElementById("sidemenu__searchByTag")
                                   .querySelector("input[name=filter]").value;

            addFilter(filter);
        });

// Добавляем поведение кнопкам выбора режима
document.getElementById("sidemenu__searchByTag")
        .querySelectorAll("input[name=mode]").forEach(function(input) {
            input.addEventListener('change', function(e){
                if(input.checked) {
                    cache["filter"]["mode"] = input.value;
                    // Получаем события по обновлённым фильтрам
                    cacheModule.force();
                    cacheModule.getEvents();
                }
            });
        });


module.exports.showEventDetails = showEventDetails;
module.exports.showSearchByTag = showSearchByTag;
module.exports.show = show;
module.exports.close = close;
