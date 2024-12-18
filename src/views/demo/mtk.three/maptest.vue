<template>
  <div class="main">
    <div class="map" id="Map"></div>
    <div class="btn" @click="mapChange=!mapChange">切换</div>
  </div>
</template>
<script>
import * as maptalks from 'maptalks'
export default {
  data() {
    return {
      mapChange: false,
      slUrl:
        'http://58.49.165.19:8083/ServiceAdapter/Map/%E6%94%BF%E5%8A%A1%E7%94%B5%E5%AD%90%E5%9C%B0%E5%9B%BE/fd69b2360e6573484fdf57be2a16085a',
      yxUrl: '',
    }
  },
  watch: {
    mapChange(val) {
      if (val) {
        this.Map.getLayer('yxlayer').show()
        this.Map.getLayer('sllayer').hide()
      } else {
        this.Map.getLayer('yxlayer').hide()
        this.Map.getLayer('sllayer').show()
      }
    },
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      maptalks.SpatialReference.loadArcgis(
        `${this.slUrl}?f=pjson`,
        (err, conf) => {
          let view = conf.spatialReference
          let center = [
            Number((view.fullExtent.xmax + view.fullExtent.xmin) / 2),
            Number((view.fullExtent.ymax + view.fullExtent.ymin) / 2),
          ]
          view.projection = 'EPSG:4326'
          let options = {
            center: center,
            zoom: 2,
            // pitch:45,
            maxZoom: view.resolutions.length - 1,
            view: view,
            attribution: false,
            baseLayer: new maptalks.TileLayer('sllayer', {
              tileSystem: conf.tileSystem,
              tileSize: conf.tileSize,
              // renderer: "canvas",
              urlTemplate: `${this.slUrl}/tile/{z}/{y}/{x}`,
              repeatWorld: false,
            }),
            // layers: [
            //   new maptalks.TileLayer('yxlayer', {
            //     renderer: 'canvas',
            //     urlTemplate: (x, y, z) => {
            //       return `${this.yxUrl}/tile/${z - 1}/${y}/${x}`
            //     },
            //     repeatWorld: false,
            //   }),
            // ],
          }
          this.Map = new maptalks.Map('Map', options)
          // this.Map.getLayer('yxlayer').hide()
          this.Map.on('click', (e) => {
            console.log(e.coordinate)
          })
        }
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
  .btn {
    width: 80px;
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
