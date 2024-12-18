<template>
  <div class="main" v-loading="loading" 
    element-loading-text="网格查询中"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.3)">
    {{objStr}}
  </div>
</template>
<script>
import * as maptalks from "maptalks";
import proj4 from "proj4";
import ids from "../../../public/data/ids2";
import { randomPoint } from "@turf/random";
import { splitArrays } from "@/utils/BaseObjectPlugins/utils";
export default {
  name: "exceltojson",
  data() {
    return {
      objStr: "",
      loading: true
    };
  },
  watch: {},
  mounted() {
    let coords = [
      [633510.25403183885, 3265922.2535280474],
      [634372.79742359091, 3265943.4202370457],
      [634325.17232834175, 3265244.9188400451],
      [633557.879127088, 3265234.3354855441],
      [633542.00409533828, 3265239.6271627918],
      [633478.50396833941, 3265498.9193480425],
      [633510.25403183885, 3265922.2535280474]
    ];
    let wgsCoords = [];
    coords.forEach(coord => {
      let wgs = this.proj4Convert(coord[0], coord[1]);
      wgsCoords.push(wgs);
    });
    let poly = new maptalks.Polygon(wgsCoords);
    let extent = poly.getExtent();
    let randomCoords = this.getRandomPoint(extent, ids.length);
    let objs = [];
    ids.map((item, index) => {
      let c = randomCoords[index];
      // item.lon = c[0];
      // item.lat = c[1];
      objs.push({
        lon: c[0],
        lat: c[1],
        id: item.id
      });
    });
    return;
    let arrays = splitArrays(objs, objs.length / 4);
    arrays.forEach(item => {
      let objStr = JSON.stringify(item);
      this.download(objStr);
    });
    this.loading = false;
  },
  methods: {
    getRandomPoint(extent, count) {
      // let extent = this.Map.getExtent();
      //随机坐标
      let coordFeature = randomPoint(count, {
        bbox: [extent.xmin, extent.ymin, extent.xmax, extent.ymax]
      });
      let coords = [];
      coordFeature.features.forEach(g => {
        coords.push(g.geometry.coordinates);
      });
      return coords;
    },
    proj4Convert(lon, lat) {
      proj4.defs(
        "EPSG:4545",
        "+proj=tmerc +lat_0=0 +lon_0=108 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs"
      );
      let gridCoord = proj4(proj4("EPSG:4545"), proj4("EPSG:4326"), [lon, lat]);
      // alert(`${wgsCoord[0]},${wgsCoord[1]}--转换后`);
      return gridCoord;
    },
    download(obj) {
      //encodeURIComponent解决中文乱码
      let uri = "data:text/csv;charset=utf-8,\ufeff" + encodeURIComponent(obj);
      //通过创建a标签实现
      let link = document.createElement("a");
      link.href = uri;
      //对下载的文件命名
      link.download = `idsCoord.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
};
</script>

<style lang="less" scoped>
.main {
  width: 100%;
  height: 100vh;
  background: #fff;
  overflow: auto;
}
</style>
