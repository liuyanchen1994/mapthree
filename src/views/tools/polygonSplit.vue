<template>
  <div class="main">
    <div class="map" id="Map"></div>
    <div class="inputCon">
      <!-- FreeHandPolygon  FreeHandLineString-->
      <el-button type="primary" @click="draw('Polygon')">
        >画面</el-button
      >
      <el-button type="primary" @click="draw('LineString')">
        >画线</el-button
      >
      <el-button type="primary" @click="split">分割</el-button>
    </div>
  </div>
</template>
<script>
import * as maptalks from 'maptalks'
import booleanPointInPolygon from '@turf/boolean-point-in-polygon'
import lineIntersect from '@turf/line-intersect'
import explode from '@turf/explode'
import buffer from '@turf/buffer'
import difference from '@turf/difference'
import { polygon, point } from '@turf/helpers'
import distance from '@turf/distance'
//分割面
export default {
  name: 'polygonSplit',
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
      let symbol = {
        polygonFill: '#66B1FF',
        polygonOpacity: 0.2,
        lineColor: '#66B1FF',
        lineWidth: 3,
      }
      if (type !== 'Polygon') symbol.lineDasharray = [8, 8]
      this.drawTool = new maptalks.DrawTool({
        mode: type,
        symbol,
        once: true,
      }).addTo(this.Map)
      this.drawTool.on('drawend', (param) => {
        let graphic = param.geometry
        type === 'Polygon' ? layer.clear() : layer2.clear()
        type == 'Polygon'
          ? layer.addGeometry(graphic)
          : layer2.addGeometry(graphic)
      })
    },
    split() {
      let layer = this.getLayer('poly')
      let layer2 = this.getLayer('line')
      let layer3 = this.getLayer('newline')
      layer3.clear()
      let polygon = layer.getGeometries()[0]
      let line = layer2.getGeometries()[0]
      //面画成线
      let polygonJson = polygon.toGeoJSON()
      const splitter = line.toGeoJSON()
      let result = this.polygonCut(polygonJson, splitter)
      let colors = this.getGradientColor('#f00', '#00f', result.length)
      result.forEach((item, i) => {
        let line = maptalks.Geometry.fromJSON(item)
        let color = colors[i]
        line.updateSymbol({
          polygonFill: color,
          polygonOpacity: 0.7,
          lineColor: color,
          lineWidth: 1,
          lineOpacity: 0,
        })
        layer3.addGeometry(line)
      })
      layer.clear()
      layer2.clear()
    },
    //分割面
    polygonCut(poly, line, tolerance = 1, toleranceType = 'meters') {
      // 1. 条件判断
      if (poly.geometry === void 0 || poly.geometry.type !== 'Polygon')
        throw '传入的必须为polygon'
      if (
        line.geometry === void 0 ||
        line.geometry.type.toLowerCase().indexOf('linestring') === -1
      )
        throw '传入的必须为linestring'
      if (line.geometry.type === 'LineString') {
        if (
          booleanPointInPolygon(point(line.geometry.coordinates[0]), poly) ||
          booleanPointInPolygon(
            point(
              line.geometry.coordinates[line.geometry.coordinates.length - 1]
            ),
            poly
          )
        )
          throw '起点和终点必须在多边形之外'
      }
      // 2. 计算交点，并把线的点合并
      let lineIntersects = lineIntersect(line, poly)
      const lineExp = explode(line)
      for (let i = 0; i < lineExp.features.length - 1; i++) {
        lineIntersects.features.push(
          point(lineExp.features[i].geometry.coordinates)
        )
      }
      // 3. 计算线的缓冲区
      const lineBuffer = buffer(line, tolerance, {
        units: toleranceType,
      })
      // 4. 计算线缓冲和多边形的difference，返回"MultiPolygon"，所以将其拆开
      const _body = difference(poly, lineBuffer)
      let pieces = []
      if (_body.geometry.type === 'Polygon') {
        pieces.push(polygon(_body.geometry.coordinates))
      } else {
        _body.geometry.coordinates.forEach(function(a) {
          pieces.push(polygon(a))
        })
      }
      // 5. 处理点数据
      for (let p in pieces) {
        const piece = pieces[p]
        for (let c in piece.geometry.coordinates[0]) {
          const coord = piece.geometry.coordinates[0][c]
          const p = point(coord)
          for (let lp in lineIntersect.features) {
            const lpoint = lineIntersect.features[lp]
            if (distance(lpoint, p, toleranceType) <= tolerance * 2) {
              piece.geometry.coordinates[0][c] = lpoint.geometry.coordinates
            }
          }
        }
      }
      // 6. 过滤掉重复点
      // for (p in pieces) {
      //   const coords = pieces[p].geometry.coordinates[0]
      //   pieces[p].geometry.coordinates[0] = filterDuplicatePoints(coords)
      // }
      // 7. 将属性赋予每一个polygon，并处理id
      pieces.forEach((a, index) => {
        a.properties = Object.assign({}, poly.properties)
        a.properties.id += `-${index}`
      })
      return pieces
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
    // 随机渐变色
    getGradientColor(startColor, endColor, step) {
      // 参数为RGB格式
      let startRGB = this.colorRgb(startColor)
      let startR = startRGB[0]
      let startG = startRGB[1]
      let startB = startRGB[2]

      let endRGB = this.colorRgb(endColor)
      let endR = endRGB[0]
      let endG = endRGB[1]
      let endB = endRGB[2]

      let sR = (endR - startR) / step
      let sG = (endG - startG) / step
      let sB = (endB - startB) / step

      let colorArr = []
      for (let i = 0; i < step; i++) {
        let hex = this.colorHex(
          'rgb(' +
            parseInt(sR * i + startR) +
            ',' +
            parseInt(sG * i + startG) +
            ',' +
            parseInt(sB * i + startB) +
            ')'
        )
        colorArr.push(hex)
      }
      return colorArr
    },
    colorRgb(sColor) {
      let reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/
      sColor = sColor.toLowerCase()
      if (sColor && reg.test(sColor)) {
        if (sColor.length === 4) {
          let sColorNew = '#'
          for (let i = 1; i < 4; i += 1) {
            sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1))
          }
          sColor = sColorNew
        }
        let sColorChange = []
        for (let i = 1; i < 7; i += 2) {
          sColorChange.push(parseInt('0x' + sColor.slice(i, i + 2)))
        }
        return sColorChange
      } else {
        return sColor
      }
    },
    colorHex(sColor) {
      let reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/
      sColor = sColor.toLowerCase()
      if (sColor && reg.test(sColor)) {
        if (sColor.length === 4) {
          let sColorNew = '#'
          for (let i = 1; i < 4; i += 1) {
            sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1))
          }
          sColor = sColorNew
        }
        return sColor
      } else {
        return sColor
      }
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
