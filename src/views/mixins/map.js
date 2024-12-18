export default {
  data() {
    return {
      activeName: "point",
      //点效果
      pointList: [
        { name: "扩散圆环", type: "ringSpread" },
        { name: "扩散圆环2", type: "ringSpread2" },
        // { name:"", type: "ringWheel" },
        { name: "烟雾光圈", type: "fogRing" },
        { name: "'跳动'网格", type: "gridPulse" },
        { name: "强调突出显示", type: "emphasizePulse" },
        // { name: "轮盘旋转", type: "alternateCurtainPulse" },
        { name: "雾化扩散", type: "fogPulse" },
        { name: "放射粒子", type: "dropPulse" },
        { name: "花朵效果", type: "flowerPulse" },
        { name: "'龙卷风'", type: "tornadoPulse" },
        { name: "'旋风'", type: "vortexPulse" },
        { name: "呼吸光圈", type: "circleBreathPulse" },
        { name: "扩散光点/圈", type: "dotPulse" },
        { name: "呼吸放大光圈", type: "breathPulse" },
        { name: "旋转旋涡", type: "rotatePulse" },
        { name: "'心跳'动光圈", type: "heartBeatPulse" },
        { name: "光点聚集", type: "dotGatherPulse" },
        { name: "波浪", type: "wavePulse" },
        { name: "多彩圆圈", type: "colorfulCircle" },
        { name: "'魔法阵'光圈", type: "magicCircle" },
        { name: "简易'花朵'", type: "simpleFlower" },
      ],
      pointRadius: 200,
      pointHeight: 1,
      pointSpeed: 0.005,
      pointType: "扩散圆环",
      pointColor: "#9999FF",
      pointOpacity: 1,
      pointMeshes: [],

      //围墙效果相关
      wallList: [
        { name: "breathWall" },
        { name: "rippleWall" },
        { name: "meteorWall" },
        { name: "floaterWall" },
        { name: "textureWall" },
        { name: "sparkWall" },
        { name: "fireWall" },
        // { name: "fireWallTwo" },
      ],
      wallType: "breathWall",
      wallDrawType: "line",
      wallSpeed: 0.025,
      wallColor: "#0099FF",
      wallOpacity: 1,
      wallHeight: 300,
      wallMeshes: [],
      //雷达效果
      radarList: [
        { name: "radar1" },
        { name: "radar2" },
        { name: "radar3" },
        { name: "radar4" },
        { name: "radar5" },
        { name: "radar6" },
        { name: "radar7" },
        { name: "flabellumScan" },
      ],
      radarDrawType: "point",
      radarRadius: 500,
      radarType: "radar1",
      radarSpeed: 0.025,
      radarColor: "#0099FF",
      radarOpacity: 1,
      radarHeight: 1,
      radarMeshes: [],
      //防护罩效果
      shieldList: [
        { name: "rippleShield" },
        { name: "textureShield" },
        { name: "composedShield" },
        { name: "electricShield" },
        { name: "alarmShield" },
        { name: "fbmShield" },
        { name: "electricRippleShield" },
        { name: "starSky" },
      ],
      shieldDrawType: "point",
      shieldRadius: 500,
      shieldType: "rippleShield",
      shieldSpeed: 0.025,
      shieldColor: "#0099FF",
      shieldOpacity: 1,
      shieldHeight: 1,
      shieldMeshes: [],
      //建筑
      buildDrawType: "polygon",
      buildTopColor: "#fff",
      buildColor: "#001138",
      buildOpacity: 1,
      buildHeight: 200,
      isTexture: false,
      buildMeshes: [],
    };
  },
  methods: {
    handleClick() {},
    typeClick(item) {},
    // 点要素效果
    pointEffect() {
      this.$mapApi.drawGraphic("point", (coord) => {
        let options = {
          color: this.pointColor,
          opacity: this.pointOpacity,
          speed: this.pointSpeed,
          radius: this.pointRadius,
          altitude: this.pointHeight,
          renderOrder: 20,
        };
        let type = this.pointList.find((x) => x.name == this.pointType).type;
        let mesh = this.$mapApi.loadRingEffect(type, coord, options);
        this.pointMeshes.push(mesh);
      });
    },
    clearEffect() {
      this.pointMeshes.length && this.pointMeshes.forEach((p) => p.remove());
      this.pointMeshes.length && (this.pointMeshes = []);
    },
    //围墙效果
    wallEffect() {
      this.$mapApi.drawGraphic(this.wallDrawType, (coord) => {
        let options = {
          color: this.wallColor,
          opacity: this.wallOpacity,
          speed: this.wallSpeed,
          height: this.wallHeight,
          renderOrder: 20,
        };
        let type = this.wallList.find((x) => x.name == this.wallType).name;
        let mesh = this.$mapApi.loadWall(
          type,
          this.wallDrawType,
          coord,
          options
        );
        this.wallMeshes.push(mesh);
      });
    },
    clearWallEffect() {
      this.wallMeshes.length && this.wallMeshes.forEach((p) => p.remove());
      this.wallMeshes.length && (this.wallMeshes = []);
    },
    //雷达效果
    radarEffect() {
      this.$mapApi.drawGraphic(this.radarDrawType, (coord) => {
        let options = {
          radius: this.radarRadius,
          color: this.radarColor,
          opacity: this.radarOpacity,
          speed: this.radarSpeed,
          altitude: this.radarHeight,
          renderOrder: 20,
        };
        let type = this.radarList.find((x) => x.name == this.radarType).name;
        let mesh = this.$mapApi.loadRadar(type, coord, options);
        this.radarMeshes.push(mesh);
      });
    },
    clearRadarEffect() {
      this.radarMeshes.length && this.radarMeshes.forEach((p) => p.remove());
      this.radarMeshes.length && (this.radarMeshes = []);
    },
    shieldEffect() {
      this.$mapApi.drawGraphic(this.shieldDrawType, (coord) => {
        let options = {
          radius: this.shieldRadius,
          color: this.shieldColor,
          opacity: this.shieldOpacity,
          speed: this.shieldSpeed,
          altitude: this.shieldHeight,
          renderOrder: 20,
        };
        let type = this.shieldList.find((x) => x.name == this.shieldType).name;
        let mesh = this.$mapApi.loadShield(type, coord, options);
        this.shieldMeshes.push(mesh);
      });
    },
    clearShieldEffect() {
      this.shieldMeshes.length && this.shieldMeshes.forEach((p) => p.remove());
      this.shieldMeshes.length && (this.shieldMeshes = []);
    },
    buildEffect() {
      this.$mapApi.drawGraphic(this.buildDrawType, (coord) => {
        let options = {
          topColor: this.buildTopColor,
          color: this.buildColor,
          opacity: this.buildOpacity,
          height: this.buildHeight,
          renderOrder: 99,
        };
        let mesh = this.$mapApi.loadBuild(this.isTexture, coord, options);
        this.buildMeshes.push(mesh);
      });
    },
    clearBuild() {
      this.buildMeshes.length && this.buildMeshes.forEach((p) => p.remove());
      this.buildMeshes.length && (this.buildMeshes = []);
    },
  },
};
