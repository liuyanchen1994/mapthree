<template>
    <div ref="box" id="box">
        <div class="btn" @click="handle">点击此处</div>
    </div>
</template>

<script>
import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TWEEN } from "three/examples/jsm/libs/tween.module.min.js";
var renderer, scene, controls, clock, camera, geometry, light, stats;
var canvas, content, img, imgData, container;
var group = new THREE.Group();
var origin_position = [];
var random_position = [];
var tween1;
var tween2;
var flag = true;
var globalID;

function onUpdate() {
  let time = this._object.time;
  group.children.forEach((d, i) => {
    d.position.set(
      time * origin_position[i][0] + (1 - time) * random_position[i][0],
      time * origin_position[i][1] + (1 - time) * random_position[i][1],
      (1 - time) * random_position[i][2]
    );
  });
}
export default {
  name: "tween, 二维码变换",
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

      scene = new THREE.Scene();

      camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        10000
      );
      camera.position.set(-300, 20, 300);
      camera.lookAt(0, 0, 0);
      scene.add(camera);

      controls = new OrbitControls(camera, renderer.domElement);
      clock = new THREE.Clock();

      light = new THREE.AmbientLight(0xeeeeee);
      scene.add(light);

      this.code();
    },
    code() {
      canvas = document.createElement("canvas");
      content = canvas.getContext("2d");
      canvas.width = 310;
      canvas.height = 310;
      // document.body.appendChild(canvas);
      img = new Image();
      img.crossOrigin = "*";
      img.src = "/static/images/base/wechat.png";
      // img.src = require("../assets/images/base/wechat.png");
      // canvas.style.position = 'absolute';
      // canvas.style.display = 'none';
      img.onload = () => {
        content.drawImage(img, 0, 0, canvas.width, canvas.height);
        imgData = content.getImageData(0, 0, canvas.width, canvas.height).data;
        this.createPosition(); //创建点云
      };
    },
    createPosition() {
      for (var i = 0; i < 31 * 31; i++) {
        random_position.push([
          Math.floor(Math.random() * 300 - 150),
          Math.floor(Math.random() * 300 - 150),
          Math.floor(Math.random() * 300 - 150)
        ]);
      }
      var color = new Array(310).fill("").map(d => []);
      for (var i = 0; i < 310; i++) {
        for (var j = 0; j < 310; j++) {
          let clr =
            imgData[(i * 310 + j) * 4] +
            imgData[(i * 310 + j) * 4 + 1] +
            imgData[(i * 310 + j) * 4 + 2];
          clr = clr > 382 ? "light" : "black";
          color[i].push(clr);
        }
      }
      var color1 = [];
      color
        .filter((d, i) => (i + 6) % 10 == 0)
        .forEach(
          (dd, ii) => (color1[ii] = dd.filter((d, i) => (i + 6) % 10 == 0))
        );
      for (var i = 0; i < color1.length; i++) {
        for (var j = 0; j < color1[i].length; j++) {
          var geometry = new THREE.PlaneGeometry(10, 10);
          var material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: color1[i][j] == "black" ? 0 : 1
          });
          var mesh = new THREE.Mesh(geometry, material);
          origin_position.push([j * 10 - 15 * 10, 15 * 10 - i * 10, 0]);
          mesh.position.set(
            random_position[j + i * j][0],
            random_position[j + i * j][1],
            random_position[j + i * j][2]
          );
          mesh.name = "plane";
          group.add(mesh);
        }
      }
      scene.add(group);
      this.initTween();
    },
    initTween() {
      var pos = { time: 0 };
      tween1 = new TWEEN.Tween(pos).to({ time: 1 }, 3000);
      tween2 = new TWEEN.Tween(pos).to({ time: 0 }, 3000);
      tween1.easing(TWEEN.Easing.Quadratic.In);
      tween2.easing(TWEEN.Easing.Quadratic.Out);
      tween1.onUpdate(onUpdate);
      tween2.onUpdate(onUpdate);
      // tween1.onUpdate(function () {
      //     let time = this._object.time;
      //     group.children.forEach((d, i) => {
      //         d.position.set(time * origin_position[i][0] + (1 - time) * random_position[i][0], time * origin_position[i][1] + (1 - time) * random_position[i][1], (1 - time) * random_position[i][2]);
      //     })
      // });
      // tween2.onUpdate(function() {
      //     let time = this._object.time;
      //     group.children.forEach((d, i) => {
      //         d.position.set(time * origin_position[i][0] + (1 - time) * random_position[i][0], time * origin_position[i][1] + (1 - time) * random_position[i][1], (1 - time) * random_position[i][2]);
      //     })
      // });
      tween1.start();

      this.render();
      document.getElementById("loading").style.display = "none";
    },
    handle() {
      flag = !flag;
      if (flag) {
        tween1.start();
      } else {
        tween2.start();
      }
    },
    onUpdate() {
      console.log(this);
      let time = this.time;
      group.children.forEach((d, i) => {
        d.position.set(
          time * origin_position[i][0] + (1 - time) * random_position[i][0],
          time * origin_position[i][1] + (1 - time) * random_position[i][1],
          (1 - time) * random_position[i][2]
        );
      });
    },
    render() {
      stats.update();
      TWEEN.update();
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
  }
};
</script>

<style lang="less" scope>
#box {
  position: relative;
  .btn {
    position: absolute;
    bottom: 50px;
    left: 50%;
    color: #ffffff;
    padding: 6px 20px;
    text-align: center;
    display: inline-block;
    border: 1px solid #ffffff;
    cursor: pointer;
    margin-left: -34px;
  }
}
</style>
