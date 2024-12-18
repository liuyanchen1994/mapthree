<template>
  <section>
    <div class="map" id="Map"></div>
    <div class="header">
      <div
        :class="{ items: true, select: item.select }"
        v-for="(item, index) in lists"
        :key="'item' + index"
        @click="btnclick(item)"
      >
        {{ item.name }}
      </div>
    </div>
    <div class="playtools" v-if="playShow">
      <playBar @toolClick="toolClick"></playBar>
    </div>
  </section>
</template>
<script>
import mapApi from "./map";
import { randomPoint } from "@turf/random";
import playBar from "./playBar/index";
import info from "./info.vue";
import Vue from "vue/dist/vue.esm";
window.mapConfig = {
  mapType: "baidu", // arcgis baidu
  baseMap:
    "http://36.133.42.130:8008/arcgis/rest/services/huanghu2/Map/MapServer",
  areaUrl:
    "http://36.133.42.130:8008/arcgis/rest/services/huanghu2/HHQH/MapServer/1",
  streetUrl:
    "http://36.133.42.130:8008/arcgis/rest/services/huanghu2/HHQH/MapServer/0",
  communityUrl:
    "http://36.133.42.130:8008/arcgis/rest/services/huanghu2/HHQH/MapServer/2",
  poiUrl:
    "http://36.133.42.130:8008/arcgis/rest/services/huanghu2/HHXQD2/MapServer/0",
  gridUrl:
    "http://36.133.42.130:8008/arcgis/rest/services/huanghu2/HHDYWG/MapServer/0",
  // mapCenter: [],
  baseMapType: "arcgis",
  initZoom: 13,
  minZoom: 2,
  maxZoom: 18,
  //区划 兴趣点 部件等查询编码属性字段
  QueryCodeField: {
    Area: "QHCODE",
    Street: "JDCODE",
    Community: "SQCODE",
    Grid: "BGID"
  },
  //区划 兴趣点 部件等名称属性字段
  QueryFieldName: {
    AreaSameName: "NAME",
    Area: "QHNAME",
    Street: "JDNAME",
    Community: "SQNAME",
    Grid: "BGNAME",
    Poi: "NAME"
  }
};
export default {
  components: { playBar },
  data() {
    return {
      lists: [
        { select: false, type: "marker", name: "标注" },
        { select: false, type: "cluster", name: "聚合" },
        { select: false, type: "heatmap", name: "热力图" },
        { select: false, type: "track", name: "轨迹" },
        { select: false, type: "drawpoint", name: "打点" },
        { select: false, type: "drawline", name: "画线" },
        { select: false, type: "drawpolygon", name: "画面" },
        { select: false, type: "zoomin", name: "放大" },
        { select: false, type: "zoomout", name: "缩小" },
        { select: false, type: "distance", name: "测距" },
        { select: false, type: "distanceoff", name: "取消测距" },
      ],
      playShow: false
    };
  },
  mounted() {
    mapApi.config = window.mapConfig;
    mapApi.mapInit("Map");
  },
  methods: {
    btnclick(item) {
      this.lists.map(x => (x.select = false));
      this.lists.map(x => {
        if (x.type == item.type) x.select = true;
      });
      mapApi.clearAllLayer();
      this.playShow = false;
      item.type == "marker" && this.addMarker();
      item.type == "cluster" && this.addCluster();
      item.type == "heatmap" && this.addHeamap();
      item.type == "track" && this.track();
      item.type == "drawpoint" && this.drawGraphic("Point");
      item.type == "drawline" && this.drawGraphic("LineString");
      item.type == "drawpolygon" && this.drawGraphic("Polygon");
      item.type == "zoomin" && mapApi.zoomIn();
      item.type == "zoomout" && mapApi.zoomOut();
      item.type == "distance" && mapApi.initMeasureTool();
      item.type == "distanceoff" && mapApi.distanceOff();
    },
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
    addCluster() {
      let coords = this.getRandomPoint(400);
      let data = [];
      coords.forEach(c => {
        data.push({
          lon: c[0],
          lat: c[1]
        });
      });
      mapApi.clusterLayer(
        data,
        {},
        obj => {
          //标注点击显示弹窗
          this.showInfowin(obj);
        },
        "",
        16
      );
    },
    showInfowin(data) {
      let { attributes, graphic } = data;
      let vm = Vue.extend({
        template: `
        <section>
          <info @closeInfowWin="closeInfowWin"></info>
        </section>
      `,
        components: { info },
        data() {
          return {
            temp: attributes
          };
        },
        mounted() {},
        methods: {
          closeInfowWin() {
            graphic.closeInfoWindow();
          }
        }
      });
      let component = new vm().$mount();
      let html = component.$el;
      mapApi.showInfowindow(graphic, html);
    },
    addHeamap() {
      let coords = this.getRandomPoint(1000);
      let data = [];
      coords.forEach(c => {
        data.push({
          lon: c[0],
          lat: c[1]
        });
      });
      mapApi.loadHeatMap(coords);
    },
    drawGraphic(type) {
      mapApi.drawGraphic(type);
    },
    track() {
      this.playShow = true;
      const data = [
        { x: 113.4674860816618, y: 29.82662838872923 },
        { x: 113.47235921780174, y: 29.828969778358964 },
        { x: 113.4737297873411, y: 29.82594310395955 },
        { x: 113.47498614275217, y: 29.82331617900911 },
        { x: 113.47561432045772, y: 29.823354250385204 },
        { x: 113.479402422379, y: 29.8248199983648 },
        { x: 113.48223873989795, y: 29.825847925519316 }
      ];
      mapApi.trackShow(data);
    },
    toolClick(data) {
      switch (data.type) {
        case "play":
          mapApi.play();
          break;
        case "pause":
          mapApi.pause();
          break;
        case "fast":
          mapApi.forward();
          break;
        case "rewind":
          mapApi.rewind();
          break;
        case "replay":
          mapApi.replay();
          break;
        case "quit":
          mapApi.quit();
          this.playShow = false;
          break;
      }
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
  background: #e1e1e1;
}
.header {
  width: 100%;
  height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  border: 1px solid rgba(30, 35, 42, 0.06);
  box-shadow: 0 1px 3px 0 rgba(0, 34, 77, 0.5);
  font-family: Arial, Helvetica, sans-serif;
  position: fixed;
  left: 0;
  top: 0;
  .items {
    width: 80px;
    height: 35px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 2px;
    box-shadow: 0 0 10px #cecece;
    margin: 0 40px;
    transition: all 0.5s;
    cursor: pointer;
  }
  .select {
    // background: #cecece;
    // border-radius: 10px;
    box-shadow: 0px 0px 15px #cecece inset;
  }
}
.playtools {
  position: absolute;
  top: 80px;
  left: 42%;
  z-index: 111;
}
</style>
