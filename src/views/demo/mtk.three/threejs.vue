<template>
  <div class="container">
      <canvas id="canvas"/>
  </div>
</template>
<script>
import axios from "axios";
import * as THREE from "three";
import * as d3geo from "d3-geo";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
export default {
  data() {
    return {
      scene: null, // 场景
      camera: null, // 摄像机
      renderer: null, // 渲染器
      map: null // 地图容器
    };
  },
  mounted() {
    // 初始化3D环境
    this.initEnvironment();
    // 构建光照系统
    this.buildLightSystem();
    // 构建辅助系统
    this.buildAuxSystem();
    this.initObject();
    this.loop();
  },
  methods: {
    // 动画循环
    loop() {
      this.render();
      requestAnimationFrame(this.loop);
    },
    // 渲染画布
    render() {
      this.renderer.render(this.scene, this.camera);
    },
    initObject1() {
      axios.get(`./data/china.json`).then(res => {
        // this.$mapApi.loadAreaObjects(res.data);
        const projection = d3geo
          .geoMercator()
          .center([104.0, 37.5])
          .scale(80)
          .translate([0, 0]);
        res.data.features.forEach(elem => {
          // 新建一个省份容器：用来存放省份对应的模型和轮廓线
          const province = new THREE.Object3D();
          const coordinates = elem.geometry.coordinates;
          coordinates.forEach(multiPolygon => {
            multiPolygon.forEach(polygon => {
              // 这里的坐标要做2次使用：1次用来构建模型，1次用来构建轮廓线
              const shape = new THREE.Shape();
              const lineMaterial = new THREE.LineBasicMaterial({
                color: 0xffffff
              });
              const linGeometry = new THREE.Geometry();
              for (let i = 0; i < polygon.length; i++) {
                const [x, y] = projection(polygon[i]);
                if (i === 0) {
                  shape.moveTo(x, -y);
                }
                shape.lineTo(x, -y);
                linGeometry.vertices.push(new THREE.Vector3(x, -y, 4.01));
              }
              const extrudeSettings = {
                depth: 4,
                bevelEnabled: false
              };
              const geometry = new THREE.ExtrudeGeometry(
                shape,
                extrudeSettings
              );
              const material = new THREE.MeshBasicMaterial({
                color: "#f00",
                transparent: true,
                opacity: 0.6
              });
              const mesh = new THREE.Mesh(geometry, material);
              const line = new THREE.Line(linGeometry, lineMaterial);
              province.add(mesh);
              province.add(line);
            });
          });
          // 将geojson的properties放到模型中，后面会用到
          province.properties = elem.properties;
          if (elem.properties.centroid) {
            const [x, y] = projection(elem.properties.centroid);
            province.properties._centroid = [x, y];
          }
          this.map.add(province);
        });
        this.scene.add(this.map);
      });
    },
    initObject() {
      let material = new THREE.MeshBasicMaterial({
        color: "#031339",
        side: THREE.DoubleSide
      });
      const geometry = new THREE.PlaneBufferGeometry(500, 500, 2);
      const mesh = new THREE.Mesh(geometry, material);
      this.scene.add(mesh);
      this.loadLandUseData();
    },
    loadLandUseData() {
      axios
        .get(`./hangzhou/WuHan.geojson`, {
          responseType: "json"
        })
        .then(res => {
          let result = res.data;
          const data = result.features.filter(x =>
            x.properties.hasOwnProperty("landuse")
          );
          const projection = d3geo
            .geoMercator()
            .center([114.17840840722722, 30.219201262799807])
            .scale(80)
            .translate([0, 0]);
          let landuses = [];
          data.forEach(elem => {
            // 新建一个省份容器：用来存放省份对应的模型和轮廓线
            const province = new THREE.Object3D();
            const coordinates = elem.geometry.coordinates;
            // 这里的坐标要做2次使用：1次用来构建模型，1次用来构建轮廓线
            const shape = new THREE.Shape();
            const lineMaterial = new THREE.LineBasicMaterial({
              color: 0xffffff
            });
            const linGeometry = new THREE.Geometry();
            for (let i = 0; i < coordinates.length; i++) {
              const [x, y] = projection(coordinates[i]);
              if (i === 0) {
                shape.moveTo(x, y);
              }
              shape.lineTo(x, y);
              // linGeometry.vertices.push(new THREE.Vector3(x, -y, 4.01));
            }
            const extrudeSettings = {
              depth: 0.001, // 定义图形拉伸的深度，默认100
              steps: 0, // 拉伸面方向分为多少级，默认为1
              bevelEnabled: true, // 表示是否有斜角，默认为true
              bevelThickness: 0, // 斜角的深度，默认为6
              bevelSize: 0, // 表示斜角的高度，高度会叠加到正常高度
              bebelSegments: 0, // 斜角的分段数，分段数越高越平滑，默认为1
              curveSegments: 0 // 拉伸体沿深度方向分为多少段，默认为1
            };
            const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
            const material = new THREE.MeshBasicMaterial({
              color: "#f00",
              transparent: true,
              opacity: 0.6
            });
            const mesh = new THREE.Mesh(geometry, material);
            const line = new THREE.Line(linGeometry, lineMaterial);
            landuses.push(mesh);
            // landuses.push(line)
          });

          var geometrys = new THREE.Geometry();
          //merge方法将两个几何体对象或者Object3D里面的几何体对象合并,(使用对象的变换)将几何体的顶点,面,UV分别合并.
          //THREE.GeometryUtils: .merge() has been moved to Geometry. Use geometry.merge( geometry2, matrix, materialIndexOffset ) instead.
          landuses.forEach(mesh => {
            geometrys.merge(mesh.geometry, mesh.matrix);
          });
          let material = new THREE.MeshPhongMaterial({
            color: "#DAE0E4"
          });
          this.scene.add(new THREE.Mesh(geometrys, material));
          // this.scene.add(this.map);
        });
    },
    // 初始化3D环境
    initEnvironment() {
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0xf0f0f0);
      // 建一个空对象存放对象
      this.map = new THREE.Object3D();
      // 设置相机参数
      this.setCamera();
      // 初始化
      this.renderer = new THREE.WebGLRenderer({
        alpha: true,
        canvas: document.querySelector("canvas")
      });
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      document.addEventListener("mousemove", this.onDocumentMouseMove, false);
      window.addEventListener("resize", this.onWindowResize, false);
    },
    setCamera() {
      this.camera = new THREE.PerspectiveCamera(
        35,
        window.innerWidth / window.innerHeight,
        1,
        10000
      );
      this.camera.position.set(0, -70, 90);
      this.camera.lookAt(0, 0, 0);
    },
    // 构建辅助系统: 网格和坐标
    buildAuxSystem() {
      let axisHelper = new THREE.AxesHelper(2000);
      this.scene.add(axisHelper);
      let gridHelper = new THREE.GridHelper(600, 60);
      this.scene.add(gridHelper);
      let controls = new OrbitControls(this.camera, this.renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.25;
      controls.rotateSpeed = 0.35;
    },
    // 光照系统
    buildLightSystem() {
      let directionalLight = new THREE.DirectionalLight(0xffffff, 1.1);
      directionalLight.position.set(300, 1000, 500);
      directionalLight.target.position.set(0, 0, 0);
      directionalLight.castShadow = true;

      let d = 300;
      const fov = 45; //拍摄距离  视野角值越大，场景中的物体越小
      const near = 1; //相机离视体积最近的距离
      const far = 1000; //相机离视体积最远的距离
      const aspect = window.innerWidth / window.innerHeight; //纵横比
      directionalLight.shadow.camera = new THREE.PerspectiveCamera(
        fov,
        aspect,
        near,
        far
      );
      directionalLight.shadow.bias = 0.0001;
      directionalLight.shadow.mapSize.width = directionalLight.shadow.mapSize.height = 1024;
      this.scene.add(directionalLight);

      let light = new THREE.AmbientLight(0xffffff, 0.6);
      this.scene.add(light);
    },
    // 根据浏览器窗口变化动态更新尺寸
    onWindowResize() {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    },
    onDocumentMouseMove(event) {
      event.preventDefault();
    }
  }
};
</script>

<style lang="less">
.container {
  height: 100%;
  width: 100%;
  canvas {
    width: 100%;
    height: 100%;
  }
}
</style>
