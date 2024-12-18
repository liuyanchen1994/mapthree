<template>
  <div class="map" id="Map"></div>
</template>
<script>
import mapApi from "./bloomTestMap";
export default {
  mounted() {
    this.$mapApi = new mapApi();

    this.init();
  },
  methods: {
    init() {
      this.$mapApi.loadMap("Map", () => {});
    },
  },
};
</script>

<style lang="less" scoped>
.map {
  width: 100%;
  height: 100vh;
  // background: #000a31;
}
</style>
