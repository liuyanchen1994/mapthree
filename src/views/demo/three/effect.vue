<template>
    <div ref="box" id="box">
    </div>
</template>

<script>
import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { ConvexGeometry } from "three/examples/jsm/geometries/ConvexGeometry";
import { GUI } from "three/examples/jsm/libs/dat.gui.module";
import { TWEEN } from "three/examples/jsm/libs/tween.module.min.js";
import { SceneUtils } from "three/examples/jsm/utils/SceneUtils";
import { AsciiEffect } from "three/examples/jsm/effects/AsciiEffect";
import ThreeBSP from "./js/ThreeBSP";
import { Reflector } from "three/examples/jsm/objects/Reflector";
var stats,
  scene,
  camera,
  renderer,
  controls,
  lights = [],
  uniforms,
  texture,
  time = 0,
  effect;
export default {
  name: "effect",
  data() {
    return {
      canHandle: true
    };
  },
  methods: {
    initScene() {
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0xffffff);

      stats = new Stats();
      stats.setMode(0);
      stats.domElement.style.position = "absolute";
      stats.domElement.style.left = "0px";
      stats.domElement.style.top = "0px";
      this.$refs.box.appendChild(stats.domElement);

      scene.add(new THREE.AxesHelper(300));

      camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        10000
      );
      camera.position.z = 100;

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(this.$refs.box.clientWidth, this.$refs.box.clientHeight);
      renderer.shadowMap.enabled = true;
      // this.$refs.box.appendChild( renderer.domElement );

      // controls = new OrbitControls( camera, renderer.domElement );

      var ambientLight = new THREE.AmbientLight(0xcccccc);
      scene.add(ambientLight);

      lights[0] = new THREE.PointLight(0x888888, 0.5, 800);
      lights[1] = new THREE.PointLight(0x888888, 0.5, 800);
      lights[2] = new THREE.PointLight(0x888888, 0.5, 800);
      lights[3] = new THREE.PointLight(0x888888, 0.5, 800);

      lights[0].position.set(0, 100, 400);
      lights[1].position.set(300, 100, 0);
      lights[2].position.set(-300, 100, 0);
      lights[3].position.set(0, 300, 0);

      scene.add(lights[0]);
      scene.add(lights[1]);
      scene.add(lights[2]);
      scene.add(lights[3]);

      this.init();
    },
    init() {
      var geometry = new THREE.SphereBufferGeometry(20);
      var material = new THREE.MeshNormalMaterial();
      var mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      effect = new AsciiEffect(renderer, "123456789 ", { invert: true });
      effect.setSize(window.innerWidth, window.innerHeight);
      effect.domElement.style.color = "white";
      effect.domElement.style.backgroundColor = "black";

      this.$refs.box.appendChild(effect.domElement);

      controls = new OrbitControls(camera, effect.domElement);

      this.render();
      document.getElementById("loading-outer").style.width = "100%";
      document.getElementById("loading").style.display = "none";
    },
    render() {
      stats.update();
      // renderer.render(scene, camera);
      effect.render(scene, camera);
      this.globalID = requestAnimationFrame(this.render);
    }
  },
  mounted() {
    this.initScene();
    window.onresize = () => {
      camera.aspect = this.$refs.box.clientWidth / this.$refs.box.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(this.$refs.box.clientWidth, this.$refs.box.clientHeight);
      effect.setSize(this.$refs.box.clientWidth, this.$refs.box.clientHeight);
    };
  },
  beforeDestroy() {
    renderer.forceContextLoss();
    renderer = null;
    scene = null;
    camera = null;
    controls = null;
    lights = [];
    cancelAnimationFrame(this.globalID);
  }
};
</script>

<style lang="less" scope>
#box {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
}
</style>
