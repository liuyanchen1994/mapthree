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
  time = 0;
export default {
  name: "mirror",
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
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.shadowMap.enabled = true;
      this.$refs.box.appendChild(renderer.domElement);

      controls = new OrbitControls(camera, renderer.domElement);

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
      var planeGeo = new THREE.PlaneBufferGeometry(100.1, 100.1);
      var geometry = new THREE.SphereBufferGeometry(20, 60, 40);
      var groundMirror = new Reflector(planeGeo, {
        clipBias: 0.1,
        textureWidth: window.innerWidth,
        textureHeight: window.innerHeight,
        color: 0x777777
      });
      groundMirror.position.y = 0.5;
      groundMirror.rotateX(-Math.PI / 2);
      scene.add(groundMirror);
      console.log(scene);

      var boxGeo = new THREE.BoxGeometry(30, 30, 30);
      var boxMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
      var boxMesh = new THREE.Mesh(boxGeo, boxMat);
      boxMesh.position.y = 50;
      scene.add(boxMesh);
      console.log(boxMesh);

      this.render();
      document.getElementById("loading-outer").style.width = "100%";
      document.getElementById("loading").style.display = "none";
    },
    render() {
      stats.update();
      renderer.render(scene, camera);
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
    lights = [];
    cancelAnimationFrame(this.globalID);
  }
};
</script>
