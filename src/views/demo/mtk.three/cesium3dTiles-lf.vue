<template>
  <div class="main">
    <div class="map" id="Map"></div>
  </div>
</template>
<script>
import * as Cesium from "cesium";
export default {
  data() {
    return {};
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      Cesium.Ion.defaultAccessToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI0MjIyYThkMi0xM2NkLTRhMWEtOGEyYy0zN2E2NzU3ODcwNjMiLCJpZCI6MzkwMjUsImlhdCI6MTYwNzA2MTYyNX0.1ZMd7ZV4X2m59LeHbdG0RF3_auKdSlKcnPjyaeGHN1g";
      // var viewer = new Cesium.Viewer('Map', {
      //   terrainProvider: Cesium.createWorldTerrain(),
      // })
      var viewer = new Cesium.Viewer("Map", {
        animation: false, //动画插件
        baseLayerPicker: false,
        geocoder: false,
        navigationHelpButton: false,
        timeline: false,
        fullscreenButton: false,
        homeButton: false,
        infoBox: true,
        scene3DOnly: true, //仅仅显示3d,可隐藏右上角2d和3d按钮
        selectionoIndicatr: false,
        navigationInstructionsInitiallyVisibl: false,
        useDefaultRenderLoop: true,
        showRenderLoopErrors: true,
        projectionPicker: false, //投影选择器
        vrButton: false
      });
      viewer._cesiumWidget._creditContainer.style.display = "none";
      var scene = viewer.scene;
      scene.primitives.add(
        new Cesium.Cesium3DTileset({
          url:
            "http://172.16.4.115:9000/model/62c839e0442511ebaf551795af04843d/tileset.json"
        })
      );

      var homeCameraView = {
        destination: Cesium.Cartesian3.fromDegrees(
          109.40499964826365,
          29.50654295670276,
          10
        ), //世界坐标系下的一个坐标点
        orientation: {
          //旋转角度
          heading: 0.6068261546578739,
          pitch: -0.6663290837739155,
          roll: 0.0
        }
      };
      viewer.scene.camera.setView(homeCameraView);
    }
  }
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
}
</style>
<style lang="less" scoped>
@import "./bucket.css";
</style>
