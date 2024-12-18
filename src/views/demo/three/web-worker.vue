<template>
    <div ref="box" id="box">
        <!-- <div id="btn" @click="click">切换</div> -->
    </div>
</template>

<script>
import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { ConvexGeometry } from "three/examples/jsm/geometries/ConvexGeometry";
import { GUI } from "three/examples/jsm/libs/dat.gui.module";
let camera, scene, renderer;
let controls,
  font,
  stats,
  gui,
  time = 0,
  params = { visible: true },
  blob;
let group = new THREE.Group();
let num = 1000;
let positions = [];
let geom = [
  new THREE.SphereBufferGeometry(10, 8, 6),
  new THREE.BoxBufferGeometry(14, 14, 14),
  new THREE.CylinderBufferGeometry(9, 9, 14)
];
var myWorker;

export default {
  name: "web-worker",
  data() {
    return {
      canHandle: true
    };
  },
  methods: {
    initScene() {
      var task = `
                onmessage = function(e) {
                    let num = 1000;
                    let positions = e.data;
                    setInterval(e => {
                        for(let i=0; i<num; i++) {
                            let angle = positions[i].y / (1000 / (Math.PI * 10));
                            positions[i].x = positions[i].x + Math.sin(angle);
                            positions[i].z = positions[i].z + Math.cos(angle);
                            positions[i].y = positions[i].y + 1;
                            for(let j=1, total=1; j<=100000; j++) {
                                total += j;
                            }
                            if(positions[i].y > 500) {
                                positions[i].y = positions[i].y - 1000;
                            }
                        }
                        postMessage(positions);
                    }, 1000 / 60)
                };
            `;
      blob = new Blob([task]);
      myWorker = new Worker(window.URL.createObjectURL(blob));

      // myWorker = new Worker('/static/js/worker.js');

      stats = new Stats();
      this.$refs.box.appendChild(stats.dom);

      camera = new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        0.1,
        10000
      );
      camera.position.z = 1200;

      scene = new THREE.Scene();
      scene.add(new THREE.AmbientLight(0x888888));

      let pointLight = new THREE.PointLight(0xffffff);
      scene.add(pointLight);
      let pointLight2 = pointLight.clone();
      pointLight2.position.set(0, 0, 600);
      scene.add(pointLight2);

      renderer = new THREE.WebGLRenderer();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0x222222);
      this.$refs.box.appendChild(renderer.domElement);

      controls = new OrbitControls(camera, renderer.domElement);
      let color = new THREE.Color();

      for (let i = 0; i < num; i++) {
        let geometry = geom[(Math.random() * 3) | 0];
        color.setHSL(Math.random(), 1.0, 0.5);
        let material = new THREE.MeshPhysicalMaterial({ color: color });
        let mesh = new THREE.Mesh(geometry, material);
        let x = Math.random() * 1000 - 500;
        let y = Math.random() * 1000 - 500;
        let z = Math.random() * 1000 - 500;
        positions.push(new THREE.Vector3(x, y, z));
        mesh.position.copy(new THREE.Vector3(x, y, z));
        group.add(mesh);
      }

      scene.add(group);
      this.initGui();

      myWorker.postMessage(positions);
      myWorker.onmessage = e => {
        let positions = e.data;
        for (var i = 0; i < num; i++) {
          group.children[i].position.set(
            positions[i].x,
            positions[i].y,
            positions[i].z
          );
        }
        renderer.render(scene, camera);
      };

      this.render();
      document.getElementById("loading-outer").style.width = "100%";
      document.getElementById("progress").innerHTML = 100;
      document.getElementById("loading").style.display = "none";
    },
    initGui() {
      gui = new GUI();
      gui.add(params, "visible").onChange(e => {
        if (e) {
          myWorker = new Worker(window.URL.createObjectURL(blob));
          // myWorker = new Worker('/static/js/worker.js');
          myWorker.postMessage(positions);
          myWorker.onmessage = e => {
            let positions = e.data;
            for (var i = 0; i < num; i++) {
              group.children[i].position.set(
                positions[i].x,
                positions[i].y,
                positions[i].z
              );
            }
            renderer.render(scene, camera);
          };
        } else {
          myWorker.terminate();
        }
      });
      gui.__controllers[0].name("Web Worker");
    },
    render() {
      if (!params.visible) {
        for (let i = 0; i < num; i++) {
          let angle = positions[i].y / (1000 / (Math.PI * 10));
          positions[i].x = positions[i].x + Math.sin(angle);
          positions[i].z = positions[i].z + Math.cos(angle);
          positions[i].y = positions[i].y + 1;
          for (let j = 1, total = 1; j <= 100000; j++) {
            total += j;
          }
          if (positions[i].y > 500) {
            positions[i].y = positions[i].y - 1000;
          }
        }
        for (var i = 0; i < num; i++) {
          group.children[i].position.set(
            positions[i].x,
            positions[i].y,
            positions[i].z
          );
        }
      }
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
    myWorker.terminate();
    document
      .getElementsByClassName("ac")[0]
      .removeChild(document.getElementsByClassName("main")[0]);
    cancelAnimationFrame(this.globalID);
  }
};
</script>

<style lang="less" scope>
#box {
  position: relative;
  #btn {
    position: absolute;
    width: 100px;
    height: 30px;
    line-height: 30px;
    margin-left: 50%;
    left: 0;
    bottom: 10px;
    background: #ffffff;
    text-align: center;
    cursor: pointer;
  }
}
</style>
