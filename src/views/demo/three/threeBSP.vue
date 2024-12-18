<template>
    <div ref="box" id="box"></div>
</template>

<script>
import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { ConvexGeometry } from "three/examples/jsm/geometries/ConvexGeometry";
import ThreeBSP from "./js/ThreeBSP";
var scene,
  controls,
  clock,
  material,
  stats,
  renderer,
  camera,
  result,
  ambientLight,
  spotLight;
export default {
  name: "threebsp",
  data() {
    return {
      globalID: null
    };
  },
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
      renderer.setClearColor(0x041336);
      this.$refs.box.appendChild(renderer.domElement);

      camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        10000
      );
      camera.position.set(0, 100, 200);
      camera.lookAt(0, 0, 0);

      controls = new OrbitControls(camera, renderer.domElement);
      clock = new THREE.Clock();

      scene = new THREE.Scene();

      ambientLight = new THREE.AmbientLight(0xeeeeee);
      scene.add(ambientLight);

      spotLight = new THREE.SpotLight(0xeeeeee);
      spotLight.position.set(0, 80, -50);
      scene.add(spotLight);
      this.drawBSP();
    },
    drawBSP() {
      var material = new THREE.MeshPhongMaterial({
        color: 0x2c85e1,
        shininess: 60,
        specular: 0x2c85e1
      });

      var cylinGeom1 = new THREE.CylinderGeometry(40, 40, 10, 50);
      var cylinMesh1 = new THREE.Mesh(cylinGeom1, material);
      cylinMesh1.position.y = 5;

      var cylinGeom2 = new THREE.CylinderGeometry(28, 28, 14, 50);
      var cylinMesh2 = new THREE.Mesh(cylinGeom2, material);
      cylinMesh2.position.y = 7;

      var cylinGeom3 = new THREE.CylinderGeometry(20, 20, 22, 50);
      var cylinMesh3 = new THREE.Mesh(cylinGeom3, material);
      cylinMesh3.position.y = 11;

      var cylinGeom4 = new THREE.CylinderGeometry(10, 10, 24, 50);
      var cylinMesh4 = new THREE.Mesh(cylinGeom4, material);
      cylinMesh4.position.y = 12;

      var pointsArr = [
        [5, -1, 33],
        [5, 11, 33],
        [-5, -1, 33],
        [-5, 11, 33],
        [20, -1, 66],
        [20, 11, 66],
        [-20, -1, 66],
        [-20, 11, 66]
      ];
      var points = pointsArr.map(d => new THREE.Vector3(d[0], d[1], d[2]));
      var tixing = new ConvexGeometry(points);
      var tixingMesh = new THREE.Mesh(tixing, material);

      var meshArray = [];
      for (var i = 0; i < 8; i++) {
        tixingMesh.rotation.y = (Math.PI / 4) * i;
        meshArray[i] = tixingMesh.clone();
      }

      var cylinBSP1 = new ThreeBSP(cylinMesh1);
      var cylinBSP2 = new ThreeBSP(cylinMesh2);
      var cylinBSP3 = new ThreeBSP(cylinMesh3);
      var cylinBSP4 = new ThreeBSP(cylinMesh4);

      var resultBSP = cylinBSP1
        .union(cylinBSP2)
        .union(cylinBSP3)
        .subtract(cylinBSP4);
      for (var i = 0; i < 8; i++) {
        resultBSP = resultBSP.subtract(new ThreeBSP(meshArray[i]));
      }
      result = resultBSP.toMesh();
      result.material = new THREE.MeshPhongMaterial({
        color: 0x2c85e1,
        shininess: 60,
        specular: 0x2c85e1
      });
      result.position.y = 20;
      scene.add(result);

      // cylinMesh1.position.set(-100,-40,0);
      // scene.add(cylinMesh1);
      // cylinMesh2.position.set(0,-40,100);
      // scene.add(cylinMesh2);
      // cylinMesh3.position.set(100, -40, 0);
      // scene.add(cylinMesh3);
      // cylinMesh4.position.set(0,-40,-100);
      // scene.add(cylinMesh4);
      // tixingMesh.position.set(40, -45, -50)
      // scene.add(tixingMesh);

      // cylinMesh1.position.set(-150,0,0);
      // scene.add(cylinMesh1);
      // cylinMesh2.position.set(-60,0,0);
      // scene.add(cylinMesh2);
      // cylinMesh3.position.set(0,0,0);
      // scene.add(cylinMesh3);
      // cylinMesh4.position.set(50,0,0);
      // scene.add(cylinMesh4);
      // tixingMesh.position.set(150,0,-40);
      // scene.add(tixingMesh);

      this.render();
      document.getElementById("loading").style.display = "none";
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
    window.onresize = function() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
  },
  beforeDestroy() {
    renderer.forceContextLoss();
    renderer = null;
    scene = null;
    controls = null;
    clock = null;
    material = null;
    stats = null;
    renderer = null;
    camera = null;
    ambientLight = null;
    spotLight = null;
    cancelAnimationFrame(this.globalID);
  }
};
</script>
