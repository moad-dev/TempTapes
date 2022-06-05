var camera;
var scene;
var renderer;

// обработчик событий для клика по событию.
// принимает id события в базе, ничего не возвращает
function setEventClickHandler (handler) { window.eventClickHandler = handler; }
// обработчик событий для клика по дороге.
// принимает id дороги в базе, ничего не возвращает
function setPathClickHandler  (handler) { window.pathClickHandler  = handler; }
// обработчик событий для клика по стаку.
// принимает имя стака, ничего не возвращает
function setStackClickHandler  (handler) { window.stackClickHandler  = handler; }

function setup() {
    const parentElementId = "right";
    
    var parentElement = document.getElementById(parentElementId);
    var width = parentElement.offsetWidth;
    var height = parentElement.offsetHeight;

    window.addEventListener("resize", onWindowResize, false);
    //мастшабирование дороги(через событие onWindowResize)
    function onWindowResize() {
        var parentElement = document.getElementById(parentElementId);
        var width = parentElement.offsetWidth;
        var height = parentElement.offsetHeight;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        renderer.setSize(width, height);
    }

    window.addEventListener("mousedown", onMouseDown, false);
    //реакция события на клик
    var raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector2();
    function onMouseDown(event) {
        var parentElement = document.getElementById(parentElementId);
        var width = parentElement.offsetWidth;
        var height = parentElement.offsetHeight;

        mouse.x = (event.clientX / width) * 2 - 1;
        mouse.y = -(event.clientY / height) * 2 + 1;
        // update the picking ray with the camera and mouse position
        raycaster.setFromCamera(mouse, camera);
        // calculate objects intersecting the picking ray
        var intersects = raycaster.intersectObjects(scene.children);
        for (var i = 0; i < intersects.length; i++) {
            if (intersects[i].object.name.substring(0, 4) === "cube") {
                if(window.pathClickHandler){
                    window.pathClickHandler(event, intersects[i].object.name.split(' ')[1]);
                }
                break;
            }
            if (intersects[i].object.name.substring(0, 5) === "event") {
                if(window.eventClickHandler){
                    window.eventClickHandler(event, intersects[i].object.name.split(' ')[1]);
                }
                break;
            }
            if (intersects[i].object.name.substring(0, 5) === "stack") {
                if(window.stackClickHandler){
                    window.stackClickHandler(event, intersects[i].object);
                }
                // let hiddenEvents = intersects[i].object.name.split(' ');
                // for (let index = 1; index < hiddenEvents.length; index++)
                // {
                //     scene.getObjectByName("event " + hiddenEvents[index]).visible = !scene.getObjectByName("event " + hiddenEvents[index]).visible;
                // }
                break;
            }
        }
    }


    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xFFFFFF, 10, 16)
    scene.background = new THREE.Color(0xffffff);

    camera = new THREE.PerspectiveCamera(
        75,
        width / height,
        0.1,
        1000
    );
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(width, height);
    parentElement.appendChild(renderer.domElement);

    camera.position.z = 4;
    camera.position.y = 2;
    camera.position.x = 0;
    camera.lookAt(camera.position.x, 1.5, 0);
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

module.exports.animate = animate;
module.exports.setup = setup;
module.exports.setEventClickHandler = setEventClickHandler;
module.exports.setPathClickHandler = setPathClickHandler;
module.exports.setStackClickHandler = setStackClickHandler;
