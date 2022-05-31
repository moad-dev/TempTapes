let cache =
{
    roads: [],
    events_day: {},
    events_month: {},
    events_year: {}
};

function findEventInCache(id) {
    for (var road in cache["events_day"]) {
        for(var date in cache["events_day"][road]) {
            let selected_event = cache["events_day"][road][date]
                .filter(obj => { return obj.event_id == id; })[0];
            if(selected_event) {
                return selected_event;
            }
        }
    }
    return null;
}
function iterateDays(path_id, callback) {
    for(let date in cache["events_day"][path_id])
    {
        callback(date);
    }
}
function iterateMonths(path_id, callback) {
    for(let date in cache["events_month"][path_id])
    {
        callback(date);
    }
}
function iterateYears(path_id, callback) {
    for(let date in cache["events_year"][path_id])
    {
        callback(date);
    }
}
function getCache() {
    return cache;
}

module.exports = {
    findEventInCache: findEventInCache,
    getCache: getCache,
    iterateDays: iterateDays,
    iterateMonths: iterateMonths,
    iterateYears: iterateYears
}
