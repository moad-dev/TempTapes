function createEvent(id, ico, groupName, whichLine)
{
    const loader = new THREE.TextureLoader();
    const geometry = new THREE.PlaneGeometry( 0.75, 0.75 );
    const material = new THREE.MeshBasicMaterial({color: 0xffffff, map: loader.load('../../storage/img/' + ico)});
    const plane = new THREE.Mesh( geometry, material );
    if (whichLine > 2)
    {
        plane.position.set(scene.getObjectByName(groupName).position.x, 0.051 * whichLine * whichLine - whichLine * 0.19 + 1.2, 1-whichLine)
    }
    else
    {
        plane.position.set(scene.getObjectByName(groupName).position.x, 1, 1-whichLine)
    }
    plane.name = "event " + id;
    scene.add( plane );
}
function editEvent(id, ico, groupName, whichLine)
{
    const loader = new THREE.TextureLoader();
    let selectedPlane = scene.getObjectByName("event " + id);
    selectedPlane.material = new THREE.MeshBasicMaterial({color: 0xffffff, map: loader.load('../../storage/img/' + ico)})
    if (whichLine > 2)
    {
        selectedPlane.position.set(scene.getObjectByName(groupName).position.x, 0.051 * whichLine * whichLine - whichLine * 0.19 + 1.2, 1-whichLine)
    }
    else
    {
        selectedPlane.position.set(scene.getObjectByName(groupName).position.x, 1, 1-whichLine)
    }
}
function deleteEvent(id)
{
    scene.remove( scene.getObjectByName("event " + id) );
}

module.exports.createEvent = createEvent
module.exports.editEvent = editEvent
module.exports.deleteEvent = deleteEvent