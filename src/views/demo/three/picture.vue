<template>
    <div ref="box" id="box"></div>
</template>

<script>
import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GUI } from "three/examples/jsm/libs/dat.gui.module";
import { Clock } from "three";
var stats, camera, scene, renderer, controls, clock;
var img;
var canvas;
var points;
var content;
var particles;
var imgDate;
var uniforms;
var positions;
var positions_af;
var intelligibility;
var geometry;
var gui;
var guiParams;
var loaded = false;
var size = 32;
export default {
  name: "mosaic马赛克",
  methods: {
    initThree() {
      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setClearColor(0x000000);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      this.$refs.box.appendChild(renderer.domElement);
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        1,
        10000
      );
      camera.position.set(0, 0, 1000);
      scene.add(camera);
      controls = new OrbitControls(camera, renderer.domElement);
      clock = new Clock();
      stats = new Stats();
      this.$refs.box.appendChild(stats.dom);
      this.initGui();
      this.initCanvas();
      this.render();
      document.getElementById("loading").style.display = "none";
    },
    initGui() {
      guiParams = new function() {
        this.intelligibility = 6;
      }();
      gui = new GUI();
      gui.add(guiParams, "intelligibility", 1, 6).onChange(this.setScale);
    },
    initCanvas() {
      canvas = document.createElement("canvas");
      content = canvas.getContext("2d");
      canvas.width = 1600;
      canvas.height = 1200;
      img = new Image();
      img.crossOrigin = "*";
      img.src = "/static/images/base/girl.jpg";
      img.onload = () => {
        content.drawImage(img, 0, 0, canvas.width, canvas.height);
        imgDate = content.getImageData(0, 0, canvas.width, canvas.height);
        this.createPotCloud(); //创建点云
      };
    },
    setScale(e) {
      size = Math.pow(2, Math.round(e) - 1);
      this.createPotCloud();
    },
    createPotCloud() {
      if (points) {
        scene.remove(points);
      }
      let cw = Math.floor(canvas.width / size);
      let ch = Math.floor(canvas.height / size);
      particles = cw * ch;
      geometry = new THREE.BufferGeometry();
      positions = new Float32Array(Math.floor(particles * 3));
      positions_af = new Float32Array(Math.floor(particles * 3));
      var colors = new Float32Array(Math.floor(particles * 3));
      for (var i = 0; i < positions.length; i += 1) {
        positions[3 * i] = -canvas.width / 2 + (i % cw) * size;
        positions[3 * i + 1] =
          canvas.height / 2 + Math.floor((-1 - i) / cw) * size;
        positions[3 * i + 2] = 0;

        let selectPos = size * (i % cw) + Math.floor(i / cw) * cw * size * size;
        colors[3 * i] = imgDate.data[4 * selectPos] / 255.0;
        colors[3 * i + 1] = imgDate.data[4 * selectPos + 1] / 255.0;
        colors[3 * i + 2] = imgDate.data[4 * selectPos + 2] / 255.0;
      }
      geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3)
      );
      geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
      geometry.dynamic = true;
      geometry.attributes.position.needsUpdate = true;
      var material = new THREE.PointsMaterial({
        size: size,
        vertexColors: THREE.VertexColors
      });
      points = new THREE.Points(geometry, material);
      points.name = "points";
      scene.add(points);
      loaded = true;
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
    cancelAnimationFrame(this.globalID);
    document
      .getElementsByClassName("ac")[0]
      .removeChild(document.getElementsByClassName("main")[0]);
  }
};
</script>

<style lang="less" scope>
#box {
  position: relative;
}
</style>
