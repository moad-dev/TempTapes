const cacheModule = require("../js/cacheModule.js")
let cache = cacheModule.getCache();
let availableStacks = [];
function createEvents(dateMode, road)
{
    let selectedGroup = scene.getObjectByName("Dates");
    let whichLine = null;
    let iterateBy = null;
    let findLine  = null;
    let cachename = null;

    switch (dateMode){
        case 0:
            iterateBy = cacheModule.iterateYears;
            cachename = "events_year";
            findLine = function (dd, mm, yy, i) {
                selectedGroup.traverse(function (child) {
                    if (yy == child.name)
                    {
                        whichLine = "line " + i;
                    }
                    i++;
                })
            }
            break;
        case 1:
            iterateBy = cacheModule.iterateMonths;
            cachename = "events_month";
            findLine = function (dd, mm, yy, i) {
                selectedGroup.traverse(function (child) {
                    if ((mm + '.' + yy) == child.name)
                    {
                        whichLine = "line " + i;
                    }
                    i++;
                })
            }
            break;
        case 2:
            iterateBy = cacheModule.iterateDays;
            cachename = "events_day";
            findLine = function (dd, mm, yy, i) {
                selectedGroup.traverse(function (child) {
                    if ((dd + '.' + mm + '.' + yy) == child.name)
                    {
                        whichLine = "line " + i;
                    }
                    i++;
                })
            }
            break;
    }

    iterateBy(road, function(date) {
        let events = cache[cachename][road][date];
        let date_tokens = date.split('-');
        let yy = date_tokens[0], mm = date_tokens[1], dd = date_tokens[2];
        let i = -1;

        findLine(dd, mm, yy, i);

        const loader = new THREE.TextureLoader();
        const geometry = new THREE.PlaneGeometry( 0.75, 0.75 );
        let color = cache["roads"][road].color;

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

function stackClick(plane, scale)
{
    let selectedStack = null;
    availableStacks.forEach(function (stack){
       if (stack == plane)
       {
           selectedStack = stack;
       }
    });
    let dateTokens = selectedStack.about["date"].split('-');
    let events = null;
    switch (scale)
    {
        case 0:
            events = cache["events_year"][selectedStack.about["path_id"]][dateTokens[0]];
            break
        case 1:
            events = cache["events_month"][selectedStack.about["path_id"]][dateTokens[0] + '-' + dateTokens[1]];
            break;
        case 2:
            events = cache["events_day"][selectedStack.about["path_id"]][selectedStack.about["date"]];
            break;
    }
    let axisOffset = 0;
    let step = {x: 0.85, y: 1};
    let side = Math.ceil(Math.sqrt(events.length));
    side = side + Math.ceil(1/3*(side));
    let start_point = {x: -side/2 * step.x + step.x/2, y: step.y};
    events.forEach(function (event){
        let eventObj = scene.getObjectByName("event " + event.event_id);
        if (eventObj)
        {
            scene.remove(eventObj);
        }
        else
        {
            const loader = new THREE.TextureLoader();
            const geometry = new THREE.PlaneGeometry( 0.75, 0.75 );
            const material = new THREE.MeshBasicMaterial({color: event.color, map: loader.load('../../storage/img/' + event.icon)});
            const plane = new THREE.Mesh( geometry, material );
            plane.position.set(
                selectedStack.position.x + start_point.x + (axisOffset % side) * step.x,
                selectedStack.position.y + start_point.y + Math.floor((axisOffset / side)) * step.y,
                selectedStack.position.z
            );
            plane.name = "event " + event.event_id;
            scene.add( plane );

        }
        axisOffset++;
    });
}
module.exports.createEvents = createEvents
module.exports.editEvent = editEvent
module.exports.deleteEvent = deleteEvent
module.exports.deleteAllEvents = deleteAllEvents
module.exports.stackClick = stackClick
