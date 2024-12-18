<template>
  <div class="main">
    <div class="map" id="Map"></div>
  </div>
</template>
<script>
import * as maptalks from 'maptalks'
import hexGrid from '@turf/hex-grid'
import centroid from '@turf/centroid'
//面的填充
export default {
  name: 'polygonFillImg',
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
      const data = {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [77.2762305966095, 38.19735267386674],
              [77.27867398759663, 38.19785247244337],
              [77.27871441134458, 38.197863106418055],
              [77.27879076731293, 38.19785601710179],
              [77.27888059786392, 38.19783474914876],
              [77.27893449619452, 38.19778512390067],
              [77.27897941147002, 38.197678783968506],
              [77.27940610658726, 38.19620064269484],
              [77.27829220775489, 38.195952510498444],
              [77.27824729247939, 38.1959418762424],
              [77.278211360259, 38.19587452591778],
              [77.27802271610189, 38.19587452591778],
              [77.27786551263765, 38.195977323756445],
              [77.27780712277949, 38.19626799271532],
              [77.27794186860599, 38.196406237297396],
              [77.27809907207025, 38.19649131075484],
              [77.27802271610189, 38.1966366443461],
              [77.27778466514175, 38.19664373378209],
              [77.27723669878067, 38.1967323516733],
              [77.27671119005733, 38.19683514829085],
              [77.27635186785334, 38.196867050659655],
              [77.2762305966095, 38.19735267386674],
            ],
          ],
        },
        properties: null,
      }
      this.three(data)
    },
    three(data) {
      let layer2 = this.getLayer('grass')
      let layer = this.getLayer('tree')
      layer2.clear()
      layer.clear()
      const grass = new maptalks.Geometry.fromJSON(data)
      grass.updateSymbol({
        polygonFill: '#0f0',
        polygonOpacity: 0.2,
        lineColor: '#66B1FF',
        lineWidth: 2,
      })
      const extent = grass.getExtent()
      const box = [extent.xmin, extent.ymin, extent.xmax, extent.ymax]
      const hexgrid = hexGrid(box, 10, { units: 'meters' })
      let markers = []
      hexgrid.features.forEach((feature) => {
        const p = new maptalks.Geometry.fromJSON(feature)
        const m = new maptalks.Marker(p.getCenter(), {
          symbol: {
            markerFile: require('@/utils/shaders/texture/marker/treemarker.png'),
            markerWidth: {
              stops: [
                [15, 0],
                [18, 15],
                [19, 30],
              ],
            },
            markerHeight: {
              stops: [
                [15, 0],
                [18, 24],
                [19, 48],
              ],
            },
          },
        })
        markers.push(m)
      })
      layer2.addGeometry(grass)
      layer.addGeometry(markers)
      layer.setMask(grass.copy())
      const center = centroid(data)
      const text = new maptalks.Label('', center.geometry.coordinates)
      this.Map.fitExtent(layer.getExtent())
    },
    showInfowindow(graphic, html, dx = 0, dy = 0, autoPan = true, show = true) {
      if (graphic.getInfoWindow()) {
        if (graphic.getInfoWindow().isVisible()) {
          graphic.getInfoWindow().hide()
        } else graphic.getInfoWindow().show()
        return
      }
      let option = {
        single: true,
        custom: true,
        autoPan: autoPan,
        content: html,
        dx,
        dy,
      }
      let info = new maptalks.ui.InfoWindow(option)
      info.addTo(graphic)
      if (show) info.show()
    },
    generateTexture() {
      var canvas = document.createElement('canvas')
      canvas.width = 512
      canvas.height = 512

      var context = canvas.getContext('2d')

      for (var i = 0; i < 40000; i++) {
        context.fillStyle = 'hsl(0,0%,' + (Math.random() * 50 + 50) + '%)'
        context.beginPath()
        context.arc(
          Math.random() * canvas.width,
          Math.random() * canvas.height,
          Math.random() + 0.15,
          0,
          Math.PI * 2,
          true
        )
        context.fill()
      }

      context.globalAlpha = 0.075
      context.globalCompositeOperation = 'lighter'

      return canvas
    },
    draw(type) {
      let layer = this.getLayer('poly')
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
        console.log(JSON.stringify(graphic.toGeoJSON()))
      })
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
