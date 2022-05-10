module.exports = class Date
{
    fy = null
    fm = null
    fd = null
    ly = null
    lm = null
    ld = null
    mode = 0
    constructor(firstDate, lastDate, mode)
    {
        this.fy = firstDate.substring(0, firstDate.indexOf('-'))
        this.fm = firstDate.substring(firstDate.indexOf('-'), firstDate.lastIndexOf('-'))
        this.fd = firstDate.substring(firstDate.lastIndexOf('-'))
        this.ly = lastDate.substring(0, lastDate.indexOf('-'))
        this.lm = lastDate.substring(lastDate.indexOf('-'), lastDate.lastIndexOf('-'))
        this.ld = lastDate.substring(lastDate.lastIndexOf('-'))
        this.mode = mode
    }
    createDates()
    {
        const group = new THREE.Group();
        switch (this.mode)
        {
            case 0:
                let count = 1
                for (let i = this.fy; i <= this.ly; i++)
                {
                    let canvas1 = document.createElement('canvas');
                    let context1 = canvas1.getContext('2d');
                    context1.font = "Bold 15px Arial";
                    context1.fillStyle = "rgb(0,0,0)";
                    context1.fillText(i, 0, 12);
                    // canvas contents will be used for a texture
                    let texture1 = new THREE.Texture(canvas1)
                    texture1.needsUpdate = true;
                    let material1 = new THREE.MeshBasicMaterial({ map: texture1, side: THREE.DoubleSide });
                    material1.transparent = true;
                    let mesh1 = new THREE.Mesh(
                        new THREE.PlaneGeometry(3, 3),
                        material1
                    );
                    var tr = new THREE.Vector3();
                    scene.getObjectByName("line " + count).getWorldPosition(tr);
                    mesh1.position.set(3, tr.y - 0.75, tr.z);
                    mesh1.name = i;
                    group.add(mesh1);
                    group.name = "Dates";
                    scene.add(group)
                    count++;
                }
                break;
            case 1:
                break;
            case 2:
                break;
        }
    }
}
