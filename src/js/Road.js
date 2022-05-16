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
        points.push( new THREE.Vector3( -0.5, 0.51, zl ) );
        points.push( new THREE.Vector3( 0.5, 0.51, zl ) );
        zl -= 0.1;
        k--;
        line_geometry = new THREE.BufferGeometry().setFromPoints( points );
        line = new THREE.Line( line_geometry, line_material );
        line.name = "line " + i;
        cube.add(line);
        group.add(cube);

    }
    let rot = 0.08
    let posx = -1;
    let posy = 0.05;
    for (let i = 2; i < 19; i++)
    {
        material = [temp, temp, temp, temp, temp, temp];
        let cube2;
        cube2 = new THREE.Mesh( geometry, material );
        cube2.position.z = posx;
        cube2.position.y = posy
        cube2.name = "cube " + i
        cube2.rotateX(rot);
        cube.add(cube2);
        if (i < 13)
        {
            points = [];
            points.push( new THREE.Vector3( -0.5, cube2.position.y + 0.41, cube.position.z + 0.85) );
            points.push( new THREE.Vector3( 0.5, cube2.position.y + 0.41, cube.position.z + 0.85 ) );
            line_geometry = new THREE.BufferGeometry().setFromPoints( points );
            line = new THREE.Line( line_geometry, line_material );
            line.name = "line " + i;
            line.position.y = cube2.position.y;
            cube2.add(line);
        }
        cube = cube2;
        zl--;
        k--;
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
    scene.remove( scene.getObjectByName("group " + id) );
}
module.exports.createGroup = createGroup
module.exports.editGroup = editGroup
module.exports.deleteGroup = deleteGroup
