/* TODO: full module rewrite */

const ONE_DAY = 1000 * 60 * 60 * 24;

function isValidRange(date_start, date_end) {
    return date_start < date_end;
}

function isInRange(date_start, current, date_end) {
    return date_start <= current && current <= date_end;
}

function daysDiff(date_start, date_end) {
    return (date_end - date_start) / ONE_DAY;
}

function initTimeline(date_start, date_end) {
    tm_start = document.getElementById('timelineStart');
    tm_current = document.getElementById('timelineCurrent');
    tm_end = document.getElementById('timelineEnd');

    tm_start.valueAsDate = date_start;
    tm_current.value = tm_start.value;
    tm_end.valueAsDate = date_end;

    tm_start.old = tm_start.value;
    tm_current.old = tm_current.value;
    tm_end.old = tm_end.value;

    updateRange();
}

function updateCurrentTime() {
    var days = Number(document.getElementById('timelineRange').value);
    var date_current = new Date(document.getElementById('timelineStart').value);
    date_current.setDate(date_current.getDate() + days);
    
    tm_current = document.getElementById('timelineCurrent');
    tm_current.valueAsDate = date_current;
    tm_current.old = tm_current.value;
}

function updateRange() {
    var date_start = new Date(document.getElementById('timelineStart').value);
    var date_current = new Date(document.getElementById('timelineCurrent').value);
    var date_end = new Date(document.getElementById('timelineEnd').value);

    if (!isValidRange(date_start, date_end) || 
        !isInRange(date_start, date_current, date_end)) {
        console.log("here");
        this.value = this.old;
        return;
    }

    var range = document.getElementById('timelineRange');
    
    range.min = 0;
    range.value = daysDiff(date_start, date_current);
    range.max = daysDiff(date_start, date_end);
    
    this.old = this.value;
}

function getStartDate() {
    return document.getElementById('timelineStart').value;
}

function getCurrentDate() {
    return document.getElementById('timelineCurrent').value;
}

function getEndDate() {
    return document.getElementById('timelineEnd').value;
}

function setCurrentDate(value) { 
    var date_current = new Date(document.getElementById('timelineStart').value);
    date_current.setDate(value);


    tm_current = document.getElementById('timelineCurrent');
    tm_current.valueAsDate = date_current;
    tm_current.old = tm_current.value;
    updateRange();
}

function incrementCurrentDate() {
    var date_current = new Date(document.getElementById('timelineStart').value);
    date_current.setDate(date_current.getDate() + 1);


    tm_current = document.getElementById('timelineCurrent');
    tm_current.valueAsDate = date_current;
    tm_current.old = tm_current.value;
    updateRange();
}

function decrementCurrentDate() {
    var date_current = new Date(document.getElementById('timelineStart').value);
    date_current.setDate(date_current.getDate() - 1);


    tm_current = document.getElementById('timelineCurrent');
    tm_current.valueAsDate = date_current;
    tm_current.old = tm_current.value;
    updateRange();
}

module.exports =  {
    initTimeline: initTimeline,
    updateRange: updateRange, 
    updateCurrentTime: updateCurrentTime,
    getStartDate: getStartDate,
    getCurrentDate: getCurrentDate,
    getEndDate: getEndDate,
    setCurrentDate: setCurrentDate,
    incrementCurrentDate: incrementCurrentDate,
    decrementCurrentDate: decrementCurrentDate
};

