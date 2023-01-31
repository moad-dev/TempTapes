
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//   Шейдеры для наложения иконок на цвет
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

import * as THREE from 'three'

function vertexShader() {
    return `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * modelViewPosition;
        }
    `;
}
function fragmentShader() {
    return `
        #ifdef GL_ES
        precision highp float;
        #endif

        uniform vec3 color;
        uniform sampler2D ico;

        varying vec2 vUv;

        void main(void)
        {
            vec3 c;
            vec4 Cb = vec4(color, 1);
            vec4 Ca = texture2D(ico, vUv);
            c = Ca.rgb * Ca.a + Cb.rgb * Cb.a * (1.0 - Ca.a);
            gl_FragColor = vec4(c, 1);
        }
    `
}

function makeMaterialWithShader(src, color, loader) {
    const texture = loader.load( '../../storage/img/' + src)
    const uniforms = {
        color: {type: 'vec3', value: new THREE.Color(color)},
        ico:   {type: "t",    value: texture}
    }
    const attributes = {};
    return new THREE.ShaderMaterial({
        uniforms: uniforms,
        fragmentShader: fragmentShader(),
        vertexShader: vertexShader(),
    });
}

export {makeMaterialWithShader};
