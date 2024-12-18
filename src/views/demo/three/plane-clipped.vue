<template>
    <div ref="box" id="box"></div>
</template>

<script>
import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { SceneUtils } from "three/examples/jsm/utils/SceneUtils";
import { GUI } from "three/examples/jsm/libs/dat.gui.module";
import { Clock, Vector3, Object3D } from "three";
var renderer,
  camera,
  scene,
  controls,
  stats,
  clock,
  ambientLight,
  directionalLight,
  globalID,
  gui,
  params,
  box,
  plane,
  planeHelper;
export default {
  name: "plane",
  methods: {
    initThree() {
      stats = new Stats();
      stats.setMode(0);
      stats.domElement.style.position = "absolute";
      stats.domElement.style.left = "0px";
      stats.domElement.style.top = "0px";
      this.$refs.box.appendChild(stats.domElement);

      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0x000000);
      renderer.localClippingEnabled = true;
      this.$refs.box.appendChild(renderer.domElement);

      camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        10000
      );
      camera.position.set(0, 20, 40);

      controls = new OrbitControls(camera, renderer.domElement);
      clock = new THREE.Clock();

      scene = new THREE.Scene();

      var helper = new THREE.AxesHelper(20);
      scene.add(helper);

      ambientLight = new THREE.AmbientLight(0xbbbbbb);
      scene.add(ambientLight);

      directionalLight = new THREE.DirectionalLight(0x666666);
      directionalLight.position.set(10, -50, 300);
      scene.add(directionalLight);

      this.setPlane();
    },
    setPlane() {
      box = new THREE.Mesh(
        new THREE.BoxGeometry(20, 20, 20),
        new THREE.MeshNormalMaterial({ side: THREE.DoubleSide })
      );
      plane = new THREE.Plane(new THREE.Vector3(1, 1, 1), 0);
      planeHelper = new THREE.PlaneHelper(plane, 30);
      renderer.clippingPlanes = [plane];
      scene.add(planeHelper);
      scene.add(box);
      gui = new GUI();
      params = new function() {
        this.normal_x = 1;
        this.normal_y = 1;
        this.normal_z = 1;
        this.constant = 0;
        this.clipping = true;
      }();
      gui.add(params, "normal_x", -1, 1).onChange(() => this.setParams());
      gui.add(params, "normal_y", -1, 1).onChange(() => this.setParams());
      gui.add(params, "normal_z", -1, 1).onChange(() => this.setParams());
      gui.add(params, "constant", -10, 10).onChange(() => this.setParams());
      gui
        .add(params, "clipping")
        .onChange(e => (renderer.clippingPlanes = e ? [plane] : []));

      this.render();
      document.getElementById("loading").style.display = "none";
    },
    setParams() {
      plane.set(
        new THREE.Vector3(params.normal_x, params.normal_y, params.normal_z),
        params.constant
      );
      planeHelper = new THREE.PlaneHelper(plane, 30);
    },
    render() {
      stats.update();
      controls.update(clock.getDelta());
      renderer.render(scene, camera);
      this.globalID = requestAnimationFrame(this.render);
    }
  },
  mounted() {
    this.initThree();
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
    controls = null;
    clock = null;
    stats = null;
    renderer = null;
    camera = null;
    ambientLight = null;
    directionalLight = null;
    document
      .getElementsByClassName("ac")[0]
      .removeChild(document.getElementsByClassName("main")[0]);
    cancelAnimationFrame(this.globalID);
  }
};
</script>

<style lang="less" scope>
#container {
  width: 100%;
  height: 100%;
  background-color: #000000;
  overflow: hidden;
  position: relative;
  > div {
    display: inline-block;
    width: 50%;
    height: 50%;
    position: relative;
    p {
      position: absolute;
      color: #ffffff;
      top: 10px;
      left: 50%;
      transform: translate(-50%, 0);
    }
  }
}
</style>
