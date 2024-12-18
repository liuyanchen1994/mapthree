<template>
  <div class="symbolContent">
    <div class="typeBtnContent">
      <div
        v-for="(item, index) in typeList"
        :key="index"
        :class="{ mtype: true, typeSelect: item.selected }"
        @click="typeClick(item)"
      >
        {{ item.name }}
      </div>
    </div>
    <!-- 点相关效果 -->
    <transition name="el-zoom-in-center">
      <div class="pointContainer" v-show="activeName == 'point'">
        <div class="attrTitle">
          效果选择
          <div
            :class="{ arrow: true, effectSelectShow: !showEffectSelect }"
            @click="showEffectSelect = !showEffectSelect"
          ></div>
        </div>
        <div
          class="effectTypeContainer"
          :style="{
            height: showEffectSelect ? (moreSelect ? '550px' : '250px') : '0px',
          }"
        >
          <div class="effectType" v-for="item in pointList" :key="item.type">
            <div
              :class="{ effectImg: true, effectImgSelect: item.select }"
              @click="pointTypeClick(item)"
            >
              <img
                :src="
                  require(`../../../public/image/mapSymbol/pointEffect/${item.type}.gif`)
                "
                alt=""
              />
              <div class="effectTypeSelect" v-if="item.select"></div>
            </div>
            <!-- <div class="effectName">{{ item.name }}</div> -->
          </div>
        </div>
        <div
          :class="{ moreBtn: true, moreBtnSel: moreSelect }"
          :style="{
            top: moreSelect ? '670px' : '370px',
            display: showEffectSelect ? 'block' : 'none',
          }"
          @click="moreSelect = !moreSelect"
        ></div>
        <div
          class="attrTitle"
          :style="{ marginTop: showEffectSelect ? '20px' : '0' }"
        >
          属性设置
          <div
            :class="{ arrow: true, effectSelectShow: !showPointAttr }"
            @click="showPointAttr = !showPointAttr"
          ></div>
        </div>
        <el-form
          class="pointForm"
          label-position="left"
          ref="form"
          label-width="80px"
          :style="{ height: showPointAttr ? '310px' : '0' }"
        >
          <el-form-item label="半径/米:">
            <el-slider v-model="pointRadius" :min="10" :max="5000" show-input>
            </el-slider>
          </el-form-item>
          <el-form-item label="高度:">
            <el-slider
              v-model="pointHeight"
              :min="1"
              :max="500"
              :step="1"
              show-input
            >
            </el-slider>
          </el-form-item>
          <el-form-item label="动效速度:">
            <el-slider
              v-model="pointSpeed"
              :min="0"
              :max="2"
              :step="0.001"
              show-input
            >
            </el-slider>
          </el-form-item>
          <el-form-item label="颜色设置:">
            <el-color-picker v-model="pointColor"></el-color-picker>
            <el-input
              size="small"
              v-model="pointColor"
              placeholder="例:#12E6FF"
              style="width: 40%; float: right"
            >
            </el-input>
          </el-form-item>
          <el-form-item label="透明度:">
            <el-slider
              v-model="pointOpacity"
              :min="0"
              :max="1"
              :step="0.1"
              show-input
            >
            </el-slider>
          </el-form-item>
        </el-form>
        <el-form
          class="pointForm"
          label-position="left"
          ref="form"
          label-width="80px"
        >
          <el-form-item style="float: right">
            <el-button type="primary" @click="pointEffect">添加效果</el-button>
            <el-button type="info" @click="clearEffect">一键清除</el-button>
          </el-form-item>
        </el-form>
      </div>
    </transition>
    <!-- 围栏 -->
    <transition name="el-zoom-in-center">
      <div class="wallContainer" v-show="activeName == 'wall'">
        <div class="attrTitle">
          效果选择
          <div
            :class="{ arrow: true, effectSelectShow: !showWallEffectSelect }"
            @click="showWallEffectSelect = !showWallEffectSelect"
          ></div>
        </div>
        <div
          class="effectTypeContainer"
          :style="{ height: showWallEffectSelect ? '250px' : '0px' }"
        >
          <div class="effectType" v-for="item in wallList" :key="item.type">
            <div
              :class="{ effectImg: true, effectImgSelect: item.select }"
              @click="wallTypeClick(item)"
            >
              <img
                :src="
                  require(`../../../public/image/mapSymbol/wallEffect/${item.type}.gif`)
                "
                alt=""
              />
              <div class="effectTypeSelect" v-if="item.select"></div>
            </div>
            <!-- <div class="effectName">{{ item.name }}</div> -->
          </div>
        </div>
        <div class="attrTitle">
          属性设置
          <div
            :class="{ arrow: true, effectSelectShow: !showWallAttr }"
            @click="showWallAttr = !showWallAttr"
          ></div>
        </div>
        <el-form
          class="pointForm"
          label-position="left"
          ref="form"
          label-width="80px"
          :style="{
            height: showWallAttr
              ? wallDrawType == '圆'
                ? '350px'
                : '310px'
              : '0',
          }"
        >
          <el-form-item label="动效速度:">
            <el-slider
              v-model="wallSpeed"
              :min="0"
              :max="2"
              :step="0.001"
              show-input
            >
            </el-slider>
          </el-form-item>
          <el-form-item label="颜色设置:">
            <el-color-picker v-model="wallColor"></el-color-picker>
            <el-input
              size="small"
              v-model="wallColor"
              placeholder="例:#0099FF"
              style="width: 40%; float: right"
            >
            </el-input>
          </el-form-item>
          <el-form-item label="透明度:">
            <el-slider
              v-model="wallOpacity"
              :min="0"
              :max="1"
              :step="0.1"
              show-input
            >
            </el-slider>
          </el-form-item>
          <el-form-item label="围栏高度:">
            <el-slider
              v-model="wallHeight"
              :min="50"
              :max="5000"
              :step="10"
              show-input
            >
            </el-slider>
          </el-form-item>
          <el-form-item label="绘制类型:">
            <el-radio-group v-model="wallDrawType">
              <el-radio
                style="margin: 3px"
                :label="item.name"
                v-for="(item, index) in wallDrawTypeList"
                :key="index"
              >
              </el-radio>
              <!-- <el-radio style="margin:3px" label="line"></el-radio>
              <el-radio style="margin:3px" label="freeline"></el-radio>
              <el-radio style="margin:3px" label="polygon"></el-radio> -->
            </el-radio-group>
          </el-form-item>
          <el-form-item label="围栏半径:" v-show="wallDrawType == '圆'">
            <el-slider
              v-model="wallRadius"
              :min="50"
              :max="5000"
              :step="10"
              show-input
            >
            </el-slider>
          </el-form-item>
        </el-form>
        <el-form
          class="pointForm"
          label-position="left"
          ref="form"
          label-width="80px"
        >
          <el-form-item style="float: right">
            <el-button type="primary" @click="wallEffect">添加效果</el-button>
            <el-button type="info" @click="clearWallEffect">清除</el-button>
          </el-form-item>
        </el-form>
      </div>
    </transition>
    <!-- 雷达 -->
    <transition name="el-zoom-in-center">
      <div class="radarContainer" v-show="activeName == 'radar'">
        <div class="attrTitle">
          效果选择
          <div
            :class="{ arrow: true, effectSelectShow: !showRadarEffectSelect }"
            @click="showRadarEffectSelect = !showRadarEffectSelect"
          ></div>
        </div>
        <div
          class="effectTypeContainer"
          :style="{ height: showRadarEffectSelect ? '250px' : '0px' }"
        >
          <div class="effectType" v-for="item in radarList" :key="item.name">
            <div
              :class="{ effectImg: true, effectImgSelect: item.select }"
              @click="radarTypeClick(item)"
            >
              <img
                :src="
                  require(`../../../public/image/mapSymbol/radarEffect/${item.name}.gif`)
                "
                alt=""
              />
              <div class="effectTypeSelect" v-if="item.select"></div>
            </div>
            <!-- <div class="effectName">{{ item.name }}</div> -->
          </div>
        </div>
        <div class="attrTitle">
          属性设置
          <div
            :class="{ arrow: true, effectSelectShow: !showRadarAttr }"
            @click="showRadarAttr = !showRadarAttr"
          ></div>
        </div>
        <el-form
          class="pointForm"
          label-position="left"
          ref="form"
          label-width="80px"
          :style="{ height: showRadarAttr ? '310px' : '0' }"
        >
          <el-form-item label="半径/米:">
            <el-slider
              v-model="radarRadius"
              :min="50"
              :max="10000"
              :step="10"
              show-input
            >
            </el-slider>
          </el-form-item>
          <el-form-item label="颜色设置:">
            <el-color-picker v-model="radarColor"></el-color-picker>
            <el-input
              size="small"
              v-model="radarColor"
              placeholder="例:#0099FF"
              style="width: 40%; float: right"
            >
            </el-input>
          </el-form-item>
          <el-form-item label="高度:">
            <el-slider
              v-model="radarHeight"
              :min="1"
              :max="500"
              :step="1"
              show-input
            >
            </el-slider>
          </el-form-item>
          <el-form-item label="动效速度:">
            <el-slider
              v-model="radarSpeed"
              :min="0"
              :max="2"
              :step="0.001"
              show-input
            >
            </el-slider>
          </el-form-item>
          <el-form-item label="透明度:">
            <el-slider
              v-model="radarOpacity"
              :min="0"
              :max="1"
              :step="0.1"
              show-input
            >
            </el-slider>
          </el-form-item>
        </el-form>
        <el-form
          class="pointForm"
          label-position="left"
          ref="form"
          label-width="80px"
        >
          <el-form-item style="float: right">
            <el-button type="primary" @click="radarEffect">添加效果</el-button>
            <el-button type="info" @click="clearRadarEffect">清除</el-button>
          </el-form-item>
        </el-form>
      </div>
    </transition>
    <!-- 防护罩 -->
    <transition name="el-zoom-in-center">
      <div class="radarContainer" v-show="activeName == 'shield'">
        <div class="attrTitle">
          效果选择
          <div
            :class="{ arrow: true, effectSelectShow: !showShieldEffectSelect }"
            @click="showShieldEffectSelect = !showShieldEffectSelect"
          ></div>
        </div>
        <div
          class="effectTypeContainer"
          :style="{ height: showShieldEffectSelect ? '250px' : '0px' }"
        >
          <div class="effectType" v-for="item in shieldList" :key="item.name">
            <div
              :class="{ effectImg: true, effectImgSelect: item.select }"
              @click="shieldTypeClick(item)"
            >
              <img
                :src="
                  require(`../../../public/image/mapSymbol/shieldEffect/${item.name}.gif`)
                "
                alt=""
              />
              <div class="effectTypeSelect" v-if="item.select"></div>
            </div>
            <!-- <div class="effectName">{{ item.name }}</div> -->
          </div>
        </div>
        <div class="attrTitle">
          属性设置
          <div
            :class="{ arrow: true, effectSelectShow: !showShieldAttr }"
            @click="showShieldAttr = !showShieldAttr"
          ></div>
        </div>
        <el-form
          class="pointForm"
          label-position="left"
          ref="form"
          label-width="80px"
          :style="{ height: showShieldAttr ? '310px' : '0' }"
        >
          <el-form-item label="半径/米:">
            <el-slider
              v-model="shieldRadius"
              :min="50"
              :max="5000"
              :step="10"
              show-input
            >
            </el-slider>
          </el-form-item>
          <el-form-item label="颜色设置:">
            <el-color-picker v-model="shieldColor"></el-color-picker>
            <el-input
              size="small"
              v-model="shieldColor"
              placeholder="例:#0099FF"
              style="width: 40%; float: right"
            >
            </el-input>
          </el-form-item>
          <el-form-item label="高度:">
            <el-slider
              v-model="shieldHeight"
              :min="1"
              :max="500"
              :step="1"
              show-input
            >
            </el-slider>
          </el-form-item>
          <el-form-item label="动效速度:">
            <el-slider
              v-model="shieldSpeed"
              :min="0"
              :max="2"
              :step="0.001"
              show-input
            >
            </el-slider>
          </el-form-item>
          <el-form-item label="透明度:">
            <el-slider
              v-model="shieldOpacity"
              :min="0"
              :max="1"
              :step="0.1"
              show-input
            >
            </el-slider>
          </el-form-item>
        </el-form>
        <el-form
          class="pointForm"
          label-position="left"
          ref="form"
          label-width="80px"
        >
          <el-form-item style="float: right">
            <el-button type="primary" @click="shieldEffect">添加效果</el-button>
            <el-button type="info" @click="clearShieldEffect">清除</el-button>
          </el-form-item>
        </el-form>
      </div>
    </transition>
    <!-- 建筑 -->
    <transition name="el-zoom-in-center">
      <div class="radarContainer" v-show="activeName == 'build'">
        <div class="attrTitle">
          效果选择
          <div
            :class="{ arrow: true, effectSelectShow: !showBuildEffectSelect }"
            @click="showBuildEffectSelect = !showBuildEffectSelect"
          ></div>
        </div>
        <div
          class="effectTypeContainer"
          :style="{ height: showBuildEffectSelect ? '250px' : '0px' }"
        >
          <div class="effectType" v-for="item in buildList" :key="item.type">
            <div
              :class="{ effectImg: true, effectImgSelect: item.select }"
              @click="buildTypeClick(item)"
            >
              <img
                :src="
                  require(`../../../public/image/mapSymbol/buildEffect/${item.type}.png`)
                "
                alt=""
              />
              <div class="effectTypeSelect" v-if="item.select"></div>
            </div>
            <!-- <div class="effectName">{{ item.name }}</div> -->
          </div>
        </div>
        <div class="attrTitle">
          属性设置
          <div
            :class="{ arrow: true, effectSelectShow: !showBuildAttr }"
            @click="showBuildAttr = !showBuildAttr"
          ></div>
        </div>
        <el-form
          class="pointForm"
          label-position="left"
          ref="form"
          label-width="80px"
          :style="{ height: showBuildAttr ? '310px' : '0' }"
        >
          <el-form-item label="颜色设置:">
            <el-color-picker v-model="buildColor"></el-color-picker>
            <el-input
              size="small"
              v-model="buildColor"
              placeholder="例:#12E6FF"
              style="width: 40%; float: right"
            >
            </el-input>
          </el-form-item>
          <!-- <el-form-item label="顶部颜色">
            <el-color-picker v-model="buildTopColor"></el-color-picker>
          </el-form-item> -->
          <el-form-item label="建筑高度:">
            <el-slider
              v-model="buildHeight"
              :min="0"
              :max="1000"
              :step="1"
              show-input
            >
            </el-slider>
          </el-form-item>
          <el-form-item label="透明度:">
            <el-slider
              v-model="buildOpacity"
              :min="0"
              :max="1"
              :step="0.1"
              show-input
            >
            </el-slider>
          </el-form-item>
        </el-form>
        <el-form
          class="pointForm"
          label-position="left"
          ref="form"
          label-width="80px"
        >
          <el-form-item style="float: right">
            <el-button type="primary" @click="buildEffect">绘制建筑</el-button>
            <el-button type="info" @click="clearBuild">清除</el-button>
          </el-form-item>
        </el-form>
      </div>
    </transition>
    <transition name="el-zoom-in-center">
      <div class="radarContainer" v-show="activeName == 'model'">
        <div class="attrTitle">
          效果选择
          <div
            :class="{ arrow: true, effectSelectShow: !showModelEffectSelect }"
            @click="showModelEffectSelect = !showModelEffectSelect"
          ></div>
        </div>
        <div
          class="effectTypeContainer"
          :style="{ height: showModelEffectSelect ? '250px' : '0px' }"
        >
          <div class="effectType" v-for="item in modelList" :key="item.name">
            <div
              :class="{ effectImg: true, effectImgSelect: item.select }"
              @click="modelTypeClick(item)"
            >
              <img
                :src="
                  require(`../../../public/image/mapSymbol/modelEffect/${item.name}.png`)
                "
                alt=""
              />
              <div class="effectTypeSelect" v-if="item.select"></div>
            </div>
            <!-- <div class="effectName">{{ item.name }}</div> -->
          </div>
        </div>
        <div class="attrTitle">
          属性设置
          <div
            :class="{ arrow: true, effectSelectShow: !showModelAttr }"
            @click="showModelAttr = !showModelAttr"
          ></div>
        </div>
      </div>
    </transition>
  </div>
