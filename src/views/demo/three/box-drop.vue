<template>
    <div ref="box" id="box">
        <!-- <div id="btn" @click="click">切换</div> -->
    </div>
</template>

<script>
import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import CANNON from "cannon";

var world,
  timeStep = 1 / 60,
  controls,
  stats,
  camera,
  scene,
  renderer,
  geometry,
  material;
var bodyGround; //bodyBox,
var ground; //box
var color = new THREE.Color();
var interval, timeout;

export default {
  name: "box掉落，碰撞，阴影...",
  data() {
    return {
      canHandle: true
    };
  },
  methods: {
    initThree() {
      scene = new THREE.Scene();

      camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        1,
        1000
      );
      camera.position.y = 30;
      camera.position.z = 20;
      camera.lookAt(0, 5, 0);
      scene.add(camera);

      scene.add(new THREE.AxesHelper(40));

      scene.add(new THREE.AmbientLight(0x888888));

      const light = new THREE.DirectionalLight(0xbbbbbb, 1);
      light.position.set(6, 30, 6);
      const distance = 20;
      light.castShadow = true;
      light.shadow.camera.left = -distance;
      light.shadow.camera.right = distance;
      light.shadow.camera.top = distance;
      light.shadow.camera.bottom = -distance;
      light.shadow.camera.near = 0;
      light.shadow.camera.far = 50;
      light.shadow.mapSize.width = light.shadow.mapSize.height = 2048;
      scene.add(light);

      scene.add(new THREE.DirectionalLightHelper(light));

      let texture = new THREE.TextureLoader().load(
        "/static/images/base/ground.png"
      );
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.copy(new THREE.Vector2(40, 40));

      let groundGeom = new THREE.BoxBufferGeometry(40, 0.2, 40);
      let groundMate = new THREE.MeshPhongMaterial({
        color: 0xdddddd,
        map: texture
      });
      ground = new THREE.Mesh(groundGeom, groundMate);
      ground.position.y = -0.1;
      ground.receiveShadow = true;
      scene.add(ground);

      geometry = new THREE.BoxGeometry(2, 2, 2);

      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.shadowMap.enabled = true;
      renderer.setClearColor(0xbfd1e5);

      controls = new OrbitControls(camera, renderer.domElement);

      this.$refs.box.appendChild(renderer.domElement);

      stats = new Stats();
      this.$refs.box.appendChild(stats.dom);

      this.initCannon();
      this.animation();
      interval = setInterval(() => {
        this.createBox();
      }, 100);

      // document.getElementById("loading-outer").style.width = "100%";
      // document.getElementById("progress").innerHTML = 100;
      // document.getElementById("loading").style.display = "none";
    },
    createBox() {
      let x = Math.random() * 10 - 5;
      let z = Math.random() * 10 - 5;
      let box = new THREE.Mesh(geometry, this.createRandomMaterial());
      box.position.set(x, 20, z);
      box.castShadow = true;
      box.receiveShadow = true;
      scene.add(box);

      let bodyBox = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(x, 20, z),
        shape: new CANNON.Box(new CANNON.Vec3(1, 1, 1)),
        material: new CANNON.Material({ friction: 0.1, restitution: 0 })
      });
      bodyBox.collisionResponse = 0.01;
      box.userData = bodyBox;
      world.addBody(bodyBox);

      setTimeout(() => {
        scene.remove(box);
        box.material.dispose();
        box.geometry.dispose();
        world.removeBody(bodyBox);
      }, 10000);
    },
    createRandomMaterial() {
      color.setHSL(Math.random(), 1.0, 0.5);
      return new THREE.MeshPhongMaterial({ color: color });
    },
    initCannon() {
      console.log(THREE);
      world = new CANNON.World();
      world.gravity.set(0, -9.8, 0);
      world.broadphase = new CANNON.NaiveBroadphase();
      world.solver.iterations = 10;

      bodyGround = new CANNON.Body({
        mass: 0,
        position: new CANNON.Vec3(0, -0.1, 0),
        shape: new CANNON.Box(new CANNON.Vec3(20, 0.1, 20)),
        material: new CANNON.Material({ friction: 0.05, restitution: 0 })
      });
      ground.userData = bodyGround;
      console.log("bodyGround", bodyGround);
      world.addBody(bodyGround);
    },
    animation() {
      this.globalID = requestAnimationFrame(this.animation);
      this.updatePhysics();
      this.render();
      stats.update();
    },
    render() {
      this.updatePhysics();
      renderer.render(scene, camera);
    },
    updatePhysics() {
      world.step(timeStep);
      scene.children.forEach(d => {
        if (d.isMesh == true) {
          d.position.copy(d.userData.position);
          d.quaternion.copy(d.userData.quaternion);
        }
      });
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
    camera = null;
    world = null;
    controls = null;
    bodyGround = null;
    ground = null;
    clearInterval(interval);
    // document
    //     .getElementsByClassName("ac")[0]
    //     .removeChild(document.getElementsByClassName("main")[0]);
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
