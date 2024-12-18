import * as THREE from "three";
import * as maptalks from "maptalks";
import { ThreeLayer } from "maptalks.three";

import { MeshLineMaterial } from "@/utils/BaseObjectPlugins/THREE.MeshLine";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

import spriteLine from "@/utils/BaseObjectPlugins/spriteLine";
import customPalneBuffer from "@/utils/BaseObjectPlugins/customPalneBuffer";

import areadata from "../jiangxi/jiangxiProvince";
import areaChilddata from "../jiangxi/jiangxiCity";
const center = [115.49867097979336, 26.483885322661123],
  zoom = 8,
  minzoom = 7,
  pitch = 61;
const bottomMeshHeight = 15000,
  dotMeshZ = 15100,
  mirrorMeshZ = -20000,
  childPolygonZ = 16300, //子级区划边界高度
  trailZ = 16500;
class mapApi {
  constructor() {
    this.Map = null;
    this.initView = null;
    this.threeLayer = null;
  }

  /**
   * 加载地图
   * @param {string} domId 地图容器DIV
   * @param {function} callFun 加载完回调
   */
  loadMap(domId, callFun) {
    this.Map = new maptalks.Map(domId, {
      center: center,
      zoom: zoom,
      minZoom: minzoom,
      pitch: pitch,
      attribution: false,
      baseLayer: new maptalks.TileLayer("base", {
        cssFilter: "sepia(70%) invert(90%)",
        urlTemplate:
          "https://c.tile.thunderforest.com/transport/{z}/{x}/{y}.png?apikey=6170aad10dfd42a38d4d8c709a536f38",
        subdomains: ["a", "b", "c", "d"]
      }).hide()
    });
    this.Map.on("click", e => {
      console.log(e.coordinate);
    });
    this.initThreeLayer();
    // this.drawGraphic("line", null)
    setTimeout(() => {
      this.loadAreaObjects();
      // this.loadChildPolygon();
    });
    callFun && callFun();
  }

  /**
   * 三维图层初始化
   */
  initThreeLayer() {
    this.threeLayer = new ThreeLayer("t", {
      forceRenderOnMoving: true,
      forceRenderOnRotating: true,
      forceRenderOnZooming: true,
      animation: true
    });
    let that = this;
    this.threeLayer.prepareToDraw = function(gl, scene, camera) {
      //环境光
      let light = new THREE.DirectionalLight(0xffffff, 2);
      light.position.set(0, -10, 10);
      scene.add(light);
      //点光源
      let pl = new THREE.PointLight(0xffffff, 2, 0);
      camera.add(pl);
      that.threeLayer.getThreeRenderer().setClearColor("#42586f");
    };
    this.threeLayer.addTo(this.Map);
  }

  //加载父级三维区划
  loadAreaObjects(parentData) {
    parentData = areadata.features[0];

    // let polygon = maptalks.GeoJSON.toGeometry(parentData);
    // let mesh = this.threeLayer.toExtrudePolygon(
    //   polygon,
    //   {
    //     height: 20,
    //     topColor: "#fff"
    //   },
    //   this.getShaderMaterial("#022A6A")
    // );
    let ground = new customPalneBuffer(
      this.Map.getCenter(),
      {
        width: 100000,
        height: 100000,
        interactive: false
      },
      this.getShaderMaterial(),
      this.threeLayer
    );
    this.threeLayer.addMesh(ground);
  }

