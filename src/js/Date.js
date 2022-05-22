
module.exports = class DateLines
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
        this.fm = firstDate.substring(firstDate.indexOf('-') + 1, firstDate.lastIndexOf('-'))
        this.fd = firstDate.substring(firstDate.lastIndexOf('-') + 1)
        this.ly = lastDate.substring(0, lastDate.indexOf('-'))
        this.lm = lastDate.substring(lastDate.indexOf('-') + 1, lastDate.lastIndexOf('-'))
        this.ld = lastDate.substring(lastDate.lastIndexOf('-') + 1)
        this.mode = mode
    }
    createDates(RoadsLength)
    {
        const group = new THREE.Group();
        let count = 0;
        let year;
        let escape;
        let j;
        let month;
        switch (this.mode)
        {
            case 0:
                for (let i = Number(this.fy); i <= Number(this.ly); i++)
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
                    mesh1.position.set(RoadsLength, tr.y - 0.75, tr.z);
                    mesh1.name = i;
                    group.add(mesh1);
                    group.name = "Dates";
                    scene.add(group)
                    count++;
                    if (count > 12)
                    {
                        break;
                    }
                }
                break;
            case 1:
                escape = true;
                j = Number(this.fm);
                year = Number(this.fy);
                while (escape)
                {
                    let canvas1 = document.createElement('canvas');
                    let context1 = canvas1.getContext('2d');
                    context1.font = "Bold 15px Arial";
                    context1.fillStyle = "rgb(0,0,0)";
                    if (j < 10)
                        month = "0" + j;
                    else
                        month = j;
                    context1.fillText(month + "." + year, 0, 12);
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
                    mesh1.position.set(RoadsLength, tr.y - 0.75, tr.z);
                    mesh1.name = month + '.' + year;
                    group.add(mesh1);
                    group.name = "Dates";
                    scene.add(group)
                    count += 1;
                    j++;
                    console.log(j + " " + count);
                    if (j > 12)
                    {
                        j = 1;
                        year++;
                    }
                    if ((year > Number(this.ly)) || (count > 12))
                        escape = false;
                }
                break;
            case 2:
                escape = true;
                year = Number(this.fy);
                j = Number(this.fm);
                let daysInMonth;
                let d = Number(this.fd);
                let day;
                while (escape)
                {
                    daysInMonth = 32 - new Date((year), j - 1, 32).getDate();
                    let canvas1 = document.createElement('canvas');
                    let context1 = canvas1.getContext('2d');
                    context1.font = "Bold 15px Arial";
                    context1.fillStyle = "rgb(0,0,0)";

                    if (j < 10)
                        month = "0" + j;
                    else
                        month = j

                    if (d < 10)
                        day = "0" + d;
                    else
                        day = d;

                    context1.fillText(day + "." + month + "." + year, 0, 12);
                    // canvas contents will be used for a texture
                    let texture1 = new THREE.Texture(canvas1)
                    texture1.needsUpdate = true;
                    let material1 = new THREE.MeshBasicMaterial({ map: texture1, side: THREE.DoubleSide });
                    material1.transparent = true;
                    let mesh1 = new THREE.Mesh(
                        new THREE.PlaneGeometry(3, 3),
                        material1
                    );
                    let tr = new THREE.Vector3();
                    scene.getObjectByName("line " + count).getWorldPosition(tr);
                    mesh1.position.set(RoadsLength, tr.y - 0.75, tr.z);
                    mesh1.name = day + '.' + month + '.' + year;
                    group.add(mesh1);
                    group.name = "Dates";
                    scene.add(group)
                    count += 1;
                    d++;
                    if (d > daysInMonth)
                    {
                        j++;
                        if (j > 12)
                        {
                            j = 1;
                            year++;
                        }
                        d = 1;
                        daysInMonth = 32 - new Date((year), j - 1, 32).getDate();
                    }
                    if ((year > Number(this.ly)) || (count > 12))
                        escape = false;
                }
                break;
        }
    }
    deleteDates()
    {
        let selectedGroup = scene.getObjectByName("Dates");
        scene.remove(selectedGroup);
    }
}
