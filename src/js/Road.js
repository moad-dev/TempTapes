// let jsdom = require("jsdom");
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
    const line_material = new THREE.LineBasicMaterial( { color: 0x000000 } );
    let points;
    let line_geometry;
    let line;

    const geometry = new THREE.BoxGeometry();
    let material;

    const loader = new THREE.TextureLoader();
    let cube;

    let temp = new THREE.MeshBasicMaterial({color: color});
    const group = new THREE.Group();
    let k = 0, zl = 0;
    for (let i = 0; i < 2; i++)
    {
        if (i === 0)
        {
            material = [temp, temp, temp, temp, new THREE.MeshBasicMaterial({color: color, map: loader.load('../../storage/img/' + ico)}), temp];
        }
        else
        {
            material = [temp, temp, temp, temp, temp, temp];
        }
        cube = new THREE.Mesh( geometry, material );
        cube.position.z = k;
        points = [];
        points.push( new THREE.Vector3( -0.5, 0.501, zl ) );
        points.push( new THREE.Vector3( 0.5, 0.501, zl ) );
        zl--;
        k--;
        line_geometry = new THREE.BufferGeometry().setFromPoints( points );
        line = new THREE.Line( line_geometry, line_material );
        line.name = "line";
        group.add(line);
        group.add(cube);
    }
    let rot = 0.05
    let posy = 0.05
    let yl = 0.508
    for (let i = 0; i < 15; i++)
    {
        if (i < 12)
        {
            points = [];
            points.push( new THREE.Vector3( -0.5, posy + yl, zl ) );
            points.push( new THREE.Vector3( 0.5, posy + yl, zl ) );
            line_geometry = new THREE.BufferGeometry().setFromPoints( points );
            line = new THREE.Line( line_geometry, line_material );
            line.name = "line";
            group.add(line);
        }

        material = [temp, temp, temp, temp, temp, temp];
        cube = new THREE.Mesh( geometry, material );
        cube.position.z = k;
        cube.position.y = posy
        cube.rotateX(rot);
        group.add( cube );
        zl--;
        k--;
        rot += 0.1;
        posy += rot;
        yl += 0.026
    }
    group.name = "group " + id;
    group.position.setX(posX)

    let canvas1 = document.createElement('canvas');
    let context1 = canvas1.getContext('2d');
    context1.font = "Bold 10px Arial";
    context1.fillStyle = "rgb(0,0,0)";
    context1.fillText(text, 0, 10);

    // canvas contents will be used for a texture
    let texture1 = new THREE.Texture(canvas1)
    texture1.needsUpdate = true;

    let material1 = new THREE.MeshBasicMaterial({ map: texture1, side: THREE.DoubleSide });
    material1.transparent = true;

    let mesh1 = new THREE.Mesh(
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
    let selectedGroup = scene.getObjectByName("group " + id);
    let temp = new THREE.MeshBasicMaterial({color: color});
    let material = [temp, temp, temp, temp, temp, temp];
    const loader = new THREE.TextureLoader();
    let facematerial = [temp, temp, temp, temp, new THREE.MeshBasicMaterial({color: color, map: loader.load('../../storage/img/' + ico)}), temp];
    let i = 0;
    selectedGroup.traverse(function (child)
    {
        if (child.name !== "line")
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
                let canvas1 = document.createElement('canvas');
                let context1 = canvas1.getContext('2d');
                context1.font = "Bold 10px Arial";
                context1.fillStyle = "rgb(0,0,0)";
                context1.fillText(newText, 0, 10);
                let texture1 = new THREE.Texture(canvas1)
                texture1.needsUpdate = true;
                let material1 = new THREE.MeshBasicMaterial({ map: texture1, side: THREE.DoubleSide });
                material1.transparent = true;
                child.material = material1;
            }
        }
    });
}

function deleteGroup(id)
{
    scene.remove( scene.getChildByName(id) );
}

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
