// TODO: add date scale support

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

    tm_start.value = date_start;
    tm_current.value = tm_start.value;
    tm_end.value = date_end;

    tm_start.old = tm_start.value;
    tm_current.old = tm_current.value;
    tm_end.old = tm_end.value;

    updateRange();
}

function updateCurrentTime() {
    days = Number(document.getElementById('timelineRange').value);
    date = getStartDate(true);
    date.setDate(date.getDate() + days);
    setCurrentDate(date, true);
}

function syncRange(date_start, date_current, date_end) {
    range = document.getElementById('timelineRange');
    
    range.min = 0;
    range.value = daysDiff(date_start, date_current);
    range.max = daysDiff(date_start, date_end); 
}

function updateRange() {
    date_start = getStartDate(true);
    date_current = getCurrentDate(true);
    date_end = getEndDate(true);

    if (!isValidRange(date_start, date_end) || 
        !isInRange(date_start, date_current, date_end)) {
        this.value = this.old;
        return;
    }

    syncRange(date_start, date_current, date_end);
    this.old = this.value;
}

function getInputDate(input_id, asdate=false) {
    value = document.getElementById(input_id).value;
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

function setCurrentDate(value, asdate=false) {
    date_start = getStartDate(true);
    date_current = asdate ? value : new Date(value);
    date_end = getEndDate(true);
    
    if (!isInRange(date_start, date_current, date_end)) 
        return;

    tm_current = document.getElementById('timelineCurrent');
    tm_current.valueAsDate = date_current;
    tm_current.old = tm_current.value;
    
    syncRange(date_start, date_current, date_end);
}

function incrementCurrentDate(value=1) {
    date = getCurrentDate(true);
    date.setDate(date.getDate() + value);
    setCurrentDate(date, true);
}

function decrementCurrentDate(value=-1) {
    date = getCurrentDate(true);
    date.setDate(date.getDate() + value);
    setCurrentDate(date, true);
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

