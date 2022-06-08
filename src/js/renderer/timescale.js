/**
 * Модуль для работы с временным масштабом
 * Предосталвяет пользователю доступ (чтение/запись) к текущему временному масштабу (день/месяц/год)
 * Получить текущий масштаб можно в форме числовых или строковых констант
 * @module timescale
 */

let scale;

/** 
 * Получить текущий масштаб в виде целочисленной константы.
 * @returns {number} - Текущий масштаб.
 */
function getScale() {
    return scale;
}

/** 
 * Получить текущий масштаб в виде строковой константы.
 * @returns {string} - Текущий масштаб.
 */
function getScaleString() {
    return ["year", "month", "day"][scale];
}

/** 
 * Установить текущий масштаб в виде целочисленной константы.
 * @param {number} value - Устанавливаемый масштаб.
 */
function setScale(value) {
    scale = value;
}

module.exports =  {
    getScale: getScale,
    getScaleString: getScaleString,
    setScale: setScale
};
