<template>
  <div class="main">
    <div class="map" id="Map"></div>
    <div class="inputCon">
      <el-input
        v-model="coordStr"
        clearable
        placeholder="例:114.277235, 30.582861"
        style="width: 300px; margin-right: 20px"
      ></el-input>
      <el-button :disabled="!coordStr" type="primary" @click="locate"
        >定位</el-button
      >
    </div>
    <transition name="el-zoom-in-top">
      <div v-show="address && coordStr" class="address" :title="address">
        {{ address }}
      </div>
    </transition>
    <el-form :inline="true" class="demo-form-inline sform">
      <el-form-item label="底图">
        <el-radio-group v-model="mapType">
          <el-radio
            :style="{ color: i == 0 ? '#cecece' : '' }"
            v-for="(item, i) in mapTypes"
            :label="item.name"
            :key="i"
          ></el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <div class="searchCon">
      地址搜索
      <el-select style="width:80%;height:35px"
        v-model="serchKey"
        filterable
        remote
        reserve-keyword
        placeholder="请输入地址搜索"
        :remote-method="queryPoi"
        :loading="loading"
        @change="itemClick"
      >
        <el-option
          style="width:300px; height: 55px; line-height: 25px"
          v-for="(item, index) in searchLlist"
          :key="'poiitem' + index"
          :label="item.name"
          :value="index"
        >
          <span style="width: 100%; float: left">{{ item.name }}</span>
          <span
            style="width: 100%; color: #8492a6; font-size: 13px; float: left"
            >{{ item.address }}</span
          >
        </el-option>
      </el-select>
    </div>
    <div
      :class="{ mapTheme: true, themeSel: !isDay }" v-show="false"
      @click="isDay = !isDay"
    ></div>
  </div>
</template>
<script>
import gcoord from "gcoord";
import * as maptalks from "maptalks";
import webapi from "./js/webApi"
/**
 * 坐标拾取 (百度 高德 腾讯 天地图)
 */
