<template>
  <Renderer ref="rendererC" antialias :orbit-ctrl="{ enableDamping: true }" resize="window">
    <Camera ref="camera" :fov="75" :aspect="width / height" :position="{ y: 2, z: 4 }" :far="1000" :lookAt="{ y: 1.5, z: 0 }"/>
    <Scene ref="scene" :background="'white'">
      <!--   Road.vue   -->
      <Road color="#aaaaaa"/>
      <!--   Road.vue   -->
    </Scene>
  </Renderer>
</template>

<script setup>
import { ref } from 'vue'
import { Camera, Renderer, Scene } from 'troisjs'
import Road from './Road.vue'

import {Fog} from "three";

let parentElement = document.getElementById("app");
let width = parentElement.offsetWidth;
let height = parentElement.offsetHeight;

const rendererC = ref()
const cameraC = ref()
const scene = ref()
</script>

<script>
export default {
  mounted() {
    let scene = this.$refs.scene.scene

    scene.fog = new Fog(0xFFFFFF, 10, 16)

    console.log(this.$refs.rendererC.renderer)
  }
}
</script>

<style>
body {
  margin: 0;
}
canvas {
  display: block;
}
</style>