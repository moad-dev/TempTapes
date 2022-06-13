/**
 * Модуль для работы с боковым меню
 * Изменяет отображение бокового меню
 * @module view/sideMenu
 */
const cacheModule = require("../cacheModule.js");
const {ipcRenderer} = require("electron");
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
 * @param {name} str - название тэга.
 * @returns {HTMLElement} - DOM элемент тэга.
 */
function createTagElement(name) {
    var tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = name;
    tag.style.background = pickColor(name);

    return tag;
}

/** Открывает боковое меню. */
function show() {
    const left = document.getElementById("left");
    const right = document.getElementById("right");
    left.style.display = "";
    right.classList.add("right");
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
    var sideMenu = document.getElementById("sideMenu");
    sideMenu.innerHTML = "";
    var container = document.createElement("div");
        container.classList.add("sidemenu__details");
    var iconContainer = document.createElement("div");
        iconContainer.classList.add("image");
    var icon = document.createElement("img");
        icon.src = "../../storage/img/" + event.icon;
    var name = document.createElement("div");
        name.classList.add("head");
        name.innerHTML = event.name + " — " + cacheModule.findPathById(event.path_id).name;
    var date = document.createElement("div");
        date.classList.add("date");
        date.innerHTML = event.date;
    var description = document.createElement("div");
        description.classList.add("text");
        description.innerHTML = event.description;
    var tagsContainer = document.createElement("div");
        tagsContainer.classList.add("text");
        tagsContainer.classList.add("tagsContainer");
    iconContainer.appendChild(icon);
    container.appendChild(iconContainer);
    container.appendChild(name);
    container.appendChild(date);
    container.appendChild(description);
    container.appendChild(tagsContainer);
    sideMenu.appendChild(container);

    ipcRenderer.send(
        "get event tags", JSON.stringify({"event_id": event["event_id"]})
    );
}

/* Обработчик события нажатия на ESC (закрывает меню) */
window.addEventListener('keyup', function (e) {
    var key = e.keyCode;

    if (key == 27) {
        close();
    };
}, false);

ipcRenderer.on("send event tags", (event, reply) => {
    reply = JSON.parse(reply);
    const tagsContainer = document.getElementById("left")
                                  .querySelector(".tagsContainer")
    for (var tag of reply["tags"]) {
        tagsContainer.appendChild(
            createTagElement(tag),
        );
    }
});

module.exports.showEventDetails = showEventDetails;
module.exports.show = show;
module.exports.close = close;
