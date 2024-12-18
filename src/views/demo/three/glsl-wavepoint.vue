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
var gui,
  scene,
  camera,
  renderer,
  controls,
  lights,
  mesh,
  bones,
  skeletonHelper,
  texture,
  uniforms = 0;
export default {
  name: "波浪点",
  methods: {
    initScene() {
      gui = new GUI();

      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x000000);

      scene.add(new THREE.AxesHelper(200));

      camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        10000
      );
      camera.position.x = 200;
      camera.position.y = 100;
      camera.position.z = 60;

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.shadowMap.enabled = true;
      this.$refs.box.appendChild(renderer.domElement);

      controls = new OrbitControls(camera, renderer.domElement);
      // controls.enableZoom = false;

      var ambientLight = new THREE.AmbientLight(0xffffff);
      scene.add(ambientLight);
      var directionalLight = new THREE.DirectionalLight(0xffffff);
      directionalLight.position.set(-50, 200, 100);
      scene.add(directionalLight);

      this.initContent();
    },
    initContent() {
      var planeGeom = new THREE.PlaneGeometry(1000, 1000, 100, 100);
      uniforms = {
        time: {
          value: 0
        }
      };
      var planeMate = new THREE.ShaderMaterial({
        transparent: true,
        side: THREE.DoubleSide,
        uniforms: uniforms,
        vertexShader: `
                    uniform float time;
                    void main() {
                        float y = sin(position.x / 50.0 + time) * 10.0 + sin(position.y / 50.0 + time) * 10.0;
                        vec3 newPosition = vec3(position.x, position.y, y * 2.0 );
                        gl_PointSize = (y + 20.0) / 4.0;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
                    }
                `,
        fragmentShader: `
                    void main() {
                        float r = distance(gl_PointCoord, vec2(0.5, 0.5));
                        if(r < 0.5) {
                            gl_FragColor = vec4(0.0,1.0,1.0,1.0);
                        }
                    }
                `
      });
      var planeMesh = new THREE.Points(planeGeom, planeMate);
      planeMesh.rotation.x = -Math.PI / 2;
      scene.add(planeMesh);

      this.render();
      document.getElementById("loading").style.display = "none";
    },
    render() {
      uniforms.time.value += 0.03;
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
