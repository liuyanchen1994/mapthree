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
  attributes,
  mesh,
  count,
  verticesArray,
  boolArray;
export default {
  name: "glsl4",
  methods: {
    initScene() {
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x000000);

      // scene.add(new THREE.AxesHelper(120))

      camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        200
      );
      camera.position.z = 50;

      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      this.$refs.box.appendChild(renderer.domElement);

      ambientLight = new THREE.AmbientLight(0x666666);
      scene.add(ambientLight);
      directionalLight = new THREE.DirectionalLight(0x999999);
      directionalLight.position.set(50, 0, 100);
      scene.add(directionalLight);

      controls = new OrbitControls(camera, renderer.domElement);
      this.initGlsl();
    },
    initGlsl() {
      var sphere = new THREE.SphereBufferGeometry(10, 120, 80);
      count = sphere.attributes.position.count;
      verticesArray = new Float32Array(count);
      boolArray = new Float32Array(count);
      for (var v = 0; v < count; v++) {
        verticesArray[v] = Math.random() * 2 + 10;
        if (Math.random() > 0.5) {
          boolArray[v] = 1;
        } else {
          boolArray[v] = -1;
        }
      }
      var bufferAttribute = new THREE.BufferAttribute(verticesArray, 1);
      sphere.setAttribute("noise", bufferAttribute);

      var material = new THREE.ShaderMaterial({
        vertexShader: `
                    attribute float noise;
                    varying vec3 vNormal;
                    varying vec3 vPosition;
                    void main() {
                        vNormal = normal;
                        vPosition = position;
                        vec3 newPosition = position + normal * noise;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
                    }
                `,
        fragmentShader: `
                    varying vec3 vPosition;
                    varying vec3 vNormal;
                    void main() {
                        vec3 nml = (vNormal + 1.0) / 2.0;
                        vec3 cy = vec3((sin(vPosition.y * 3.0) + 1.0) / 2.0);
                        gl_FragColor=vec4(cy * nml, 1.0);
                    }
                `
      });

      mesh = new THREE.Mesh(sphere, material);

      scene.add(mesh);

      this.render();
      document.getElementById("loading").style.display = "none";
    },
    render() {
      for (var v = 0; v < count; v++) {
        if (verticesArray[v] < 10) {
          boolArray[v] = 1;
          verticesArray[v] += 0.05;
        } else if (verticesArray[v] > 12) {
          boolArray[v] = -1;
          verticesArray[v] -= 0.05;
        } else if (boolArray[v] == 1) {
          verticesArray[v] += 0.05;
        } else {
          verticesArray[v] -= 0.05;
        }
      }
      var bufferAttribute = new THREE.BufferAttribute(verticesArray, 1);
      mesh.geometry.setAttribute("noise", bufferAttribute);

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
