<template>
  <div class="infoCon">
    <div class="mapCloseBtn" @click="closeEvent">×</div>
    <div class="title">{{ form.name }}</div>
    <div class="stitle">实时监测</div>
    <div class="item">
      <div class="left">油烟值：{{form.yyz}}mg/m³</div>
      <div class="left">PM浓度：{{form.pm}}mg/m³</div>
    </div>
    <div class="item">
      <div class="left">VOCs浓度：<span style="color:#FD5A12">{{form.voc}}mg/m³</span></div>
      <div class="left">风机运行状态：<span style="color:#FACF7F">{{form.fjyxzt}}</span></div>
    </div>
    <div class="item">
      <div class="left">NMHC浓度：{{form.nmhc}}mg/m³</div>
      <div class="left">净化器运行状态：{{form.jhqyxzt}}</div>
    </div>
    <div class="stitle" style="margin-top: 10px">视频监控</div>
    <div class="videoCon">
      <div class="video">监控探头01</div>
      <div class="video">监控探头02</div>
      <div class="video">监控探头03</div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    form: {
      type: Object,
      default: () => {
        return {
          x: 112.76773079264694,
          y: 32.12971475741364,
          name: "老街烧烤",
          yyz: "324",
          pm: "123",
          voc: "78",
          fjyxzt: "正常",
          nmhc: 98,
          jhqyxzt: "正常"
        };
      }
    }
  },
  methods: {
    closeEvent(){
      this.$emit("closeInfowWin")
    }
  }
};
</script>
<style lang="less" scoped>
.infoCon {
  width: 410px;
  height: 258px;
  background: #FFFFFF;
  box-shadow: 0px 8px 8px rgba(229, 233, 242, 0.8);
  opacity: 1;
  border-radius: 8px;
  // float: left;
  font-size: 14px;
  // position: absolute;
  // left: 400px;
  // top: 400px;
  // z-index: 111;
  .mapCloseBtn {
    width: 30px;
    height: 30px;
    font-size: 25px;
    color: #444;
    cursor: pointer;
    border-radius: 50%;
    text-align: center;
    line-height: 27px;
    background: #fff;
    box-shadow: 0 0 10px #cecece;
    position: absolute;
    right: -8px;
    top: -8px;
    z-index: 11;
  }
  .title {
    width: 360px;
    margin: 0 25px;
    height: 50px;
    line-height: 50px;
    font-size: 16px;
    font-family: Microsoft YaHei;
    float: left;
    color: #494E5E;
  }
  .stitle {
    width: 69px;
    height: 24px;
    line-height: 23px;
    text-align: center;
    background: rgba(47, 117, 229, 0.1);
    // border: 1px solid #003ECB;
    border-radius: 4px;
    color: #2F75E5;
    float: left;
    margin: 5px 0 5px 25px;
  }
  .item {
    width: 360px;
    margin: 0 25px;
    height: 30px;
    float: left;
    .left {
      width: 50%;
      height: 30px;
      line-height: 30px;
      color: #707070;
      float: left;
      overflow: hidden;
    }
  }
  .videoCon {
    width: 360px;
    margin: 0 25px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .video {
      width: 100px;
      height: 40px;
      color: #2F75E5;
      line-height: 40px;
      text-align: center;
    }
  }

}
</style>
