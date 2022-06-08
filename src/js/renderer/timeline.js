/**
 * Модуль для работы с временным диапазоном
 * Работает с четырьмя основными сущностями - начальной и конечной датами, определяющими границы диапазона
 * текущей датой и ползунком для перемещения по диапазону
 *  1.  Валидирует входные данные со стороны пользователя (граф. интерфейса или других программных модулей)
 *  2.  Определяет логику обновления состояния при изменении состояний связанных сущностей 
 *  3.  Изменяет представление сущностей в граф. интерфейсе
 *  4.  Предоставляет пользователю интерфейс для изменения состояния сущностей  
 * @module timeline
 */

const {getScaleString} = require("./timescale.js");

/** 
 * Внутрення константа модуля. Количество секунд в одном дне
 * @constant {number} 
 */
const ONE_DAY = 1000 * 60 * 60 * 24;


/** 
 * Расширение прототипа Date. Возвращает новый объект Date, смещенный по дням.
 * @param {number} days - Количество дней.
 * @returns {Date} - Смещенная дата.
 */
Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

/** 
 * Расширение прототипа Date. Возвращает новый объект Date, смещенный по месяцам. 
 * @param {number} months - Количество месяцев.
 * @returns {Date} - Смещенная дата.
 */
Date.prototype.addMonths = function(months) {
    var date = new Date(this.valueOf());
    date.setMonth(date.getMonth() + months);
    return date;
}


/** 
 * Расширение прототипа Date. Возвращает новый объект Date, смещенный по годам.
 * @param {number} months - Количество лет.
 * @returns {Date} - Смещенная дата.
 */
Date.prototype.addYears = function(years) {
    var date = new Date(this.valueOf());
    date.setFullYear(date.getFullYear() + years);
    return date;
}


/** 
 * Расширение прототипа Date. Возвращает значение Date в строке формата YYYY-MM-DD (совместимой с форматом даты в БД). 
 * @returns {string} - Дата в формате YYYY-MM-DD.
 */
Date.prototype.formatted = function() {
    var date = new Date(this.valueOf());
    return date.toISOString().slice(0, 10);
}

/** 
 * Внутренняя функция модуля. Используется для валидации границ временного диапазона.
 * @param {Date} date_start - Начальная дата.
 * @param {Date} date_end - Конечная дата.
 * @returns {boolean} - Промежуток правильный.
 */
function isValidRange(date_start, date_end) {
    return date_start < date_end;
}

/** 
 * Внутренняя функция модуля. Используется для проверки вхождения текущей даты в границы временного диапазона.
 * @param {Date} date_start - Начальная дата.
 * @param {Date} current - Текущая дата.
 * @param {Date} date_end - Конечная дата.
 * @returns {boolean} - Дата входит в промежуток.
 */
function isInRange(date_start, current, date_end) {
    return date_start <= current && current <= date_end;
}


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
 * Внутренняя функция модуля. Вычисляет количество *полных* месяцев между датами.
 * @param {Date} date_start - Начальная дата.
 * @param {Date} date_end - Конечная дата.
 * @returns {number} - Количество месяцев.
 */
function monthsDiff(date_start, date_end) {
    var months;
    months = (date_end.getFullYear() - date_start.getFullYear()) * 12;
    months -= date_start.getMonth();
    months += date_end.getMonth();
    return months <= 0 ? 0 : months;
}

/** 
 * Внутренняя функция модуля. Вычисляет количество *полных* лет между датами.
 * @param {Date} date_start - Начальная дата.
 * @param {Date} date_end - Конечная дата.
 * @returns {number} - Количество лет.
 */
function yearsDiff(date_start, date_end) {
    var years = date_end.getFullYear() - date_start.getFullYear();
    return years <= 0 ? 0 : years;
}


/** 
 * Внутренняя функция модуля. Смещает текущую дату в зависимости от масштаба. Использует модуль timescale.
 * @param {Date} date - Смещаемая дата.
 * @returns {Date} - Cмещенная дата.
 */
function addScale(date, value) {
    switch (getScaleString()) {
        case "day":
            return date.addDays(value);
        case "month":
            return date.addMonths(value);
        case "year":
            return date.addYears(value);
    }
}


/** 
 * Инициализация начальной и конечной границ временного диапазона. 
 * @param {string} date_start - Начальная дата в формате YYYY-MM-DD.
 * @param {string} date_end - Конечная дата в формате YYYY-MM-DD.
 */
