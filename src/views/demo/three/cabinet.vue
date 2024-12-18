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
import ThreeBSP from "./js/ThreeBSP";
var gui,
  scene,
  camera,
  renderer,
  controls,
  lights = [],
  object,
  res,
  doorGroup = new THREE.Group(),
  raycaster,
  mouse = new THREE.Vector2();
var doorArray = [
  [94, 10, -176, 196, false],
  [94, 10, -76, 196, false],
  [94, 10, 76, 196, false],
  [94, 10, 176, 196, false],
  [46, 15, 0, 186, false],
  [46, 60, 0, 147, false],

  [46, 21, 0, 105.5, true],
  [46, 10, 0, 89, true],
  [46, 10, 0, 78, true],
  [46, 20, 0, 62, true],
  [46, 20, 0, 41, true],
  [46, 20, 0, 20, true],

  [46, 40, -200, 170, true],
  [46, 10, -200, 144, true],
  [46, 10, -200, 133, true],
  [46, 10, -200, 122, true],
  [46, 10, -200, 111, true],
  [46, 10, -200, 100, true],
  [46, 10, -200, 89, true],
  [46, 10, -200, 78, true],
  [46, 20, -200, 62, true],
  [46, 20, -200, 41, true],
  [46, 20, -200, 20, true],

  [46, 40, -152, 170, true],
  [46, 10, -152, 144, true],
  [46, 10, -152, 133, true],
  [46, 10, -152, 122, true],
  [46, 10, -152, 111, true],
  [46, 10, -152, 100, true],
  [46, 10, -152, 89, true],
  [46, 10, -152, 78, true],
  [46, 20, -152, 62, true],
  [46, 20, -152, 41, true],
  [46, 20, -152, 20, true],

  [46, 40, -100, 170, true],
  [46, 10, -100, 144, true],
  [46, 10, -100, 133, true],
  [46, 10, -100, 122, true],
  [46, 10, -100, 111, true],
  [46, 10, -100, 100, true],
  [46, 10, -100, 89, true],
  [46, 10, -100, 78, true],
  [46, 20, -100, 62, true],
  [46, 20, -100, 41, true],
  [46, 20, -100, 20, true],

  [46, 40, -52, 170, true],
  [46, 10, -52, 144, true],
  [46, 10, -52, 133, true],
  [46, 10, -52, 122, true],
  [46, 10, -52, 111, true],
  [46, 10, -52, 100, true],
  [46, 10, -52, 89, true],
  [46, 10, -52, 78, true],
  [46, 20, -52, 62, true],
  [46, 20, -52, 41, true],
  [46, 20, -52, 20, true],

  [46, 40, 52, 170, true],
  [46, 10, 52, 144, true],
  [46, 10, 52, 133, true],
  [46, 10, 52, 122, true],
  [46, 10, 52, 111, true],
  [46, 10, 52, 100, true],
  [46, 10, 52, 89, true],
  [46, 10, 52, 78, true],
  [46, 20, 52, 62, true],
  [46, 20, 52, 41, true],
  [46, 20, 52, 20, true],

  [46, 40, 100, 170, true],
  [46, 10, 100, 144, true],
  [46, 10, 100, 133, true],
  [46, 10, 100, 122, true],
  [46, 10, 100, 111, true],
  [46, 10, 100, 100, true],
  [46, 10, 100, 89, true],
  [46, 10, 100, 78, true],
  [46, 20, 100, 62, true],
  [46, 20, 100, 41, true],
  [46, 20, 100, 20, true],

  [46, 40, 152, 170, true],
  [46, 10, 152, 144, true],
  [46, 10, 152, 133, true],
  [46, 10, 152, 122, true],
  [46, 10, 152, 111, true],
  [46, 10, 152, 100, true],
  [46, 10, 152, 89, true],
  [46, 10, 152, 78, true],
  [46, 20, 152, 62, true],
  [46, 20, 152, 41, true],
  [46, 20, 152, 20, true],

  [46, 40, 200, 170, true],
  [46, 10, 200, 144, true],
  [46, 10, 200, 133, true],
  [46, 10, 200, 122, true],
  [46, 10, 200, 111, true],
  [46, 10, 200, 100, true],
  [46, 10, 200, 89, true],
  [46, 10, 200, 78, true],
  [46, 20, 200, 62, true],
  [46, 20, 200, 41, true],
  [46, 20, 200, 20, true]
];
var doorStatus = new Array(100).fill("").map(() => false);
export default {
  name: "cabinet",
  methods: {
    initScene() {
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0xffffff);

      scene.add(new THREE.AxesHelper(300));

      camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        10000
      );
      camera.position.y = 150;
      camera.position.z = 300;

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.shadowMap.enabled = true;
      this.$refs.box.appendChild(renderer.domElement);

      controls = new OrbitControls(camera, renderer.domElement);
      controls.target = new THREE.Vector3(0, 103, 0);
      camera.lookAt(new THREE.Vector3(0, 103, 0));

      var ambientLight = new THREE.AmbientLight(0xcccccc);
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

      this.initContent();
    },
    initContent() {
      var texture = new THREE.TextureLoader().load(
        "/static/images/base/cabinet.jpg",
        () => {
          document.getElementById("loading-outer").style.width = "100%";
          document.getElementById("loading").style.display = "none";
        }
      );
      let pubMate = new THREE.MeshNormalMaterial();
      let frameGeom = new THREE.BoxGeometry(450, 200, 50);
      let frameMesh = new THREE.Mesh(frameGeom, pubMate);
      frameMesh.position.y = 106;

      let footShape = new THREE.Shape();
      footShape.moveTo(0, 2);
      footShape.lineTo(8, -2);
      footShape.lineTo(8, -4);
      footShape.lineTo(0, -4);
      footShape.lineTo(0, 0);
      footShape.lineTo(-12, 0);
      footShape.lineTo(-12, 2);
      footShape.lineTo(0, 2);

      let footExtrudeSettings = {
        steps: 5,
        depth: 450,
        bevelEnabled: false
      };
      let footGeom = new THREE.ExtrudeGeometry(footShape, footExtrudeSettings);
      let footMesh = new THREE.Mesh(footGeom, pubMate);
      let footMesh1 = footMesh.clone();
      footMesh1.rotation.y = -Math.PI / 2;
      footMesh1.position.x = 225;
      footMesh1.position.y = 4;
      footMesh1.position.z = 25;
      let footMesh2 = footMesh.clone();
      footMesh2.rotation.y = Math.PI / 2;
      footMesh2.position.x = -225;
      footMesh2.position.y = 4;
      footMesh2.position.z = -25;

      let headGeom = new THREE.BoxGeometry(450, 5, 20);
      let headMesh = new THREE.Mesh(headGeom, pubMate);
      headMesh.position.z = 23;
      headMesh.position.y = 206 - 2.5;

      let framebsp = new ThreeBSP(frameMesh);
      let foot1bsp = new ThreeBSP(footMesh1);
      let foot2bsp = new ThreeBSP(footMesh2);
      let headbsp = new ThreeBSP(headMesh);

      res = framebsp
        .union(foot1bsp)
        .union(foot2bsp)
        .union(headbsp);

      for (var i = 0; i < doorArray.length; i++) {
        let geom = new THREE.BoxGeometry(
          doorArray[i][0] - 1,
          doorArray[i][1] - 1,
          50
        );
        let mesh = new THREE.Mesh(geom, pubMate);
        mesh.position.set(doorArray[i][2], doorArray[i][3], 4);
        let meshbsp = new ThreeBSP(mesh);
        res = res.subtract(meshbsp);

        let doorGeom = new THREE.BoxGeometry(
          doorArray[i][0],
          doorArray[i][1],
          3
        );
        let doorMate1 = new THREE.MeshLambertMaterial({
          color: 0xffffff,
          map: texture
        });
        let doorMate2 = new THREE.MeshPhongMaterial({
          color: 0xeeeeee,
          specular: 0xeeeeee
        });
        let doorMesh = new THREE.Mesh(doorGeom, [
          doorMate2,
          doorMate2,
          doorMate2,
          doorMate2,
          doorMate1,
          doorMate2
        ]);
        let tempGroup = new THREE.Group();
        if (doorArray[i][4]) {
          tempGroup.name = "door-" + i;
        }
        doorMesh.position.set(doorArray[i][0] / 2, 0, 0);
        //-223 - 223   10 - 201
        let a0 = doorArray[i][0];
        let a1 = doorArray[i][1];
        let a2 = doorArray[i][2];
        let a3 = doorArray[i][3];

        let x1 = (a2 - a0 / 2 + 223) / 446;
        let x2 = (a2 + a0 / 2 + 223) / 446;
        let y1 = (a3 - a1 / 2 - 10) / 191;
        let y2 = (a3 + a1 / 2 - 10) / 191;

        doorMesh.geometry.faceVertexUvs[0][8] = [
          new THREE.Vector2(x1, y2),
          new THREE.Vector2(x1, y1),
          new THREE.Vector2(x2, y2)
        ];
        doorMesh.geometry.faceVertexUvs[0][9] = [
          new THREE.Vector2(x1, y1),
          new THREE.Vector2(x2, y1),
          new THREE.Vector2(x2, y2)
        ];

        tempGroup.position.set(
          doorArray[i][2] - doorArray[i][0] / 2,
          doorArray[i][3],
          26
        );
        tempGroup.add(doorMesh);
        doorGroup.add(tempGroup);
      }

      let cabinetGeom = res.toGeometry();
      let cabinetMate = new THREE.MeshPhongMaterial({
        color: 0xd8c513,
        specular: 0xd8c513,
        shininess: 10
      });
      let cabinetMesh = new THREE.Mesh(cabinetGeom, cabinetMate);
      cabinetMesh.position.y = 106;

      scene.add(cabinetMesh);

      scene.add(doorGroup);

      this.render();
    },
    initEventListener() {
      raycaster = new THREE.Raycaster();
      document.addEventListener(
        "mousemove",
        function(event) {
          event.preventDefault();
          mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
          mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        },
        false
      );
      document.addEventListener("click", () => {
        if (scene && doorGroup && doorGroup.children.length > 0) {
          raycaster.setFromCamera(mouse, camera);
          let intersectDoor = raycaster.intersectObjects(
            doorGroup.children,
            true
          );
          if (intersectDoor && intersectDoor[0]) {
            let arr = intersectDoor[0].object.parent.name.split("-");
            if (arr[0] == "door" && doorStatus[arr[1]]) {
              this.doAnimate(
                -Math.PI / 2,
                0,
                500,
                intersectDoor[0].object.parent,
                ["rotation", "y"]
              );
              doorStatus[arr[1]] = false;
            } else if (arr[0] == "door" && !doorStatus[arr[1]]) {
              this.doAnimate(
                0,
                -Math.PI / 2,
                500,
                intersectDoor[0].object.parent,
                ["rotation", "y"]
              );
              doorStatus[arr[1]] = true;
            }
          }
        }
      });
    },
    doAnimate(s, e, t, o, a) {
      //start end time object attribute
      let temp = s;
      let step = t / 20;
      let stepLen = (e - s) / step;
      let animationObj = setInterval(() => {
        temp += stepLen;
        if (stepLen > 0 && temp >= e) {
          o[a[0]][a[1]] = e;
          clearInterval(animationObj);
        } else if (stepLen < 0 && temp <= e) {
          o[a[0]][a[1]] = e;
          clearInterval(animationObj);
        } else {
          o[a[0]][a[1]] = temp;
        }
      }, 20);
    },
    render() {
      renderer.render(scene, camera);
      this.globalID = requestAnimationFrame(this.render);
    }
  },
  mounted() {
    this.initScene();
    this.initEventListener();
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

<style lang="less" scope>
</style>
