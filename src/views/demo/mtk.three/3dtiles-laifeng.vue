<template>
  <div class="main">
    <div class="map" id="Map"></div>
    <!-- <div class="btn" @click="mapChange = !mapChange">切换</div> -->
    <!-- <div class="btn">
      <input type="text" v-model="zindex">
    </div> -->
  </div>
</template>
<script>
import * as Cesium from "cesium";
import * as maptalks from "maptalks";
import { CesiumLayer, Cesium3DTileset } from "./maptalks.cesium.es";
export default {
  data() {
    return {
      mapChange: false,
      slUrl: "",
      threeTilesUrl: ""
    };
  },
  watch: {
    mapChange(val) {
      if (val) {
        window.Maps.getLayer("yxlayer").show();
        window.Maps.getLayer("sllayer").hide();
      } else {
        window.Maps.getLayer("yxlayer").hide();
        window.Maps.getLayer("sllayer").show();
      }
    }
  },
  mounted() {
    this.slUrl = window.mapConfig.lfBaseMapUrl;
    this.threeTilesUrl = window.mapConfig.lf3dtilesUrl;
    this.init();
  },
  methods: {
    init() {
      maptalks.SpatialReference.loadArcgis(
        `${this.slUrl}?f=pjson`,
        (err, conf) => {
          let view = conf.spatialReference;
          view.projection = "EPSG:4490";
          let center = [
            Number((view.fullExtent.xmax + view.fullExtent.xmin) / 2),
            Number((view.fullExtent.ymax + view.fullExtent.ymin) / 2)
          ];
          let options = {
            center: window.mapConfig.center || center,
            zoom: window.mapConfig.initZoom || 2,
            minZoom: window.mapConfig.minZoom || 2,
            maxZoom: window.mapConfig.maxZoom || view.resolutions.length - 1,
            view: view,
            attribution: false,
            baseLayer: new maptalks.TileLayer("sllayer", {
              tileSystem: conf.tileSystem,
              tileSize: conf.tileSize,
              renderer: "canvas",
              urlTemplate: `${this.slUrl}/tile/{z}/{y}/{x}`,
              repeatWorld: false
            })
          };
          window.Maps = new maptalks.Map("Map", options);
          // this.Map.getLayer('yxlayer').hide()
          window.Maps.on("click", e => {
            console.log(e.coordinate);
          });
          var cesiumLayer = new CesiumLayer("yxlayer", {
            gray: false,
            geometryEvents: true
          }).addTo(window.Maps);
          //   return;

          // cesiumLayer.onSelect = function (e) {
          //   console.log(e)
          // }
          //获取cesium scene对象
          var scene = cesiumLayer.getCesiumScene();

          let tileLayerUrls = window.mapConfig.lf3dtilesUrl;
          tileLayerUrls.forEach(tileUrl => {
            let tileset = new Cesium3DTileset({
              url: tileUrl
            });
            scene.primitives.add(tileset);
            tileset.readyPromise.then(function(tileset) {
              var boundingSphere = tileset.boundingSphere;
              var cartographic = Cesium.Cartographic.fromCartesian(
                boundingSphere.center
              );
              console.log(cartographic, "cartographic.height");
              var surface = Cesium.Cartesian3.fromRadians(
                cartographic.longitude,
                cartographic.latitude,
                0.0
              );
              var offset = Cesium.Cartesian3.fromRadians(
                cartographic.longitude,
                cartographic.latitude,
                -cartographic.height
              );
              var translation = Cesium.Cartesian3.subtract(
                offset,
                surface,
                new Cesium.Cartesian3()
              );
              tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
            });
          });

          // var tileset = new Cesium3DTileset({
          //   url: this.threeTilesUrl
          //   // "http://172.16.4.115:9000/model/62c839e0442511ebaf551795af04843d/tileset.json"
          // });

          // cesiumLayer.addPrimitive(tileset)
        }
      );
    },
    tileClickTest(scene, e, silhouetteGreen, silhouetteBlue) {
      // var picks = scene.pick(e.point2d)
      var picks = scene.drillPick(e.viewPoint);
      // scene.render()
      for (var i = 0; i < picks.length; i++) {
        if (
          (picks[i] && picks[i].primitive) ||
          picks[i] instanceof Cesium.Cesium3DTileFeature
        ) {
          //模型上拾取
          // isOn3dtiles = true
          silhouetteGreen.selected.push(picks[i]);
          silhouetteBlue.selected.push(picks[i]);
        }
      }
      scene.postProcessStages.add(
        Cesium.PostProcessStageLibrary.createSilhouetteStage([
          silhouetteBlue,
          silhouetteGreen
        ])
      );
    },
    tileClick(scene, e, layer, cesiumLayer) {
      this.loadBuild(e.coordinate, layer, cesiumLayer);
    },
    loadBuild(coord, layer) {
      let geometry = {
        x: coord.x,
        y: coord.y,
        spatialReference: { wkid: 4326 }
      };
      geometry = JSON.stringify(geometry);
      let url = `http://58.49.165.19:8083/ServiceAdapter/Map/%E6%88%BF%E5%B1%8B/fd69b2360e6573484fdf57be2a16085a/0/query?&where=1=1&geometry=${geometry}&geometryType=esriGeometryPoint&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&objectIds=&time=&returnCountOnly=false&returnGeometry=true&maxAllowableOffset=&outSR=&text=&outFields=*&f=pjson`;
      maptalks.Ajax.getJSON(url, (obj, data) => {
        if (data.features.length) {
          let feature = data.features[0];
          new maptalks.Polygon(feature.geometry.rings, {
            symbol: {
              polygonFill: "#f00",
              lineColor: "#f00",
              lineWidth: 5
            }
          }).addTo(layer);
          //   let geojson = polygon.toGeoJSON();
        }
      });
    },
    adjust() {},
    getLayer(layerid) {
      let layer = null;
      if (this.Map) {
        if (this.Map.getLayer(layerid)) {
          //根据图层id获取图层
          layer = this.Map.getLayer(layerid); //获取图层
        } else {
          layer = new maptalks.VectorLayer(layerid, {
            enableAltitude: true,
            altitudeProperty: "altitude"
          }).addTo(this.Map); //创建图层
        }
      }
      return layer;
    },
    loadCesiumLayer() {
      var cesiumLayer = new CesiumLayer("cesium", {
        gray: false,
        geometryEvents: false
      }).addTo(this.Map);

      // cesiumLayer.onSelect = function (e) {
      //   console.log(e)
      // }
      //获取cesium scene对象
      cesiumLayer.getCesiumScene();

      var tileset = new Cesium3DTileset({
        url:
          "http://172.16.4.115:9000/model/0061607035b011eb80f6dd01302ef676/tileset.json"
      });
      // scene.primitives.add(tileset);
      cesiumLayer.addPrimitive(tileset);
      tileset.on("mousemove", e => {
        console.log(e);
      });

      // var instance = new Cesium.GeometryInstance({
      //   geometry: new Cesium.EllipseGeometry({
      //     center: Cesium.Cartesian3.fromDegrees(
      //       114.14069249433261,
      //       30.630464296045343,
      //       10
      //     ),
      //     semiMinorAxis: 20.0,
      //     semiMajorAxis: 30.0,
      //     extrudedHeight: 20,
      //     rotation: Cesium.Math.PI_OVER_FOUR,
      //     vertexFormat: Cesium.VertexFormat.POSITION_AND_ST,
      //   }),
      //   id: maptalks.Util.GUID(),
      // })
      // const ellipse = new Primitive({
      //   geometryInstances: instance,
      //   appearance: new Cesium.EllipsoidSurfaceAppearance({
      //     material: Cesium.Material.fromType('Checkerboard'),
      //   }),
      // })
      // ellipse.on('click mousemove dbclick contextmenu', (e) => {
      //   console.log(e)
      // })
    }
  }
};
</script>

<style lang="less" scoped>
.main {
  width: 100%;
  height: 100vh;
  background: #fff;
  .map {
    width: 100%;
    height: 100vh;
  }
  .btn {
    width: 200px;
    height: 35px;
    border-radius: 5px;
    background: violet;
    cursor: pointer;
    text-align: center;
    line-height: 35px;
    position: absolute;
    left: 20px;
    top: 20px;
  }
}
</style>
