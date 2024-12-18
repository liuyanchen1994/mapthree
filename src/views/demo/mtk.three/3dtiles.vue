<template>
  <div class="main">
    <div class="map" id="Map"></div>
    <div class="btn" @click="mapChange=!mapChange">切换</div>
    <!-- <div class="btn">
      <input type="text" v-model="zindex">
    </div> -->
  </div>
</template>
<script>
import * as Cesium from 'cesium'
import * as maptalks from 'maptalks'
import { CesiumLayer, Cesium3DTileset, Primitive } from './maptalks.cesium.es'
export default {
  data() {
    return {
      mapChange: false,
      slUrl:
        'http://58.49.165.89:8010/ServiceAdapter/MAP/%E7%94%B5%E5%AD%90%E5%9C%B0%E5%9B%BE/07769b53b5243b7d6aea9df803f471c1',
      yxUrl:
        'http://58.49.165.19:8083/ServiceAdapter/Map/%E6%9C%80%E6%96%B0%E9%81%A5%E6%84%9F%E5%BD%B1%E5%83%8F/fd69b2360e6573484fdf57be2a16085a',
      blueDeep:
        'http://58.49.165.19:8083/ServiceAdapter/Map/%E6%94%BF%E5%8A%A1%E7%94%B5%E5%AD%90%E5%9C%B0%E5%9B%BE%EF%BC%88%E5%A4%9C%E5%85%89%E7%89%88%EF%BC%89/fd69b2360e6573484fdf57be2a16085a',
    }
  },
  watch: {
    zindex(val) {
      return
      var boundingSphere = this.temptileset.boundingSphere
      var cartographic = Cesium.Cartographic.fromCartesian(
        boundingSphere.center
      )
      var surface = Cesium.Cartesian3.fromRadians(
        cartographic.longitude,
        cartographic.latitude,
        cartographic.height
      )
      var offset = Cesium.Cartesian3.fromRadians(
        cartographic.longitude,
        cartographic.latitude,
        Number(val)
      )
      var translation = Cesium.Cartesian3.subtract(
        offset,
        surface,
        new Cesium.Cartesian3()
      )
      this.temptileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation)
    },
    mapChange(val) {
      if (val) {
        window.Maps.getLayer('yxlayer').show()
        window.Maps.getLayer('sllayer').hide()
      } else {
        window.Maps.getLayer('yxlayer').hide()
        window.Maps.getLayer('sllayer').show()
      }
    },
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      maptalks.SpatialReference.loadArcgis(
        `${this.blueDeep}?f=pjson`,
        (err, conf) => {
          let view = conf.spatialReference
          let center = [
            Number((view.fullExtent.xmax + view.fullExtent.xmin) / 2),
            Number((view.fullExtent.ymax + view.fullExtent.ymin) / 2),
          ]
          view.projection = 'EPSG:4326'
          let options = {
            center: [114.14069249433261, 30.630464296045343],
            zoom: 7,
            maxZoom: view.resolutions.length - 1,
            view: view,
            attribution: false,
            baseLayer: new maptalks.TileLayer('sllayer', {
              tileSystem: conf.tileSystem,
              tileSize: conf.tileSize,
              // renderer: "gl",
              urlTemplate: `${this.blueDeep}/tile/{z}/{y}/{x}`,
              repeatWorld: false,
            }),
          }
          window.Maps = new maptalks.Map('Map', options)
          // this.Map.getLayer('yxlayer').hide()
          window.Maps.on('click', (e) => {
            console.log(e.coordinate)
          })

          var cesiumLayer = new CesiumLayer('yxlayer', {
            gray: false,
            geometryEvents: true,
          }).addTo(window.Maps)

          // cesiumLayer.onSelect = function (e) {
          //   console.log(e)
          // }
          //获取cesium scene对象
          var scene = cesiumLayer.getCesiumScene()

          var tileset = new Cesium3DTileset({
            url:
              'http://172.16.4.115:9000/model/0061607035b011eb80f6dd01302ef676/tileset.json',
          })
          scene.primitives.add(tileset)

          tileset.readyPromise.then(function (tileset) {
            var boundingSphere = tileset.boundingSphere
            var cartographic = Cesium.Cartographic.fromCartesian(
              boundingSphere.center
            )
            console.log(cartographic,"cartographic.height")
            var surface = Cesium.Cartesian3.fromRadians(
              cartographic.longitude,
              cartographic.latitude,
              0.0
            )
            var offset = Cesium.Cartesian3.fromRadians(
              cartographic.longitude,
              cartographic.latitude,
              -10
            )
            var translation = Cesium.Cartesian3.subtract(
              offset,
              surface,
              new Cesium.Cartesian3()
            )
            tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation)
          })

          // cesiumLayer.addPrimitive(tileset)

          // //  mousemove dbclick contextmenu
          // ellipse.on('click', (e) => {
          //   console.log(e)
          // })
          let layer = new maptalks.VectorLayer('templayer', {
            enableAltitude: true,
            altitudeProperty: 'altitude',
          }).addTo(window.Maps) //创建图层

          var silhouetteGreen = Cesium.PostProcessStageLibrary.createEdgeDetectionStage()
          silhouetteGreen.uniforms.color = Cesium.Color.LIME
          silhouetteGreen.uniforms.length = 0.01

          var silhouetteBlue = Cesium.PostProcessStageLibrary.createEdgeDetectionStage()
          silhouetteBlue.uniforms.color = Cesium.Color.BLUE //蓝色
          silhouetteBlue.uniforms.length = 0.01

          tileset.on('click', (e) => {
            // let primitives = cesiumLayer.identify(e.coordinate, { count: 1 })
            // cesiumLayer.removePrimitive(primitives)
            // return
            silhouetteBlue.selected = []
            silhouetteGreen.selected = []
            console.log(e)
            // this.tileClick(scene, e, layer, cesiumLayer)
            this.tileClickTest(scene, e, silhouetteGreen, silhouetteBlue)
          })
        }
      )
    },
    tileClickTest(scene, e, silhouetteGreen, silhouetteBlue) {
      // var picks = scene.pick(e.point2d)
      var picks = scene.drillPick(e.viewPoint)
      // scene.render()
      for (var i = 0; i < picks.length; i++) {
        if (
          (picks[i] && picks[i].primitive) ||
          picks[i] instanceof Cesium.Cesium3DTileFeature
        ) {
          //模型上拾取
          // isOn3dtiles = true
          silhouetteGreen.selected.push(picks[i])
          silhouetteBlue.selected.push(picks[i])
        }
      }
      scene.postProcessStages.add(
        Cesium.PostProcessStageLibrary.createSilhouetteStage([
          silhouetteBlue,
          silhouetteGreen,
        ])
      )
    },
    tileClick(scene, e, layer, cesiumLayer) {
      this.loadBuild(e.coordinate, layer, cesiumLayer)
      return;
      var picks = scene.drillPick(e.viewPoint)
      scene.render()
      var cartesian
      var isOn3dtiles = false
      for (var i = 0; i < picks.length; i++) {
        if (
          (picks[i] && picks[i].primitive) ||
          picks[i] instanceof Cesium.Cesium3DTileFeature
        ) {
          //模型上拾取
          isOn3dtiles = true
        }
      }
      if (isOn3dtiles) {
        let cartesian = scene.pickPosition(e.viewPoint)
        console.log(cartesian, 'cartesian')
        // 转换坐标
        var ellipsoid = scene.globe.ellipsoid
        var cartesian3 = new Cesium.Cartesian3(
          cartesian.x,
          cartesian.y,
          cartesian.z
        )
        var cartographic = ellipsoid.cartesianToCartographic(cartesian3)
        var lat = Cesium.Math.toDegrees(cartographic.latitude)
        var lng = Cesium.Math.toDegrees(cartographic.longitude)
        //根据坐标点查询建筑数据
        this.loadBuild(e.coordinate, layer, cesiumLayer)
        // this.loadBuild(lng, lat, layer, cesiumLayer)
      } else {
        console.warn('请到模型上拾取！')
        return
      }
    },
    loadBuild(coord, layer, cesiumLayer) {
      let geometry = {
        x: coord.x,
        y: coord.y,
        spatialReference: { wkid: 4326 },
      }
      geometry = JSON.stringify(geometry)
      let url = `http://58.49.165.19:8083/ServiceAdapter/Map/%E6%88%BF%E5%B1%8B/fd69b2360e6573484fdf57be2a16085a/0/query?&where=1=1&geometry=${geometry}&geometryType=esriGeometryPoint&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&objectIds=&time=&returnCountOnly=false&returnGeometry=true&maxAllowableOffset=&outSR=&text=&outFields=*&f=pjson`
      maptalks.Ajax.getJSON(url, (obj, data) => {
        if (data.features.length) {
          let feature = data.features[0]
          let polygon = new maptalks.Polygon(feature.geometry.rings, {
            symbol: {
              polygonFill: '#f00',
              lineColor: '#f00',
              lineWidth: 5,
            },
          }).addTo(layer)
          let geojson = polygon.toGeoJSON()
        }
      })
    },
    adjust() {},
    getLayer(layerid) {
      let layer = null
      if (this.Map) {
        if (this.Map.getLayer(layerid)) {
          //根据图层id获取图层
          layer = this.Map.getLayer(layerid) //获取图层
        } else {
          layer = new maptalks.VectorLayer(layerid, {
            enableAltitude: true,
            altitudeProperty: 'altitude',
          }).addTo(this.Map) //创建图层
        }
      }
      return layer
    },
    loadCesiumLayer() {
      var cesiumLayer = new CesiumLayer('cesium', {
        gray: false,
        geometryEvents: false,
      }).addTo(this.Map)

      // cesiumLayer.onSelect = function (e) {
      //   console.log(e)
      // }
      //获取cesium scene对象
      var scene = cesiumLayer.getCesiumScene()

      var tileset = new Cesium3DTileset({
        url:
          'http://172.16.4.115:9000/model/0061607035b011eb80f6dd01302ef676/tileset.json',
      })
      // scene.primitives.add(tileset);
      cesiumLayer.addPrimitive(tileset)
      tileset.on('mousemove', (e) => {
        console.log(e)
      })

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
    },
  },
}
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