function initTimeline(date_start, date_end) {
    var tm_start = document.getElementById('timelineStart');
    var tm_current = document.getElementById('timelineCurrent');
    var tm_end = document.getElementById('timelineEnd');

    tm_start.value = date_start;
    tm_current.value = tm_start.value;
    tm_end.value = date_end;

    tm_start.old = tm_start.value;
    tm_current.old = tm_current.value;
    tm_end.old = tm_end.value;

    updateRange();
}


/** Установка текущей даты в зависимости от значения ползунка. Вызывается на событие изменения ползунка */
function updateCurrentDate() {
    var value = Number(document.getElementById('timelineRange').value);
    var date = getStartDate(document.getElementById('timelineRange'));
    setCurrentDate(addScale(date, value), true);
}

/** 
 * Расширяет диапазон до минимальной единицы деления для текущего масштаба (days - один день, months - один месяц...), 
 * если диапазон меньше минимальной единицы.
 */
function adjustDate() {
    switch (getScaleString()) {
        case "month":
            var date_start = getStartDate(true);
            var date_end = getEndDate(true).addMonths(1).addDays(-1);

            date_end.setDate(1);

            setStartDate(date_start);
            setCurrentDate(date_start);
            setEndDate(date_end);
            break;

        case "year":
            var date_start = getStartDate(true);
            var date_end = getEndDate(true).addYears(1).addDays(-1);


            date_start.setMonth(0);
            date_start.setDate(1);
            date_end.setMonth(0);
            date_end.setDate(1);

            setStartDate(date_start);
            setCurrentDate(date_start);
            setEndDate(date_end);
            break;
    }
}

/**
 * Внутренняя функция модуля.
 * Синхронизация параметров ползунка под границы временного диапазона и текущую дату.
 * Устанавливает количество делений как разницу между границами диапазона в единицах текущего масштаба.
 * Устанавливает текущее значение ползунка как разницу между началом диапазона и текущей датой в единицах текущего масштаба.
 * @param {Date} date_start - Начальная дата.
 * @param {Date} date_current - Текущая дата.
 * @param {Date} date_end - Конечная дата.
 */
function syncRange(date_start, date_current, date_end) {
    var range = document.getElementById('timelineRange');

    switch (getScaleString()) {
        case "day":
            range.min = 0;
            range.value = daysDiff(date_start, date_current);
            range.max = daysDiff(date_start, date_end);
            break;
        case "month":
            range.min = 0;
            range.value = monthsDiff(date_start, date_current);
            range.max = monthsDiff(date_start, date_end);
            break;
        case "year":
            range.min = 0;
            range.value = yearsDiff(date_start, date_current);
            range.max = yearsDiff(date_start, date_end);
            break;
    }
}

/** Синхронизация временного диапазона с предварительной валидацией данных. */
function updateRange() {
    var date_start = getStartDate(true);
    var date_current = getCurrentDate(true);
    var date_end = getEndDate(true);

    if (!isValidRange(date_start, date_end) ||
        !isInRange(date_start, date_current, date_end)) {
        this.value = this.old;
        return;
    }

    syncRange(date_start, date_current, date_end);
    this.old = this.value;
}

/** 
 * Внутренняя функция модуля. Получение даты из форм ввода.
 * @param {string} input_id - id нужного DOM-элемента (input type=date).
 * @param {boolean} [asdate=false] - Вернуть как объект класса Date если true, иначе как строку формата YYYY-MM-DD.
 * @returns {(Date|string)} - Дата из указанной формы ввода.
 */
function getInputDate(input_id, asdate=false) {
    var value = document.getElementById(input_id).value;
    if (asdate)
        return new Date(value);
    return value;
}

/** Получить начало временного диапазона 
 * @param {boolean} [asdate=false] - Вернуть как объект класса Date если true, иначе как строку формата YYYY-MM-DD.
 * @returns {(Date|string)} - Начальная дата.
 */
function getStartDate(asdate=false) {
    return getInputDate('timelineStart', asdate);
}

/** 
 * Получить текущую дату 
 * @param {boolean} [asdate=false] - Вернуть как объект класса Date если true, иначе как строку формата YYYY-MM-DD.
 * @returns {(Date|string)} - Текущая дата.
 */
function getCurrentDate(asdate=false) {
    return getInputDate('timelineCurrent', asdate);
}

