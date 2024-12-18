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
  uniforms;
export default {
  name: "glsl2",
  methods: {
    initScene() {
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x000000);

      // scene.add(new THREE.AxesHelper(20))

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
      var shape = new THREE.Shape();
      shape.moveTo(-10, 20);
      shape.absarc(0, 20, 10, Math.PI, Math.PI * 2, true);
      shape.lineTo(10, -20);
      shape.absarc(0, -20, 10, 0, Math.PI, true);
      shape.lineTo(-10, 20);

      var extrudeSettings = {
        steps: 2, //用于沿着挤出样条的深度细分的点的数量，默认值为1
        depth: 5, //挤出的形状的深度，默认值为100
        bevelEnabled: true, //对挤出的形状应用是否斜角，默认值为true
        bevelThickness: 1, //设置原始形状上斜角的厚度。默认值为6
        bevelSize: 1, //斜角与原始形状轮廓之间的延伸距离
        bevelSegments: 10, //斜角的分段层数，默认值为3
        curveSegments: 12 //曲线上点的数量，默认值是12
      };
      var frame = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      // var material = new THREE.MeshPhongMaterial({color: 0x222222, emissive: 0x222222});

      var cylinGeom = new THREE.CylinderGeometry(6, 6, 6, 30, 20);
      frame.merge(
        cylinGeom.clone(),
        new THREE.Matrix4().compose(
          new THREE.Vector3(0, 15, 3.1),
          new THREE.Quaternion().setFromAxisAngle(
            new THREE.Vector3(1, 0, 0),
            Math.PI / 2
          ),
          new THREE.Vector3(1, 1, 1)
        )
      );
      frame.merge(
        cylinGeom.clone(),
        new THREE.Matrix4().compose(
          new THREE.Vector3(0, 0, 3.1),
          new THREE.Quaternion().setFromAxisAngle(
            new THREE.Vector3(1, 0, 0),
            Math.PI / 2
          ),
          new THREE.Vector3(1, 1, 1)
        )
      );
      frame.merge(
        cylinGeom.clone(),
        new THREE.Matrix4().compose(
          new THREE.Vector3(0, -15, 3.1),
          new THREE.Quaternion().setFromAxisAngle(
            new THREE.Vector3(1, 0, 0),
            Math.PI / 2
          ),
          new THREE.Vector3(1, 1, 1)
        )
      );
      uniforms = {
        time: {
          type: "f",
          value: 0.0
        }
      };
      var material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: `
                    varying vec3 vPosition;
                    void main() {
                        vPosition = position;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                    }
                `,
        fragmentShader: `
                    varying vec3 vPosition;
                    uniform float time;
                    void main() {
                        float time = mod(time, 3.0);
                        if(vPosition.z == 6.1 && vPosition.y > 8.0) {
                            if(time < 1.0) {
                                gl_FragColor=vec4(1.0, 0.0, 0.0, 1.0);
                            } else {
                                gl_FragColor=vec4(0.2, 0.0, 0.0, 1.0);
                            }
                        } else if(vPosition.z == 6.1 && vPosition.y > -8.0) {
                            if(time >= 1.0 && time < 2.0) {
                                gl_FragColor=vec4(1.0, 0.7, 0.0, 1.0);
                            } else {
                                gl_FragColor=vec4(0.2, 0.1, 0.0, 1.0);
                            }
                        } else if(vPosition.z == 6.1) {
                            if(time >= 2.0) {
                                gl_FragColor=vec4(0.0, 1.0, 0.0, 1.0);
                            } else {
                                gl_FragColor=vec4(0.0, 0.2, 0.0, 1.0);
                            }
                        } else {
                            gl_FragColor=vec4(0.2, 0.2, 0.2, 1.0);
                        }
                    }
                `
      });

      var mesh = new THREE.Mesh(frame, material);

      scene.add(mesh);

      this.render();
      document.getElementById("loading").style.display = "none";
    },
    render() {
      renderer.render(scene, camera);
      uniforms.time.value += 0.01;
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
