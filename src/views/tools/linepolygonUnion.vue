<template>
  <div class="main">
    <div class="map" id="Map"></div>
    <div class="inputCon">
      <!-- FreeHandPolygon  FreeHandLineString-->
      <el-button type="primary" @click="draw('FreeHandPolygon')"
        >画面</el-button
      >
      <el-button type="primary" @click="draw('FreeHandLineString')"
        >画线</el-button
      >
      <el-button type="primary" @click="merge">求交集面</el-button>
    </div>
  </div>
</template>
<script>
import * as maptalks from 'maptalks'
import polygonToLine from '@turf/polygon-to-line'
import lineIntersect from '@turf/line-intersect'
import lineSlice from '@turf/line-slice'
import booleanPointInPolygon from '@turf/boolean-point-in-polygon'
import { point, polygon } from '@turf/helpers'
//获取线跟面的交集面
export default {
  name: 'linepolygonUnion',
  data() {
    return {
      Map: null,
    }
  },
  mounted() {
    this.baiduMap()
  },
  methods: {
    baiduMap() {
      this.Map && this.Map.remove()
      let options = {
        center: [114.533176, 38.0519272],
        zoom: 12,
        view: {
          projection: 'baidu',
        },
        attribution: false,
        baseLayer: new maptalks.TileLayer('base', {
          urlTemplate: `https://maponline2.bdimg.com/tile/?qt=vtile&x={x}&y={y}&z={z}&styles=pl&scaler=2&udt=20220317`,
        }),
      }
      this.Map = new maptalks.Map('Map', options)
      this.getLayer('poly')
      this.getLayer('line')
      this.getLayer('newline')
    },
    draw(type) {
      let layer = this.Map.getLayer('poly')
      let layer2 = this.Map.getLayer('line')
      this.drawTool = new maptalks.DrawTool({
        mode: type,
        symbol: {
          polygonFill: '#f00',
          polygonOpacity: 0.2,
          lineColor: '#f00',
          lineWidth: 3,
        },
        once: true,
      }).addTo(this.Map)
      this.drawTool.on('drawend', (param) => {
        let graphic = param.geometry
        type === 'FreeHandPolygon' ? layer.clear() : layer2.clear()
        type == 'FreeHandPolygon'
          ? layer.addGeometry(graphic)
          : layer2.addGeometry(graphic)
      })
    },
    merge() {
      let layer = this.getLayer('poly')
      let layer2 = this.getLayer('line')
      let layer3 = this.getLayer('newline')
      let polygon1 = layer.getGeometries()[0]
      let line1 = layer2.getGeometries()[0]
      //绘制的面
      let polygonJson = polygon1.toGeoJSON()
      //绘制的线
      let lineJson = line1.toGeoJSON()

      var newpolygonJson = this.getLinePolygonIntersection(
        polygonJson,
        lineJson
      )
      let newPolygon = maptalks.Geometry.fromJSON(newpolygonJson)
      newPolygon
        .updateSymbol({
          polygonFill: '#f00',
          polygonOpacity: 0.2,
          lineColor: '#f00',
          lineWidth: 3,
        })
        .addTo(layer3)
      layer.clear()
      layer2.clear()
    },
    //根据线面计算交集面()
    getLinePolygonIntersection(polygonJson, lineJson) {
      let polygonLineJson = polygonToLine(polygonJson)
      //1 求线跟面的交点 两个点
      let lineIntersects = lineIntersect(polygonLineJson, lineJson)
      if (lineIntersects.features.length < 2) {
        alert('线跟面没有交点或线的交点小于2')
        return
      }
      if (lineJson.geometry.type === 'LineString') {
        if (
          !booleanPointInPolygon(
            point(lineJson.geometry.coordinates[0]),
            polygonJson
          ) ||
          !booleanPointInPolygon(
            point(
              lineJson.geometry.coordinates[
                lineJson.geometry.coordinates.length - 1
              ]
            ),
            polygonJson
          )
        )
          throw '起点和终点必须在多边形之内'
      }
      let inspoint1 = lineIntersects.features[0]
      let inspoint2 = lineIntersects.features[1]
      //2 截取两点之间的线段
      let lineSlices = lineSlice(inspoint1, inspoint2, polygonLineJson)
      let lineSlices2 = lineSlice(inspoint1, inspoint2, lineJson)
      let path = lineSlices.geometry.coordinates
      let path1 = lineSlices2.geometry.coordinates
      if (this.Map.computeLength(path[0], path1[0]) < 10) path.reverse()
      let newPath = [...path, ...path1]
      newPath.push(newPath[0])
      return polygon([newPath])
    },
    getLayer(layerid) {
      if (!this.Map) return
      let layer = this.Map.getLayer(layerid)
      !layer &&
        (layer = new maptalks.VectorLayer(layerid, {
          forceRenderOnMoving: true,
          forceRenderOnRotating: true,
          forceRenderOnZooming: true,
          enableSimplify: false,
        }).addTo(this.Map)) //创建图层
      return layer
    },
    //随机颜色
    randomColor() {
      return (
        '#' +
        ('00000' + ((Math.random() * 0x1000000) << 0).toString(16)).slice(-6)
      )
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
  .inputCon {
    width: 400px;
    height: auto;
    position: absolute;
    z-index: 5;
    top: 10px;
    left: 10px;
    float: left;
  }
}
</style>
