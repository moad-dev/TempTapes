<template>
  <Renderer ref="rendererC" antialias resize="window">
    <Camera ref="camera" :fov="75" :aspect="width / height" :position="{ y: 2, z: 4 }" :far="1000" :lookAt="{ y: 1.5, z: 0 }"/>
    <Scene ref="scene" :background="'white'">
      <Box :size="1" ref="meshC" :position="{x: 1, y: 0, z: -1}">
        <BasicMaterial color="green"/>
      </Box>
    </Scene>
  </Renderer>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Box, Camera, BasicMaterial, Renderer, Scene } from 'troisjs'
import * as THREE from 'three'

let parentElement = document.getElementById("app");
let width = parentElement.offsetWidth;
let height = parentElement.offsetHeight;

const rendererC = ref()
const meshC = ref()
const cameraC = ref()
const scene = ref()
</script>

<script>
export default {
  mounted() {
    this.$refs.scene.scene.fog = new THREE.Fog(0xFFFFFF, 10, 16)
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