  getShaderMaterial() {
    let material = new THREE.ShaderMaterial({
      uniforms: {
        color: {
          value: new THREE.Color("#f00"),
          type: "c"
        },
        brightness: {
          value: "10.04980631",
          type: "f"
        },
        falloff: {
          value: "4.18104668",
          type: "f"
        },
        uvScale: {
          value: {
            x: "1",
            y: "1",
            z: "1"
          },
          type: "v3"
        },
        uvOffset: {
          value: {
            x: 0,
            y: 0,
            z: 0
          },
          type: "v3"
        },
        colorFront1: {
          value: new THREE.Color("#1488f0"),
          type: "c",
          glslType: "vec3"
        },
        colorFront2: {
          value: new THREE.Color("#1488f0"),
          type: "c"
        },
        colorRight1: {
          value: new THREE.Color("#1488f0"),
          type: "c"
        },
        colorRight2: {
          value: new THREE.Color("#1488f0"),
          type: "c"
        },
        colorTop1: {
          value: new THREE.Color("#1488f0"),
          type: "c"
        },
        colorTop2: {
          value: new THREE.Color("#1488f0"),
          type: "c"
        }
      },
      defaultAttributeValues: {},
      vertexShader: `
      precision highp float;
precision highp int;
varying vec2 vUv;
varying vec4 worldCoord;
varying float lightStrengthX;
varying float lightStrengthY;
varying float lightStrengthZ;
vec3 lightPositionX = vec3(1.0, 0.0, 0.0);
vec3 lightPositionY = vec3(0.0, 1.0, 0.0);
vec3 lightPositionZ = vec3(0.0, 0.0, 1.0);
float getLightStrength(vec3 lightPosition, vec3 norm) 
{
    return pow(min(abs(dot(normalize(norm), normalize(vec3(vec4(lightPosition, 1.0) * modelMatrix)))), 1.0), 2.0);
}
vec4 Cube_Edges1468788327926_62_main() 
{
    vec4 Cube_Edges1468788327926_62_gl_Position = vec4(0.0);
    vUv = uv;
    Cube_Edges1468788327926_62_gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    return Cube_Edges1468788327926_62_gl_Position *= 1.0;
}
vec4 World_Based_Gradients1472519140028_142_main() 
{
    vec4 World_Based_Gradients1472519140028_142_gl_Position = vec4(0.0);
    worldCoord = modelMatrix * vec4(position, 1.0);
    lightStrengthX = getLightStrength(lightPositionX, normal);
    lightStrengthY = getLightStrength(lightPositionY, normal);
    lightStrengthZ = getLightStrength(lightPositionZ, normal);
    World_Based_Gradients1472519140028_142_gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    return World_Based_Gradients1472519140028_142_gl_Position *= 1.0;
}
void main() 
{
    gl_Position = Cube_Edges1468788327926_62_main() + World_Based_Gradients1472519140028_142_main();}
      `,
      fragmentShader: `
      precision highp float;
precision highp int;
uniform vec3 color;
uniform float brightness;
uniform float falloff;
uniform mat4 modelMatrix;
uniform vec3 uvScale;
uniform vec3 uvOffset;
uniform vec3 colorFront1;
uniform vec3 colorFront2;
uniform vec3 colorRight1;
uniform vec3 colorRight2;
uniform vec3 colorTop1;
uniform vec3 colorTop2;
varying vec2 vUv;
varying vec4 worldCoord;
varying float lightStrengthX;
varying float lightStrengthY;
varying float lightStrengthZ;
vec4 Cube_Edges1468788327926_62_main() 
{
    vec4 Cube_Edges1468788327926_62_gl_FragColor = vec4(0.0);
    vec2 multiplier = pow(abs(vUv - 0.5), vec2(falloff));
    Cube_Edges1468788327926_62_gl_FragColor = vec4(color * brightness * length(multiplier), 1.0);
    return Cube_Edges1468788327926_62_gl_FragColor *= 1.0;
}
vec4 World_Based_Gradients1472519140028_142_main() 
{
    vec4 World_Based_Gradients1472519140028_142_gl_FragColor = vec4(0.0);
    float gradientX = clamp((worldCoord.x + uvOffset.z + uvScale.z * 0.5) / uvScale.z, 0.0, 1.0);
    float gradientY = clamp((worldCoord.z + uvOffset.x + uvScale.x * 0.5) / uvScale.x, 0.0, 1.0);
    float gradientZ = clamp((worldCoord.y + uvOffset.y + uvScale.y * 0.5) / uvScale.y, 0.0, 1.0);
    vec3 gradientTop = mix(colorTop1, colorTop2, gradientX);
    vec3 gradientRight = mix(colorRight1, colorRight2, gradientZ);
    vec3 gradientFront = mix(colorFront1, colorFront2, gradientY);
    vec3 outputColor = (gradientFront * lightStrengthY) + (gradientRight * lightStrengthX) + (gradientTop * lightStrengthZ);
    World_Based_Gradients1472519140028_142_gl_FragColor = vec4(outputColor, 1.0);
    return World_Based_Gradients1472519140028_142_gl_FragColor *= 1.0;
}
void main() 
{
    gl_FragColor = (Cube_Edges1468788327926_62_main() + World_Based_Gradients1472519140028_142_main());}

      `,
      blending: THREE.AdditiveBlending,
      transparent: !0,
      depthWrite: !1,
      depthTest: !0,
      side: THREE.DoubleSide,
      fog: !0
    });
    return material;
  }

  getMaterial(color) {
    let material = new THREE.MeshBasicMaterial({
      color: color,
      side: THREE.DoubleSide,
      transparent: !0
    });
    material.vertexColors = THREE.VertexColors;
    return material;
  }
  getTextureMaterial(texture) {
    let material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: !0,
      color: "#fff",
      side: THREE.DoubleSide
    });
    material.vertexColors = THREE.VertexColors;
    return material;
  }
  getTexture(image) {
    const texture = new THREE.TextureLoader().load(image);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  //顶部换色处理
  topDeal(mesh, topColor) {
    topColor = new THREE.Color(topColor);
    const bufferGeometry = mesh.getObject3d().geometry;
    const geometry = new THREE.Geometry().fromBufferGeometry(bufferGeometry);
    const { vertices, faces, faceVertexUvs } = geometry;
    for (let i = 0, len = faces.length; i < len; i++) {
      const { a, b, c } = faces[i];
      const p1 = vertices[a],
        p2 = vertices[b],
        p3 = vertices[c];
      //top face
      if (p1.z > 0 && p2.z > 0 && p3.z > 0) {
        const vertexColors = faces[i].vertexColors;
        for (let j = 0, len1 = vertexColors.length; j < len1; j++) {
          vertexColors[j].r = topColor.r;
          vertexColors[j].g = topColor.g;
          vertexColors[j].b = topColor.b;
        }
        const uvs = faceVertexUvs[0][i];
        for (let j = 0, len1 = uvs.length; j < len1; j++) {
          uvs[j].x = 0;
          uvs[j].y = 0;
        }
      }
    }
    mesh.getObject3d().geometry = new THREE.BufferGeometry().fromGeometry(
      geometry
    );
    bufferGeometry.dispose();
    geometry.dispose();
    return mesh;
  }
}
export default mapApi;