export default {
  name: "coordPick",
  data() {
    return {
      mapType: "百度(bd09)", //当前地图
      currentCoordSys: "BD09", //当前坐标系
      mapTypes: [
        { name: "百度(bd09)", sys: "BD09" },
        { name: "高德(gcj02)", sys: "GCJ02" },
        { name: "腾讯(gcj02)", sys: "BD09" },
        { name: "天地图(wgs84)", sys: "WGS84" }
      ],
      center: [114.3087835, 30.5496509],
      zoom: 12,
      coordStr: "",
      address: "",
      serchKey: "",
      searchLlist: [],
      loading: false,
      isDay: false
    };
  },
  watch: {
    mapType(val) {
      if (val == "百度(bd09)") this.baiduMap();
      if (val == "高德(gcj02)") this.aMap();
      if (val == "腾讯(gcj02)") this.tencentMap();
      if (val == "天地图(wgs84)") this.tdtMap();
      this.currentCoordSys = this.mapTypes.filter(x => x.name == val)[0].sys;
      this.themeChange(this.isDay);
    },
    isDay(val) {
      this.themeChange(val);
    }
  },
  mounted() {
    this.baiduMap();
  },
  methods: {
    locate() {
      if (!this.coordStr.includes(",")) {
        this.$message("格式不正确");
        return;
      }
      let coord = this.coordStr.split(",");
      if (coord.length !== 2) {
        this.$message("格式不正确");
        return;
      }
      
      let bdcoord = gcoord.transform(coord, gcoord[this.currentCoordSys], gcoord["BD09"]);
      this.center = bdcoord;
      this.addMarker(coord);
      this.Map.panTo(coord);
      this.getAddressByPoint(coord);
    },
    /**
     * 根据坐标获取地址(百度api)
     */
    getAddressByPoint(point) {
      point = gcoord.transform(
        point, // 经纬度坐标
        gcoord[this.currentCoordSys], // 当前坐标系
        gcoord["BD09"] // 目标坐标系
      );
      webapi.getAddressByLocation(point[0], point[1], data => {
        this.address = data.sematic_description;
      })
    },
    /**
     * 添加标注
     */
    addMarker(coord) {
      let layer = this.getLayer("locateLayer");
      layer.clear();
      new maptalks.Marker(coord, {
        symbol: {
          markerFile: require("../../../public/image/map/marker.png"),
          markerDy: 3
        }
      }).addTo(layer);
    },
    themeChange(val) {
      if (val)
        this.Map.getBaseLayer().options.cssFilter = "sepia(100%) invert(90%)";
      else this.Map.getBaseLayer().options.cssFilter = "";
    },
    /**
     * 查询兴趣点(百度api)
     */
    queryPoi(query) {
      if (query !== "") {
        this.loading = true;
        webapi.getAddressByName(query, data => {
          this.loading = false;
          this.searchLlist = data;
          this.searchLlist.map((x, i) => (x.index = i));
          this.serchKey = "";
        })
      } else {
        this.searchLlist = [];
        this.serchKey = "";
      }
    },
    //下拉框选择
    itemClick(index) {
      let data = this.searchLlist[index];
      let gcjCoord = data.location.split(",");
      let bdcoord = gcoord.transform(gcjCoord, gcoord["GCJ02"], gcoord["BD09"]);
      this.center = bdcoord;
      let coord = gcoord.transform(
        gcjCoord,
        gcoord["GCJ02"],
        gcoord[this.currentCoordSys]
      )
      this.coordStr = `${Number(coord[0]).toFixed(7)},${Number(coord[1]).toFixed(7)}`;
      this.addMarker(coord);
      this.Map.animateTo({
        center: coord,
        zoom: 17
      })
    },
    /**
     * 百度地图
     */
    baiduMap() {
      this.Map && this.Map.remove();
      let options = {
        center: this.center,
        zoom: this.zoom || 12,
        view: {
          projection: "baidu"
        },
        attribution: false,
        baseLayer: new maptalks.TileLayer("base", {
          urlTemplate: `https://maponline2.bdimg.com/tile/?qt=vtile&x={x}&y={y}&z={z}&styles=pl&scaler=2&udt=20220317`,
        }),
        layers: [
          new maptalks.TileLayer("baidu_yx_tile", {
            urlTemplate: "https://maponline3.bdimg.com/starpic/?qt=satepc&u=x={x};y={y};z={z};v=009;type=sate&fm=46&udt=20220317",
          }).hide()
        ]
      };
      this.Map = new maptalks.Map("Map", options);
      this.eventInit();
    },
    /**
     * 高德地图
     */
    aMap() {
      let acenter = gcoord.transform(
        this.center, // 经纬度坐标
        gcoord["BD09"], // 当前坐标系
        gcoord["GCJ02"] // 目标坐标系
      );
      this.Map && this.Map.remove();
      let options = {
        center: acenter,
        zoom: this.zoom || 12,
        attribution: false,
        baseLayer: new maptalks.TileLayer("amapTile", {
          urlTemplate:
            "http://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}"
        }),
        layers: [
          new maptalks.TileLayer("amap_yx_tile", {
          urlTemplate:
            "https://webst02.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}"
          }).hide()
        ]
      };
      this.Map = new maptalks.Map("Map", options);
      this.eventInit();
    },
    /**
     * 腾讯地图
     */
    tencentMap() {
      let tcenter = gcoord.transform(
        this.center, // 经纬度坐标
        gcoord["BD09"], // 当前坐标系
        gcoord["GCJ02"] // 目标坐标系
      );

      this.Map && this.Map.remove();
      let options = {
        center: tcenter,
        zoom: this.zoom || 12,
        attribution: false,
        baseLayer: new maptalks.TileLayer("tencentTile", {
          urlTemplate: (x, y, z) => {
            const urlArgs = this.getUrlArgs(x, y, z);
            const _z = urlArgs.z;
            const _x = urlArgs.x;
            const _y = urlArgs.y;
            const m = Math.floor(_x / 16.0);
            const n = Math.floor(_x / 16.0);
            const urlTemplate =
              "http://rt0.map.gtimg.com/realtimerender?z={z}&x={x}&y={y}&type=vector&style=3";
            const url = urlTemplate
              .replace("{x}", _x)
              .replace("{y}", _y)
              .replace("{z}", _z)
              .replace("{m}", m)
              .replace("{n}", n);
            return url;
          }
        })
      };
      this.Map = new maptalks.Map("Map", options);
      this.eventInit();
    },
    getUrlArgs(t, e, r) {
      return {
        z: r,
        x: t,
        y: Math.pow(2, r) - 1 - e
      };
    },
    /**
     * 天地图
     */
    tdtMap() {
      let wgscenter = gcoord.transform(
        this.center, // 经纬度坐标
        gcoord["BD09"], // 当前坐标系
        gcoord["WGS84"] // 目标坐标系
      );
      this.Map && this.Map.remove();
      let options = {
        center: wgscenter,
        zoom: this.zoom || 12,
        attribution: false,
        baseLayer: new maptalks.TileLayer("TdtTile", {
          subdomains: ["0", "1", "2", "3", "4", "5", "6", "7"],
          urlTemplate:
            "http://t{s}.tianditu.com/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=9071c785650c2efc428f58b64ff92c9c"
        }),
        layers: [
          new maptalks.TileLayer("wordtile", {
            //文字图层
            subdomains: ["0", "1", "2", "3", "4", "5", "6", "7"],
            urlTemplate:
              "http://t{s}.tianditu.com/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=9071c785650c2efc428f58b64ff92c9c"
          }),
          new maptalks.TileLayer("tdt_yx_tile", {
            //影像图层
            subdomains: ["0", "1", "2", "3", "4", "5", "6", "7"],
            urlTemplate:
              "http://t{s}.tianditu.com/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=9071c785650c2efc428f58b64ff92c9c",
            //影像图层
            // urlTemplate:
            //   "https://t0.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILECOL={x}&TILEROW={y}&TILEMATRIX={z}&tk=9071c785650c2efc428f58b64ff92c9c"
          })
        ]
      };
      this.Map = new maptalks.Map("Map", options);
      this.eventInit();
    },
    eventInit() {
      this.addMarker(this.Map.getCenter());
      this.Map.on("mousemove", e => {
        let layer = this.getLayer("coordLayer");
        let marker = layer.getGeometries()[0];
        if (marker) {
          marker.show();
          marker.setCoordinates(e.coordinate);
          marker
            .getInfoWindow()
            .setContent(this.getCoordHtml(e.coordinate))
            .show();
        } else {
          marker = new maptalks.Marker(e.coordinate, {
            symbol: {
              markerWidth: 0
            }
          }).addTo(layer);

          var options = {
            custom: true,
            single: true,
            autoPan: false,
            dx: 120,
            dy: 50,
            content: this.getCoordHtml(e.coordinate)
          };
          var infoWindow = new maptalks.ui.InfoWindow(options);
          infoWindow.addTo(marker).show();
        }
      }).on("mouseout", () => {
        let layer = this.getLayer("coordLayer");
        let marker = layer.getGeometries()[0];
        marker && marker.hide();
      });
      this.Map.on("click", e => {
        let coord = e.coordinate;
        this.coordStr = `${coord.x.toFixed(7)},${coord.y.toFixed(7)}`;
        let bdcoord = gcoord.transform([coord.x, coord.y], gcoord[this.currentCoordSys], gcoord["BD09"]);
        this.center = bdcoord;
        this.addMarker(coord);
        this.getAddressByPoint([coord.x, coord.y]);
      });
      this.Map.on("zoomend", e => {
        this.zoom = this.Map.getZoom();
      });
    },
    getCoordHtml(coordinate) {
      return `
            <div class="coordinateCon">
              <div class="item">${coordinate.x.toFixed(7)}</div>
              <div class="item">${coordinate.y.toFixed(7)}</div>
            </div>`;
    },
    getLayer(layerid) {
      let layer = null;
      if (this.Map) {
        if (this.Map.getLayer(layerid)) {
          //根据图层id获取图层
          layer = this.Map.getLayer(layerid); //获取图层
        } else {
          layer = new maptalks.VectorLayer(layerid, {
            enableAltitude: true,
            altitudeProperty: "altitude"
          }).addTo(this.Map); //创建图层
        }
      }
      return layer;
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