</template>
<script>
// import { GetTime } from "@/utils/assis";
export default {
  data() {
    return {
      moreSelect: false,
      activeName: "point",
      typeList: [
        { name: "点", type: "point", selected: true },
        { name: "围栏", type: "wall", selected: false },
        { name: "雷达", type: "radar", selected: false },
        { name: "防护罩", type: "shield", selected: false },
        { name: "建筑", type: "build", selected: false },
        { name: "模型", type: "model", selected: false }
      ],
      showEffectSelect: true,
      showPointAttr: true,
      pointList: [
        { select: true, name: "扩散圆环", type: "ringSpread" },
        { select: false, name: "扩散圆环2", type: "ringSpread2" },
        { select: false, name: "烟雾光圈", type: "fogRing" },
        { select: false, name: "'跳动'网格", type: "gridPulse" },
        { select: false, name: "强调突出显示", type: "emphasizePulse" },
        { select: false, name: "雾化扩散", type: "fogPulse" },
        { select: false, name: "放射粒子", type: "dropPulse" },
        { select: false, name: "'花朵'效果", type: "flowerPulse" },
        { select: false, name: "'龙卷风'", type: "tornadoPulse" },
        { select: false, name: "'旋风'", type: "vortexPulse" },
        { select: false, name: "呼吸光圈", type: "circleBreathPulse" },
        { select: false, name: "扩散光点/圈", type: "dotPulse" },
        { select: false, name: "呼吸放大光圈", type: "breathPulse" },
        { select: false, name: "旋转'旋涡'", type: "rotatePulse" },
        { select: false, name: "'心跳'动光圈", type: "heartBeatPulse" },
        { select: false, name: "光点聚集", type: "dotGatherPulse" },
        { select: false, name: "波浪", type: "wavePulse" },
        { select: false, name: "多彩圆圈", type: "colorfulCircle" },
        { select: false, name: "'魔法阵'光圈", type: "magicCircle" },
        { select: false, name: "简易'花朵'", type: "simpleFlower" }
        // { name: "轮盘旋转", type: "alternateCurtainPulse" },
        // { name:"", type: "ringWheel" },
      ],
      pointType: "ringSpread",
      pointRadius: 200,
      pointHeight: 1,
      pointSpeed: 0.005,
      pointColor: "#12E6FF",
      pointOpacity: 1,
      pointMeshes: [],
      currentMesh: null,

      //围墙效果相关
      wallList: [
        { select: true, name: "呼吸围栏", type: "breathWall" },
        { select: false, name: "波纹围栏", type: "rippleWall" },
        { select: false, name: "'粒子'围栏", type: "meteorWall" },
        { select: false, name: "'漂浮物'围栏", type: "floaterWall" },
        { select: false, name: "贴图围栏", type: "textureWall" },
        { select: false, name: "'火花'", type: "sparkWall" },
        { select: false, name: "fireWall", type: "fireWall" }
        // { name: "fireWallTwo" },
      ],
      wallDrawTypeList: [
        { name: "线", type: "line" },
        { name: "自由绘制线", type: "freeline" },
        { name: "圆形", type: "circle" },
        { name: "多边形", type: "polygon" }
      ],
      wallType: "breathWall",
      showWallEffectSelect: true,
      showWallAttr: true,
      wallDrawType: "线",
      wallSpeed: 0.025,
      wallColor: "#0099FF",
      wallOpacity: 1,
      wallHeight: 300,
      wallRadius: 300,
      wallMeshes: [],
      //雷达效果
      radarList: [
        { select: true, name: "radar1" },
        // { select: false, name: "radar2" },
        { select: false, name: "radar3" },
        { select: false, name: "radar4" },
        { select: false, name: "radar5" },
        { select: false, name: "radar6" },
        { select: false, name: "radar7" },
        { select: false, name: "flabellumScan" }
      ],
      radarType: "radar1",
      showRadarEffectSelect: true,
      showRadarAttr: true,
      radarDrawType: "point",
      radarRadius: 500,
      radarSpeed: 0.025,
      radarColor: "#0099FF",
      radarOpacity: 1,
      radarHeight: 1,
      radarMeshes: [],
      //防护罩效果
      shieldList: [
        { select: true, name: "rippleShield" },
        { select: false, name: "textureShield" },
        { select: false, name: "composedShield" },
        { select: false, name: "electricShield" },
        // { select: false, name: "alarmShield" },
        { select: false, name: "fbmShield" },
        { select: false, name: "electricRippleShield" },
        { select: false, name: "starSky" }
      ],
      showShieldEffectSelect: true,
      showShieldAttr: true,
      shieldDrawType: "point",
      shieldRadius: 500,
      shieldType: "rippleShield",
      shieldSpeed: 0.025,
      shieldColor: "#0099FF",
      shieldOpacity: 1,
      shieldHeight: 1,
      shieldMeshes: [],
      //建筑
      buildList: [
        { select: true, name: "纯色", type: "fillColor" },
        { select: false, name: "canvas贴图", type: "canvasTexture01" },
        { select: false, name: "canvas贴图", type: "canvasTexture02" },
        { select: false, name: "贴图1", type: "texture01" },
        { select: false, name: "贴图2", type: "texture02" },
        { select: false, name: "贴图3", type: "texture03" }
      ],
      showBuildEffectSelect: true,
      showBuildAttr: true,
      buildType: "fillColor",
      buildDrawType: "polygon",
      buildTopColor: "#fff",
      buildColor: "#12E6FF",
      buildOpacity: 1,
      buildHeight: 200,
      isTexture: true,
      buildMeshes: [],
      //模型
      modelList: [{ select: true, name: "tree" }],
      showModelEffectSelect: true,
      showModelAttr: true,
      modelDrawType: "point",
      modelType: "tree"
    };
  },
  computed: {
    radiusChange() {
      const { pointRadius, wallRadius, radarRadius, shieldRadius } = this;
      return {
        pointRadius,
        wallRadius,
        radarRadius,
        shieldRadius
      };
    }
  },
  watch: {
    // radiusChange: {
    //   handler(val, newval) {
    //     //this.updateRadius(val);
    //   },
    //   deep: true
    // },
    pointRadius(val) {
      this.updateRadius(val);
    },
    pointColor(val) {
      this.updateColor(val);
    },
    pointHeight(val) {
      this.updateAltitude(val);
    },
    pointSpeed(val) {
      this.updateSpeed(val);
    },
    pointOpacity(val) {
      this.updateOpacity(val);
    },
    wallSpeed(val) {
      this.updateSpeed(val);
    },
    wallOpacity(val) {
      this.updateOpacity(val);
    },
    wallColor(val) {
      this.updateColor(val);
    },
    wallRadius(val) {
      this.updateRadius(val);
    },
    radarRadius(val) {
      this.updateRadius(val);
    },
    radarColor(val) {
      this.updateColor(val);
    },
    radarSpeed(val) {
      this.updateSpeed(val);
    },
    radarHeight(val) {
      this.updateAltitude(val);
    },
    shieldRadius(val) {
      this.updateRadius(val);
    },
    shieldColor(val) {
      this.updateColor(val);
    },
    shieldOpacity(val) {
      this.updateOpacity(val);
    },
    shieldSpeed(val) {
      this.updateSpeed(val);
    },
    buildColor(val) {
      this.updateBuildColor(val);
    }
  },
  methods: {
    typeClick(item) {
      this.typeList.map(x => (x.selected = false));
      item.selected = !item.selected;
      this.activeName = item.type;
      this.currentMesh = null;
    },
    //点效果选择点击事件
    pointTypeClick(data) {
      this.pointType = data.type;
      this.pointList.map(x => (x.select = false));
      data.select = true;
      this.currentMesh = null;
    },
    //围栏效果选择点击事件
    wallTypeClick(data) {
      this.wallType = data.type;
      this.wallList.map(x => (x.select = false));
      data.select = true;
      this.currentMesh = null;
    },
    //雷达选择点击事件
    radarTypeClick(data) {
      this.radarType = data.name;
      this.radarList.map(x => (x.select = false));
      data.select = true;
      this.currentMesh = null;
    },
    //防护罩选择点击事件
    shieldTypeClick(data) {
      this.shieldType = data.name;
      this.shieldList.map(x => (x.select = false));
      data.select = true;
      this.currentMesh = null;
    },
    //建筑选择点击事件
    buildTypeClick(data) {
      this.buildType = data.type;
      this.buildList.map(x => (x.select = false));
      data.select = true;
      this.currentMesh = null;
    },
    modelTypeClick(data) {
      this.modelType = data.type;
      this.buildList.map(x => (x.select = false));
      data.select = true;
      this.currentMesh = null;
    },
    // 点要素效果
    pointEffect() {
      this.currentMesh = null;
      this.$parent.$mapApi.drawGraphic("point", coord => {
        let options = {
          color: this.pointColor,
          opacity: this.pointOpacity,
          speed: this.pointSpeed,
          radius: this.pointRadius,
          altitude: this.pointHeight,
          renderOrder: 20
        };
        // let type = this.pointList.find((x) => x.name == this.pointType).type;
        this.$parent.$mapApi.loadRingEffect(this.pointType, coord, options);
      });
    },

    //清除所有点效果
    clearEffect() {
      this.$parent.$mapApi.clearEffect();
    },
    //围墙效果
    wallEffect() {
      this.currentMesh = null;
      let wdType = this.wallDrawTypeList.find(x => x.name == this.wallDrawType)
        .type;
      if (wdType == "circle") wdType = "point";
      this.$parent.$mapApi.drawGraphic(wdType, coord => {
        let options = {
          color: this.wallColor,
          opacity: this.wallOpacity,
          speed: this.wallSpeed,
          height: this.wallHeight,
          renderOrder: 60,
          radius: this.wallRadius
        };
        // let type = this.wallList.find((x) => x.name == this.wallType).name;
        if (wdType == "point") options.isCylinder = true;
        this.$parent.$mapApi.loadWall(this.wallType, wdType, coord, options);
      });
    },
    //清除所有围栏效果
    clearWallEffect() {
      this.$parent.$mapApi.clearWallEffect();
    },
    //雷达效果
    radarEffect() {
      this.currentMesh = null;
      this.$parent.$mapApi.drawGraphic(this.radarDrawType, coord => {
        let options = {
          radius: this.radarRadius,
          color: this.radarColor,
          opacity: this.radarOpacity,
          speed: this.radarSpeed,
          altitude: this.radarHeight,
          renderOrder: 3
        };
        // let type = this.radarList.find((x) => x.name == this.radarType).name;
        this.$parent.$mapApi.loadRadar(this.radarType, coord, options);
      });
    },
    //清除所有雷达效果
    clearRadarEffect() {
      this.$parent.$mapApi.clearRadarEffect();
    },
    //防护罩
    shieldEffect() {
      this.$parent.$mapApi.drawGraphic(this.shieldDrawType, coord => {
        let options = {
          radius: this.shieldRadius,
          color: this.shieldColor,
          opacity: this.shieldOpacity,
          speed: this.shieldSpeed,
          altitude: this.shieldHeight,
          renderOrder: 40
        };
        // let type = this.shieldList.find((x) => x.name == this.shieldType).name;
        this.$parent.$mapApi.loadShield(this.shieldType, coord, options);
      });
    },
    clearShieldEffect() {
      this.$parent.$mapApi.clearShieldEffect();
    },
    //建筑
    buildEffect() {
      this.$parent.$mapApi.drawGraphic(this.buildDrawType, coord => {
        let options = {
          // topColor: this.buildTopColor,
          color: this.buildColor,
          opacity: this.buildOpacity,
          height: this.buildHeight,
          renderOrder: 10
        };
        this.$parent.$mapApi.loadBuild(this.buildType, coord, options);
      });
    },
    clearBuild() {
      this.$parent.$mapApi.clearBuild();
    },
    modelEffect() {
      this.$parent.$mapApi.drawGraphic("point", coord => {
        let options = {
          width: this.markerWidth,
          height: this.markerHeight,
          opacity: this.markerOpacity,
          altitude: this.markerHeight,
          renderOrder: 40
        };
        // let type = this.shieldList.find((x) => x.name == this.shieldType).name;
        this.$parent.$mapApi.loadRunMarker(coord, options);
      });
    },
    clearModel() {
      this.$parent.$mapApi.clearBuild();
    },
    //更新半径(计算缩放比)
    updateRadius(val) {
      this.$parent.$mapApi.updateRadius(val);
    },
    //更新颜色
    updateColor(val) {
      this.$parent.$mapApi.updateColor(val);
    },
    //更新垂直高度
    updateAltitude(val) {
      this.$parent.$mapApi.updateAltitude(val);
    },
    //更新动画速度
    updateSpeed(val) {
      this.$parent.$mapApi.updateSpeed(val);
    },
    //更新透明度
    updateOpacity(val) {
      this.$parent.$mapApi.updateOpacity(val);
    },
    updateBuildColor(val) {
      this.$parent.$mapApi.updateBuildColor(val);
    }
  }
};
</script>

