function createEvent(id, ico, color, groupName, date, dateMode)
{
    let selectedGroup = scene.getObjectByName("Dates");
    let whichLine = null;
    const loader = new THREE.TextureLoader();
    const geometry = new THREE.PlaneGeometry( 0.75, 0.75 );
    const material = new THREE.MeshBasicMaterial({color: color, map: loader.load('../../storage/img/' + ico)});
    const plane = new THREE.Mesh( geometry, material );
    switch (dateMode)
    {
        case 0:
            let yy = date.substring(0, date.indexOf('-'))
            let i = 0;
            selectedGroup.traverse(function (child) {
                if (yy == child.name)
                {
                    whichLine = "line " + i;
                }
                i++;
            })
            break;
        case 1:
            break;
        case 2:
            break;
    }
    var tr = new THREE.Vector3();
    scene.getObjectByName(whichLine).getWorldPosition(tr);
    plane.position.set(scene.getObjectByName(groupName).position.x, tr.y + 1, tr.z )
    plane.name = "event " + id;
    scene.add( plane );
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
module.exports.deleteEvent = deleteEvent