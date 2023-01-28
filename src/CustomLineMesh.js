import {BufferGeometry, Fog, Line, LineBasicMaterial, Vector3} from 'three'

export default {
    props: {
        x: { type: Number, default: 0 },
        y: { type: Number, default: 0 },
        z: { type: Number, default: 0 }
    },
    methods: {
        // TODO: Need to refactor
        createLine() {
           return createLine({ x: this.x, y: this.y, z: this.z }) // если передавать параметры напрямую, то они будут undefined
        }
    }
}

function createLine({ x = 0, y = 0, z = 0 }) {
    let points = [];
    points.push( new Vector3( x - 0.5, y + 0.51, z ) );
    points.push( new Vector3( x + 0.5, y + 0.51, z ) );
    const geometry = new BufferGeometry().setFromPoints(points);
    const material = new LineBasicMaterial( { color: 0x000000 } );
    return new Line(geometry, material)
}