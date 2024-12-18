<template>
  <div class="home">
    <div id="map" class="map"></div>
    <div
      :class="{ toolBtn: true, toolBtnSelect: showMapSymbol }"
      @click="showMapSymbol = !showMapSymbol"
    ></div>
    <transition name="el-zoom-in-top">
      <mapSymbol v-show="showMapSymbol"></mapSymbol>
    </transition>
  </div>
</template>
<script>
import mapSymbol from "./components/mapSymbol";
import mapApi from "../utils/zyMap";
import mapFun from "./mixins/map";
export default {
  name: "home",
  mixins: [mapFun],
  components: {
    mapSymbol
  },
  data() {
    return {
      maploading: false,
      showMapSymbol: false
    };
  },
  mounted() {
    this.$mapApi = new mapApi();
    this.loadmap();
  },
  methods: {
    loadmap() {
      this.$mapApi.loadMap("map");
    }
  }
};
</script>
