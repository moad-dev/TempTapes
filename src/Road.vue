<!-- NOTE: In order to pass this.props to BasicMaterial need to use :<child-prop>="$props.<parent-prop>", over-wise it's undefined -->
<template>
  <Group ref="group">
    <Box v-for="i in 2" :size="1" ref="groupMesh" :position="{x: 0, y: 0, z: -i+1}">
      <BasicMaterial :color="$props.color"/>
    </Box>
    <LineGeometry v-for="i in 2" ref="lines" v-bind="{x: 0, y: 0, z: -i+1}"/>
    <Box v-for="i in 16" :size="1" ref="groupMesh" :position="{x: 0, y: i * i * 0.05 + i * 0.005, z: -i-1}" :rotation="{x: i * 0.1}">
      <BasicMaterial :color="$props.color"/>
    </Box>
    <LineGeometry v-for="i in 11" ref="lines" v-bind="{x: 0, y: i * i * 0.045 - i * 0.0038, z: -i* 0.9 - 1}"/>
  </Group>
</template>

<script setup>
import {ref} from "vue";
import { Box, BasicMaterial } from 'troisjs'
import LineGeometry from './CustomLineMesh.js'
import { TextureLoader, MeshBasicMaterial } from 'three'
import { makeMaterialWithShader } from './iconShader'

const groupMesh = ref()
const lines = ref()
</script>


<script>
export default {
  name: "Road",
  props: {
    color: {
      type: String,
      default: 'green'
    },
    ico: {
      type: String,
      default: "01.png"
    }
  },
  mounted() {
    // cannot use this.$refs.lines in CustomLineMesh.js because this component is not defined yet
    let scene = this.$root.$refs.scene.scene

    this.$refs.lines.forEach(function(line) {
      scene.add(line.createLine())
    });

    const loader = new TextureLoader();
    let basicMaterial = new MeshBasicMaterial({color: this.color});
    this.$refs.groupMesh[0].mesh.material = [basicMaterial, basicMaterial, basicMaterial, basicMaterial, makeMaterialWithShader('../../storage/img/' + this.ico, this.color, loader), basicMaterial];
  }
}
</script>

<style scoped>

</style>