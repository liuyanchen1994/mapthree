<template>
    <div ref="box" id="box">
        <div class="btn" @click="reset">点击重玩</div>
    </div>
</template>

<script>
import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import { FirstPersonControls } from "three/examples/jsm/controls/FirstPersonControls";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { MTLLader } from "three/examples/jsm/loaders/MTLLoader";
var renderer,
  scene,
  camera,
  geometry,
  light,
  directLight,
  stats,
  texture,
  controls,
  clock,
  scopeArr,
  scope,
  wallArr,
  boxGroup,
  boxArr,
  targetArr,
  currentPoint,
  prex,
  prez,
  mouse = new THREE.Vector2(),
  mouseX,
  mouseY,
  raycaster,
  manager;
wallArr = [
  [0, 0],
  [1, 0],
  [2, 0],
  [3, 0],
  [3, 1],
  [4, 1],
  [4, 2],
  [4, 3],
  [5, 3],
  [5, 4],
  [5, 5],
  [5, 6],
  [4, 6],
  [3, 6],
  [2, 6],
  [1, 6],
  [0, 6],
  [0, 5],
  [0, 4],
  [0, 3],
  [0, 2],
  [0, 1]
];
scopeArr = [
  [1, 1],
  [2, 1],
  [1, 2],
  [2, 2],
  [3, 2],
  [1, 3],
  [2, 3],
  [1, 4],
  [4, 4],
  [1, 5],
  [2, 5],
  [3, 5],
  [4, 5]
];
boxArr = [[3, 3], [2, 4], [3, 4]];
targetArr = [[2, 2], [1, 3], [2, 3]];
export default {
  name: "boxman",
  methods: {
    initStats() {
      stats = new Stats();
      stats.setMode(0);
      stats.domElement.style.position = "absolute";
      stats.domElement.style.left = "0px";
      stats.domElement.style.top = "0px";
      this.$refs.box.appendChild(stats.domElement);
    },
    initRenderer() {
      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0x000000);
      renderer.shadowMap.enabled = true;
      this.$refs.box.appendChild(renderer.domElement);
    },
    initManage() {
      manager = new THREE.LoadingManager();
      manager.onProgress = (url, itemsLoaded, itemsTotal) => {
        let num = Math.floor((itemsLoaded / itemsTotal) * 100);
        document.getElementById("loading-outer").style.width = num + "%";
        document.getElementById("progress").innerHTML = num;
        if (num == 100) {
          document.getElementById("loading").style.display = "none";
        }
      };
    },
    initScene() {
      scene = new THREE.Scene();
      scene.background = new THREE.CubeTextureLoader(manager)
        .setPath("/static/images/sky/")
        .load([
          "right.jpg",
          "left.jpg",
          "top.jpg",
          "bottom.jpg",
          "front.jpg",
          "back.jpg"
        ]);
      clock = new THREE.Clock();
    },
    initCamera() {
      if (camera) {
        scene.remove(camera);
      }
      camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        10000
      );
      camera.position.y = 60;
      camera.lookAt(0, 0, 0);
      scene.add(camera);
    },
    initControls() {
      controls = new FirstPersonControls(camera, renderer.domElement);
      controls.lookSpeed = 0.2; //鼠标移动查看的速度
      controls.movementSpeed = 50; //相机移动速度
      controls.noFly = true;
      controls.constrainVertical = true; //约束垂直
      controls.lookVertical = false;
      controls.verticalMin = 1.0;
      controls.verticalMax = 2.0;
      controls.lon = -100; //进入初始视角x轴的角度
      controls.lat = 0; //初始视角进入后y轴的角度
    },
    initLight() {
      light = new THREE.AmbientLight(0x666666);
      scene.add(light);
      directLight = new THREE.DirectionalLight(0xaaaaaa, 1);
      directLight.position.set(0, 40, 0);
      scene.add(directLight);
    },
    initBox() {
      var textureBox = new THREE.TextureLoader(manager).load(
        "/static/images/base/crate.png"
      );
      if (boxGroup) {
        scene.remove(boxGroup);
      }
      boxGroup = new THREE.Group();
      boxGroup.name = "box_group";
      boxArr.forEach(d => {
        var boxGeom = new THREE.BoxGeometry(40, 40, 40);
        var boxMate = [];
        boxGeom.faces.forEach(d =>
          boxMate.push(new THREE.MeshBasicMaterial({ map: textureBox }))
        );
        var boxMesh = new THREE.Mesh(boxGeom, boxMate);
        boxMesh.position.set(d[0] * 40 - 20, 20, d[1] * 40 - 20);
        boxMesh.name = "box";
        boxGroup.add(boxMesh);
      });
      scene.add(boxGroup);
      //判断是否赢得比赛
      this.isWinner(boxArr, targetArr);
    },
    initGround() {
      var textureGround = new THREE.TextureLoader(manager).load(
        "/static/images/wall/plaster.jpg"
      );
      var textureGroundNormal = new THREE.TextureLoader(manager).load(
        "/static/images/wall/plaster-normal.jpg"
      );
      var textureGroundSpecular = new THREE.TextureLoader(manager).load(
        "/static/images/wall/plaster-diffuse.jpg"
      );
      textureGround.wrapS = textureGround.wrapT = THREE.RepeatWrapping;
      textureGround.repeat.set(50, 50);
      textureGroundNormal.wrapS = textureGroundNormal.wrapT =
        THREE.RepeatWrapping;
      textureGroundNormal.repeat.set(50, 50);
      var materialGround = new THREE.MeshPhongMaterial({
        map: textureGround
      });
      materialGround.normalMap = textureGroundNormal;
      materialGround.specularMap = textureGroundSpecular;
      var ground = new THREE.Mesh(
        new THREE.PlaneGeometry(1000, 1000, 1, 1),
        materialGround
      );
      ground.rotation.x = -Math.PI / 2;
      scene.add(ground);
    },
    initWall() {
      var normal = new THREE.TextureLoader(manager).load(
        "/static/images/wall/stone.jpg"
      );
      var bump = new THREE.TextureLoader(manager).load(
        "/static/images/wall/stone-bump.jpg"
      );
      wallArr.forEach(d => {
        var wallBox = new THREE.BoxGeometry(40, 40, 40);
        var material = new THREE.MeshPhongMaterial({
          map: normal,
          bumpMap: bump,
          bumpScale: 1
        });
        var wall = new THREE.Mesh(wallBox, material);
        wall.position.x = d[0] * 40 - 20;
        wall.position.y = 20;
        wall.position.z = d[1] * 40 - 20;
        scene.add(wall);
      });
    },
    initTarget() {
      let objLoader = new OBJLoader(manager);
      objLoader.setPath("/static/images/texture/hongqi/");
      objLoader.load("hongqi.obj", object => {
        let hongqi = object.children[0];
        targetArr.forEach(d => {
          hongqi.position.set(d[0] * 40 - 20, -50, d[1] * 40 - 20);
          hongqi.scale.set(0.12, 0.12, 0.12);
          hongqi.material = new THREE.MeshNormalMaterial({
            side: THREE.DoubleSide
          });
          scene.add(hongqi.clone());
        });
      });
    },
    initScope() {
      scope = [];
      scopeArr.forEach(d => {
        scope.push([d[0] * 40 - 40, d[1] * 40 - 40, d[0] * 40, d[1] * 40]);
      });
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
        if (scene.children && scene.getObjectByName("box")) {
          raycaster.setFromCamera(mouse, camera);
          let intersects = raycaster.intersectObjects(
            scene.getObjectByName("box_group").children
          );
          if (intersects[0] && intersects[0].object.name == "box") {
            this.computeMove(intersects[0].object, camera.position);
          }
        }
      });
    },
    computeMove(obj, pos) {
      let camx = Math.floor(pos.x / 40 + 1);
      let camz = Math.floor(pos.z / 40 + 1);
      let tarx = (obj.position.x + 20) / 40;
      let tarz = (obj.position.z + 20) / 40;
      if (camx == tarx) {
        if (tarz > camz) {
          let res = wallArr.concat(boxArr).some(d => {
            return d[0] == tarx && d[1] == tarz + 1;
          });
          if (!res) {
            obj.position.z += 40;
            boxArr = boxArr.map(d => {
              if (d[0] == tarx && d[1] == tarz) {
                return [tarx, tarz + 1];
              } else {
                return d;
              }
            });
            scopeArr = scopeArr.map(d => {
              if (d[0] == tarx && d[1] == tarz + 1) {
                return [tarx, tarz];
              } else {
                return d;
              }
            });
            this.initBox();
            this.initScope();
          }
        } else {
          let res = wallArr.concat(boxArr).some(d => {
            return d[0] == tarx && d[1] == tarz - 1;
          });
          if (!res) {
            obj.position.z -= 40;
            boxArr = boxArr.map(d => {
              if (d[0] == tarx && d[1] == tarz) {
                return [tarx, tarz - 1];
              } else {
                return d;
              }
            });
            scopeArr = scopeArr.map(d => {
              if (d[0] == tarx && d[1] == tarz - 1) {
                return [tarx, tarz];
              } else {
                return d;
              }
            });
            this.initBox();
            this.initScope();
          }
        }
      }
      if (camz == tarz) {
        if (tarx > camx) {
          let res = wallArr.concat(boxArr).some(d => {
            return d[0] == tarx + 1 && d[1] == tarz;
          });
          if (!res) {
            obj.position.x += 40;
            boxArr = boxArr.map(d => {
              if (d[0] == tarx && d[1] == tarz) {
                return [tarx + 1, tarz];
              } else {
                return d;
              }
            });
            scopeArr = scopeArr.map(d => {
              if (d[0] == tarx + 1 && d[1] == tarz) {
                return [tarx, tarz];
              } else {
                return d;
              }
            });
            this.initBox();
            this.initScope();
          }
        } else {
          let res = wallArr.concat(boxArr).some(d => {
            return d[0] == tarx - 1 && d[1] == tarz;
          });
          if (!res) {
            obj.position.x -= 40;
            boxArr = boxArr.map(d => {
              if (d[0] == tarx && d[1] == tarz) {
                return [tarx - 1, tarz];
              } else {
                return d;
              }
            });
            scopeArr = scopeArr.map(d => {
              if (d[0] == tarx - 1 && d[1] == tarz) {
                return [tarx, tarz];
              } else {
                return d;
              }
            });
            this.initBox();
            this.initScope();
          }
        }
      }
    },
    isWinner(arr1, arr2) {
      let boo = true; //true为赢
      arr1.forEach(d => {
        let res = arr2.some(dd => {
          return d[0] == dd[0] && d[1] == dd[1];
        });
        if (!res) {
          boo = false;
        }
      });
      if (boo) {
        setTimeout(() => {
          alert("恭喜你赢了！");
        }, 100);
      }
    },
    reset() {
      wallArr = [
        [0, 0],
        [1, 0],
        [2, 0],
        [3, 0],
        [3, 1],
        [4, 1],
        [4, 2],
        [4, 3],
        [5, 3],
        [5, 4],
        [5, 5],
        [5, 6],
        [4, 6],
        [3, 6],
        [2, 6],
        [1, 6],
        [0, 6],
        [0, 5],
        [0, 4],
        [0, 3],
        [0, 2],
        [0, 1]
      ];

      scopeArr = [
        [1, 1],
        [2, 1],
        [1, 2],
        [2, 2],
        [3, 2],
        [1, 3],
        [2, 3],
        [1, 4],
        [4, 4],
        [1, 5],
        [2, 5],
        [3, 5],
        [4, 5]
      ];

      boxArr = [[3, 3], [2, 4], [3, 4]];

      targetArr = [[2, 2], [1, 3], [2, 3]];

      this.initCamera();
      this.initControls();
      this.initBox();
    },
    render() {
      stats.update();

      controls.update(clock.getDelta());
      camera.position.y = 60;

      let flag = false;
      let x = camera.position.x;
      let z = camera.position.z;
      if (!x || !z) {
        x = 20;
        z = 60;
      }
      for (var i = 0; i < scope.length; i++) {
        if (
          x > scope[i][0] &&
          x < scope[i][2] &&
          z > scope[i][1] &&
          z < scope[i][3]
        ) {
          flag = true;
        }
      }
      if (flag) {
        camera.position.x = x;
        camera.position.z = z;
        prex = x;
        prez = z;
      } else {
        camera.position.x = prex;
        camera.position.z = prez;
      }

      renderer.render(scene, camera);
      this.globalID = requestAnimationFrame(this.render);
    }
  },
  mounted() {
    this.initStats();
    this.initRenderer();
    this.initManage();
    this.initScene();
    this.initCamera();
    this.initControls();
    this.initLight();
    this.initBox();
    this.initGround();
    this.initWall();
    this.initTarget();
    this.initScope();
    this.initEventListener();
    this.render();
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
    manager = null;
    cancelAnimationFrame(this.globalID);
  }
};
</script>

<style lang="less" scope>
#box {
  position: relative;
  .btn {
    position: absolute;
    right: 20px;
    top: 20px;
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
