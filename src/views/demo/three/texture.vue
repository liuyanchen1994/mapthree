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
var gui, scene, camera, renderer, controls, ambientLight, directionalLight;
export default {
  name: "texture",
  methods: {
    initScene() {
      gui = new GUI();

      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x444444);

      scene.add(new THREE.AxesHelper(20));

      camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        200
      );
      camera.position.z = 30;
      camera.position.y = 30;

      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      this.$refs.box.appendChild(renderer.domElement);

      ambientLight = new THREE.AmbientLight(0x999999);
      scene.add(ambientLight);
      directionalLight = new THREE.DirectionalLight(0x666666);
      directionalLight.position.set(300, 0, 0);
      scene.add(directionalLight);

      controls = new OrbitControls(camera, renderer.domElement);

      this.initTexture();
    },
    initTexture() {
      // var geom = new THREE.BoxBufferGeometry(10,10,10);
      // var uvArr = geom.attributes.uv;
      // var uv = new Float32Array(48);

      // for(var i=0; i<uvArr.count; i++) {
      //     uv[i] =0;
      // }
      // uv[0] = 0;
      // uv[1] = 0.5;
      // uv[2] = 1;
      // uv[3] = 0.5;
      // uv[4] = 0;
      // uv[5] = 0;
      // uv[6] = 1;
      // uv[7] = 0;

      // uv[8] = 0;
      // uv[9] = 0.5;
      // uv[10] = 1;
      // uv[11] = 0.5;
      // uv[12] = 0;
      // uv[13] = 0;
      // uv[14] = 1;
      // uv[15] = 0;

      // uv[16] = 0;
      // uv[17] = 1;
      // uv[18] = 1;
      // uv[19] = 1;
      // uv[20] = 0;
      // uv[21] = 0.5;
      // uv[22] = 1;
      // uv[23] = 0.5;

      // uv[24] = 0;
      // uv[25] = 1;
      // uv[26] = 1;
      // uv[27] = 1;
      // uv[28] = 0;
      // uv[29] = 0.5;
      // uv[30] = 1;
      // uv[31] = 0.5;

      // uv[32] = 0;
      // uv[33] = 0.5;
      // uv[34] = 1;
      // uv[35] = 0.5;
      // uv[36] = 0;
      // uv[37] = 0;
      // uv[38] = 1;
      // uv[39] = 0;

      // uv[40] = 0;
      // uv[41] = 0.5;
      // uv[42] = 1;
      // uv[43] = 0.5;
      // uv[44] = 0;
      // uv[45] = 0;
      // uv[46] = 1;
      // uv[47] = 0;

      // geom.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
      var geom = new THREE.BoxGeometry(10, 10, 10);

      var loader = new THREE.TextureLoader();
      // var map = loader.load('/static/images/base/atlas.png');
      var map = loader.load("/static/images/wall/stone.jpg");
      var bumpMap = loader.load("/static/images/wall/stone-bump.jpg");
      // var mate = new THREE.MeshLambertMaterial({map});
      var mate = new THREE.MeshPhongMaterial({
        map: map,
        bumpMap: bumpMap,
        bumpScale: 1
      });

      // var geom = new THREE.SphereGeometry(10, 8, 6);
      // var mater = new THREE.MeshNormalMaterial({
      //     flatShading: true
      // });

      // var geom = new THREE.BoxGeometry(10,10,10);
      // geom.colors = [new THREE.Color(0xffaa00),new THREE.Color(0xffaa00),new THREE.Color(0xffaa00),new THREE.Color(0xffaa00),new THREE.Color(0xffaa00),new THREE.Color(0xffaa00),new THREE.Color(0xffaa00),new THREE.Color(0xffaa00)]
      // var mate = new THREE.MeshLambertMaterial({
      //     vertexColors: THREE.VertexColors,
      //     color: 0x00ff00
      // })

      var mesh = new THREE.Mesh(geom, mate);
      console.log(mesh);
      scene.add(mesh);

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
    ambientLight = null;
    directionalLight = null;
    cancelAnimationFrame(this.globalID);
  }
};
</script>

<style lang="less" scope>
#box {
}
</style>
