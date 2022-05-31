let cache = {roads: [], events: {}};

function findEventInCache(id) {
    for (var road in cache["events"]) {
        for(var date in cache["events"][road]) {
            let selected_event = cache["events"][road][date]
                .filter(obj => { return obj.event_id == id; })[0];
            if(selected_event) {
                return selected_event;
            }
        }
    }
    return null;
}

function getCache() {
    return cache;
}

module.exports = {
    findEventInCache: findEventInCache,
    getCache: getCache
}
