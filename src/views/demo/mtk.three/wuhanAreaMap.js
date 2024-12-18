import * as THREE from "three";
import * as maptalks from "maptalks";

import {
  ThreeLayer
} from "maptalks.three";

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { FocusShader } from "three/examples/jsm/shaders/FocusShader";
import { UnrealBloomPass } from "../../../utils/BaseObjectPlugins/UnrealBloomPass";
import axios from "axios";

const baseUrl = `http://58.49.165.89:8010/ServiceAdapter/MAP/%E7%94%B5%E5%AD%90%E5%9C%B0%E5%9B%BE/07769b53b5243b7d6aea9df803f471c1`;
const areaUrl = `http://58.49.165.89:8010/ServiceAdapter/Map/%E5%B8%82%E7%95%8C%E7%BA%BF/07769b53b5243b7d6aea9df803f471c1/0`;
const streetUrl = `http://58.49.165.89:8010/ServiceAdapter/Map/%E5%8C%BA%E7%95%8C%E7%BA%BF/07769b53b5243b7d6aea9df803f471c1/0`;

class mapApi {
  constructor() {
    this.colors = {
      water: "#043B86",
      // water: "#7FBFDC",
      landuse: "#014f44",
      road: "#acd0e1",
      build: "#fff",
    };
    this.renderOrder = {
      landuse: 2,
      water: 3,
      road: 4,
      build: 20,
      track: 10,
      trackRing: 8
    };
    this.altitude = {
      landuse: 0.01,
      water: 1,
      road: 2,
      build: 0,
      track: 3,
      trackRing: 3
    };
    this.baseMapMeshes = [];
    this.buildMeshes = [];
    this.Map = null;
    this.threeLayer = null;
  }

  /**
   * 加载地图
   * @param {string} domId 地图容器DIV
   * @param {function} callFun 加载完回调
   */
  loadMap(domId, callFun) {
    maptalks.SpatialReference.loadArcgis(
      baseUrl + "?f=pjson",
      (err, conf) => {
        let view = conf.spatialReference
        let center = [Number((view.fullExtent.xmax + view.fullExtent.xmin) / 2), Number((view.fullExtent.ymax + view.fullExtent.ymin) / 2)]
        view.projection = 'EPSG:4326';
        this.Map = new maptalks.Map(domId, {
          center: center,
          zoom: 1,
          view: view,
          attribution: false,
          baseLayer: new maptalks.TileLayer("tile", {
            tileSystem: conf.tileSystem,
            tileSize: conf.tileSize,
            // renderer: window.dconfig.MapRenderer,
            urlTemplate: baseUrl + "/tile/{z}/{y}/{x}",
            repeatWorld: false
          }).hide()
        })
        this.initBloomFun();
        this.initThreeLayer();
        setTimeout(() => {
          this.loadArea();
        }, 500);
        callFun && callFun();
        this.Map.on("click", e => {
          console.log(e.coordinate);
        });
      })
  }

  /**
   * 三维图层初始化
   */
  initThreeLayer() {
    this.threeLayer = new ThreeLayer("t", {
      forceRenderOnMoving: true,
      forceRenderOnRotating: true,
      forceRenderOnZooming: true,
      animation: true,
      enableSimplify: false
    });
    this.threeLayer.prepareToDraw = function (gl, scene, camera) {
      let light = new THREE.DirectionalLight(0xffffff, 2);
      light.position.set(0, -10, 10);
      scene.add(light);
      //点光源
      let pl = new THREE.PointLight(0xffffff, 2, 0);
      camera.add(pl);

      this.initBloom();
      this.setRendererRenderScene();
    };
    this.threeLayer.addTo(this.Map);
  }

  loadArea() {
    axios
      .get(`./wuhan/shi.json`, {
        responseType: "json"
      })
      .then(res => {
        let data = res.data;
        let polygon = maptalks.Geometry.fromJSON(data.features[0]);
        // let polygon = new maptalks.Polygon(coord);
        let material = new THREE.ShaderMaterial({
          "uniforms": {
            "falloff": {
              "value": "4.10119692",
              "type": "f",
              "glslType": "float"
            },
            "Cube_Edges1473028860737_112_color": {
              "value": new THREE.Color(0x01133C),
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
                Transparent_Glow1473028895371_124_gl_FragColor = vec4(Transparent_Glow1473028895371_124_color * value, 0);
                // Transparent_Glow1473028895371_124_gl_FragColor = vec4(Transparent_Glow1473028895371_124_color * value, value);
                return Transparent_Glow1473028895371_124_gl_FragColor *= 0.4;
            }
            void main() 
            {
                gl_FragColor = Cube_Edges1473028860737_112_main();
                // gl_FragColor = (Cube_Edges1473028860737_112_main() + Transparent_Glow1473028895371_124_main());
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
                // gl_Position = Cube_Edges1473028860737_112_main();
                gl_Position = Cube_Edges1473028860737_112_main() + Transparent_Glow1473028895371_124_main();
            }

          `
        });
        let mesh = this.threeLayer.toExtrudePolygon(
          polygon, {
            height: 5000,
            altitude: 0,
            interactive: false,
            topColor: "#fff"
          },
          material
        );
        mesh.getObject3d().layers.enable(1);
        this.threeLayer.addMesh(mesh);
        
        let m1 = new THREE.MeshBasicMaterial({
          color: '#01133C'
        });
        var geometry = new THREE.BoxGeometry( 2000, 2000, 2000 );
        var cube = new THREE.Mesh(geometry, material);
        let v=this.threeLayer.coordinateToVector3(this.Map.getCenter(), 5200)
        cube.position.copy(v)
        cube.layers.enable(1);
        this.threeLayer.addMesh(cube)
      });
  }

  getLayer(layerid) {
    if (!this.Map) return;
    let layer = this.Map.getLayer(layerid);
    !layer && (
      layer = new maptalks.VectorLayer(layerid, {
        // forceRenderOnMoving: true,
        // forceRenderOnRotating: true,
        // forceRenderOnZooming: true,
        enableAltitude: true,
        enableSimplify: false
      }).addTo(this.Map)) //创建图层
    return layer;
  }
  getThreeLayer(layerid, callFun) {
    let layer = this.Map.getLayer(layerid);
    layer && layer.remove();
    layer = new ThreeLayer(layerid, {
      forceRenderOnMoving: true,
      forceRenderOnRotating: true,
      forceRenderOnZooming: true,
      animation: true,
      enableSimplify: false
    });
    layer.prepareToDraw = function (gl, scene, camera) {
      //环境光
      let light = new THREE.DirectionalLight(0xffffff, 2);
      light.position.set(0, -10, 10);
      scene.add(light);
      //点光源
      let pl = new THREE.PointLight(0xffffff, 2, 0);
      camera.add(pl);
      this.initBloom();
      this.setRendererRenderScene();
    };
    layer.addTo(this.Map);
    setTimeout(() => {
      callFun && callFun(layer);
    });
  }
  toThreeZ(altitude) {
    const z = this.threeLayer.distanceToVector3(altitude, altitude).x;
    return z;
  }
  
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
export default new mapApi();