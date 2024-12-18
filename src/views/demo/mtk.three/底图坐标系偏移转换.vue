<template>
  <div class="container">
    <div class="map" id="Map"></div>
  </div>
</template>
<script>
import * as maptalks from "maptalks";
export default {
  mounted() {
    var map = new maptalks.Map("map", {
      center: [121.50743103027344, 31.24734310997107],
      zoom: 16,
      pitch: 0,
      bearing: 0,
      baseLayer: new maptalks.TileLayer("base", {
        urlTemplate:
          "http://www.google.cn/maps/vt?pb=!1m5!1m4!1i{z}!2i{x}!3i{y}!4i256!2m3!1e0!2sm!3i342009817!3m9!2sen-US!3sCN!5e18!12m1!1e47!12m3!1e37!2m1!1ssmartmaps!4e0&token=32965",
        subdomains: ["a", "b", "c", "d"],
        attribution: "&copy; Google Maps"
      })
    });

    var wgslayer = new maptalks.TileLayer("base", {
      offset: function() {
        //实时计算wgs84和gcj02瓦片的偏移量
        const center = map.getCenter();
        const c = maptalks.CRSTransform.transform(
          center.toArray(),
          "WGS84",
          "GCJ02"
        );
        const offset = map
          .coordToPoint(center)
          .sub(map.coordToPoint(new maptalks.Coordinate(c)));
        return offset._round().toArray();
      },
      opacity: 0.7,
      urlTemplate: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
      subdomains: ["a", "b", "c", "d"],
      attribution: "&copy; Google Maps"
    });

    wgslayer.addTo(map);
  },
  methods: {
    init() {}
  }
};
</script>

<style lang="less">
.container,
.map,
.mask {
  width: 100%;
  height: 100vh;
  // background: #000a31;
}
.mask {
  position: absolute;
  z-index: 11;
  left: 0;
  top: 0;
  background: linear-gradient(
    to top,
    rgba(3, 19, 57, 0),
    rgba(3, 19, 57, 0.1),
    rgba(3, 19, 57, 0.1),
    rgba(3, 19, 57, 1)
  );
  pointer-events: none;
}
</style>
