<template>
  <div class="main">
    <div class="map" id="Map"></div>
    <div class="inputCon">
      <!-- FreeHandPolygon  FreeHandLineString-->
      <el-button type="primary" @click="draw('FreeHandPolygon')">画面</el-button>
      <el-button type="primary" @click="draw('FreeHandLineString')">画线</el-button>
      <el-button type="primary" @click="merge">求交集面</el-button>
    </div>
  </div>
</template>
<script>
import * as maptalks from 'maptalks'
import polygonToLine from '@turf/polygon-to-line'
import lineIntersect from '@turf/line-intersect'
import lineSlice from '@turf/line-slice'
import {point,featureCollection} from '@turf/helpers'
import concave from '@turf/concave'
import lineToPolygon from '@turf/line-to-polygon'
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
        center: [114.5331760,38.0519272],
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
      this.getLayer("poly")
      this.getLayer("line")
      this.getLayer("newline")
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
      let layer = this.getLayer("poly")
      let layer2 = this.getLayer("line")
      let layer3 = this.getLayer("newline")
      let polygon1 = layer.getGeometries()[0]
      let line1 = layer2.getGeometries()[0]
      //绘制的面
      let polygonJson = polygon1.toGeoJSON()
      //绘制的线
      let lineJson = line1.toGeoJSON()
      
      var hull = this.getLinePolygonIntersection(polygonJson, lineJson)
      let unionPolygon = maptalks.Geometry.fromJSON(hull)
      let color = this.randomColor()
      unionPolygon.updateSymbol({
        polygonFill: color,
        polygonOpacity: 0.7,
        lineColor: color,
        lineWidth: 2,
        // lineOpacity: 0,
      })
      layer3.addGeometry(unionPolygon)
      layer.clear()
      layer2.clear()
    },
    //根据线面计算交集面()
    getLinePolygonIntersection(polygonJson, lineJson) {
      let polygonLineJson = polygonToLine(polygonJson)
      //1 求线跟面的交点 两个点
      let lineIntersects = lineIntersect(polygonLineJson, lineJson)
      if(lineIntersects.features.length < 2) {
        alert("线跟面没有交点或线的交点小于2")
        return
      }
      let inspoint1 = lineIntersects.features[0];
      let inspoint2 = lineIntersects.features[1];
      //2 截取两点之间的线段
      let lineSlices = lineSlice(inspoint1, inspoint2, polygonLineJson)
      let lineSlices2 = lineSlice(inspoint1, inspoint2, lineJson)
      //3 线段和绘制的线合并
      lineSlices.geometry.coordinates.forEach(function(a) {
        lineSlices2.geometry.coordinates.push(a)
      })
      var hull = lineToPolygon(lineSlices2);
      return hull;
    },
    getLayer(layerid) {
      if (!this.Map) return;
      let layer = this.Map.getLayer(layerid);
      !layer && (
        layer = new maptalks.VectorLayer(layerid, {
          forceRenderOnMoving: true,
          forceRenderOnRotating: true,
          forceRenderOnZooming: true,
          enableSimplify: false
        }).addTo(this.Map)) //创建图层
      return layer;
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
