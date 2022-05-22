const {Color} = require("./three");
let lineArray = [];

function InitEvents(countRoads) {
    lineArray = [];
    for (let i = 0; i < countRoads; i++)
    {
        lineArray.push([]);
    }
    for (let i = 0; i < countRoads; i++)
    {
        for (let j = 0; j < 14; j++)
        {
            lineArray[i].push([]);
        }
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
                    lineArray[groupName.substring(groupName.indexOf(' ') + 1) - 1][i].push(id);
                }
                i++;
            })
            break;
        case 1:
            selectedGroup.traverse(function (child) {
                if ((mm + '.' + yy) == child.name)
                {
                    whichLine = "line " + i;
                    lineArray[groupName.substring(groupName.indexOf(' ') + 1) - 1][i].push(id);
                }
                i++;
            })
            break;
        case 2:
            selectedGroup.traverse(function (child) {
                if ((dd + '.' + mm + '.' + yy) == child.name)
                {
                    whichLine = "line " + i;
                    lineArray[groupName.substring(groupName.indexOf(' ') + 1) - 1][i].push(id);
                }
                i++;
            })
            break;
    }
    if (scene.getObjectByName(whichLine) !== undefined)
    {
        let tr = new THREE.Vector3();
        scene.getObjectByName(whichLine).getWorldPosition(tr);
        plane.position.set(scene.getObjectByName(groupName).position.x, tr.y + 1, tr.z )
        plane.name = "event " + id;
        scene.add( plane );
    }
}
function mergeEvents(i)
{
    let selectedGroup = scene.getObjectByName("group " + i);
    let color;
    console.log(lineArray);
    for (let j = 0; j < 14; j++)
    {
        if (lineArray[i - 1][j].length > 1)
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
            //прозрачность
            //const material = new THREE.MeshBasicMaterial({map: loader.load('../../storage/img/instagram.png'), opacity: 1, transparent: true});
            const plane = new THREE.Mesh( geometry, material );
            plane.position.set(scene.getObjectByName("event " + lineArray[i - 1][j][0]).position.x,
                scene.getObjectByName("event " + lineArray[i - 1][j][0]).position.y,
                scene.getObjectByName("event " + lineArray[i - 1][j][0]).position.z )
            plane.name = "stack";
            scene.add(plane)
            for (let z = 0; z < lineArray[i - 1][j].length; z++)
            {
                plane.name += " " + lineArray[i - 1][j][z];
                scene.getObjectByName("event " + lineArray[i - 1][j][z]).position.y += 0.77;
                scene.getObjectByName("event " + lineArray[i - 1][j][z]).position.x -= z * 0.85;
                scene.getObjectByName("event " + lineArray[i - 1][j][z]).visible = false;

            }
        }
    }
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
    let stack_name = "stack";
    for (let i = 0; i < lineArray.length; i++)
    {
        for (let j = 0; j < lineArray[i].length; j++)
        {
            for (let k = 0; k < lineArray[i][j].length; k++)
            {
                scene.remove( scene.getObjectByName("event " + lineArray[i][j][k]) );
                for (let l = 0; l < lineArray[i][j].length; l++)
                {
                    stack_name += " " + lineArray[i][j][l];
                }
                scene.remove( scene.getObjectByName(stack_name) );
            }
        }
    }
    for (let i = 0; i < lineArray.length; i++) {
        for (let j = 0; j < lineArray[i].length; j++) {
            lineArray[i][j].length = 0;
        }
    }

}
module.exports.createEvent = createEvent
module.exports.editEvent = editEvent
module.exports.mergeEvents = mergeEvents
module.exports.deleteEvent = deleteEvent
module.exports.deleteAllEvents = deleteAllEvents
module.exports.InitEvents = InitEvents
