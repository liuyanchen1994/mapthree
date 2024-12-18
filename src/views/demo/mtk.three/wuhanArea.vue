<template>
  <div class="main">
    <div class="map" id="Map"></div>
  </div>
</template>
<style lang="less">
.amap_areaName {
  width: 165px;
  height: 40px;
  text-align: center;
  font-size: 20px;
  font-family: pmzd;
  color: rgba(164, 241, 255, 1);
  text-shadow: 2px 2px 2px #000;
  transform: perspective(244px) rotateX(-30deg);
  background: url("./img/光点.png") no-repeat;
  background-position-y: 113%;
}
</style>

<script>
import mapApi from "./wuhanAreaMap";
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
}
</style>
