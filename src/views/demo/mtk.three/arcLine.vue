<template>
  <div class="map" id="Map"></div>
</template>
<script>
import * as THREE from "three";
import * as maptalks from "maptalks";
import { ThreeLayer } from "maptalks.three";
import arcLine from "@/utils//BaseObjectPlugins/arcLine";
import { randomPoint } from "@turf/random";

import {
  MeshLineMaterial
} from "@/utils//BaseObjectPlugins/THREE.MeshLine";

import { LineMaterial } from "three/examples/jsm/lines/LineMaterial";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { FocusShader } from "three/examples/jsm/shaders/FocusShader";
import { UnrealBloomPass } from "../../../utils/BaseObjectPlugins/UnrealBloomPass";

import {
  rippleWallMaterial,
  breathWallMaterial,
  meteorWallMaterial,
  textureBuildMaterial
} from "@/utils/shaders/wall/material";
export default {
  data(){
    return {
      areaUrl: "http://124.112.75.2:6083/arcgis/rest/services/ZY/ZYQH/MapServer/0"
    }
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      this.loadMap("Map", () => {});
    },
    loadMap() {
      let options = {
        center: [112.7784299,32.1348472],
        zoom: 16,
        pitch: 45,
        view: {
          projection: 'baidu'
        },
        attribution: false,
        baseLayer: new maptalks.TileLayer("amapTile", {
          // cssFilter: "sepia(100%) invert(80%)",
          // urlTemplate: `http://online2.map.bdimg.com/tile/?qt=vtile&x={x}&y={y}&z={z}&styles=pl&scaler=1&udt=20190704`,
          urlTemplate:
            "http://api.map.baidu.com/customimage/tile?&x={x}&y={y}&z={z}&udt=20210506&scale=1&ak=RBmlwIwK43GtIGfe9eQCdaWO2A5Ix0Hv&styles=t%3Aland%7Ce%3Ag%7Cv%3Aon%7Cc%3A%23243853ff%2Ct%3Awater%7Ce%3Al.t.f%7Cv%3Aon%7Cc%3A%23243853ff%2Ct%3Abuilding%7Ce%3Ag.f%7Cv%3Aon%7Cc%3A%23192c44ff%2Ct%3Abuilding%7Ce%3Ag.s%7Cv%3Aon%7Cc%3A%230a1a2bff%2Ct%3Awater%7Ce%3Ag%7Cv%3Aon%7Cc%3A%233e506cff%2Ct%3Avillage%7Ce%3Al%7Cv%3Aoff%2Ct%3Atown%7Ce%3Al%7Cv%3Aoff%2Ct%3Adistrict%7Ce%3Al%7Cv%3Aoff%2Ct%3Acountry%7Ce%3Al.t.f%7Cv%3Aon%7Cc%3A%233e506cff%2Ct%3Acity%7Ce%3Al.t.f%7Cv%3Aon%7Cc%3A%233e506cff%2Ct%3Acontinent%7Ce%3Al.t.f%7Cv%3Aon%7Cc%3A%233e506cff%2Ct%3Apoi%7Ce%3Al.i%7Cv%3Aoff%2Ct%3Ascenicspotslabel%7Ce%3Al.i%7Cv%3Aoff%2Ct%3Ascenicspotslabel%7Ce%3Al.t.f%7Cv%3Aon%7Cc%3A%233e506cff%2Ct%3Atransportationlabel%7Ce%3Al.t.f%7Cv%3Aon%7Cc%3A%233e506cff%2Ct%3Atransportationlabel%7Ce%3Al.i%7Cv%3Aoff%2Ct%3Aairportlabel%7Ce%3Al.t.f%7Cv%3Aon%7Cc%3A%233e506cff%2Ct%3Aairportlabel%7Ce%3Al.i%7Cv%3Aoff%2Ct%3Agreen%7Ce%3Ag%7Cv%3Aon%7Cc%3A%234d5d74ff%2Ct%3Ascenicspots%7Ce%3Ag%7Cv%3Aon%7Cc%3A%23243853ff%2Ct%3Ascenicspots%7Ce%3Al.t.f%7Cv%3Aon%7Cc%3A%233e506cff%2Ct%3Ascenicspots%7Ce%3Al.t.s%7Cv%3Aon%7Cc%3A%23202833ff%7Cw%3A1%2Ct%3Acontinent%7Ce%3Al.t.s%7Cv%3Aon%7Cc%3A%23202833ff%7Cw%3A1%2Ct%3Acountry%7Ce%3Al.t.s%7Cv%3Aon%7Cc%3A%23202833ff%7Cw%3A1%2Ct%3Acity%7Ce%3Al.t.s%7Cv%3Aon%7Cc%3A%23202833ff%7Cw%3A1%2Ct%3Acity%7Ce%3Al.i%7Cv%3Aoff%2Ct%3Ascenicspotslabel%7Ce%3Al.t.s%7Cv%3Aon%7Cc%3A%23202833ff%7Cw%3A1%2Ct%3Arailway%7Ce%3Ag%7Cv%3Aoff%2Ct%3Asubway%7Ce%3Ag%7Cv%3Aoff%2Ct%3Ahighwaysign%7Ce%3Al%7Cv%3Aoff%2Ct%3Anationalwaysign%7Ce%3Al%7Cv%3Aoff%2Ct%3Anationalwaysign%7Ce%3Al.i%7Cv%3Aoff%2Ct%3Aprovincialwaysign%7Ce%3Al%7Cv%3Aoff%2Ct%3Aprovincialwaysign%7Ce%3Al.i%7Cv%3Aoff%2Ct%3Atertiarywaysign%7Ce%3Al%7Cv%3Aoff%2Ct%3Atertiarywaysign%7Ce%3Al.i%7Cv%3Aoff%2Ct%3Asubwaylabel%7Ce%3Al%7Cv%3Aoff%2Ct%3Asubwaylabel%7Ce%3Al.i%7Cv%3Aoff%2Ct%3Aroad%7Ce%3Al.t.f%7Cv%3Aon%7Cc%3A%233e506cff%7Cw%3A90%2Ct%3Aroad%7Ce%3Al.t.s%7Cv%3Aon%7Cc%3A%23202833ff%7Cw%3A1%2Ct%3Ashopping%7Ce%3Ag%7Cv%3Aoff%2Ct%3Ascenicspots%7Ce%3Al%7Cv%3Aon%2Ct%3Ascenicspotslabel%7Ce%3Al%7Cv%3Aoff%2Ct%3Amanmade%7Ce%3Ag%7Cv%3Aoff%2Ct%3Amanmade%7Ce%3Al%7Cv%3Aoff%2Ct%3Ahighwaysign%7Ce%3Al.i%7Cv%3Aoff%2Ct%3Awater%7Ce%3Al.t.s%7Cv%3Aon%7Cc%3A%234d5d7400%2Ct%3Aroad%7Ce%3Ag%7Cv%3Aon%2Ct%3Aroad%7Ce%3Al%7Cv%3Aon%2Ct%3Aarterial%7Ce%3Al%7Cv%3Aoff%2Ct%3Aroad%7Ce%3Al%7Cv%3Aon%2Ct%3Aroad%7Ce%3Aundefined%7Cv%3Aon%2Ct%3Ahighway%7Ce%3Al.t.s%7Cv%3Aon%7Cc%3A%23202833ff%7Cw%3A1%2Ct%3Ahighway%7Ce%3Ag.f%7Cv%3Aon%7Cc%3A%234c5e79ff%2Ct%3Ahighway%7Ce%3Ag.s%7Cc%3A%231c4f7eff%2Ct%3Ahighway%7Ce%3Al.t.f%7Cv%3Aon%7Cc%3A%233e506cff%2Ct%3Ahighway%7Ce%3Ag%7Cv%3Aon%7Cw%3A3%2Ct%3Anationalway%7Ce%3Ag.f%7Cv%3Aon%7Cc%3A%234c5e79ff%2Ct%3Anationalway%7Ce%3Ag.s%7Cc%3A%231c4f7eff%2Ct%3Anationalway%7Ce%3Al.t.f%7Cv%3Aon%7Cc%3A%233e506cff%2Ct%3Anationalway%7Ce%3Al.t.s%7Cv%3Aon%7Cc%3A%23202833ff%7Cw%3A1%2Ct%3Anationalway%7Ce%3Ag%7Cw%3A3%2Ct%3Aprovincialway%7Ce%3Ag.f%7Cv%3Aon%7Cc%3A%234c5e79ff%2Ct%3Acityhighway%7Ce%3Ag.f%7Cv%3Aon%7Cc%3A%234c5e79ff%2Ct%3Aarterial%7Ce%3Ag.f%7Cv%3Aon%7Cc%3A%234c5e79ff%2Ct%3Atertiaryway%7Ce%3Ag.f%7Cv%3Aon%7Cc%3A%234c5e79ff%2Ct%3Afourlevelway%7Ce%3Ag.f%7Cv%3Aon%7Cc%3A%234c5e79ff%2Ct%3Alocal%7Ce%3Ag.f%7Cv%3Aon%7Cc%3A%234c5e79ff%2Ct%3Aprovincialway%7Ce%3Ag.s%7Cv%3Aon%7Cc%3A%232e3b51ff%2Ct%3Acityhighway%7Ce%3Ag.s%7Cv%3Aon%7Cc%3A%232e3b51ff%2Ct%3Aarterial%7Ce%3Ag.s%7Cv%3Aon%7Cc%3A%232e3b51ff%2Ct%3Atertiaryway%7Ce%3Ag.s%7Cv%3Aon%7Cc%3A%232e3b51ff%2Ct%3Afourlevelway%7Ce%3Ag.s%7Cv%3Aon%7Cc%3A%232e3b51ff%2Ct%3Alocal%7Ce%3Ag.s%7Cv%3Aon%7Cc%3A%232e3b51ff%2Ct%3Alocal%7Ce%3Al.t.f%7Cv%3Aon%7Cc%3A%233e506cff%2Ct%3Alocal%7Ce%3Al.t.s%7Cv%3Aon%7Cc%3A%23202833ff%7Cw%3A1%2Ct%3Afourlevelway%7Ce%3Al.t.f%7Cv%3Aon%7Cc%3A%233e506cff%2Ct%3Atertiaryway%7Ce%3Al.t.f%7Cv%3Aon%7Cc%3A%233e506cff%2Ct%3Aarterial%7Ce%3Al.t.f%7Cv%3Aon%7Cc%3A%233e506cff%2Ct%3Acityhighway%7Ce%3Al.t.f%7Cv%3Aon%7Cc%3A%233e506cff%2Ct%3Aprovincialway%7Ce%3Al.t.f%7Cv%3Aon%7Cc%3A%233e506cff%2Ct%3Aprovincialway%7Ce%3Al.t.s%7Cv%3Aon%7Cc%3A%23202833ff%7Cw%3A1%2Ct%3Acityhighway%7Ce%3Al.t.s%7Cv%3Aon%7Cc%3A%23202833ff%7Cw%3A1%2Ct%3Aarterial%7Ce%3Al.t.s%7Cv%3Aon%7Cc%3A%23202833ff%7Cw%3A1%2Ct%3Atertiaryway%7Ce%3Al.t.s%7Cv%3Aon%7Cc%3A%23202833ff%7Cw%3A1%2Ct%3Afourlevelway%7Ce%3Al.t.s%7Cv%3Aon%7Cc%3A%23202833ff%7Cw%3A1%2Ct%3Afourlevelway%7Ce%3Ag%7Cw%3A1%2Ct%3Atertiaryway%7Ce%3Ag%7Cw%3A1%2Ct%3Alocal%7Ce%3Ag%7Cw%3A1%2Ct%3Aprovincialway%7Ce%3Ag%7Cw%3A3%2Ct%3Acityhighway%7Ce%3Ag%7Cw%3A3%2Ct%3Aarterial%7Ce%3Ag%7Cw%3A1%2Ct%3Ahighway%7Ce%3Ag%7Cv%3Aoff%2Ct%3Ahighway%7Ce%3Ag%7Cv%3Aoff%2Ct%3Ahighway%7Ce%3Ag%7Cv%3Aoff%2Ct%3Ahighway%7Ce%3Ag%7Cv%3Aoff%2Ct%3Ahighway%7Ce%3Al%7Cv%3Aoff%2Ct%3Ahighway%7Ce%3Al%7Cv%3Aoff%2Ct%3Apoi%7Ce%3Al.t.s%7Cc%3A%234a4a4a94%2Ct%3Apoi%7Ce%3Al.t.f%7Cc%3A%237697c2ff%2Ct%3Aroad%7Ce%3Aall%7Cc%3A%234C5E79",
          subdomains: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
        })
      }
      this.Map = new maptalks.Map("Map", options);
      this.Map.on("click", e => {
        console.log(e.coordinate);
      });
      this.initBloomFun();
      this.initThreeLayer();
    },
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
        this.initBloom();
        this.setRendererRenderScene();
        // that.loadArcLine();
        // that.loadLine();
        that.loadPolygon();
        // that.loadCylinder();
      };
      this.threeLayer.addTo(this.Map);
    },
    loadmarker(){
      let coords = this.getRandomPoint(25000);
      
      // coords.forEach((item) => {
      // });
    },
    getRandomPoint(count = 20) {
      let extent = this.Map.getExtent();
      //随机坐标
      let coordFeature = randomPoint(count, {
        bbox: [extent.xmin, extent.ymin, extent.xmax, extent.ymax]
      });
      let coords = [];
      coordFeature.features.forEach(g => {
        coords.push(g.geometry.coordinates);
      });
      return coords;
    },
    loadLine(){
      let path = [
        {x: 112.76565892003426, y: 32.13439448502706},
        {x: 112.77036521840044, y: 32.134306678668224},
        {x: 112.77067646174149, y: 32.1376979884679},
        {x: 112.77692512694563, y: 32.137382403456996},
        {x: 112.77681432203916, y: 32.13421863039815},
        {x: 112.77706215917435, y: 32.129537877089476}
      ];
      let lineString = new maptalks.LineString(path);
      let material = new THREE.MeshBasicMaterial({
        color: '#F9F9F6', transparent: true, blending: THREE.AdditiveBlending
      });
      var fatlinematerial = new LineMaterial({
            color: 0x00ffff,
            transparent: true,
            // side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            linewidth: 3, // in pixels
            // vertexColors: THREE.VertexColors,
            // dashed: false
        });

      // var line = this.threeLayer.toFatLine(lineString, { interactive: false }, fatlinematerial);
      var line = this.threeLayer.toExtrudeLine(lineString, { altitude: 305, width: 10, height: 1 }, material);
      line.getObject3d().layers.enable(1);
      this.threeLayer.addMesh(line);
    },
    loadArcLine() {
      let height = 1000;
      let center = this.Map.getCenter();
      let data = this.getRandomPoint();
      const camera = this.threeLayer.getCamera();
      const texture = new THREE.TextureLoader().load(
        require("@/utils//shaders/texture/linebg3.png")
      );
      texture.anisotropy = 25;
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      let getMaterial = () => {
        return new MeshLineMaterial({
          map: texture,
          color: "#fff",
          useMap: true,
          lineWidth: 8,
          sizeAttenuation: false,
          transparent: true,
          near: camera.near,
          far: camera.far
        });
      }
      data.forEach((item) => {
        let path = [center, item];
        let linestring = new maptalks.LineString(path);
        let arcline = new arcLine(
          linestring, {
            altitude: 0,
            height: height,
            firstHeight: 0,
            speed: 1 / 4,
            interactive: false
          },
          getMaterial(),
          this.threeLayer
        );
        arcline.getObject3d().children[0].material.blending = THREE.AdditiveBlending;
        arcline.getObject3d().layers.enable(1);
        this.threeLayer.addMesh(arcline)
      });
    },
    loadPolygon(){
      let coord = [
       {x: 112.77138588417397, y: 32.13500481850638},
        {x: 112.7714707173543, y: 32.133017483240685},
        {x: 112.77358577367983, y: 32.132850029586436},
        {x: 112.77369525709096, y: 32.1355397750026},
        {x: 112.77138588417397, y: 32.13500481850638}
      ];
      let polygon = new maptalks.Polygon(coord);
      let material = new THREE.ShaderMaterial({
        "uniforms": {
          "falloff": {
            "value": "4.10119692",
            "type": "f",
            "glslType": "float"
          },
          "Cube_Edges1473028860737_112_color": {
            "value": {
              "r": 0.15294117647058825,
              "g": 0.6078431372549019,
              "b": 0.34901960784313724
            },
            "type": "c",
            "glslType": "vec3"
          },
          "brightness": {
            "value": "27.62780926",
            "type": "f",
            "glslType": "float"
          },
          "start": {
            "value": "0.00124148",
            "type": "f",
            "glslType": "float"
          },
          "end": {
            "value": "1",
            "type": "f",
            "glslType": "float"
          },
          "alpha": {
            "value": "1",
            "type": "f",
            "glslType": "float"
          },
          "Transparent_Glow1473028895371_124_color": {
            "value": {
              "r": 0.9803921568627451,
              "g": 0.9803921568627451,
              "b": 0.9803921568627451
            },
            "type": "c",
            "glslType": "vec3"
          }
        },
        defaultAttributeValues: {},
        fragmentShader: `
          precision highp float;
          precision highp int;
          uniform vec3 Cube_Edges1473028860737_112_color;
          uniform float brightness;
          uniform float falloff;
          uniform vec3 Transparent_Glow1473028895371_124_color;
          uniform float start;
          uniform float end;
          uniform float alpha;
          varying vec2 vUv;
          varying vec3 fPosition;
          varying vec3 fNormal;
          vec4 Cube_Edges1473028860737_112_main() 
          {
              vec4 Cube_Edges1473028860737_112_gl_FragColor = vec4(0.0);
              vec2 multiplier = pow(abs(vUv - 0.5), vec2(falloff));
              Cube_Edges1473028860737_112_gl_FragColor = vec4(Cube_Edges1473028860737_112_color * brightness * length(multiplier), 1.0);
              return Cube_Edges1473028860737_112_gl_FragColor *= 0.6;
          }
          vec4 Transparent_Glow1473028895371_124_main() 
          {
              vec4 Transparent_Glow1473028895371_124_gl_FragColor = vec4(0.0);
              vec3 normal = normalize(fNormal);
              vec3 eye = normalize(-fPosition.xyz);
              float rim = smoothstep(start, end, 1.0 - dot(normal, eye));
              float value = clamp(rim * alpha, 0.0, 1.0);
              Transparent_Glow1473028895371_124_gl_FragColor = vec4(Transparent_Glow1473028895371_124_color * value, value);
              return Transparent_Glow1473028895371_124_gl_FragColor *= 0.4;
          }
          void main() 
          {
              gl_FragColor = (Cube_Edges1473028860737_112_main() + Transparent_Glow1473028895371_124_main());
          }
        `,
        vertexShader: `
          precision highp float;
          precision highp int;
          varying vec2 vUv;
          varying vec3 fNormal;
          varying vec3 fPosition;
          vec4 Cube_Edges1473028860737_112_main() 
          {
              vec4 Cube_Edges1473028860737_112_gl_Position = vec4(0.0);
              vUv = uv;
              Cube_Edges1473028860737_112_gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
              return Cube_Edges1473028860737_112_gl_Position *= 0.6;
          }
          vec4 Transparent_Glow1473028895371_124_main() 
          {
              vec4 Transparent_Glow1473028895371_124_gl_Position = vec4(0.0);
              fNormal = normalize(normalMatrix * normal);
              vec4 pos = modelViewMatrix * vec4(position, 1.0);
              fPosition = pos.xyz;
              Transparent_Glow1473028895371_124_gl_Position = projectionMatrix * pos;
              return Transparent_Glow1473028895371_124_gl_Position *= 0.4;
          }
          void main() 
          {
              gl_Position = Cube_Edges1473028860737_112_main() + Transparent_Glow1473028895371_124_main();
          }

        `
        // blending: THREE.AdditiveBlending,
        // transparent: !0,
        // depthWrite: !1,
        // depthTest: !0,
        // side: THREE.DoubleSide,
        // fog: !0,
      });
      let mesh = this.threeLayer.toExtrudePolygon(
          polygon,
          { height: 1, altitude: 100, interactive: false, topColor: "#fff" },
          material
      );
      
      // mesh.getObject3d().layers.enable(1);
      this.threeLayer.addMesh(mesh);

    },
    loadCylinder(){
      let height = 2;
      let m1 = new THREE.MeshBasicMaterial({
        color: '#f00', transparent: true, opacity: 1, blending: THREE.AdditiveBlending
      });
      const texture = new THREE.TextureLoader().load(
        require("@/utils/shaders/texture/texture_03.png")
      );
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      //贴图
      let m2 = textureBuildMaterial({
        opacity: 1,
        color: "#EDD464",
        texture: texture
      });
      let material = meteorWallMaterial({color: "#0f0", opacity: 1});
      let cylinder = new THREE.CylinderBufferGeometry(
        0.01,
        1,
        height,
        24,
        1,
        true
      );
      let mesh = new THREE.Mesh(cylinder, m2);
      let position = this.threeLayer.coordinateToVector3(this.Map.getCenter(), height / 2);
      mesh.position.copy(position);
      mesh.rotation.x = Math.PI / 2;
      mesh.layers.enable(1);
      this.threeLayer.addMesh(mesh);
      // setInterval(() => {
      //   mesh.material.uniforms.time.value += 0.025
      // }, 10);
    },
    loadAreaData(){
      maptalks.Ajax.getJSON(
        this.areaUrl,
        {
          jsonp: true
        },
        (obj, data) => {
          
        }
      );
    },
    initBloomFun() {
      /**
       * initBloom
       * */
      ThreeLayer.prototype.initBloom = function() {
        const params = {
          exposure: 1,
          bloomStrength: 3.5,
          bloomThreshold: 0,
          bloomRadius: 0,
          debug: false
        };
        const renderer = this.getThreeRenderer();
        const size = this.getMap().getSize();
        this.composer = new EffectComposer(renderer);
        this.composer.setSize(size.width, size.height);

        const scene = this.getScene(),
          camera = this.getCamera();
        this.renderPass = new RenderPass(scene, camera);

        this.composer.addPass(this.renderPass);

        const bloomPass = (this.bloomPass = new UnrealBloomPass(
          new THREE.Vector2(size.width, size.height)
        ));
        bloomPass.renderToScreen = true;
        bloomPass.threshold = params.bloomThreshold;
        bloomPass.strength = params.bloomStrength;
        bloomPass.radius = params.bloomRadius;

        // composer.setSize(size.width, size.height);
        // composer.addPass(renderPass);
        const finalPass = new ShaderPass(
          new THREE.ShaderMaterial( {
            uniforms: {
              baseTexture: { value: null },
              bloomTexture: { value: this.composer.renderTarget2.texture }
            },
            vertexShader: `
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
            }
            `,
            fragmentShader: `
            uniform sampler2D baseTexture;
            uniform sampler2D bloomTexture;
            varying vec2 vUv;
            void main() {
              gl_FragColor = ( texture2D( baseTexture, vUv ) + vec4( 1.0 ) * texture2D( bloomTexture, vUv ) );
            }
            `,
            defines: {}
          } ), "baseTexture"
        );
        finalPass.needsSwap = true;
        finalPass.renderToScreen = true;

        var focuspass = new ShaderPass(FocusShader);
        focuspass.uniforms["screenWidth"].value = size.width;
        focuspass.uniforms["screenHeight"].value = size.height;
        focuspass.uniforms["sampleDistance"].value = 1.07;
        this.composer.addPass(bloomPass);
        this.composer.addPass(finalPass);
        // this.composer.addPass(focuspass);
        this.bloomEnable = true;
      };

      /*
      *@override  renderer.renderScene
      */
      ThreeLayer.prototype.setRendererRenderScene = function() {
        this.getRenderer().renderScene = function() {
          const layer = this.layer;
          layer._callbackBaseObjectAnimation();
          this._syncCamera();

          const renderer = this.context,
            camera = this.camera,
            scene = this.scene;
          if (
            layer.bloomEnable &&
            layer.composer &&
            layer.composer.passes.length > 1
          ) {
            if (renderer.autoClear) {
              renderer.autoClear = false;
            }
            if (layer.bloomPass) {
              camera.layers.set(1);
            }
            if (layer && layer.composer) {
              layer.composer.render(0);
            }
            renderer.clearDepth();
            camera.layers.set(0);
            renderer.render(scene, camera);
          } else {
            if (!renderer.autoClear) {
              renderer.autoClear = true;
            }
            renderer.render(scene, camera);
          }

          this.completeRender();
        };
      };
    }
  }
};
</script>

<style lang="less">
.map {
  width: 100%;
  height: 100vh;
  // background: #000a31;
}
</style>