<style lang="less" scoped>
.symbolContent {
  width: 466px;
  height: 850px;
  overflow: hidden;
  background: #000927;
  opacity: 0.95;
  position: absolute;
  right: 85px;
  top: 20px;
  z-index: 33;
  .typeBtnContent {
    width: 100%;
    height: 40px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.35);
    display: flex;
    justify-content: center;
    align-items: center;

    .mtype {
      width: 77px;
      height: 40px;
      line-height: 36px;
      text-indent: 26px;
      cursor: pointer;
      background: url("../../../public/image/mapSymbol/pic_default.png")
        no-repeat;
      background-position: 6px 10px;
      color: #12e6ff;
    }
    .mtype:first-child {
      width: 50px;
    }
    .typeSelect {
      background: url("../../../public/image/mapSymbol/pic_selected.png")
        no-repeat;
      background-position: 6px 10px;
      color: #ffd248;
      // border-bottom: 1px solid #FFD248;
    }
  }
  .pointContainer,
  .wallContainer,
  .radarContainer {
    width: calc(100% - 40px);
    height: calc(100% - 40px);
    // background: #0ff;
    margin: 20px;
  }
  .attrTitle {
    width: 100%;
    height: 40px;
    line-height: 40px;
    float: left;
    font-family: nanshen;
    font-size: 16px;
    font-weight: 400;
    color: #ffffff;
    align-items: center;
    display: flex;
    transition: all 0.5s;
    .arrow {
      width: 12px;
      height: 12px;
      margin: -5px 0 0 10px;
      cursor: pointer;
      transition: all 0.5s;
      background: url("../../../public/image/mapSymbol/展开.png") no-repeat;
    }
    .effectSelectShow {
      transform: rotateZ(180deg);
    }
  }
  .moreBtn {
    width: 40px;
    height: 25px;
    background: url("../../../public/image/mapSymbol/more.png") no-repeat;
    cursor: pointer;
    position: absolute;
    z-index: 2;
    right: 38px;
    top: 370px;
    transition: all 0.5s;
  }
  .moreBtnSel {
    background: url("../../../public/image/mapSymbol/折叠.png") no-repeat;
  }
  .effectTypeContainer {
    width: 100%;
    height: 250px;
    margin: 10px 0;
    overflow: hidden;
    float: left;
    transition: all 0.5s;
    .effectType {
      width: 80px;
      height: 110px;
      margin: 0 13px;
      // justify-content: center;
      // align-items: center;
      // display: flex;
      float: left;
      .effectImg {
        width: 78px;
        height: 80px;
        // background: #0ff;
        border: 1px solid rgba(255, 255, 255, 0.2);
        cursor: pointer;
        position: relative;
        transition: all 0.5s;
        img {
          width: 76px;
          height: 78px;
        }
        .effectTypeSelect {
          width: 18px;
          height: 18px;
          background: url("../../../public/image/mapSymbol/确认.png") no-repeat;
          position: absolute;
          bottom: -1px;
          right: -1px;
          z-index: 3;
          transition: all 0.5s;
        }
      }
      .effectImgSelect {
        border: 1px solid rgba(255, 255, 255, 1);
      }
      .effectName {
        width: 100%;
        height: 28px;
        text-align: center;
        line-height: 28px;
        color: #ffffff;
        opacity: 0.6;
      }
    }
  }
  .pointForm {
    float: left;
    width: 95%;
    overflow: hidden;
    transition: all 0.5s;
  }
}
</style>
