<template>
  <div class="main">
    <div class="map" id="Map"></div>
    <div class="inputCon">
      <!-- FreeHandPolygon  FreeHandLineString-->
      <el-button type="primary" @click="draw('Polygon')"> >画面</el-button>
      <el-button type="primary" @click="merge">合并</el-button>
    </div>
  </div>
</template>
<script>
import * as maptalks from 'maptalks'
import union from '@turf/union'
import Ajax from './js/ajax'
import gcoord from 'gcoord'
//合并面
export default {
  name: 'polygonUnion',
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
        // center: [114.533176, 38.0519272],
        center: [77.26992000040191, 38.171641999719817],
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
      this.getLayer('newline')
      // this.unionServiceTest()
    },
    draw(type) {
      let layer = this.Map.getLayer('poly')
      this.drawTool = new maptalks.DrawTool({
        mode: type,
        symbol: {
          polygonFill: '#66B1FF',
          polygonOpacity: 0.2,
          lineColor: '#66B1FF',
          lineWidth: 3,
        },
        once: true,
      }).addTo(this.Map)
      this.drawTool.on('drawend', (param) => {
        let graphic = param.geometry
        layer.addGeometry(graphic)
        graphic.startEdit(this.getEditSymbol())
      })
    },
    merge() {
      let layer = this.getLayer('poly')
      let layer3 = this.getLayer('newline')
      let polygon1 = layer.getGeometries()[0]
      let polygon2 = layer.getGeometries()[1]
      let polygonJson1 = polygon1.toGeoJSON()
      let polygonJson2 = polygon2.toGeoJSON()
      let result = union(polygonJson1, polygonJson2)
      let unionPolygon = maptalks.Geometry.fromJSON(result)
      let color = this.randomColor()
      unionPolygon.updateSymbol({
        polygonFill: '#66B1FF',
        polygonOpacity: 0.2,
        lineColor: '#66B1FF',
        lineWidth: 3,
      })
      layer3.addGeometry(unionPolygon)
      unionPolygon.startEdit(this.getEditSymbol())
      layer.clear()
    },
    unionServiceTest() {
      let layer = this.getLayer('poly')
      new Ajax().getJSON(
        'http://172.16.4.115:6080/arcgis/rest/services/XJZP/QH/MapServer/0/query?where=1%3D1&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=*&returnGeometry=true&maxAllowableOffset=&geometryPrecision=&outSR=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&f=pjson',
        {
          jsonp: true,
        },
        (obj, data) => {
          data.features.forEach((item) => {
            let geo = item.geometry.rings[0]
            let paths = []
            geo.forEach((c) => {
              let bdcoord = gcoord.transform(c, gcoord['WGS84'], gcoord['BD09'])
              paths.push(bdcoord)
            })
            new maptalks.Polygon(paths, {
              symbol: {
                polygonFill: '#66B1FF',
                polygonOpacity: 0.2,
                lineColor: '#66B1FF',
                lineWidth: 3,
              },
              properties: item.attributes,
            }).addTo(layer)
          })
        }
      )
    },
    getEditSymbol() {
      const options = {
        //fix outline's aspect ratio when resizing
        fixAspectRatio: false,
        // geometry's symbol when editing
        // 'symbol': null,
        removeVertexOn: 'contextmenu',
        //symbols of edit handles
        centerHandleSymbol: this.createHandleSymbol('ellipse', 1),
        vertexHandleSymbol: this.createHandleSymbol('ellipse', 1, 10),
        newVertexHandleSymbol: this.createHandleSymbol('ellipse', 0.4),
      }
      return options
    },

    createHandleSymbol(markerType, opacity, width) {
      return {
        markerType: markerType,
        markerFill: '#fff',
        // markerFillOpacity: 0.5,
        markerLineColor: '#5298f8',
        markerLineWidth: 2,
        markerWidth: width || 10,
        markerHeight: width || 10,
        opacity: opacity,
        lineDasharray: [5, 5],
        lineColor: '#5298f8',
      }
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
