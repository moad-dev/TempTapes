const cacheModule = require("../js/cacheModule.js")
const {get} = require("jsdom/lib/jsdom/named-properties-tracker");
let cache = cacheModule.getCache();
let availableStacks = [];

function createEvents(dateMode, road)
{
    let selectedGroup = scene.getObjectByName("Dates");
    let whichLine = null;
    let iterateBy = null;
    let cachename = null;
    switch (dateMode){
        case 0:
            iterateBy = cacheModule.iterateYears;
            cachename = "events_year";
            break;
        case 1:
            iterateBy = cacheModule.iterateMonths;
            cachename = "events_month";
            break;
        case 2:
            iterateBy = cacheModule.iterateDays;
            cachename = "events_day";
            break;
    }
    let i = -1;
    iterateBy(road, function(date) {
        let events = cache[cachename][road][date];
        let date_tokens = date.split('-');
        let yy = date_tokens[0], mm = date_tokens[1], dd = date_tokens[2];
        i = -1;
        switch (dateMode)
        {
            case 0:
                selectedGroup.traverse(function (child) {
                    if (yy == child.name)
                    {
                        whichLine = "line " + i;
                    }
                    i++;
                })
                break;
            case 1:
                selectedGroup.traverse(function (child) {
                    if ((mm + '.' + yy) == child.name)
                    {
                        whichLine = "line " + i;
                    }
                    i++;
                })
                break;
            case 2:
                selectedGroup.traverse(function (child) {
                    if ((dd + '.' + mm + '.' + yy) == child.name)
                    {
                        whichLine = "line " + i;
                    }
                    i++;
                })
                break;
        }
        const loader = new THREE.TextureLoader();
        const geometry = new THREE.PlaneGeometry( 0.75, 0.75 );
        let selectedGroup1 = scene.getObjectByName("group " + road);
        let color;
        selectedGroup1.traverse(function (child) {
            if (child.name !== "line")
            {
                if ((child instanceof THREE.Mesh) && (child.name !== "name"))
                {
                    color = child.material[0].color
                }
            }
        });
        if (events.length > 1)
        {
            const material = new THREE.MeshBasicMaterial({color: color, map: loader.load('../../storage/img/stack.png')});
            const plane = new THREE.Mesh( geometry, material );
            let tr = new THREE.Vector3();
            scene.getObjectByName(whichLine).getWorldPosition(tr);
            plane.position.set(
                scene.getObjectByName("group " + road).position.x,
                tr.y + 1,
                tr.z
            )
            plane.name = "stack";
            plane.about = {
                path_id: road,
                date: date
            };
            scene.add( plane );
            availableStacks.push(plane);
        }
        else
        {
            const material = new THREE.MeshBasicMaterial({color: events[0].color, map: loader.load('../../storage/img/' + events[0].icon)});
            const plane = new THREE.Mesh( geometry, material );
            let tr = new THREE.Vector3();
            scene.getObjectByName(whichLine).getWorldPosition(tr);
            plane.position.set(
                scene.getObjectByName("group " + road).position.x,
                tr.y + 1,
                tr.z
            )
            plane.name = "event " + events[0].event_id;
            scene.add( plane );
        }
    });
}

function editEvent(id, ico, color,  groupName, whichLine)
{
    const loader = new THREE.TextureLoader();
    let selectedPlane = scene.getObjectByName("event " + id);
    let tr = new THREE.Vector3();
    scene.getObjectByName(whichLine).getWorldPosition(tr);
    selectedPlane.material = new THREE.MeshBasicMaterial({color: color, map: loader.load('../../storage/img/' + ico)})
    selectedPlane.position.set(scene.getObjectByName(groupName).position.x, tr.y + 1, tr.z)
}

function deleteEvent(id)
{
    scene.remove( scene.getObjectByName("event " + id) );
}

function deleteAllEvents()
{
    for (let road in cache["events_day"])
    {
        for(let date in cache["events_day"][road])
        {
            let events = cache["events_day"][road][date];
            events.forEach(function (elem){
                scene.remove(scene.getObjectByName("event " + elem.event_id))
            })
        }
    }
    availableStacks.forEach(function (stack){
        scene.remove(stack)
    });
    availableStacks = []
}
module.exports.createEvents = createEvents
module.exports.editEvent = editEvent
module.exports.deleteEvent = deleteEvent
module.exports.deleteAllEvents = deleteAllEvents
