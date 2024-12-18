<template>
    <div ref="box" id="box"></div>
</template>

<script>
import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Clock, Vector3 } from "three";
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
  params;
export default {
  name: "matrix3",
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
      this.$refs.box.appendChild(renderer.domElement);

      camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        10000
      );
      camera.position.set(20, 30, 60);

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

      this.setBox3();
    },
    setBox3() {
      new THREE.Vector3();

      var quaternion = new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(0, 0, 1),
        Math.PI / 4
      );
      var position = new THREE.Vector3(1, 0, 0);
      var scale = new THREE.Vector3(2, 2, 2);

      var matrix1 = new THREE.Matrix4().makeRotationZ(Math.PI / 6);

      // console.log('res', matrix1.compose(position, quaternion, scale))
      // console.log('res', matrix1.makeRotationFromQuaternion( quaternion ).scale(scale).setPosition(position))
      var matrix2 = new THREE.Matrix4().set(
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14,
        15,
        16
      );
      console.log(matrix2.extractRotation(matrix1));

      this.render();
      document.getElementById("loading").style.display = "none";
    },
    mm(tx, ty, sx, sy, rotation, cx, cy) {
      var c = Math.cos(rotation);
      var s = Math.sin(rotation);

      return new THREE.Matrix3().set(
        sx * c,
        sx * s,
        -sx * (c * cx + s * cy) + cx + tx,
        -sy * s,
        sy * c,
        -sy * (-s * cx + c * cy) + cy + ty,
        0,
        0,
        1
      );
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
