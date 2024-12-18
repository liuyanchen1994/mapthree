<template>
  <div class="playContent">
    <div
      v-for="item in playList"
      class="playbtn"
      :key="item.type"
      @click="playBtnClick(item)"
    >
      <img
        class="imgplay"
        :src="item.select ? item.selimg : item.img"
        :title="item.title"
      />
    </div>
  </div>
</template>
<script>
</script>
<script>
export default {
  data() {
    return {
      playList: [
        {
          type: "play",
          img: require("./img/Play1.png"),
          selimg: require("./img/Play.png"),
          select: false,
          title: "播放"
        },
        {
          type: "pause",
          img: require("./img/Pause1.png"),
          selimg: require("./img/Pause.png"),
          select: false,
          title: "暂停"
        },
        {
          type: "fast",
          img: require("./img/Fast1.png"),
          selimg: require("./img/Fast.png"),
          select: false,
          title: "快进"
        },
        {
          type: "rewind",
          img: require("./img/Rewind1.png"),
          selimg: require("./img/Rewind.png"),
          select: false,
          title: "慢放"
        },
        {
          type: "replay",
          img: require("./img/Refresh1.png"),
          selimg: require("./img/Refresh.png"),
          select: false,
          title: "重放"
        },
        {
          type: "quit",
          img: require("./img/quite1.png"),
          selimg: require("./img/quite.png"),
          select: false,
          title: "退出"
        }
      ]
    };
  },
  mounted() {},
  methods: {
    playBtnClick(item) {
      this.$emit("toolClick", item);
      this.playList.map(x => {
        x.select = false;
        if (x.type == item.type) x.select = true;
      });
    }
  }
};
</script>

<style lang="less" scoped>
.playContent {
  width: 275px;
  height: 40px;
  background: #fff;
  border-radius: 20px;
  // border: 1px solid #7895b6;
  padding: 0 10px;
  box-shadow: 0px 0 10px #a5a4a4;
  display: flex;
  justify-content: space-between;
  align-items: center;
  .playbtn {
    width: 35px;
    height: 40px;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>
