<template>
    <div ref="box" id="box"></div>
</template>

<script>
import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { ConvexGeometry } from "three/examples/jsm/geometries/ConvexGeometry";
import { GUI } from "three/examples/jsm/libs/dat.gui.module";

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { AfterimagePass } from "three/examples/jsm/postprocessing/AfterimagePass.js";

import { DotScreenPass } from "three/examples/jsm/postprocessing/DotScreenPass.js";
import { BloomPass } from "three/examples/jsm/postprocessing/BloomPass.js";
import { FilmPass } from "three/examples/jsm/postprocessing/FilmPass.js";

var gui,
  scene,
  camera,
  renderer,
  controls,
  lights,
  time = 0,
  refractor,
  clock,
  halfX,
  halfY,
  points,
  stats,
  pointLight,
  pointLight2,
  composer,
  object,
  mesh;

let afterimagePass;

const params = {
  enable: true
};
export default {
  name: "after_image_pass",
  data() {
    return {};
  },
  methods: {
    init() {
      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      this.$refs.box.appendChild(renderer.domElement);

      camera = new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        1,
        1000
      );
      camera.position.z = 400;

      scene = new THREE.Scene();
      scene.fog = new THREE.Fog(0x000000, 1, 1000);

      const geometry = new THREE.BoxBufferGeometry(150, 150, 150, 2, 2, 2);
      const material = new THREE.MeshNormalMaterial();

      mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      const renderPass = new RenderPass(scene, camera);
      const afterImagePass = new AfterimagePass();
      const effectBloom = new BloomPass(0.5);
      const effectFilm = new FilmPass(0.35, 0.025, 648, false);
      const effectFilmBW = new FilmPass(0.35, 0.5, 2048, true);
      const effectDotScreen = new DotScreenPass(
        new THREE.Vector2(0, 0),
        0.5,
        0.8
      );

      composer = new EffectComposer(renderer);
      composer.addPass(renderPass);
      composer.addPass(afterImagePass);
      // composer.addPass(effectFilm);
      composer.setSize(window.innerWidth, window.innerHeight);

      const gui = new GUI({ name: "Damp setting" });
      gui.add(afterImagePass.uniforms["damp"], "value", 0, 1).step(0.001);
      gui.add(params, "enable");

      this.render();
      document.getElementById("loading-outer").style.width = "100%";
      document.getElementById("loading").style.display = "none";
    },
    render() {
      mesh.rotation.x += 0.005;
      mesh.rotation.y += 0.01;
      if (params.enable) {
        composer.render();
      } else {
        renderer.render(scene, camera);
      }
      this.globalID = requestAnimationFrame(this.render);
    }
  },
  mounted() {
    this.init();
    window.onresize = () => {
      camera.aspect = this.$refs.box.clientWidth / this.$refs.box.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(this.$refs.box.clientWidth, this.$refs.box.clientHeight);
    };
  },
  beforeDestroy() {
    // renderer.forceContextLoss();
    // renderer = null;
    // scene = null;
    // camera = null;
    // controls = null;
    // lights = null;
    // cancelAnimationFrame(this.globalID);
  }
};
</script>

<style lang="less" scope>
#box {
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 100%;
  background: #000000;
}
</style>
