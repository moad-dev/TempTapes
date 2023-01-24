<template>
  <Renderer ref="rendererC" antialias resize="window">
    <Camera ref="camera" :fov="75" :aspect="width / height" :position="{ y: 2, z: 4 }" :far="1000" :lookAt="{ y: 1.5, z: 0 }"/>
    <Scene ref="scene" :background="'white'">
      <Group>
        <Box v-for="i in 2" :size="1" ref="meshC" :position="{x: 0, y: 0, z: -i+1}">
          <BasicMaterial color="green"/>
        </Box>
        <LineGeometry v-for="i in 2" ref="lines" v-bind="{x: 0, y: 0, z: -i+1}"/>
      </Group>
    </Scene>
  </Renderer>
</template>

<script setup>
import { ref } from 'vue'
import { Box, Camera, BasicMaterial, Renderer, Scene } from 'troisjs'
import LineGeometry from './CustomLineMesh'

let parentElement = document.getElementById("app");
let width = parentElement.offsetWidth;
let height = parentElement.offsetHeight;

const rendererC = ref()
const meshC = ref()
const cameraC = ref()
const scene = ref()
</script>

<style>
body {
  margin: 0;
}
canvas {
  display: block;
}
</style>