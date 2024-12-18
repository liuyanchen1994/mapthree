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
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import {
  Lensflare,
  LensflareElement
} from "three/examples/jsm/objects/Lensflare";
import { LightProbeGenerator } from "three/examples/jsm/lights/LightProbeGenerator";
import ThreeBSP from "./js/ThreeBSP";
var stats,
  scene,
  camera,
  renderer,
  controls,
  lights = [],
  uniforms,
  texture,
  time = 0,
  planeMesh,
  group,
  texture0,
  texture3;
/**
 * 光照
 */
export default {
  name: "lensflares",
  data() {
    return {
      canHandle: true
    };
  },
  methods: {
    initScene() {
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x000000);

      stats = new Stats();
      stats.setMode(0);
      stats.domElement.style.position = "absolute";
      stats.domElement.style.left = "0px";
      stats.domElement.style.top = "0px";
      this.$refs.box.appendChild(stats.domElement);

      scene.add(new THREE.AxesHelper(100));

      camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        10000
      );
      camera.position.z = 200;

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.shadowMap.enabled = true;
      this.$refs.box.appendChild(renderer.domElement);

      controls = new OrbitControls(camera, renderer.domElement);

      var ambientLight = new THREE.AmbientLight(0x111111);
      scene.add(ambientLight);

      lights[0] = new THREE.PointLight(0x888888, 0.5, 800);
      lights[1] = new THREE.PointLight(0x888888, 0.5, 800);
      lights[2] = new THREE.PointLight(0x888888, 0.5, 800);
      lights[3] = new THREE.PointLight(0x888888, 0.5, 800);

      lights[0].position.set(0, 100, 400);
      lights[1].position.set(300, 100, 0);
      lights[2].position.set(-300, 100, 0);
      lights[3].position.set(0, 300, 0);

      // scene.add(lights[0]);
      // scene.add(lights[1]);
      // scene.add(lights[2]);
      // scene.add(lights[3]);

      this.init();
    },
    init() {
      let num = 1000;
      var geometry = new THREE.BoxBufferGeometry(50, 50, 50);
      var material = new THREE.MeshPhongMaterial({ color: 0xffff00 });

      var mesh = new THREE.InstancedMesh(geometry, material, num);

      for (var i = 0; i < num; i++) {
        let pos = new THREE.Vector3(
          Math.random() * 2000 - 1000,
          Math.random() * 2000 - 1000,
          Math.random() * 2000 - 1000
        );
        let rot = new THREE.Euler(
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2
        );
        mesh.setMatrixAt(
          i,
          new THREE.Matrix4().makeRotationFromEuler(rot).setPosition(pos)
        );
      }

      scene.add(mesh);

      texture0 = new THREE.TextureLoader().load(
        "/static/images/base/lensflare0.png"
      );
      texture3 = new THREE.TextureLoader().load(
        "/static/images/base/lensflare3.png"
      );

      this.addLight(0.55, 0.9, 0.5, 500, 0, -100);
      this.addLight(0.08, 0.8, 0.5, 0, 0, -100);
      this.addLight(0.995, 0.5, 0.9, 500, 500, -100);
      // this.addLight(0.55, 1, 0.5, 0, 0, 100);

      this.render();
      document.getElementById("loading-outer").style.width = "100%";
      document.getElementById("loading").style.display = "none";
    },
    addLight(h, s, l, x, y, z) {
      var light = new THREE.PointLight(0xffffff, 1.5, 400);
      light.color.setHSL(h, s, l);
      light.position.set(x, y, z);
      scene.add(light);

      var lensflare = new Lensflare();
      lensflare.addElement(new LensflareElement(texture0, 700, 0, light.color));
      lensflare.addElement(
        new LensflareElement(texture3, 60, 0.6, light.color)
      );
      lensflare.addElement(
        new LensflareElement(texture3, 70, 0.7, light.color)
      );
      lensflare.addElement(
        new LensflareElement(texture3, 120, 0.9, light.color)
      );
      lensflare.addElement(new LensflareElement(texture3, 70, 1, light.color));
      light.add(lensflare);
    },
    render() {
      // let objVec = planeMesh.rotation.toVector3();
      // let incVec = new THREE.Vector3(0.03, 0.03, 0.03);
      // let euler = new THREE.Euler().setFromVector3(objVec.add(incVec));
      // planeMesh.rotation.copy(euler);

      // time += 0.01;
      stats.update();
      // texture.rotation = - Math.PI * time;
      // uniforms.time.value += 0.01;
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
