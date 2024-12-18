<template>
  <div class="main">
    <div class="map" id="Map"></div>
    <div class="map_CaseTypeSum">
      <div class="title">高发案件</div>
      <div class="item">
        <div class="left">
          <div class="dot"></div>
          沿街晾挂
        </div>
        <div class="right">123</div>
      </div>
      <div class="item">
        <div class="left">
          <div class="dot"></div>
          沿街晾挂
        </div>
        <div class="right">123</div>
      </div>
      <div class="item">
        <div class="left">
          <div class="dot"></div>
          沿街晾挂
        </div>
        <div class="right">123</div>
      </div>
    </div>
    <!-- <div class="amap_areaName">
      南城街道
    </div> -->
  </div>
</template>
<style lang="less">
.amap_areaName {
  width: 165px;
  height: 40px;
  text-align: center;
  font-size: 18px;
  color: #fff;
  // position: absolute;
  // left: 400px;
  // top: 200px;
  // z-index: 11;
  transform: perspective(244px) rotateX(-30deg);
  background: url("./img/光点.png") no-repeat;
  background-position-y: 113%;
}
</style>

<script>
import mapApi from "./zaoyangDemo";
export default {
  data() {
    return {};
  },
  mounted() {
    mapApi.loadMap("Map")
  },
  methods: {}
};
</script>

<style lang="less">
.main {
  width: 100%;
  height: 100vh;
  .map {
    background: #01133C;
    width: 100%;
    height: 100vh;
  }
  .map_CaseTypeSum {
    width: 220px;
    height: 220px;
    background: rgba(0, 0, 0, 0.8);
    border: 1px solid rgba(0, 216, 255, 0.6);
    transform: perspective(244px) rotateX(-10deg);
    position: absolute;
    left: 100px;
    top: 50px;
    z-index: 1;
    .title {
      width: 190px;
      height: 15px;
      margin: 12px 15px;
      margin-bottom: 25px;
      text-indent: 23px;
      line-height: 16px;
      color: #ff9c00;
      font-size: 18px;
      background: url("./img/arrowRight.png") no-repeat;
      background-size: contain;
      border-left: 1px solid rgba(206, 206, 206, 0.5);
    }
    .item {
      width: 190px;
      height: 50px;
      display: flex;
      justify-content: space-between;
      color: #fff;
      font-size: 16px;
      line-height: 40px;
      margin: 0 15px;
      .left {
        width: 100px;
        height: 40px;
        text-align: right;
        position: relative;
        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #ff9c00;
          position: absolute;
          left: 20px;
          top: 15px;
        }
      }
      .right {
        width: 90px;
        height: 40px;
        text-align: center;
      }
    }
  }
}
</style>
