var camera;
var scene;
var renderer;

function setup() {
    window.addEventListener("resize", onWindowResize, false);
    //мастшабирование дороги(через событие onWindowResize)
    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener("mousedown", onMouseDown, false);
    //реакция события на клик
    var raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector2();
    function onMouseDown(event) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        // update the picking ray with the camera and mouse position
        raycaster.setFromCamera(mouse, camera);
        // calculate objects intersecting the picking ray
        var intersects = raycaster.intersectObjects(scene.children);
        for (var i = 0; i < intersects.length; i++) {
            if (intersects[i].object.name.substring(0, 5) === "event") {
                intersects[i].object.material.color.set(0xff0000);
            }
        }
    }

    window.addEventListener("wheel", onScroll, false);
    //скролл событий
    const {editEvent, currentLine} = require("../js/Event")
    var lastScrollTop = 0;
    function detectMouseWheelDirection( e )
    {
        var delta = null,
            direction = false;
        if ( !e ) { // if the event is not provided, we get it from the window object
            e = window.event;
        }
        if ( e.wheelDelta ) { // will work in most cases
            delta = e.wheelDelta / 60;
        }
        if ( delta !== null ) {
            direction = delta > 0 ? 'up' : 'down';
        }
        return direction;
    }
    function onScroll(e) {
        var scrollDirection = detectMouseWheelDirection( e );
        if (scrollDirection === "up"){
            // downscroll code
            console.log("up")
        } else {
            // upscroll code

            console.log("down")
        }
    }

    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xFFFFFF, 10, 16)
    scene.background = new THREE.Color(0xffffff);

    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // const {createGroup, deleteGroup, editGroup} = require("../js/Road.js");
    // const {createEvent, deleteEvent, editEvent} = require("../js/Event.js");

    // const {createGroup} = require("../js/Road.js")
    //
    // createGroup(0x00ff00, "picture.png", 0, "lorem ipsum", -1);
    // createGroup(0x00ffff, "picture.png", 1, "lorem ipsum", 0);
    // createGroup(0x00cfff, "picture.png", 2, "lorem ipsum", 1);
    // createGroup(0x00cfff, 0x00ff00, 3, "lorem ipsum", 2);
    // editGroup(0xff00ff, 0xccffff, 3, "Вода");

    // console.log(scene.getObjectByName("group 0").position.x);
    // createEvent(2, "picture.png", "group 1", 2);
    // editEvent(2, "picture.png", "group 1", 5);
    // const {createEvent} = require("../js/Event.js")
    // createEvent(1, "picture.png", "group 1", "line 2");
    // createEvent(3, "picture.png", "group 2", "line 13");

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
