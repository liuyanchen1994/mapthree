<template>
  <div class="main">
    <div class="container">
      <div class="card">
        <div class="info">
          <h1 class="title">坐标转换</h1>
          <!-- <h3>WGS-84坐标系，GPS设备获取的经纬度坐标,天地图所用的坐标.</h3> -->
          <h3>{{coordDesc}}</h3>
          <div class="fromCon">
            <el-select v-model="sType" placeholder="请选择">
              <el-option
                v-for="item in sTypeData"
                :key="item.value"
                :label="item.type"
                :value="item.type">
              </el-option>
            </el-select>
            <el-avatar shape="square" :size="35" :fit="fit" :src="imgurl"></el-avatar>
            <el-select v-model="eType" placeholder="请选择">
              <el-option
                v-for="item in eTypeData"
                :key="item.value"
                :label="item.type"
                :value="item.type">
              </el-option>
            </el-select>
          </div>
          <div class="toCon">
            <el-input
              v-model="coordStr1" clearable  style="width:217px;margin-top:20px"
              placeholder="例:114.277235, 30.582861"
            ></el-input>
            <el-avatar shape="square" :size="35" :fit="fit" :src="imgurl" style="margin-top:20px"></el-avatar>
            <el-input
              v-model="coordStr2" clearable  style="width:217px;margin-top:20px"></el-input>
          </div>
          <div class="transform">
            <div class="btnTrans" @click="transform">转换(Transform)</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import gcoord from "gcoord";
/**
 * 坐标转换
 */
export default {
  name: "coordTransform",
  data() {
    return {
      coordDesc: "WGS-84坐标系，GPS设备获取的经纬度坐标,天地图所用的坐标.",
      sTypeData: [
        {
          type: "WGS84",
          remark: "WGS-84坐标系，GPS设备获取的经纬度坐标,天地图所用的坐标."
        },
        {
          type: "GCJ02",
          remark:
            "GCJ-02坐标系，高德地图、腾讯地图、google中国地图、soso地图、aliyun地图、mapabc地图、所用的坐标系."
        },
        { type: "BD09", remark: "BD-09坐标系，百度地图采用的经纬度坐标." },
        { type: "BD09LL", remark: "同BD-09坐标系，百度地图采用的经纬度坐标." },
        { type: "AMap", remark: "高德地图，同GCJ-02." },
        {
          type: "WebMercator",
          remark: "Web Mercator投影，墨卡托投影，同EPSG3857，单位：米."
        },
        { type: "WGS1984", remark: "WGS-84坐标系别名，同WGS-84." },
        { type: "EPSG4326", remark: "WGS-84坐标系别名，同WGS-84." },
        {
          type: "EPSG3857",
          remark: "Web Mercator投影，同WebMercator，单位：米."
        }
      ],
      imgurl: require("../../assets/arrow.png"),
      eTypeData: [],
      sType: "WGS84",
      eType: "BD09",
      coordStr1: "",
      coordStr2: ""
    };
  },
  watch: {
    sType(val) {
      let desc = this.sTypeData.filter(x => x.type == val)[0].remark;
      this.coordDesc = desc;
    },
    eType(val) {
      let desc = this.sTypeData.filter(x => x.type == val)[0].remark;
      this.coordDesc = desc;
    }
  },
  mounted() {
    this.eTypeData = this.sTypeData;
    this.eventInit();
  },
  methods: {
    transform() {
      if (!this.coordStr1) {
        this.$message("请输入需转换的坐标");
        return;
      }
      if (!this.coordStr1.includes(",")) {
        this.$message("格式不正确");
        return;
      }
      let coord = this.coordStr1.split(",");
      if (coord.length !== 2) {
        this.$message("格式不正确");
        return;
      }
      let t_coord = gcoord.transform(
        coord, // 经纬度坐标
        gcoord[this.sType], // 当前坐标系
        gcoord[this.eType] // 目标坐标系
      );
      this.coordStr2 = `${t_coord[0]},${t_coord[1]}`;
    },
    eventInit() {
      //Movement Animation to happen
      const card = document.querySelector(".card");
      const container = document.querySelector(".container");
      //Items
      const title = document.querySelector(".title");
      // const sneaker = document.querySelector(".sneaker img");
      const purchase = document.querySelector(".transform");
      const description = document.querySelector(".info h3");
      const fromCon = document.querySelector(".fromCon");
      const toCon = document.querySelector(".toCon");
      //Moving Animation Event
      container.addEventListener("mousemove", e => {
        let xAxis = (window.innerWidth / 2 - e.pageX) / 25;
        let yAxis = (window.innerHeight / 2 - e.pageY) / 25;
        card.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
      });
      //Animate In
      container.addEventListener("mouseenter", e => {
        card.style.transition = "none";
        //Popout
        title.style.transform = "translateZ(150px)";
        // sneaker.style.transform = "translateZ(200px) rotateZ(-45deg)";
        description.style.transform = "translateZ(125px)";
        fromCon.style.transform = "translateZ(100px)";
        toCon.style.transform = "translateZ(100px)";
        purchase.style.transform = "translateZ(75px)";
      });
      //Animate Out
      container.addEventListener("mouseleave", e => {
        card.style.transition = "all 0.5s ease";
        card.style.transform = `rotateY(0deg) rotateX(0deg)`;
        //Popback
        title.style.transform = "translateZ(0px)";
        // sneaker.style.transform = "translateZ(0px) rotateZ(0deg)";
        description.style.transform = "translateZ(0px)";
        fromCon.style.transform = "translateZ(0px)";
        toCon.style.transform = "translateZ(0px)";
        purchase.style.transform = "translateZ(0px)";
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

  display: flex;
  align-items: center;
  justify-content: center;
  perspective: 1000px;
  .container {
    width: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .card {
    transform-style: preserve-3d;
    min-height: 80vh;
    width: 35rem;
    border-radius: 30px;
    padding: 0rem 5rem;
    box-shadow: 0 20px 20px rgba(0, 0, 0, 0.2), 0px 0px 50px rgba(0, 0, 0, 0.2);
  }

  .sneaker {
    min-height: 35vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .sneaker img {
    width: 20rem;
    z-index: 2;
    transition: all 0.75s ease-out;
  }
  .circle {
    width: 15rem;
    height: 15rem;
    background: linear-gradient(
      to right,
      rgba(245, 70, 66, 0.75),
      rgba(8, 83, 156, 0.75)
    );
    position: absolute;
    border-radius: 50%;
    z-index: 1;
  }

  .info h1 {
    font-size: 3rem;
    transition: all 0.75s ease-out;
  }
  .info h3 {
    font-size: 1.3rem;
    padding: 2rem 0rem;
    color: #585858;
    font-weight: lighter;
    transition: all 0.75s ease-out;
  }
  .fromCon, .toCon {
    display: flex;
    justify-content: space-between;
    transition: all 0.75s ease-out;
  }
  .fromCon button {
    padding: 0.5rem 2rem;
    background: none;
    border: none;
    box-shadow: 0px 5px 10px rgba(0, 0, 0, 0.2);
    border-radius: 30px;
    cursor: pointer;
    font-weight: bold;
    color: #585858;
  }
  button.active {
    background: #585858;
    color: white;
  }
  .transform {
    margin-top: 5rem;
    transition: all 0.75s ease-out;
  }
  .btnTrans {
    width: 100%;
    text-align: center;
    padding: 1rem 0rem;
    background: #f54642;
    border: none;
    color: white;
    cursor: pointer;
    border-radius: 30px;
    font-weight: bolder;
  }
}
</style>
<style lang="less">
.el-avatar {
  background: none;
}
</style>
