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
var state = { animateBones: false };
/**
 * 骨骼
 */
export default {
  name: "bone-official",
  methods: {
    initScene() {
      gui = new GUI();

      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x444444);

      scene.add(new THREE.AxesHelper(20));

      camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        200
      );
      camera.position.z = 30;
      camera.position.y = 30;

      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      this.$refs.box.appendChild(renderer.domElement);

      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableZoom = false;

      lights = [];
      lights[0] = new THREE.PointLight(0xffffff, 1, 0);
      lights[1] = new THREE.PointLight(0xffffff, 1, 0);
      lights[2] = new THREE.PointLight(0xffffff, 1, 0);

      lights[0].position.set(0, 200, 0);
      lights[1].position.set(100, 200, 100);
      lights[2].position.set(-100, -200, -100);

      scene.add(lights[0]);
      scene.add(lights[1]);
      scene.add(lights[2]);

      this.initBones();
      this.setupDatGui();
    },
    initBones() {
      var segmentHeight = 8;
      var segmentCount = 4;
      var height = segmentHeight * segmentCount;
      var halfHeight = height * 0.5;

      var sizing = {
        segmentHeight: segmentHeight,
        segmentCount: segmentCount,
        height: height,
        halfHeight: halfHeight
      };

      var geometry = this.createGeometry(sizing);
      var bones = this.createBones(sizing);
      mesh = this.createMesh(geometry, bones);

      mesh.scale.multiplyScalar(1);
      scene.add(mesh);

      this.render();
      document.getElementById("loading").style.display = "none";
    },
    createGeometry(sizing) {
      var geometry = new THREE.CylinderBufferGeometry(
        5, // radiusTop
        5, // radiusBottom
        sizing.height, // height
        8, // radiusSegments
        sizing.segmentCount * 3, // heightSegments
        true // openEnded
      );

      var position = geometry.attributes.position;

      var vertex = new THREE.Vector3();

      var skinIndices = [];
      var skinWeights = [];

      for (var i = 0; i < position.count; i++) {
        vertex.fromBufferAttribute(position, i);

        var y = vertex.y + sizing.halfHeight;

        var skinIndex = Math.floor(y / sizing.segmentHeight);
        var skinWeight = (y % sizing.segmentHeight) / sizing.segmentHeight;

        skinIndices.push(skinIndex, skinIndex + 1, 0, 0);
        skinWeights.push(1 - skinWeight, skinWeight, 0, 0);
      }

      geometry.setAttribute(
        "skinIndex",
        new THREE.Uint16BufferAttribute(skinIndices, 4)
      );
      geometry.setAttribute(
        "skinWeight",
        new THREE.Float32BufferAttribute(skinWeights, 4)
      );

      return geometry;
    },
    createBones(sizing) {
      bones = [];

      var prevBone = new THREE.Bone();
      bones.push(prevBone);
      prevBone.position.y = -sizing.halfHeight;

      for (var i = 0; i < sizing.segmentCount; i++) {
        var bone = new THREE.Bone();
        bone.position.y = sizing.segmentHeight;
        bones.push(bone);
        prevBone.add(bone);
        prevBone = bone;
      }
      console.log(bones);
      return bones;
    },
    createMesh(geometry, bones) {
      var material = new THREE.MeshPhongMaterial({
        skinning: true,
        color: 0x156289,
        emissive: 0x072534,
        side: THREE.DoubleSide,
        flatShading: true
      });

      var mesh = new THREE.SkinnedMesh(geometry, material);
      var skeleton = new THREE.Skeleton(bones);

      mesh.add(bones[0]);

      mesh.bind(skeleton);

      skeletonHelper = new THREE.SkeletonHelper(mesh);
      skeletonHelper.material.linewidth = 2;
      scene.add(skeletonHelper);

      return mesh;
    },
    setupDatGui() {
      var folder = gui.addFolder("General Options");

      folder.add(state, "animateBones");
      folder.__controllers[0].name("Animate Bones");

      folder.add(mesh, "pose");
      folder.__controllers[1].name(".pose()");

      var bones = mesh.skeleton.bones;

      for (var i = 0; i < bones.length; i++) {
        var bone = bones[i];

        folder = gui.addFolder("Bone " + i);

        folder.add(
          bone.position,
          "x",
          -10 + bone.position.x,
          10 + bone.position.x
        );
        folder.add(
          bone.position,
          "y",
          -10 + bone.position.y,
          10 + bone.position.y
        );
        folder.add(
          bone.position,
          "z",
          -10 + bone.position.z,
          10 + bone.position.z
        );

        folder.add(bone.rotation, "x", -Math.PI * 0.5, Math.PI * 0.5);
        folder.add(bone.rotation, "y", -Math.PI * 0.5, Math.PI * 0.5);
        folder.add(bone.rotation, "z", -Math.PI * 0.5, Math.PI * 0.5);

        folder.add(bone.scale, "x", 0, 2);
        folder.add(bone.scale, "y", 0, 2);
        folder.add(bone.scale, "z", 0, 2);

        folder.__controllers[0].name("position.x");
        folder.__controllers[1].name("position.y");
        folder.__controllers[2].name("position.z");

        folder.__controllers[3].name("rotation.x");
        folder.__controllers[4].name("rotation.y");
        folder.__controllers[5].name("rotation.z");

        folder.__controllers[6].name("scale.x");
        folder.__controllers[7].name("scale.y");
        folder.__controllers[8].name("scale.z");
      }
    },
    render() {
      var time = Date.now() * 0.001;

      //Wiggle the bones
      if (state.animateBones) {
        for (var i = 0; i < mesh.skeleton.bones.length; i++) {
          mesh.skeleton.bones[i].rotation.z =
            (Math.sin(time) * 2) / mesh.skeleton.bones.length;
        }
      }
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
    state = { animateBones: false };
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
