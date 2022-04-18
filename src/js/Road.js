// var jsdom = require("jsdom");
// $ = require('jquery')(new jsdom.JSDOM().window);
window.addEventListener( 'resize', onWindowResize, false );
//мастшабирование дороги(через событие onWindowResize)
function onWindowResize(){

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff)

const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

function createGroup(color, ico, id, text, posX)
{
    const geometry = new THREE.BoxGeometry();
    var material;

    const loader = new THREE.TextureLoader();
    var cube;

    var temp = new THREE.MeshBasicMaterial({color: color});
    const group = new THREE.Group();
    let k = 0
    for (let i = 0; i < 2; i++)
    {
        if (i === 0)
        {
            material = [temp, temp, temp, temp, new THREE.MeshBasicMaterial({color: color, map: loader.load('../../storage/img/picture.png')}), temp];
        }
        else
        {
            material = [temp, temp, temp, temp, temp, temp];
        }
        cube = new THREE.Mesh( geometry, material );
        cube.position.z = k;
        group.add( cube );
        k -= 1;
    }
    let rot = 0.05
    let posy = 0.05
    for (let i = 0; i < 15; i++)
    {
        material = [temp, temp, temp, temp, temp, temp];
        cube = new THREE.Mesh( geometry, material );
        cube.position.z = k;
        cube.position.y = posy
        cube.rotateX(rot);
        group.add( cube );
        k -= 1;
        rot += 0.1;
        posy += rot;
    }
    group.name = "group " + id;
    group.position.setX(posX)

    var canvas1 = document.createElement('canvas');
    var context1 = canvas1.getContext('2d');
    context1.font = "Bold 10px Arial";
    context1.fillStyle = "rgb(0,0,0)";
    context1.fillText(text, 0, 10);

    // canvas contents will be used for a texture
    var texture1 = new THREE.Texture(canvas1)
    texture1.needsUpdate = true;

    var material1 = new THREE.MeshBasicMaterial({ map: texture1, side: THREE.DoubleSide });
    material1.transparent = true;

    var mesh1 = new THREE.Mesh(
        new THREE.PlaneGeometry(3, 3),
        material1
    );
    mesh1.position.set(1.15, -1.85, 0.9);
    mesh1.rotation.x = -0.2;
    mesh1.name = "name";
    group.add(mesh1);
    scene.add(group);
}

function editGroup(color, ico, id, newText)
{
    var selectedGroup = scene.getObjectByName("group " + id);
    var temp = new THREE.MeshBasicMaterial({color: color});
    var material = [temp, temp, temp, temp, temp, temp];
    const loader = new THREE.TextureLoader();
    var facematerial = [temp, temp, temp, temp, new THREE.MeshBasicMaterial({color: color, map: loader.load('../../storage/img/picture.png')}), temp];
    let i = 0;
    selectedGroup.traverse(function (child)
    {
        if ((child instanceof THREE.Mesh) && (child.name !== "name"))
        {
            if (i === 0)
            {
                child.material = facematerial;
                i++
            }
            else
            {
                child.material = material;
            }
        }
        else
        {
            var canvas1 = document.createElement('canvas');
            var context1 = canvas1.getContext('2d');
            context1.font = "Bold 10px Arial";
            context1.fillStyle = "rgb(0,0,0)";
            context1.fillText(newText, 0, 10);
            var texture1 = new THREE.Texture(canvas1)
            texture1.needsUpdate = true;
            var material1 = new THREE.MeshBasicMaterial({ map: texture1, side: THREE.DoubleSide });
            material1.transparent = true;
            child.material = material1;
        }
    });
}

function deleteGroup(id)
{
    scene.remove( scene.getChildByName(id) );
}

createGroup(0x00ff00, 0x00ff00, 0, 'lorem ipsum', -1)
createGroup(0x00ffff, 0x00ff00, 1, 'lorem ipsum', 0)
createGroup(0x00cfff, 0x00ff00, 2, 'lorem ipsum', 1)
createGroup(0x00cfff, 0x00ff00, 3, 'lorem ipsum', 2)
editGroup(0xff00ff, 0xccffff, 3, 'Вода')

camera.position.z = 4;
camera.position.y = 2;
camera.position.x = 0
camera.lookAt(camera.position.x, 1.5, 0)
function animate() {
    requestAnimationFrame( animate );
    // cube.rotation.x += 0.01;
    // cube.rotation.y += 0.01;
    renderer.render( scene, camera );
}
animate();
