<template>
  <div class="main">
    <div class="map" id="Map"></div>
  </div>
</template>
<script>
import * as maptalks from "maptalks";
import Ajax from "./js/ajax";
import gcoord from "gcoord";
export default {
  name: "coordPick",
  data() {
    return {
    };
  },
  mounted() {
    setTimeout(() => {
    this.baiduMap();
      
    }, 200);
  },
  methods: {
    /**
     * 百度地图
     */
    baiduMap() {
      this.Map && this.Map.remove();
      let options = {
        center: [77.26992000040191, 38.171641999719817],
        zoom: 12,
        view: {
          projection: "baidu"
        },
        attribution: false,
        baseLayer: new maptalks.TileLayer("base", {
          urlTemplate: `https://maponline2.bdimg.com/tile/?qt=vtile&x={x}&y={y}&z={z}&styles=pl&scaler=2&udt=20220317`,
        }),
        layers: [
          new maptalks.TileLayer("baidu_yx_tile", {
            urlTemplate: "http://shangetu4.map.bdimg.com/it/u=x={x};y={y};z={z};v=009;type=sate&fm=46&udt=20200730",
            subdomains: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
          }).hide()
        ]
      };
      this.Map = new maptalks.Map("Map", options);
      let layer = new maptalks.VectorLayer("test");
      layer.addTo(this.Map)
      new Ajax().getJSON("http://172.16.4.115:6080/arcgis/rest/services/XJZP/QH/MapServer/0/query?where=1%3D1&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=*&returnGeometry=true&maxAllowableOffset=&geometryPrecision=&outSR=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&f=pjson", {
        jsonp: true
      },
      (obj, data) => {
        data.features.forEach(item=>{
          let geo = item.geometry.rings[0];
          let paths = [];
          geo.forEach(c=>{
            let bdcoord = gcoord.transform(c, gcoord["WGS84"], gcoord["BD09"]);
            paths.push(bdcoord);
          })
          new maptalks.Polygon(paths, {
            symbol: {
              textName: "{NAME}",
              textFill: "#fff",
              polygonFill: "#AD526B",
              polygonOpacity: 0.3,
              lineColor: "#AD526B",
              lineWidth: 2,
              lineOpacity: 1
            },
            properties: item.attributes
          }).addTo(layer)
        })
      });
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
  .inputCon {
    width: 400px;
    height: auto;
    position: absolute;
    z-index: 5;
    top: 10px;
    left: 10px;
    float: left;
  }
  .address {
    width: 390px;
    height: 35px;
    line-height: 35px;
    text-indent: 10px;
    color: #606266b3;
    background: #fff;
    border-radius: 4px;
    box-shadow: 0 1px 10px rgba(0, 0, 0, 0.2);
    position: absolute;
    overflow: hidden;
    z-index: 111;
    top: 55px;
    left: 10px;
  }
  .mapTheme {
    width: 94px;
    height: 94px;
    border-radius: 50%;
    // background: url("../../assets/mark2.png") no-repeat;
    box-shadow: 0 10px 10px rgba(255, 255, 255, 0.5);
    background: #b2fefa; /* fallback for old browsers */
    background: -webkit-linear-gradient(to right, #0ed2f7, #b2fefa);
    /* Chrome 10-25, Safari 5.1-6 */
    background: linear-gradient(to right, #0ed2f7, #b2fefa);
    /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
    cursor: pointer;
    position: absolute;
    top: -47px;
    right: -47px;
    z-index: 11;
  }
  .themeSel {
    // background: url("../../assets/mark1.png") no-repeat;
    background: #0f2027;
    box-shadow: 0 10px 10px rgba(0, 0, 0, 0.5);
    /* fallback for old browsers */
    background: -webkit-linear-gradient(to right, #2c5364, #203a43, #0f2027);
    /* Chrome 10-25, Safari 5.1-6 */
    background: linear-gradient(to right, #2c5364, #203a43, #0f2027);
    /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
  }
  .searchCon {
    width: 430px;
    height: 45px;    
    text-indent: 10px;
    line-height: 45px;
    background: #fff;
    border-radius: 4px;
    box-shadow: 0 1px 10px rgb(0 0 0 / 20%);
    position: absolute;
    z-index: 5;
    top: 10px;
    right: 10px;
  }
}
</style>
<style lang="less">
.coordinateCon {
  width: 200px;
  height: 35px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 10px rgba(0, 0, 0, 0.2);
  color: rgb(86, 86, 86);
  // position: absolute;
  // left: 30%;
  // top: 300px;
  // z-index: 11;
  .item {
    width: 49%;
    height: 100%;
    height: 25px;
    line-height: 25px;
    float: left;
    margin-top: 5px;
    text-align: center;
  }
  .item:first-child {
    border-right: 1px solid #7e7373b3;
  }
}
.sform {
  width: 565px;
  height: 35px;
  background: #fff;
  padding: 0 10px;
  border-radius: 4px;
  box-shadow: 0 1px 10px rgba(0, 0, 0, 0.2);
  position: absolute;
  z-index: 5;
  top: 10px;
  left: 430px;
  label,
  span {
    color: rgb(86, 86, 86) !important;
  }
  label {
    font-weight: bold;
  }
  .el-select-dropdown__item {
    line-height: 20px;
  }
}
</style>
