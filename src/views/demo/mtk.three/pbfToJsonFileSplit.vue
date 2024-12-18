<template>
  <div class="main">
  </div>
</template>
<script>
import * as maptalks from "maptalks";
import * as Pbf from "pbf";
import * as geobuf from "geobuf";
import axios from "axios";
import { splitArrays } from "@/utils/BaseObjectPlugins/utils";
//pbf文件解析为geojson
export default {
  data() {
    return {
      inter: null
    };
  },
  watch: {},
  mounted() {
    axios
      .get(`http://localhost:1013/3DModel/hangzhou/WuHan.geojson`, {
        responseType: "json"
      })
      .then(res => {
        let data = res.data;
        debugger;
      });
    this.init();
  },
  methods: {
    init() {
      const url = "http://localhost:8003/3DModel/hangzhou/";
      axios
        .get(`${url}hangzhou-landuse.pbf`, {
          responseType: "arraybuffer"
        })
        .then(res => {
          let data = res.data;
          let geojson = geobuf.decode(new Pbf(data)); // 对GeoBuf解码
          // console.info(JSON.stringify(geojson));
          console.log(geojson.features.length, "buildingLength");
          let arrays = splitArrays(geojson.features, 2);
          this.downLoad(arrays);
        });
    },
    downLoad(data) {
      let total = data.length,
        num = 0;
      this.inter = setInterval(() => {
        if (num == total - 1) {
          clearInterval(this.inter);
          return;
        }
        var obj = JSON.stringify(data[num]);
        //encodeURIComponent解决中文乱码
        let uri =
          "data:text/csv;charset=utf-8,\ufeff" + encodeURIComponent(obj);
        //通过创建a标签实现
        let link = document.createElement("a");
        link.href = uri;
        //对下载的文件命名
        link.download = `hangzhou-roads${num + 1}.json`;
        document.body.appendChild(link);
        link.click();
        console.log(`hangzhou-roads${num + 1}.json`);
        document.body.removeChild(link);
        num++;
      }, 1000);
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
  .btn {
    width: 80px;
    height: 35px;
    margin: 5px;
    border-radius: 5px;
    background: violet;
    cursor: pointer;
    text-align: center;
    line-height: 35px;
  }
}
</style>
