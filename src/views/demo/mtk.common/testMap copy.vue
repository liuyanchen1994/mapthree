<template>
  <section>
    <div class="map" id="Map"></div>
  </section>
</template>
<script>
import mapApiClass from "./map2";
const mapApi = new mapApiClass();
export default {
  data() {
    return {};
  },
  mounted() {
    mapApi.mapInit("Map");
  },
  methods: {
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
