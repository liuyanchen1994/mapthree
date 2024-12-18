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
// import fwdata from "../../../public/data/fw1";
//获取来凤房屋的网格数据
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
    let fwdata = [
      { id: 135178, lon: "109.37985070753946", lat: "29.502660434074564" },
      { id: 135179, lon: "109.37698252886962", lat: "29.502607858657978" },
      { id: 135180, lon: "109.38243626837783", lat: "29.499000258364557" },
      { id: 135207, lon: "109.3834624986654", lat: "29.497866525162383" },
      { id: 135210, lon: "109.37871223519718", lat: "29.49842018305811" },
      { id: 135211, lon: "109.38488930336293", lat: "29.50295631202298" },
      { id: 135212, lon: "109.38179850746751", lat: "29.501920980965565" },
      { id: 135213, lon: "109.38454273366948", lat: "29.50194909407446" },
      { id: 135215, lon: "109.38502862704804", lat: "29.49898777654381" },
      { id: 135219, lon: "109.37902631447875", lat: "29.50062794101591" },
      { id: 135220, lon: "109.383072533758", lat: "29.499440474753257" },
      { id: 135221, lon: "109.38151589775916", lat: "29.502972272577157" },
      { id: 135222, lon: "109.3803336432369", lat: "29.50132927901906" }
    ];
    let arrs = [];
    for (let i = 0; i < fwdata.length; i++) {
      let item = fwdata[i];
      if (item.lon && item.lat) {
        let gridCoord = this.proj4Convert(Number(item.lon), Number(item.lat));
        let url = `http://36.133.42.130:8008/arcgis/rest/services/lfcs/wg/MapServer/0/query?&where=1=1&geometry={"x":${
          gridCoord[0]
        },"y":${
          gridCoord[1]
        },"spatialReference":{"wkid":4326}}&geometryType=esriGeometryPoint&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&objectIds=&time=&returnCountOnly=false&returnGeometry=true&maxAllowableOffset=&outSR=&text=&outFields=*&f=pjson`;
        maptalks.Ajax.getJSON(
          url,
          {
            jsonp: true
          },
          (obj, data) => {
            if (data.features.length) {
              let attr = data.features[0].attributes;
              fwdata[i].wgbm = attr.WGBM;
              fwdata[i].wgmc = attr.WGQC;
            } else {
              fwdata[i].wgbm = "";
              fwdata[i].wgmc = "";
            }
            arrs.push(fwdata[i]);
            if (i == fwdata.length - 1) {
              this.objStr = JSON.stringify(arrs);
              this.download(this.objStr);
              this.loading = false;
            }
          }
        );
      }
    }
  },
  methods: {
    proj4Convert(lon, lat) {
      proj4.defs(
        "EPSG:4545",
        "+proj=tmerc +lat_0=0 +lon_0=108 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs"
      );
      let gridCoord = proj4(proj4("EPSG:4326"), proj4("EPSG:4545"), [lon, lat]);
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
      link.download = `fw.json`;
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
