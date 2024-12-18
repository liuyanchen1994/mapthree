<template>
  <div class="main">
    <div class="map" id="Map"></div>t">分割</el-button>
    </div>
  </div>
</template>
<script>
import * as maptalks from 'maptalks'
import centerid from '@turf/centroid'
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
      this.getLayer('poly2')
      this.loadArea()
    },
    loadArea() {
      let layer = this.Map.getLayer('poly')
      let layer2 = this.Map.getLayer('poly2')
      let url = `http://58.49.165.89:8010/ServiceAdapter/Map/%E8%A1%97%E7%95%8C%E7%BA%BF/07769b53b5243b7d6aea9df803f471c1/0/query?where=1=1&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=*&returnGeometry=true&maxAllowableOffset=&geometryPrecision=&outSR=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&returnTrueCurves=false&resultOffset=&resultRecordCount=&f=pjson`
      maptalks.Ajax.getJSON(
        url,
        {
          jsonp: true,
        },
        (obj, data) => {
          if (data.features.length) {
            let ableData = []
            data.features.forEach(item => {
              let attr = item.attributes
              let color = this.randomColor()
              let poly = new maptalks.MultiPolygon(
                item.geometry.rings,
                {
                  symbol: {
                    polygonFill: color,
                    polygonOpacity: 1,
                    lineColor: color,
                  },
                  properties: attr
                }
              ).addTo(layer)
              let poly2 = new maptalks.Polygon(
                item.geometry.rings,
                {
                  symbol: {
                    polygonFill: color,
                    polygonOpacity: 0,
                    lineColor: color,
                    lineOpacity: 0,
                    textName: "{SSJ}"
                  },
                  properties: attr
                }
              )
              let center = centerid(poly2.toGeoJSON())
              let text = new maptalks.Marker(center.geometry.coordinates, {
                symbol: {
                  textName: attr.SSJ,
                  textFill: '#fff',
                  textOpacity: 1,
                  textHaloFill: '#000',
                  textHaloRadius: 1,
                  textHaloWidth: 1,
                  textDx: 0,
                  textDy: 0,
                  textFont: '14px Arial',
                  textHorizontalAlignment: 'middle',
                  textVerticalAlignment: 'middle',
                },
                properties: attr
              }).addTo(layer2)
            })
            this.Map.fitExtent(layer.getExtent())
          }
        }
      )
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
