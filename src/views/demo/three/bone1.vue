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
var gui, scene, camera, renderer, controls, lights, mesh, bones, skeletonHelper;
export default {
  name: "bone1",
  methods: {
    initScene() {
      gui = new GUI();

      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x444444);

      // scene.add(new THREE.AxesHelper(12))
      scene.add(new THREE.GridHelper(200, 100));

      camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      camera.position.set(70, 30, 0);

      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      this.$refs.box.appendChild(renderer.domElement);

      controls = new OrbitControls(camera, renderer.domElement);
      controls.target = new THREE.Vector3(0, 10, 0);
      camera.lookAt(new THREE.Vector3(0, 10, 0));
      // controls.enableZoom = false;

      lights = [];
      lights[0] = new THREE.PointLight(0xffffff, 1, 0);
      lights[1] = new THREE.PointLight(0xffffff, 1, 0);
      lights[2] = new THREE.PointLight(0xffffff, 1, 0);

      lights[0].position.set(0, 100, 0);
      lights[1].position.set(100, 100, 100);
      lights[2].position.set(-100, -100, -100);

      scene.add(lights[0]);
      scene.add(lights[1]);
      scene.add(lights[2]);

      this.initBones();
      this.setupDatGui();
    },
    initBones() {
      let head = new THREE.SphereGeometry(3, 60, 40);
      let eye_l = new THREE.BoxGeometry(2, 1, 1);
      let eye_r = new THREE.BoxGeometry(2, 1, 1);
      let mouth = new THREE.BoxGeometry(2, 0.4, 1);
      head.merge(eye_l, new THREE.Matrix4().makeTranslation(2, 1, 1));
      head.merge(eye_r, new THREE.Matrix4().makeTranslation(2, 1, -1));
      head.merge(mouth, new THREE.Matrix4().makeTranslation(2, -1, 0));

      let body = new THREE.BoxGeometry(5, 10, 8, 1, 20, 1);
      let leg_l = new THREE.CylinderGeometry(2, 2, 14, 8, 14);
      let leg_r = new THREE.CylinderGeometry(2, 2, 14, 8, 14);
      let arm_l = new THREE.CylinderGeometry(1, 1, 12, 8, 11);
      let arm_r = new THREE.CylinderGeometry(1, 1, 12, 8, 11);
      let human = body.clone();

      human.merge(head, new THREE.Matrix4().makeTranslation(0, 8, 0));
      human.merge(leg_l, new THREE.Matrix4().makeTranslation(0, -12, 2.1));
      human.merge(leg_r, new THREE.Matrix4().makeTranslation(0, -12, -2.1));
      human.merge(arm_l, new THREE.Matrix4().makeTranslation(0, -1, 5.3));
      human.merge(arm_r, new THREE.Matrix4().makeTranslation(0, -1, -5.3));

      human = new THREE.BufferGeometry().fromGeometry(human);

      // let material = new THREE.MeshNormalMaterial({wireframe: true});
      // scene.add(new THREE.Mesh(human, material));

      var skinIndices = [];
      var skinWeights = [];
      let position = human.attributes.position;
      var vertex = new THREE.Vector3();

      for (let i = 0; i < position.count; i++) {
        vertex.fromBufferAttribute(position, i);
        if (vertex.z > 4.3 && vertex.y >= 0) {
          skinIndices.push(9, 0, 0, 0);
          skinWeights.push(1, 0, 0, 0);
        } else if (vertex.z < -4.3 && vertex.y >= 0) {
          skinIndices.push(10, 0, 0, 0);
          skinWeights.push(1, 0, 0, 0);
        } else if (vertex.z > 4.3 && vertex.y < 0) {
          skinIndices.push(11, 0, 0, 0);
          skinWeights.push(1, 0, 0, 0);
        } else if (vertex.z < -4.3 && vertex.y < 0) {
          skinIndices.push(12, 0, 0, 0);
          skinWeights.push(1, 0, 0, 0);
        } else if (vertex.y <= 5 && vertex.y >= -5) {
          let w = (vertex.y + 5) / 10;
          skinIndices.push(0, 2, 0, 0);
          skinWeights.push(Math.sqrt(w), 1 - Math.sqrt(w), 0, 0);
        } else if (vertex.y > 5) {
          skinIndices.push(1, 0, 0, 0);
          skinWeights.push(1, 0, 0, 0);
        } else if (vertex.y < -5 && vertex.y >= -12 && vertex.z > 0) {
          skinIndices.push(3, 0, 0, 0);
          skinWeights.push(1, 0, 0, 0);
        } else if (vertex.y < -12 && vertex.z > 0) {
          skinIndices.push(5, 0, 0, 0);
          skinWeights.push(1, 0, 0, 0);
        } else if (vertex.y < -5 && vertex.y >= -12 && vertex.z < 0) {
          skinIndices.push(4, 0, 0, 0);
          skinWeights.push(1, 0, 0, 0);
        } else {
          skinIndices.push(6, 0, 0, 0);
          skinWeights.push(1, 0, 0, 0);
        }
      }

      human.setAttribute(
        "skinIndex",
        new THREE.Uint16BufferAttribute(skinIndices, 4)
      );
      human.setAttribute(
        "skinWeight",
        new THREE.Float32BufferAttribute(skinWeights, 4)
      );

      let bones = [];
      let bone1 = new THREE.Bone(); //胸
      bone1.position.y = 5;
      let bone2 = new THREE.Bone(); //头
      bone2.position.y = 3;
      let bone3 = new THREE.Bone(); //尾椎
      bone3.position.y = -10;

      let bone4 = new THREE.Bone(); //左腿上
      bone4.position.y = -0.1;
      bone4.position.z = 2.1;
      let bone5 = new THREE.Bone(); //右腿上
      bone5.position.y = -0.1;
      bone5.position.z = -2.1;
      let bone6 = new THREE.Bone(); //左腿中
      bone6.position.y = -7;
      let bone7 = new THREE.Bone(); //右腿中
      bone7.position.y = -7;
      let bone8 = new THREE.Bone(); //左腿下
      bone8.position.y = -7;
      let bone9 = new THREE.Bone(); //右腿下
      bone9.position.y = -7;

      let bone10 = new THREE.Bone(); //左臂上
      bone10.position.z = 5.3;
      let bone11 = new THREE.Bone(); //右臂上
      bone11.position.z = -5.3;
      let bone12 = new THREE.Bone(); //左臂中
      bone12.position.y = -6;
      let bone13 = new THREE.Bone(); //右臂中
      bone13.position.y = -6;
      let bone14 = new THREE.Bone(); //左臂下
      bone14.position.y = -6;
      let bone15 = new THREE.Bone(); //右臂下
      bone15.position.y = -6;

      bone1.add(bone2);

      bone1.add(bone3);
      bone3.add(bone4);
      bone3.add(bone5);
      bone4.add(bone6);
      bone5.add(bone7);
      bone6.add(bone8);
      bone7.add(bone9);

      bone1.add(bone10);
      bone1.add(bone11);
      bone10.add(bone12);
      bone11.add(bone13);
      bone12.add(bone14);
      bone13.add(bone15);

      bones.push(bone1);
      bones.push(bone2);
      bones.push(bone3);
      bones.push(bone4);
      bones.push(bone5);
      bones.push(bone6);
      bones.push(bone7);
      bones.push(bone8);
      bones.push(bone9);
      bones.push(bone10);
      bones.push(bone11);
      bones.push(bone12);
      bones.push(bone13);
      bones.push(bone14);
      bones.push(bone15);

      let material = new THREE.MeshPhongMaterial({
        skinning: true,
        color: 0x156289,
        emissive: 0x072534,
        side: THREE.DoubleSide,
        flatShading: true
        // wireframe: true,
      });

      mesh = new THREE.SkinnedMesh(human, material);
      let skeleton = new THREE.Skeleton(bones);

      mesh.add(bones[0]);
      mesh.bind(skeleton);
      mesh.position.y = 19;

      skeletonHelper = new THREE.SkeletonHelper(mesh);
      skeletonHelper.material.linewidth = 1;
      // scene.add( skeletonHelper );

      scene.add(mesh);

      this.render();
      // document.getElementById("loading").style.display = "none";
    },
    setupDatGui() {
      var bones = mesh.skeleton.bones;

      gui.add(mesh, "pose");

      gui.add(
        bones[0].rotation,
        "y",
        bones[0].rotation.y - Math.PI / 4,
        bones[0].rotation.y + Math.PI / 4
      );
      gui.add(
        bones[0].rotation,
        "z",
        bones[0].rotation.z - Math.PI / 2,
        bones[0].rotation.z
      );
      gui.add(
        bones[0].position,
        "y",
        bones[0].position.y - 21.5,
        bones[0].position.y
      );

      gui.add(
        bones[1].rotation,
        "y",
        bones[1].rotation.y - Math.PI / 4,
        bones[1].rotation.y + Math.PI / 4
      );
      gui.add(
        bones[1].rotation,
        "z",
        bones[1].rotation.z - Math.PI / 6,
        bones[1].rotation.z + Math.PI / 6
      );

      gui.add(
        bones[2].rotation,
        "y",
        bones[2].rotation.y - Math.PI / 6,
        bones[2].rotation.y + Math.PI / 6
      );

      gui.add(
        bones[3].rotation,
        "z",
        bones[3].rotation.z - Math.PI / 3,
        bones[3].rotation.z + Math.PI / 3
      );
      gui.add(
        bones[4].rotation,
        "z",
        bones[4].rotation.z - Math.PI / 3,
        bones[4].rotation.z + Math.PI / 3
      );
      gui.add(
        bones[5].rotation,
        "z",
        bones[5].rotation.z - Math.PI / 3,
        bones[5].rotation.z
      );
      gui.add(
        bones[6].rotation,
        "z",
        bones[6].rotation.z - Math.PI / 3,
        bones[6].rotation.z
      );

      gui.add(
        bones[9].rotation,
        "x",
        bones[9].rotation.x - Math.PI,
        bones[9].rotation.x
      );
      gui.add(
        bones[9].rotation,
        "y",
        bones[9].rotation.y - Math.PI / 2,
        bones[9].rotation.y + Math.PI / 4
      );
      gui.add(
        bones[9].rotation,
        "z",
        bones[9].rotation.z - Math.PI / 3,
        bones[9].rotation.z + Math.PI
      );

      gui.add(
        bones[10].rotation,
        "x",
        bones[10].rotation.x,
        bones[10].rotation.x + Math.PI
      );
      gui.add(
        bones[10].rotation,
        "y",
        bones[10].rotation.y - Math.PI / 4,
        bones[10].rotation.y + Math.PI / 2
      );
      gui.add(
        bones[10].rotation,
        "z",
        bones[10].rotation.z - Math.PI / 3,
        bones[10].rotation.z + Math.PI
      );

      gui.add(
        bones[11].rotation,
        "z",
        bones[11].rotation.z,
        bones[11].rotation.z + (Math.PI / 4) * 3
      );
      gui.add(
        bones[12].rotation,
        "z",
        bones[12].rotation.z,
        bones[12].rotation.z + (Math.PI / 4) * 3
      );

      gui.__controllers[0].name("重置身体");
      gui.__controllers[1].name("身体-旋转");
      gui.__controllers[2].name("身体-前趴");
      gui.__controllers[3].name("身体-下移");

      gui.__controllers[4].name("头-左右转");
      gui.__controllers[5].name("头-上下转");

      gui.__controllers[6].name("腰-扭动");

      gui.__controllers[7].name("左大腿");
      gui.__controllers[8].name("右大腿");
      gui.__controllers[9].name("左小腿");
      gui.__controllers[10].name("右小腿");

      gui.__controllers[11].name("左大臂-侧平举");
      gui.__controllers[12].name("左大臂-内旋");
      gui.__controllers[13].name("左大臂-前平举");

      gui.__controllers[14].name("右大臂-侧平举");
      gui.__controllers[15].name("右大臂-内旋");
      gui.__controllers[16].name("右大臂-前平举");

      gui.__controllers[17].name("左小臂");
      gui.__controllers[18].name("右小臂");
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
    lights = null;
    mesh = null;
    bones = null;
    skeletonHelper = null;
    cancelAnimationFrame(this.globalID);
    document
      .getElementsByClassName("ac")[0]
      .removeChild(document.getElementsByClassName("main")[0]);
  }
};
</script>

<style lang="less" scope>
#box {
}
</style>
