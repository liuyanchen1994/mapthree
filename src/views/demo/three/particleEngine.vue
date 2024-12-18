<template>
  <div ref="box" id="box"></div>
</template>

<script>
import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Reflector } from "three/examples/jsm/objects/Reflector";
import ParticleEngine from "./js/particleEngine.es";
import Examples from "./js/engineExample";
var renderer,
  camera,
  scene,
  controls,
  stats,
  clock,
  ambientLight,
  directionalLight;
export default {
  name: "test",
  methods: {
    initThree() {
      stats = new Stats();
      stats.setMode(0);
      stats.domElement.style.position = "absolute";
      stats.domElement.style.left = "0px";
      stats.domElement.style.top = "0px";
      this.$refs.box.appendChild(stats.domElement);

      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0x7680a2);
      this.$refs.box.appendChild(renderer.domElement);

      camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        10000
      );
      camera.position.set(0, 200, 400);

      controls = new OrbitControls(camera, renderer.domElement);
      camera.lookAt(new THREE.Vector3(0, 70, 0));
      clock = new THREE.Clock();

      scene = new THREE.Scene();

      var helper = new THREE.AxesHelper(200);
      scene.add(helper);

      ambientLight = new THREE.AmbientLight(0xbbbbbb);
      scene.add(ambientLight);

      directionalLight = new THREE.DirectionalLight(0x666666);
      directionalLight.position.set(10, -50, 300);
      scene.add(directionalLight);

      //TODO
      this.engine = new ParticleEngine();
      this.engine.setValues(Examples.smoke);
      let mesh = this.engine.initialize();

      scene.add(mesh);
      this.init();
      this.render();
    },

    init() {
      var cubeGeometry = new THREE.CubeGeometry(50, 50, 50, 20, 20, 20);
      var discTexture = new THREE.TextureLoader().load(
        require("./image/star.png")
      );

      // values that are constant for all particles during a draw call
      this.customUniforms = {
        time: { type: "f", value: 1.0 },
        noise_map: { type: "t", value: discTexture }
      };

      // properties that may vary from particle to particle. only accessible in vertex shaders!
      //	(can pass color info to fragment shader via vColor.)
      var customAttributes = {
        customColor: { type: "c", value: [] },
        customFrequency: { type: "f", value: [] }
      };

      // assign values to attributes, one for each vertex of the geometry
      for (var v = 0; v < cubeGeometry.vertices.length; v++) {
        customAttributes.customColor.value[v] = new THREE.Color(
          0xffffff * Math.random()
        );
        customAttributes.customFrequency.value[v] = 5 * Math.random() + 0.5;
      }

      var shaderMaterial = new THREE.ShaderMaterial({
        uniforms: this.customUniforms,
        attributes: customAttributes,
        vertexShader: `
        uniform float time;
        attribute float customFrequency;
        attribute vec3 customColor;
        varying vec3 vColor;
        void main() 
        {
          vColor = customColor; // set color associated to vertex; use later in fragment shader
          vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );

          // option (1): draw particles at constant size on screen
          // gl_PointSize = size;
            // option (2): scale particles as objects in 3D space
          gl_PointSize = (1.0 + sin( customFrequency * time )) * 8.0 * ( 300.0 / length( mvPosition.xyz ) );
          gl_Position = projectionMatrix * mvPosition;
        }
        `,
        fragmentShader: `
          uniform sampler2D noise_map;
          varying vec3 vColor; // colors associated to vertices; assigned by vertex shader
          void main() 
          {
            // calculates a color for the particle
            gl_FragColor = vec4( vColor, 1.0 );
            // sets particle texture to desired color
            gl_FragColor = gl_FragColor * texture2D( noise_map, gl_PointCoord );
          }
        `,
        transparent: true,
        alphaTest: 0.5 // if having transparency issues, try including: alphaTest: 0.5,
        // blending: THREE.AdditiveBlending, depthTest: false,
      });

      var particleCube = new THREE.ParticleSystem(cubeGeometry, shaderMaterial);
      particleCube.position.set(0, 10, 0);
      particleCube.dynamic = true;
      particleCube.sortParticles = true;
      scene.add(particleCube);
    },

    render() {
      stats.update();
      renderer.render(scene, camera);
      var dt = clock.getDelta();
      this.engine.update(dt * 0.5);

      var t = clock.getElapsedTime();
      this.customUniforms.time.value = t;
      requestAnimationFrame(this.render);
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
    controls = null;
    clock = null;
    stats = null;
    renderer = null;
    camera = null;
    ambientLight = null;
    directionalLight = null;
    cancelAnimationFrame(this.globalID);
  }
};
</script>

<style lang="less" scope>
#box {
  position: relative;
  .btn {
    position: absolute;
    bottom: 50px;
    left: 50%;
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
