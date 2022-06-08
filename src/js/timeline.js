const {getScaleString} = require("./timescale.js");
const ONE_DAY = 1000 * 60 * 60 * 24;

Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

Date.prototype.addMonths = function(months) {
    var date = new Date(this.valueOf());
    date.setMonth(date.getMonth() + months);
    return date;
}

Date.prototype.addYears = function(years) {
    var date = new Date(this.valueOf());
    date.setFullYear(date.getFullYear() + years);
    return date;
}

Date.prototype.formatted = function() {
    var date = new Date(this.valueOf());
    return date.toISOString().slice(0, 10);
}

function isValidRange(date_start, date_end) {
    return date_start < date_end;
}

function isInRange(date_start, current, date_end) {
    return date_start <= current && current <= date_end;
}

function daysDiff(date_start, date_end) {
    return (date_end - date_start) / ONE_DAY;
}

function monthsDiff(date_start, date_end) {
    var months;
    months = (date_end.getFullYear() - date_start.getFullYear()) * 12;
    months -= date_start.getMonth();
    months += date_end.getMonth();
    return months <= 0 ? 0 : months;
}

function yearsDiff(date_start, date_end) {
    var years = date_end.getFullYear() - date_start.getFullYear();
    return years <= 0 ? 0 : years;
}


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

function updateCurrentDate() {
    var value = Number(document.getElementById('timelineRange').value);
    var date = getStartDate(document.getElementById('timelineRange'));
    setCurrentDate(addScale(date, value), true);
}

/* TODO: Buggy, rewrite later */
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

function getInputDate(input_id, asdate=false) {
    var value = document.getElementById(input_id).value;
    if (asdate)
        return new Date(value);
    return value;
}

function getStartDate(asdate=false) {
    return getInputDate('timelineStart', asdate);
}

function getCurrentDate(asdate=false) {
    return getInputDate('timelineCurrent', asdate);
}

function getEndDate(asdate=false) {
    return getInputDate('timelineEnd', asdate);
}

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


/* TODO: rewrite later */
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


function incrementCurrentDate() {
    var date = getCurrentDate(true);
    setCurrentDate(addScale(date, 1), true);
}

function decrementCurrentDate(value=-1) {
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
