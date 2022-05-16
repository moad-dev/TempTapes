const ONE_DAY = 1000 * 60 * 60 * 24;

function isValidRange(date_start, date_end) {
    return date_start < date_end;
}

function daysDiff(date_start, date_end) {
    return (date_end - date_start) / ONE_DAY;
}

function initTimeline(date_start, date_end) {
    document.getElementById('timelineStart').valueAsDate = date_start;
    document.getElementById('timelineEnd').valueAsDate = date_end;
}

function updateCurrentTime(e) {
    var days = Number(document.getElementById('timelineRange').value);
    var current = new Date(document.getElementById('timelineStart').value);
    current.setDate(current.getDate() + days);
    
    document.getElementById('timelineCurrent').valueAsDate = current;
}

function updateRange(e) {
    var date_start = new Date(document.getElementById('timelineStart').value);
    var date_end = new Date(document.getElementById('timelineEnd').value);

    if (!isValidRange(date_start, date_end)) {
        this.value = this.old;
        return;
    }

    var range = document.getElementById('timelineRange');
    range.min = 0;
    range.value = 0;
    range.max = daysDiff(date_start, date_end);
    
    this.old = this.value;
}

module.exports =  {
    initTimeline: initTimeline,
    updateRange: updateRange, 
    updateCurrentTime: updateCurrentTime
};
