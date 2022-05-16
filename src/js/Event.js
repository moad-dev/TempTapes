let lineArrayDay = [];
let lineArrayMonth = [];
let lineArrayYear = [];
for (let i = 0; i < 3; i++)
{
    lineArrayDay.push([]);
    lineArrayMonth.push([]);
    lineArrayYear.push([]);
}
for (let i = 0; i < 3; i++)
{
    for (let j = 0; j < 14; j++)
    {
        lineArrayDay[i].push([]);
        lineArrayMonth[i].push([]);
        lineArrayYear[i].push([]);
    }
}
function createEvent(id, ico, color, groupName, date, dateMode)
{
    let selectedGroup = scene.getObjectByName("Dates");
    let whichLine = null;
    const loader = new THREE.TextureLoader();
    const geometry = new THREE.PlaneGeometry( 0.75, 0.75 );
    const material = new THREE.MeshBasicMaterial({color: color, map: loader.load('../../storage/img/' + ico)});
    const plane = new THREE.Mesh( geometry, material );
    let yy = date.substring(0, date.indexOf('-'));
    let mm = date.substring(date.indexOf('-') + 1, date.lastIndexOf('-'));
    let dd = date.substring(date.lastIndexOf('-') + 1);
    let i = -1;
    switch (dateMode)
    {
        case 0:
            selectedGroup.traverse(function (child) {
                if (yy == child.name)
                {
                    whichLine = "line " + i;
                    lineArrayYear[groupName.substring(groupName.indexOf(' ') + 1) - 1][i].push(id);
                }
                i++;
            })
            break;
        case 1:
            selectedGroup.traverse(function (child) {
                if ((mm + '.' + yy) == child.name)
                {
                    whichLine = "line " + i;
                    lineArrayMonth[groupName.substring(groupName.indexOf(' ') + 1) - 1][i].push(id);
                }
                i++;
            })
            break;
        case 2:
            selectedGroup.traverse(function (child) {
                if ((dd + '.' + mm + '.' + yy) == child.name)
                {
                    whichLine = "line " + i;
                    lineArrayDay[groupName.substring(groupName.indexOf(' ') + 1) - 1][i].push(id);
                }
                i++;
            })
            break;
    }
    //TODO: Сделать стэк из событий при наложении с помощью контейнера из айди для каждой линии ИТОГ: Контейнер(линия1[id, id,...],линия2[id],...)
    var tr = new THREE.Vector3();
    scene.getObjectByName(whichLine).getWorldPosition(tr);
    plane.position.set(scene.getObjectByName(groupName).position.x, tr.y + 1, tr.z )
    plane.name = "event " + id;
    scene.add( plane );
}
function mergeEvents(i)
{
    console.log(i)
    let selectedGroup = scene.getObjectByName("group " + i);
    let color;
    for (let j = 0; j < 14; j++)
    {
        if (lineArrayYear[i - 1][j].length > 1)
        {
            selectedGroup.traverse(function (child) {
                if (child.name !== "line")
                {
                    if ((child instanceof THREE.Mesh) && (child.name !== "name"))
                    {
                        color = child.material[0].color
                    }
                }
            });
            const loader = new THREE.TextureLoader();
            const geometry = new THREE.PlaneGeometry( 0.75, 0.75 );
            const material = new THREE.MeshBasicMaterial({color: color, map: loader.load('../../storage/img/stack.png')});
            const plane = new THREE.Mesh( geometry, material );
            plane.position.set(scene.getObjectByName("event " + lineArrayYear[i - 1][j][0]).position.x,
                scene.getObjectByName("event " + lineArrayYear[i - 1][j][0]).position.y,
                scene.getObjectByName("event " + lineArrayYear[i - 1][j][0]).position.z )
            plane.name = "event stack " + (i - 1) + " " + j;
            scene.add(plane)
            for (let z = 0; z < lineArrayYear[i - 1][j].length; z++)
            {
                scene.getObjectByName("event " + lineArrayYear[i - 1][j][z]).position.y += 0.77;
                scene.getObjectByName("event " + lineArrayYear[i - 1][j][z]).position.x -= z * 0.85;
            }
        }
    }
}
function editEvent(id, ico, color,  groupName, whichLine)
{
    const loader = new THREE.TextureLoader();
    let selectedPlane = scene.getObjectByName("event " + id);
    var tr = new THREE.Vector3();
    scene.getObjectByName(whichLine).getWorldPosition(tr);
    selectedPlane.material = new THREE.MeshBasicMaterial({color: color, map: loader.load('../../storage/img/' + ico)})
    selectedPlane.position.set(scene.getObjectByName(groupName).position.x, tr.y + 1, tr.z)
}
function deleteEvent(id)
{
    scene.remove( scene.getObjectByName("event " + id) );
}

module.exports.createEvent = createEvent
module.exports.editEvent = editEvent
module.exports.mergeEvents = mergeEvents
module.exports.deleteEvent = deleteEvent