/** 
 * Получить конец временного диапазона 
 * @param {boolean} [asdate=false] - Вернуть как объект класса Date если true, иначе как строку формата YYYY-MM-DD.
 * @returns {(Date|string)} - Конечная дата.
 */
function getEndDate(asdate=false) {
    return getInputDate('timelineEnd', asdate);
}

/** Получить конец видимого пользователем на дороге временного промежутка
 * Используется для экономии ресурсов с помощью обработки только тех событий, которые пользователь напрямую видит, 
 * а так же для реализации кэширования
 * @param {boolean} [asdate=false] - Вернуть как объект класса Date если true, иначе как строку формата YYYY-MM-DD.
 * @returns {(Date|string)} - Конец видимого временного промежутка.
 */
function getVisibleDate(asdate=false) {
    let date = getCurrentDate(true);
    let result_date = null;
    switch (getScaleString()) {
        case "day":
            result_date = date.addDays(12);
        break;
        case "month":
            result_date = date.addMonths(12);
        break;
        case "year":
            result_date = date.addYears(12);
        break;
    }
    if(asdate)
        return result_date;
    else
        return result_date.formatted();
}


/**
 * Установить начальную дату 
 * @param {(Date|string)} - Устанавливаемое значение
 * @param {boolean} [asdate=false] - Если true, то value обрабатывается как объект класса Date, иначе как строка формата YYYY-MM-DD.
 */
function setStartDate(value, asdate=false) {
    var date_start = asdate ? value : new Date(value);
    var date_current = getCurrentDate(true);
    var date_end = getEndDate(true);

    if (!isValidRange(date_start, date_end) ||
        !isInRange(date_start, date_current, date_end)) {

        return;
    }

    var tm_start = document.getElementById('timelineStart');
    tm_start.valueAsDate = date_start;
    tm_start.old = tm_start.value;

    syncRange(date_start, date_current, date_end);
}


/**
 * Установить текущую дату 
 * @param {(Date|string)} - Устанавливаемое значение
 * @param {boolean} [asdate=false] - Если true, то value обрабатывается как объект класса Date, иначе как строка формата YYYY-MM-DD.
 */
function setCurrentDate(value, asdate=false) {
    var date_start = getStartDate(true);
    var date_current = asdate ? value : new Date(value);
    var date_end = getEndDate(true);

    date_current.setHours(11, 0, 0);

    if (!isValidRange(date_start, date_end) ||
        !isInRange(date_start, date_current, date_end)) {

        return;
    }

    var tm_current = document.getElementById('timelineCurrent');
    tm_current.valueAsDate = date_current;
    tm_current.old = tm_current.value;

    syncRange(date_start, date_current, date_end);
}

/**
 * Установить конечную дату 
 * Установить текущую дату 
 * @param {(Date|string)} - Устанавливаемое значение
 * @param {boolean} [asdate=false] - Если true, то value обрабатывается как объект класса Date, иначе как строка формата YYYY-MM-DD.
 */
function setEndDate(value, asdate=false) {
    var date_start = getStartDate(true);
    var date_current = getCurrentDate(true);
    var date_end = asdate ? value : new Date(value);


    if (!isValidRange(date_start, date_end) ||
        !isInRange(date_start, date_current, date_end)) {

        return;
    }

    var tm_end = document.getElementById('timelineEnd');
    tm_end.valueAsDate = date_end;
    tm_end.old = tm_end.value;

    syncRange(date_start, date_end, date_end);
}

/** Увеличить текущую дату на одну единицу в зависимости от масштаба. */
function incrementCurrentDate() {
    var date = getCurrentDate(true);
    setCurrentDate(addScale(date, 1), true);
}

/** Уменьшить текущую дату на одну единицу в зависимости от масштаба. */
function decrementCurrentDate() {
    var date = getCurrentDate(true);
    setCurrentDate(addScale(date, -1), true);
}

module.exports =  {
    initTimeline: initTimeline,
    updateRange: updateRange,
    updateCurrentDate: updateCurrentDate,
    adjustDate: adjustDate,
    getStartDate: getStartDate,
    getCurrentDate: getCurrentDate,
    getEndDate: getEndDate,
    setCurrentDate: setCurrentDate,
    getVisibleDate: getVisibleDate,
    incrementCurrentDate: incrementCurrentDate,
    decrementCurrentDate: decrementCurrentDate
};
