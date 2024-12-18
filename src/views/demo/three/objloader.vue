<template>
    <div ref="box" id="box">
    </div>
</template>

<script>
import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { DDSLoader } from "three/examples/jsm/loaders/DDSLoader";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader";
import { TGALoader } from "three/examples/jsm/loaders/TGALoader";
var gui, scene, camera, renderer, controls, ambientLight;
export default {
  name: "obj-loader",
  methods: {
    initScene() {
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x444444);

      // scene.add(new THREE.AxesHelper(20))

      camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        10000
      );
      camera.position.z = 30;
      camera.position.y = 30;

      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      this.$refs.box.appendChild(renderer.domElement);

      controls = new OrbitControls(camera, renderer.domElement);

      ambientLight = new THREE.AmbientLight(0xffffff);
      scene.add(ambientLight);
      // let directionalLight = new THREE.DirectionalLight(0x666666);
      // directionalLight.position.set(10, -50, 300);
      // scene.add(directionalLight);

      this.initBones();
    },
    initBones() {
      var geom = new THREE.BoxGeometry(10, 10, 10);
      var tga_loader = new TGALoader();
      var mate0 = new THREE.MeshLambertMaterial({
        map: tga_loader.load("/static/images/texture/hongqi/Map__1_Falloff.tga")
      });
      var mate1 = new THREE.MeshLambertMaterial({
        map: tga_loader.load("/static/images/texture/hongqi/Map__7_Falloff.tga")
      });

      let loader = new OBJLoader();
      loader.setPath("/static/images/texture/hongqi/");
      loader.load("hongqi.obj", obj => {
        let mesh = obj.children[0];
        mesh.material[0] = mate1;
        mesh.material[1] = mate0;
        scene.add(mesh);
      });

      // scene.add(new THREE.Mesh(new THREE.BoxGeometry(12,12,12), new THREE.MeshNormalMaterial()))

      this.render();
      document.getElementById("loading").style.display = "none";
    },
    render() {
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
    gui = null;
    scene = null;
    camera = null;
    controls = null;
    cancelAnimationFrame(this.globalID);
  }
};
</script>

<style lang="less" scope>
#box {
}
</style>
