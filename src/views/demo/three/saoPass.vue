<template>
    <div ref="box" id="box"></div>
</template>

<script>
import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { ConvexGeometry } from "three/examples/jsm/geometries/ConvexGeometry";
import { GUI } from "three/examples/jsm/libs/dat.gui.module";
import { TWEEN } from "three/examples/jsm/libs/tween.module.min.js";

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { SAOPass } from "three/examples/jsm/postprocessing/SAOPass.js";
var gui,
  scene,
  clock,
  camera,
  renderer,
  stats,
  controls,
  mesh,
  textureObj,
  group,
  container;
let composer, renderPass, saoPass;
export default {
  name: "sao-pass",
  data() {
    return {
      canHandle: true
    };
  },
  methods: {
    initScene() {
      clock = new THREE.Clock();
      container = this.$refs.box;

      const width = window.innerWidth || 1;
      const height = window.innerHeight || 1;
      const devicePixelRatio = window.devicePixelRatio || 1;

      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setClearColor(0x000000);
      renderer.setPixelRatio(devicePixelRatio);
      renderer.setSize(width, height);
      container.appendChild(renderer.domElement);

      camera = new THREE.PerspectiveCamera(65, width / height, 3, 10);
      camera.position.z = 7;

      scene = new THREE.Scene();

      group = new THREE.Object3D();
      scene.add(group);

      const light = new THREE.PointLight(0xddffdd, 0.8);
      light.position.z = 70;
      light.position.y = -70;
      light.position.x = -70;
      scene.add(light);

      const light2 = new THREE.PointLight(0xffdddd, 0.8);
      light2.position.z = 70;
      light2.position.x = -70;
      light2.position.y = 70;
      scene.add(light2);

      const light3 = new THREE.PointLight(0xddddff, 0.8);
      light3.position.z = 70;
      light3.position.x = 70;
      light3.position.y = -70;
      scene.add(light3);

      const light4 = new THREE.AmbientLight(0xffffff, 0.05);
      scene.add(light4);

      // const geometry = new THREE.SphereBufferGeometry( 3, 48, 24 );

      // for ( let i = 0; i < 120; i ++ ) {

      //     const material = new THREE.MeshStandardMaterial();
      //     material.roughness = 0.5 * Math.random() + 0.25;
      //     material.metalness = 0;
      //     material.color.setHSL( Math.random(), 1.0, 0.3 );

      //     const mesh = new THREE.Mesh( geometry, material );
      //     mesh.position.x = Math.random() * 4 - 2;
      //     mesh.position.y = Math.random() * 4 - 2;
      //     mesh.position.z = Math.random() * 4 - 2;
      //     mesh.rotation.x = Math.random();
      //     mesh.rotation.y = Math.random();
      //     mesh.rotation.z = Math.random();

      //     mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 0.2 + 0.05;
      //     group.add( mesh );

      // }
      var planeGeom = new THREE.BoxBufferGeometry(6, 4, 0.4);
      var planeMate = new THREE.MeshStandardMaterial({ color: 0xbbbbbb });
      var planeMesh = new THREE.Mesh(planeGeom, planeMate);

      var planeMesh2 = planeMesh.clone();
      planeMesh2.position.y = -2;
      planeMesh2.rotation.x = -Math.PI / 2;

      group.add(planeMesh);
      group.add(planeMesh2);

      stats = new Stats();
      container.appendChild(stats.dom);

      composer = new EffectComposer(renderer);
      renderPass = new RenderPass(scene, camera);
      saoPass = new SAOPass(scene, camera, false, true);
      composer.addPass(renderPass);
      composer.addPass(saoPass);
      composer.setSize(width, height);

      saoPass.params.output = 0;
      saoPass.params.saoIntensity = 0.2;
      // saoPass.params.saoBias = -2;

      this.render();
      document.getElementById("loading-outer").style.width = "100%";
      document.getElementById("loading").style.display = "none";
    },

    render() {
      // group.rotation.set(0, clock.getElapsedTime(), 0);
      stats.update();
      renderer.render(scene, camera);
      // composer.render();
      composer.render();
      this.globalID = requestAnimationFrame(this.render);
    }
  },
  mounted() {
    this.initScene();
    window.onresize = () => {
      camera.aspect = this.$refs.box.clientWidth / this.$refs.box.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(this.$refs.box.clientWidth, this.$refs.box.clientHeight);
    };
  },
  beforeDestroy() {
    renderer.forceContextLoss();
    renderer = null;
    scene = null;
    camera = null;
    controls = null;
    cancelAnimationFrame(this.globalID);
  }
};
</script>

<style lang="less" scope>
#box {
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 100%;
}
</style>
