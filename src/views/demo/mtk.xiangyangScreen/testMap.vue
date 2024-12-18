<template>
  <section>
    <div class="map" id="Map"></div>
  </section>
</template>
<script>
import mapApi from "./map";
import { randomPoint } from "@turf/random";
export default {
  data() {
    return {}
  },
  mounted() {
    mapApi.config = window.mapConfig;
    mapApi.mapInit("Map");
  },
  methods: {
    addMarker() {
      let coords = this.getRandomPoint(40);
      let data = [];
      coords.forEach(c => {
        data.push({
          lon: c[0],
          lat: c[1]
        });
      });
      mapApi.addMarker(data, {}, obj => {
        //标注点击显示弹窗
        this.showInfowin(obj);
      });
    },
    getRandomPoint(count) {
      let extent = mapApi.Map.getExtent();
      //随机坐标
      let coordFeature = randomPoint(count, {
        bbox: [extent.xmin, extent.ymin, extent.xmax, extent.ymax]
      });
      let coords = [];
      coordFeature.features.forEach(g => {
        coords.push(g.geometry.coordinates);
      });
      return coords;
    }
  }
};
</script>

<style lang="less" scoped>
.map {
  width: 100%;
  height: 100vh;
  background: #11305f;
}
</style>
