<template>
  <Renderer ref="rendererC" antialias resize="window">
    <Camera ref="camera" :fov="75" :aspect="width / height" :position="{ y: 2, z: 4 }" :far="1000" :lookAt="{ y: 1.5, z: 0 }"/>
    <Scene ref="scene" :background="'white'">
      <!--   Road.vue   -->
      <Group>
        <Box v-for="i in 2" :size="1" ref="groupMesh" :position="{x: 0, y: 0, z: -i+1}">
          <BasicMaterial color="green"/>
        </Box>
        <LineGeometry v-for="i in 2" ref="lines" v-bind="{x: 0, y: 0, z: -i+1}"/>
        <Box v-for="i in 16" :size="1" ref="groupMesh" :position="{x: 0, y: i * i * 0.05 + i * 0.005, z: -i-1}" :rotation="{x: i * 0.1}">
          <BasicMaterial color="green"/>
        </Box>
        <LineGeometry v-for="i in 11" ref="lines" v-bind="{x: 0, y: i * i * 0.045 - i * 0.0038, z: -i* 0.9 - 1}"/>
      </Group>
      <!--   Road.vue   -->
    </Scene>
  </Renderer>
</template>

<script setup>
import { ref } from 'vue'
import { Box, Camera, BasicMaterial, Renderer, Scene } from 'troisjs'
import LineGeometry from './CustomLineMesh.js'

import {Fog} from "three";

let parentElement = document.getElementById("app");
let width = parentElement.offsetWidth;
let height = parentElement.offsetHeight;

const rendererC = ref()
const groupMesh = ref()
const cameraC = ref()
const scene = ref()
</script>

<script>
export default {
  mounted() {
    let scene = this.$refs.scene.scene

    scene.fog = new Fog(0xFFFFFF, 10, 16)
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