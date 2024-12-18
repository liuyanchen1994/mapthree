<template>
  <div class="container">
    <div class="map" id="Map"></div>
    <div class="mask"></div>
  </div>
</template>
<script>
import mapApi from "./tempMap2";
export default {
  mounted() {
    this.$mapApi = new mapApi();

    this.init();
  },
  methods: {
    init() {
      this.$mapApi.loadMap("Map", () => {});
    }
  }
};
</script>

<style lang="less">
.container,
.map,
.mask {
  width: 100%;
  height: 100vh;
  // background: #000a31;
}
.mask {
  position: absolute;
  z-index: 11;
  left: 0;
  top: 0;
  background: linear-gradient(
    to top,
    rgba(3, 19, 57, 0),
    rgba(3, 19, 57, 0.1),
    rgba(3, 19, 57, 0.1),
    rgba(3, 19, 57, 1)
  );
  pointer-events: none;
}
</style>
