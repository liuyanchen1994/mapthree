import * as THREE from "three";
import * as maptalks from "maptalks";

import {
  ThreeLayer
} from "maptalks.three";
import layerApi from "./layerManager"
import axios from "axios";
import Vue from "vue/dist/vue.esm";
import info from "../mtk.common/info"

class mapApi {
  constructor() {
    this.config = window.mapConfig;
    this.Map = null; //地图
    this.glowInters = null;
  }

  /**
   * 百度地图初始化
   * @param {*} domId 地图容器
   * @param {*} callFun 加载完回调
   */
  mapInit(domId, callFun) {
    let options = {
      center: [111.9106865273, 31.96672969542786],
      zoom: 9,
      minZoom: 7,
      maxZoom: 13,
      // view: {
      //   projection: "baidu"
      // },
      attribution: false,
      baseLayer: new maptalks.TileLayer("base", {
        urlTemplate: "https://c.tile.thunderforest.com/transport/{z}/{x}/{y}.png?apikey=6170aad10dfd42a38d4d8c709a536f38",
        subdomains: ["a", "b", "c", "d"]
      }).hide()
      // baseLayer: new maptalks.TileLayer("baseMap", {
      //   urlTemplate: `http://api1.map.bdimg.com/customimage/tile?&x={x}&y={y}&z={z}&scale=1&customid=midnight`,
      //   subdomains: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
      // }).hide()
    };
    this.Map = new maptalks.Map(domId, options);
    layerApi.Map = this.Map;
    callFun && callFun(this.Map);
    this.Map.on("click", (e) => {
      console.log(e.coordinate);
    });
    layerApi.getLayer("areaLayer");
    layerApi.getLayer("areaChildLayer");
    // this.initThreeLayer();
    this.loadArea();
    this.addMarker();
  }

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
    };
    this.threeLayer.addTo(this.Map);
  }

  addMarker(data) {
    let layer = layerApi.getLayer("markerLayer");
    layer.clear();

    let marker = new maptalks.Marker(this.Map.getCenter(), {
      symbol: {
        markerWidth: 1,
        markerHeight: 1,
        markerFile: require("../mtk.common/img/3dmarker.png")
      },
      properties: data
    }).addTo(layer);
    var targetStyles = {
      symbol: {
        markerWidth: 40,
        markerHeight: 55
      }
    };
    let vm = Vue.extend({
      template: `
      <section>
        <info @closeInfowWin="closeInfowWin"></info>
      </section>
    `,
      components: { info },
      data() {
        return {
          temp: ""
        };
      },
      mounted() {},
      methods: {
        closeInfowWin() {
          marker.closeInfoWindow();
        }
      }
    });
    let component = new vm().$mount();
    let html = component.$el;
    var player = maptalks.animation.Animation.animate(
      targetStyles, {
        duration: 500,
        easing: 'out'
      },
      frame => {
        if (frame.state.playState === 'running') {
          marker.updateSymbol(frame.styles.symbol);
        }
        if (frame.state.playState === 'finished') {
          setTimeout(() => {
          this.showInfowindow(marker, html)
          }, 500);
        }
      }
    );
    setTimeout(function () {
      player.play();
    }, 2000);
  }
  loadArea() {
    let layer = layerApi.getLayer("areaLayer");
    layer.clear();
    axios.get("./area.json").then(res => {
      let data = res.data.features;
      data.forEach((feature) => {
        // let areaAttr = item.properties;
        let topPolygon = maptalks.GeoJSON.toGeometry(feature);
        topPolygon.updateSymbol({
          polygonFill: "#2368b5",
          // polygonOpacity: 0.3,
          lineColor: "#fff",
          lineWidth: 1,
          lineOpacity: 0,
          shadowColor: "#2368b5",
          shadowBlur: 35
        }).addTo(layer);
      })
      this.loadChildArea();
    })
  }
  loadChildArea() {
    let layer = layerApi.getLayer("areaChildLayer");
    layer.clear();
    axios.get("./areaFull.json").then(res => {
      let data = res.data.features;
      data.forEach((feature) => {
        let attr = feature.properties;
        let topPolygon = maptalks.GeoJSON.toGeometry(feature);
        topPolygon.updateSymbol({
          polygonFill: "#173569",
          lineColor: "#57a1c6",
          lineWidth: 1,
        }).addTo(layer);
        this.addAreaName(attr, layer);
      })
    })
  }

  addAreaName(attr, layer) {
    let coordinates = new maptalks.Coordinate(attr.centroid);
    if (attr.name == "襄城区") coordinates = coordinates.sub(0.06, -0.02);
    new maptalks.Marker(coordinates, {
      symbol: {
        markerType: "ellipse",
        markerWidth: 15,
        markerHeight: 15,
        markerFillOpacity: 0.8,
        markerFill: {
          type: "radial",
          colorStops: [
            [0.00, "rgba(39,200,194,0)"],
            [0.50, "rgba(39,200,194,0.7)"],
            [1.00, "rgba(39,200,194,1)"]
          ]
        },
        markerLineWidth: 0,
      },
      properties: attr
    }).addTo(layer);
    let dx = 35;
    if (attr.name == "老河口市") dx = 40;
    new maptalks.Marker(coordinates, {
      symbol: {
        textName: "{name}",
        textFill: "#26cdc5",
        textSize: 15,
        textDx: dx,
      },
      properties: attr
    }).addTo(layer);
  }


  /**
   * 根据图层id和字段值查找要素
   * @param {string} layerid 图层id
   * @param {string} field 属性字段
   * @param {string} val 字段值
   */
  findGraphic(layerid, field, val) {
    return layerApi.findGraphic(layerid, field, val)
  }

  showInfowindow(graphic, html, dx = 0, dy = 0, show = true) {
    let option = {
      single: true,
      custom: true,
      autoPan: true,
      content: html,
      dx,
      dy
    }
    let info = new maptalks.ui.InfoWindow(option);
    info.addTo(graphic);
    if (show) info.show();
  }

  dealData(data) {
    let result = [];
    data.forEach(item => {
      let attr = item.attributes;
      let geo = item.geometry;
      let coords = [];
      if (geo.rings) {
        let p = geo.rings[0];
        if (p && p.length)
          p.forEach(c => {
            coords.push(c);
          });
      } else if (geo.paths) {
        geo.paths.forEach(p => {
          let b = [];
          p.forEach(c => {
            b.push(c);
          });
          coords.push(b);
        });
      } else {
        let wgsCoord = [geo.x, geo.y];
        coords = wgsCoord;
      }
      if (coords.length)
        result.push({
          attributes: attr,
          coordinates: coords
        });
    });
    return result;
  }

  /**
   * 要素高亮
   * @param {maptalks.Geometry} graphic 点线面
   * @param {string} glowColor 颜色
   */
  glowEffect(graphic, glowColor) {
    layerApi.glowEffect(graphic, glowColor)
  }

  clearGlowEffect() {
    layerApi.clearGlowEffect();
  }

  /**
   * 清除图层
   * @param {string} layerid 图层名称
   */
  clearLayerById(layerid) {
    layerApi.ClearLayerByLayerId(layerid);
  }
  clearAllLayer() {
    layerApi.clearAllLayer();
  }
}
export default new mapApi()