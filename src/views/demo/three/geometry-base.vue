<template>
    <div ref="box" id="box"></div>
</template>

<script>
import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { SceneUtils } from "three/examples/jsm/utils/SceneUtils";
// import json from "@/assets/fonts/helvetiker_regular.typeface.json";
export default {
  name: "geometry-base",
  data() {
    return {
      renderer: null,
      scene: null,
      camera: null,
      stats: null,
      controls: null,
      clock: null,
      container: null,
      width: 0,
      height: 0
    };
  },
  methods: {
    initThree() {
      this.container = this.$refs.box;
      this.width = this.container.clientWidth;
      this.height = this.container.clientHeight;
      this.renderer = new THREE.WebGLRenderer({ antialias: true });
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.setClearColor(0x000000);
      this.renderer.setSize(this.width, this.height);
      this.container.appendChild(this.renderer.domElement);

      this.stats = new Stats();
      this.stats.setMode(0);
      this.stats.domElement.style.position = "absolute";
      this.stats.domElement.style.left = "0";
      this.stats.domElement.style.top = "0";
      this.container.appendChild(this.stats.domElement);

      this.camera = new THREE.PerspectiveCamera(
        60,
        this.width / this.height,
        0.1,
        10000
      );
      this.camera.position.set(-15, 13, 30);

      this.scene = new THREE.Scene();

      var directionalLight = new THREE.DirectionalLight(0x666666);
      directionalLight.position.set(20, 40, -20);
      this.scene.add(directionalLight);

      var ambientLight = new THREE.AmbientLight(0xbbbbbb);
      this.scene.add(ambientLight);

      this.clock = new THREE.Clock();
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);

      var geom, mesh;
      //平面
      geom = new THREE.PlaneGeometry(4, 4);
      mesh = this.createMesh(geom);
      mesh.position.set(-16, 0, -12);
      mesh.name = "mesh";
      this.scene.add(mesh);
      //圆形
      geom = new THREE.CircleGeometry(2.5, 24, 0, Math.PI * 2);
      mesh = this.createMesh(geom);
      mesh.position.set(-8, 0, -12);
      mesh.name = "mesh";
      this.scene.add(mesh);
      //环形
      geom = new THREE.RingGeometry(1, 2.5, 24, 3, 0, Math.PI * 2);
      mesh = this.createMesh(geom);
      mesh.position.set(0, 0, -12);
      mesh.name = "mesh";
      this.scene.add(mesh);
      //自定义形状
      var shape = new THREE.Shape();
      shape.moveTo(0, 1.5);
      shape.bezierCurveTo(2, 3.5, 4, 1.5, 2, -0.5);
      shape.lineTo(0, -2.5);
      shape.lineTo(-2, -0.5);
      shape.bezierCurveTo(-4, 1.5, -2, 3.5, 0, 1.5);
      geom = new THREE.ShapeGeometry(shape);
      mesh = this.createMesh(geom);
      mesh.position.set(8, 0, -12);
      mesh.name = "mesh";
      this.scene.add(mesh);
      //立方体
      geom = new THREE.BoxGeometry(4, 4, 4, 2, 2, 2);
      mesh = this.createMesh(geom);
      mesh.position.set(16, 0, -12);
      mesh.name = "mesh";
      this.scene.add(mesh);
      //球体
      geom = new THREE.SphereGeometry(2, 24, 12, 0, Math.PI * 2);
      mesh = this.createMesh(geom);
      mesh.position.set(-16, 0, -4);
      mesh.name = "mesh";
      this.scene.add(mesh);
      //圆台
      geom = new THREE.CylinderGeometry(
        1.5,
        2,
        3.5,
        24,
        2,
        false,
        0,
        Math.PI * 2
      );
      mesh = this.createMesh(geom);
      mesh.position.set(-8, 0, -4);
      mesh.name = "mesh";
      this.scene.add(mesh);
      //圆锥
      geom = new THREE.ConeGeometry(2, 4, 24, 2, false, 0, Math.PI * 2);
      mesh = this.createMesh(geom);
      mesh.position.set(0, 0, -4);
      mesh.name = "mesh";
      this.scene.add(mesh);
      //圆环
      geom = new THREE.TorusGeometry(1.5, 0.6, 8, 30, Math.PI * 2);
      mesh = this.createMesh(geom);
      mesh.position.set(8, 0, -4);
      mesh.name = "mesh";
      this.scene.add(mesh);
      //文本几何体
      geom = new THREE.TextGeometry("js", {
        font: new THREE.Font(json),
        size: 3,
        height: 0.5,
        curveSegments: 10,
        bevelThickness: 0.2,
        bevelSize: 0.2,
        bevelEnabled: false,
        bevelSegments: 10
      });
      mesh = this.createMesh(geom);
      var group = new THREE.Group();
      group.add(mesh);
      var center = new THREE.Box3()
        .setFromObject(mesh)
        .getCenter(mesh.position)
        .negate();
      mesh.position.copy(center);
      group.position.set(16, 0, -4);
      group.name = "mesh";
      this.scene.add(group);
      //四面体
      geom = new THREE.TetrahedronGeometry(2.4);
      mesh = this.createMesh(geom);
      mesh.position.set(-16, 0, 4);
      mesh.name = "mesh";
      this.scene.add(mesh);
      //八面体
      geom = new THREE.OctahedronGeometry(2.2);
      mesh = this.createMesh(geom);
      mesh.position.set(-8, 0, 4);
      mesh.name = "mesh";
      this.scene.add(mesh);
      //十二面体
      geom = new THREE.DodecahedronGeometry(2);
      mesh = this.createMesh(geom);
      mesh.position.set(0, 0, 4);
      mesh.name = "mesh";
      this.scene.add(mesh);
      //二十面体
      geom = new THREE.IcosahedronGeometry(2);
      mesh = this.createMesh(geom);
      mesh.position.set(8, 0, 4);
      mesh.name = "mesh";
      this.scene.add(mesh);
      //圆环扭结几何体
      geom = new THREE.TorusKnotGeometry(1.4, 0.3);
      mesh = this.createMesh(geom);
      mesh.position.set(16, 0, 4);
      mesh.name = "mesh";
      this.scene.add(mesh);
      //多面几何体
      var verticesOfCube = [0, 1, 0, 1, -1, 0, 0, -1, 1, -1, -1, 0, 0, -1, -1];
      var indicesOfFaces = [
        1,
        0,
        2,
        2,
        0,
        3,
        3,
        0,
        4,
        4,
        0,
        1,
        1,
        2,
        3,
        3,
        2,
        4
      ];
      geom = new THREE.PolyhedronGeometry(verticesOfCube, indicesOfFaces, 2, 1);
      mesh = this.createMesh(geom);
      mesh.position.set(-16, 0, 12);
      mesh.name = "mesh";
      this.scene.add(mesh);
      //管道几何体
      var curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-1.5, -1.5, -1.5),
        new THREE.Vector3(-1.5, -1.5, 1.5),
        new THREE.Vector3(1.5, -1.5, 1.5),
        new THREE.Vector3(1.5, -1.5, -1.5),
        new THREE.Vector3(1.5, 1.5, -1.5),
        new THREE.Vector3(1.5, 1.5, 1.5),
        new THREE.Vector3(-1.5, 1.5, 1.5),
        new THREE.Vector3(-1.5, 1.5, -1.5),
        new THREE.Vector3(-1.5, -1.5, -1.5)
      ]);

      geom = new THREE.TubeGeometry(curve, 64, 0.3, 8, false);
      mesh = this.createMesh(geom);
      mesh.position.set(-8, 0, 12);
      mesh.name = "mesh";
      this.scene.add(mesh);
      //挤压几何体
      var shape = new THREE.Shape();
      shape.moveTo(0, 1.5);
      shape.bezierCurveTo(2, 3.5, 4, 1.5, 2, -0.5);
      shape.lineTo(0, -2.5);
      shape.lineTo(-2, -0.5);
      shape.bezierCurveTo(-4, 1.5, -2, 3.5, 0, 1.5);

      var extrudeSettings = {
        steps: 2,
        depth: 0.3,
        bevelEnabled: true,
        bevelThickness: 0.3,
        bevelSize: 0.5,
        bevelSegments: 2
      };
      geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      mesh = this.createMesh(geom);
      mesh.position.set(0, 0, 12);
      mesh.scale.set(0.7, 0.7, 0.7);
      mesh.name = "mesh";
      this.scene.add(mesh);
      //车削几何体
      var points = [];
      for (let i = 0; i < 41; i++) {
        points.push(
          new THREE.Vector2(
            Math.abs(Math.sin((Math.PI * i) / 10)) * 1.8,
            i * 0.1 - 2
          )
        );
      }
      geom = new THREE.LatheGeometry(points, 30);
      mesh = this.createMesh(geom);
      mesh.position.set(8, 0, 12);
      mesh.name = "mesh";
      this.scene.add(mesh);
      //参数化几何体
      geom = new THREE.ParametricGeometry(
        (u, v, target) => {
          let x =
            Math.sin(Math.PI * 2 * u) * 1.7 * Math.abs(Math.sin(Math.PI * v));
          let y = v * 4 - 2;
          let z =
            Math.cos(Math.PI * 2 * u) * 1.7 * Math.abs(Math.cos(Math.PI * v));
          target.set(x, y, z);
        },
        30,
        12
      );
      mesh = this.createMesh(geom);
      mesh.position.set(16, 0, 12);
      mesh.name = "mesh";
      this.scene.add(mesh);

      this.render();
      document.getElementById("loading").style.display = "none";
    },
    createMesh(geom) {
      var mate1 = new THREE.MeshPhongMaterial({
        color: 0x008bfb,
        specular: 0x008bfb,
        side: THREE.DoubleSide
      });
      var mate2 = new THREE.MeshBasicMaterial({
        color: 0x99ffff,
        wireframe: true
      });
      return SceneUtils.createMultiMaterialObject(geom, [mate1, mate2]);
    },
    addListener() {
      this.width = this.container.clientWidth;
      this.height = this.container.clientHeight;
      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.width, this.height);
    },
    render() {
      this.stats.update();
      this.controls.update(this.clock.getDelta());
      this.scene.traverse(
        obj => obj.name == "mesh" && (obj.rotation.y += 0.01)
      );
      this.renderer.render(this.scene, this.camera);
      requestAnimationFrame(this.render);
    }
  },
  mounted() {
    this.initThree();
    window.addEventListener("resize", () => this.addListener());
  },
  beforeDestroy() {
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.stats = null;
    this.controls = null;
    this.clock = null;
    this.container = null;
    window.removeEventListener("resize", () => this.addListener());
  }
};
</script>

<style lang="less">
#box {
  width: 100%;
  height: 100%;
}
</style>
