<template>
  <div class="main">
    <div class="map" id="Map"></div>
  </div>
</template>
<script>
import * as maptalks from "maptalks";
export default {
  data() {
    return {
      mapChange: false,
      slUrl: "http://36.134.75.141:6080/arcgis/rest/services/SJ/DT/MapServer"
    };
  },
  mounted() {
    maptalks.SpatialReference.loadArcgis(
      this.slUrl + "?f=pjson",
      (err, conf) => {
        let view = conf.spatialReference;
        let center = [
          Number((view.fullExtent.xmax + view.fullExtent.xmin) / 2),
          Number((view.fullExtent.ymax + view.fullExtent.ymin) / 2)
        ];
        view.projection = "EPSG:4490";
        new maptalks.Map("Map", {
          center: center,
          zoom: 1,
          view: view,
          attribution: false,
          baseLayer: new maptalks.TileLayer("tile", {
            tileSystem: conf.tileSystem,
            tileSize: conf.tileSize,
            renderer: "canvas",
            urlTemplate: this.slUrl + "/tile/{z}/{y}/{x}",
            repeatWorld: false
          })
        });
      }
    );
  },
  methods: {}
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
