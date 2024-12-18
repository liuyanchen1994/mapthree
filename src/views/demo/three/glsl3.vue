<template>
    <div ref="box" id="box">
    </div>
</template>

<script>
import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
var gui,
  scene,
  camera,
  renderer,
  controls,
  ambientLight,
  directionalLight,
  uniforms,
  total,
  every,
  centers;
export default {
  name: "glsl3",
  methods: {
    initScene() {
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x15255b);

      // scene.add(new THREE.AxesHelper(1000))

      camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        10000
      );
      camera.position.set(800, 200, 0);
      camera.lookAt(new THREE.Vector3(300, 0, 0));

      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      this.$refs.box.appendChild(renderer.domElement);

      ambientLight = new THREE.AmbientLight(0x666666);
      scene.add(ambientLight);
      directionalLight = new THREE.DirectionalLight(0x999999);
      directionalLight.position.set(50, 100, 0);
      scene.add(directionalLight);

      // controls = new OrbitControls( camera, renderer.domElement );
      // controls.target = new THREE.Vector3(300, 0, 0);
      // camera.lookAt(new THREE.Vector3(300, 0, 0));
      this.initGlsl();
    },
    initGlsl() {
      let geometry = new THREE.Geometry();
      for (let i = 0; i < 39; i++) {
        for (let j = 0; j < 39; j++) {
          let sphere = new THREE.SphereGeometry(2, 15, 10);
          sphere.translate(i * 50 - 950, 0, j * 50 - 950);
          geometry.merge(sphere);
        }
      }
      let bufferGeometry = new THREE.BufferGeometry().fromGeometry(geometry);
      total = bufferGeometry.attributes.position.count;
      every = total / 39 / 39;
      centers = new Float32Array(total * 3);

      for (let i = 0; i < 39; i++) {
        for (let j = 0; j < 39; j++) {
          for (let k = 0; k < every; k++) {
            centers[(i * 39 * every + j * every + k) * 3] = i * 50 - 950;
            centers[(i * 39 * every + j * every + k) * 3 + 1] = 0;
            centers[(i * 39 * every + j * every + k) * 3 + 2] = j * 50 - 950;
          }
        }
      }
      bufferGeometry.setAttribute(
        "centers",
        new THREE.BufferAttribute(centers, 3)
      );

      uniforms = {
        time: {
          type: "f",
          value: 0
        }
      };
      var material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: `
                    attribute vec3 centers;
                    uniform float time;
                    void main() {
                        float centery = sin(centers.x / 100.0 + time) * 40.0 + sin(centers.z / 100.0 + time) * 40.0;
                        vec3 center = vec3(centers.x, 0, centers.z);
                        vec3 target = position - center;
                        vec3 newPosition = center + target * ((centery + 80.0) / 80.0);

                        // gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                        gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition.x, newPosition.y + centery, newPosition.z, 1.0 );
                    }
                `,
        fragmentShader: `
                    void main() {
                        gl_FragColor = vec4(0.0,0.5,0.8,1.0);
                    }
                `
      });

      var mesh = new THREE.Mesh(bufferGeometry, material);

      scene.add(mesh);

      this.render();
      document.getElementById("loading").style.display = "none";
    },
    addEventListener() {
      document.addEventListener(
        "mousemove",
        function(event) {
          event.preventDefault();
          let x = new THREE.Vector2();
          x = event.clientX / window.innerWidth;
          camera.position.set(800, 200, (x - 0.5) * 400);
          camera.lookAt(new THREE.Vector3(300, 0, -(x - 0.5) * 200));
        },
        false
      );
    },
    render() {
      uniforms.time.value += 0.02;
      renderer.render(scene, camera);
      this.globalID = requestAnimationFrame(this.render);
    }
  },
  mounted() {
    this.initScene();
    this.addEventListener();
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
    ambientLight = null;
    directionalLight = null;
    cancelAnimationFrame(this.globalID);
  }
};
</script>

<style lang="less" scope>
#box {
}
</style>
