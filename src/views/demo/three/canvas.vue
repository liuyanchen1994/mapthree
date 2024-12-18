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
  name: "canvas1",
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
      camera.position.y = 100;
      camera.position.z = 200;

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.shadowMap.enabled = true;
      this.$refs.box.appendChild(renderer.domElement);

      controls = new OrbitControls(camera, renderer.domElement);

      var ambientLight = new THREE.AmbientLight(0x444444);
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
      var canvas = document.createElement("canvas");
      canvas.width = canvas.height = 128;
      var context = canvas.getContext("2d");
      var gradient = context.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width / 2
      );
      gradient.addColorStop(0.1, "rgba(150, 150, 150, 1)");
      gradient.addColorStop(1, "rgba(255, 255, 255, 1)");
      context.fillStyle = gradient;
      context.fillRect(0, 0, canvas.width, canvas.height);
      var shadowTexture = new THREE.CanvasTexture(canvas);
      var shadowMate = new THREE.MeshBasicMaterial({ map: shadowTexture });
      var shadowGeom = new THREE.PlaneBufferGeometry(300, 300, 1, 1);
      var shadowMesh = new THREE.Mesh(shadowGeom, shadowMate);
      shadowMesh.rotation.x = -Math.PI / 2;
      // scene.add(shadowMesh);

      var radius = 200;
      var geometry = new THREE.IcosahedronBufferGeometry(radius, 1);
      var count = geometry.attributes.position.count;
      geometry.setAttribute(
        "color",
        new THREE.BufferAttribute(new Float32Array(count * 3), 3)
      );
      var colors = geometry.attributes.color;
      var positions = geometry.attributes.position;
      var color = new THREE.Color();

      // console.log(colors)

      for (var i = 0; i < count; i++) {
        color.setRGB(1, 0.8 - (positions.getY(i) / radius + 1) / 2, 0);
        colors.setXYZ(i, color.r, color.g, color.b);
      }

      var material = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        flatShading: true,
        vertexColors: true,
        shininess: 0
      });

      var mesh = new THREE.Mesh(geometry, material);

      var wireframeMaterial = new THREE.MeshBasicMaterial({
        color: 0x000000,
        wireframe: true,
        transparent: true
      });
      var wireframe = new THREE.Mesh(geometry, wireframeMaterial);

      scene.add(mesh);
      scene.add(wireframe);

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
