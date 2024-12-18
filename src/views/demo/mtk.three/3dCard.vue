<template>
  <div class="map" id="Map"></div>
</template>
<script>
import mapApi from "./3dCardMap";
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
.map {
  width: 100%;
  height: 100vh;
  // background: #000a31;
}
.eventInfo {
  width: 310px;
  height: 160px;
  background: url(../texture/eventInfo.png);
}
.videoInfo {
  width: 310px;
  height: 200px;
  background: rgba(20, 14, 3, 0.8);
  border: 1px solid rgba(154, 155, 157, 1);
  //   position: absolute;
  //   left: 500px;
  //   top: 300px;
  //   z-index: 111;
  .main {
    width: 290px;
    height: 180px;
    margin: 10px;
  }
  .dot {
    width: 5px;
    height: 5px;
    background: #f7c95c;
    position: absolute;
    z-index: 3;
  }
  .topLeft {
    top: -2px;
    left: -2px;
  }
  .topRight {
    top: -2px;
    right: -2px;
  }
  .bottomLeft {
    bottom: -2px;
    left: -2px;
  }
  .bottomRight {
    bottom: -2px;
    right: -2px;
  }
}
.info_Cgcontent {
  width: 910px;
  height: 823px;
  .caseTitle {
  }
}

.info_Cgcontent {
  width: 910px;
  height: 823px;
  background: url("../texture/案件弹出.png") no-repeat;
  // position: absolute;
  // z-index: 999;
  // left: 3000px;
  // top: 800px;
  .main {
    width: 538px;
    height: 100%;
    margin-left: 380px;
    .caseTitle {
      width: 100%;
      font-size: 36px;
      height: 34px;
      font-size: 36px;
      font-family: HuXiaoBo;
      font-weight: 400;
      font-style: italic;
      color: #ffffff;
      line-height: 50px;
    }
    .areaName {
      width: 300px;
      height: 30px;
      margin: 107px 0 0 95px;
      font-size: 30px;
      font-family: Microsoft YaHei;
      font-weight: 400;
      color: #ffffff;
      line-height: 50px;
    }
    .imgs {
      width: 430px;
      height: 241px;
      overflow-y: hidden;
      margin: 30px 45px 0 45px;
      white-space: nowrap;
      img {
        width: 430px;
        height: 241px;
        background-size: 100%;
      }
    }
    .imgs::-webkit-scrollbar-track {
      -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
      background-color: #f5f5f5;
    }

    .imgs::-webkit-scrollbar {
      width: 6px;
      height: 15px;
      background-color: #f5f5f5;
    }

    .imgs::-webkit-scrollbar-thumb {
      border-radius: 5px;
      background-color: #0c3c81;
    }

    .item {
      width: 430px;
      height: 350px;
      margin: 30px 45px;
      .item_li {
        width: 210px;
        height: 100px;
        float: left;
        margin: 4px 0;
        .itel_li_top {
          width: 120px;
          height: 34px;
          line-height: 34px;
          text-align: center;
          margin: 0 10px;
          font-size: 24px;
          font-family: Microsoft YaHei;
          font-weight: 400;
          color: #ffffff;
          background: rgba(52, 203, 213, 0.2);
          border: 1px solid #34cbd5;
          border-radius: 4px;
        }
        .itel_li_bot {
          width: 100%;
          height: 45px;
          font-size: 30px;
          font-family: Microsoft YaHei;
          font-weight: 400;
          color: #ffffff;
          line-height: 50px;
          text-indent: 15px;
          overflow: hidden;
        }
      }
    }
  }
}
</style>
