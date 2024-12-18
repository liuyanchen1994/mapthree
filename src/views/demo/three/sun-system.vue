<template>
    <div ref="box" id="box">
        <transition name="fade">
            <div v-if="showSpeed" class="speed">
                <p>{{speedString}}</p>
            </div>
        </transition>
        <transition name="fade">
            <div v-if="show1" class="tooltip">
                <p class="head">太阳</p>
                <div class="content">
                    太阳是距离地球最近的恒星，是太阳系的中心天体。太阳系质量的99.87%都集中在太阳。太阳系中的八大行星、小行星、流星、彗星、外海王星天体以及星际尘埃等，都围绕着太阳运行（公转）。太阳只是一颗非常普通的恒星，在广袤浩瀚的繁星世界里，太阳的亮度、大小和物质密度都处于中等水平。只是因为它离地球较近，所以看上去是天空中最大最亮的天体。其它恒星离我们都非常遥远，即使是最近的恒星，也比太阳远27万倍，看上去只是一个闪烁的光点。
组成太阳的物质大多是些普通的气体，其中氢约占71.3%、氦约占27%， 其它元素占2%。太阳从中心向外可分为核反应区、辐射区和对流区、太阳大气。太阳的大气层，像地球的大气层一样，可按不同的高度和不同的性质分成各个圈层，即从内向外分为光球、色球和日冕三层。我们平常看到的太阳表面，是太阳大气的最底层，温度约是6000℃。
                </div>
            </div>
        </transition>
        <transition name="fade">
            <div v-if="show2" class="tooltip">
                <p class="head">水星</p>
                <div class="content">
                    水星(Mercury )，中国古代称为辰星。是太阳系中的类地行星，其主要由石质和铁质构成，密度较高。自转周期很长为58.65天，自转方向和公转方向相同，水星在88个地球日里就能绕太阳一周,平均速度47.89千米,是太阳系中运动最快的行星。无卫星环绕。它是八大行星中是最小的行星，也是离太阳最近的行星。水星最接近太阳，是太阳系的八大行星中按前后顺序排名第一的行星。水星在
太阳系行星
太阳系行星
直径上小于木卫三和土卫六，水星上的太阳看上去要比在地球上大二倍半，太阳光比地球赤道的阳光还要强六倍。水星朝向太阳的一面，温度非常高，可达到400℃以上。
                </div>
            </div>
        </transition>
        <transition name="fade">
            <div v-if="show3" class="tooltip">
                <p class="head">金星</p>
                <div class="content">
                    金星（Venus）是太阳系中八大行星之一，按离太阳由近及远的次序是第二颗。它是离地球最近的行星。中国古代称之为长庚、启明、太白或太白金星。公转周期是224.71地球日。夜空中亮度仅次于月球，排第二，金星要在日出稍前或者日落稍后才能达到亮度最大。它日出稍前出现在东方天空，被称为“启明”；有时黄昏后出现在西方天空，被称为“长庚”。金星是全天中除太阳和月亮外最亮的星，亮度最大时为-4.4等，比著名的天狼星（除太阳外全天最亮的恒星）还要亮14倍，犹如一颗耀眼的钻石，于是古希腊人称它为阿佛洛狄忒（Aphrodite）——爱与美的女神，而罗马人则称它为维纳斯（Venus）——美神。
                </div>
            </div>
        </transition>
        <transition name="fade">
            <div v-if="show4" class="tooltip">
                <p class="head">地球</p>
                <div class="content">
                    地球是太阳系从内到外的第三颗行星，也是太阳系中直径、质量和密度最大的类地行星，也是人类最了解的行星，它也经常被称作世界。英语的地球Earth一词来自于古英语及日耳曼语。地球已经存在了44～46亿年，有一颗天然卫星——月球围绕着地球以30天的周期旋转，而地球以近24小时的周期自转并且以一年的周期绕太阳公转。地球与太阳的平均距离约为14960万公里,在行星中排第三位,它的赤道半径为6378.2公里,其大小在行星中列第五位。
                </div>
                 <p class="head">月球</p>
                <div class="content">
                    月球，天体名称，人类肉眼所见称为月亮，中国古时又称太阴、玄兔、婵娟、玉盘，是地球的卫星，并且是太阳系中第五大的卫星。月球直径大约是地球的四分之一，质量大约是地球的八十一分之一。其表面布满了由小天体撞击形成的撞击坑。月球与地球的平均距离约38.44万千米，大约是地球直径的30倍。月球早已被地球的潮汐力锁定，所以自转和公转周期相同，都为27.32天，黄道和赤道交角约为23.5度，黄道和白道交角约为5度（白道如图中白色轨道）。
                </div>
            </div>
        </transition>
        <transition name="fade">
            <div v-if="show5" class="tooltip">
                <p class="head">火星</p>
                <div class="content">
                    火星是太阳系由内往外数的第四颗行星，属于类地行星，直径为地球的一半，自转轴倾角、自转周期相近，公转一周则花两倍时间。在西方称为战神玛尔斯（Mars），中国则称为“荧惑”。橘红色外表是因为地表的赤铁矿（氧化铁）。火星基本上是沙漠行星，地表沙丘、砾石遍布，没有稳定的液态水体。二氧化碳为主的大气既稀薄又寒冷，沙尘悬浮其中，每年常有尘暴发生。火星两极皆有水冰与干冰组成的极冠，会随着季节消长。
                </div>
            </div>
        </transition>
        <transition name="fade">
            <div v-if="show6" class="tooltip">
                <p class="head">小行星带</p>
                <div class="content">
                    小行星带是太阳系内介于火星和木星轨道之间的小行星密集区域，98.5%的小行星都在此处被发现，已经被编号小行星有120,437颗。由于小行星带是小行星最密集的区域，这个区域因此也被称为主带。
小行星带距离太阳约2.17-3.64天文单位的空间区域内，聚集了大约50万颗以上的小行星。这么多小行星能够被凝聚在小行星带中，除了太阳的引力作用以外，木星的引力起着更大的作用。
                </div>
            </div>
        </transition>
        <transition name="fade">
            <div v-if="show7" class="tooltip">
                <p class="head">木星</p>
                <div class="content">
                    木星，为太阳系八大行星之一，距太阳（由近及远）顺序为第五，亦为太阳系体积最大、自转最快的行星。木星主要由氢和氦组成，中心温度估计高达30,500℃。古代中国称之岁星，取其绕行太阳一周为12年，与地支相同之故。西方语言一般称之朱比特（拉丁语：Jupiter），源自罗马神话中的众神之王、相当于希腊神话中的宙斯。木星在太阳系的八大行星中体积和质量最大，它有着极其巨大的质量，是其它七大行星总和的2.5倍还多，是地球的318倍，而体积则是地球的1,321倍。按照与太阳的距离由近到远排，木星位列第五。同时，木星还是太阳系中自转最快的行星，所以木星并不是正球形的，而是两极稍扁，赤道略鼓。木星是天空中第四亮的星星，仅次于太阳、月球和金星（在有的时候，木星会比火星稍暗，但有时却要比金星还要亮）。木星表面有一个大红斑，从东到西有40,000千米，从北到南有13,000千米，面积大约453,250,000平方千米。对于它是什么仍有争论，很多人认为它是一个永不停息的旋风（风暴），它的范围可以吞没3个地球。
                </div>
            </div>
        </transition>
        <transition name="fade">
            <div v-if="show8" class="tooltip">
                <p class="head">土星</p>
                <div class="content">
                    土星，为太阳系八大行星之一，至太阳距离（由近到远）位于第六、体积则仅次于木星。并与木星、天王星及海王星同属气体（类木）巨星。古代中国亦称之镇星或填星。土星古称镇星或填星，因为土星公转周期大约为29.5年,我国古代有28宿,土星几乎是每年在一个宿中,有镇住或填满该宿的意味,所以称为镇星或填星，直径119300公里（约为地球的9.5倍），是太阳系第二大行星。它与邻居木星十分相像，表面也是液态氢和氦的海洋，上方同样覆盖着厚厚的云层。土星上狂风肆虐，沿东西方向的风速可超过每小时1600公里。土星上空的云层就是这些狂风造成的，云层中含有大量的结晶氨。
                </div>
            </div>
        </transition>
        <transition name="fade">
           <div v-if="show9" class="tooltip">
                <p class="head">天王星</p>
                <div class="content">
                    天王星是太阳向外的第七颗行星，在太阳系的体积是第三大（比海王星大），质量排名第四（比海王星轻）。他的名称来自古希腊神话中的天空之神乌拉诺斯（Ο?ραν??），是克洛诺斯（农神）的父亲，宙斯（朱比特）的祖父。天王星是第一颗在现代发现的行星，虽然它的光度与五颗传统行星一样，亮度是肉眼可见的，但由于较为黯淡而未被古代的观测者发现。威廉·赫歇耳爵士在1781年3月13日宣布他的发现，在太阳系的现代史上首度扩展了已知的界限。这也是第一颗使用望远镜发现的行星。天王星和海王星的内部和大气构成不同于更巨大的气体巨星——木星和土星。同样的，天文学家设立了不同的冰巨星分类来安置它们。天王星大气的主要成分是氢和氦，还包含较高比例的由水、氨、甲烷结成的“冰”，与可以察觉到的碳氢化合物。他是太阳系内温度最低的行星，最低的温度只有49K，还有复合体组成的云层结构，水在最低的云层内，而甲烷组成最高处的云层。
                </div>
            </div>
        </transition>
        <transition name="fade">
           <div v-if="show10" class="tooltip">
                <p class="head">海王星</p>
                <div class="content">
                    海王星（Neptune）是环绕太阳运行的第八颗行星，是围绕太阳公转的第四大天体（直径上）。海王星在直径上小于天王星，但质量比它大。海王星的质量大约是地球的17倍，而类似双胞胎的天王星因密度较低，质量大约是地球的14倍。海王星以罗马神话中的尼普顿(Neptunus)，因为尼普顿是海神，所以中文译为海王星。天文学的符号，是希腊神话的海神波塞冬使用的三叉戟。作为典型的气体行星，海王星上呼啸着按带状分布的大风暴或旋风，海王星上的风暴是太阳系中最快的，时速达到2000千米。海王星的蓝色是大气中甲烷吸收了日光中的红光造成的。尽管海王星是一个寒冷而荒凉的星球。不过科学家们推测它的内部有热源。和土星、木星一样，海王星内部有热源－－它辐射出的能量是它吸收的太阳能的两倍多。由于海王星是一颗淡蓝色的行星，人们根据传统的行星命名法，称其为涅普顿。涅普顿是罗马神话中统治大海的海神，掌握着1/3的宇宙，颇有神通。
                </div>
            </div>
        </transition>
    </div>
</template>

<script>
import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import { FlyControls } from "three/examples/jsm/controls/FlyControls";
import { ConvexGeometry } from "three/examples/jsm/geometries/ConvexGeometry";
import { GUI } from "three/examples/jsm/libs/dat.gui.module";
import { TWEEN } from "three/examples/jsm/libs/tween.module.min.js";
var renderer,
  camera,
  scene,
  height,
  width,
  controls,
  stats,
  clock,
  pointLight,
  ambientLight,
  manager;
var tween1,
  tween2,
  tween3,
  tween4,
  tween5,
  tween6,
  tween7,
  tween8,
  tween9,
  tween10;
var taiyang,
  shuixing,
  jinxing,
  diqiu,
  huoxing,
  muxing,
  tuxing,
  tianwangxing,
  haiwangxing,
  yueqiu,
  asteriods,
  tuxinghuan;
var taiyangT,
  shuixingT,
  jinxingT,
  diqiuT,
  huoxingT,
  muxingT,
  tuxingT,
  tianwangxingT,
  haiwangxingT,
  yueqiuT,
  asteriodsT,
  tuxinghuanT;
function onUpdate() {
  var px = this._object.x;
  var py = this._object.y;
  var pz = this._object.z;
  var lx = this._object.lx;
  var ly = this._object.ly;
  var lz = this._object.lz;
  camera.position.set(px, py, pz);
  camera.lookAt(new THREE.Vector3(lx, ly, lz));
}
export default {
  name: "sun-system",
  data() {
    return {
      radiuses: [2440, 6052, 6371, 3397, 71492, 60268, 25559, 24766],
      distances: [5791, 10820, 14960, 22794, 77833, 142940, 287099, 450400],
      pub_rotation: [88, 225, 365, 687, 4329, 10767, 30769, 60152],
      self_rotation: [58.65, 243, 1, 1, 0.41, 0.42, 0.64, 0.65],
      pitchs: [0, 177, 23, 25, 3, 27, 98, 28],
      distance_ratio: 1 / 100,
      radius_ratio: 1 / 1500,
      self_ratio: 1 / 50,
      pub_ratio: 1 / 2,
      sunObj: {
        radius: 60000 //实际695500
      },
      moonObj: {
        distance: 800, //3实际90
        radius: 1737,
        pitchs: 5,
        self_rotation: 27.25,
        pub_rotation: 27.25
      },
      asteriodObj: {
        radius: 2000, //2000
        pub_rotation: 408
      },
      animation_time: 120,
      pubRotateFlag: false,
      timeS: 0,
      timeP: 0,
      speed: 100,
      speedString: "使用键盘和鼠标控制飞行器移动！",
      showSpeed: false,
      show1: false,
      show2: false,
      show3: false,
      show4: false,
      show5: false,
      show6: false,
      show7: false,
      show8: false,
      show9: false,
      show10: false
    };
  },
  methods: {
    initThree() {
      height = this.$refs.box.clientHeight;
      width = this.$refs.box.clientWidth;
      stats = new Stats();
      stats.setMode(0);
      stats.domElement.style.position = "absolute";
      stats.domElement.style.left = "0px";
      stats.domElement.style.top = "0px";
      this.$refs.box.appendChild(stats.domElement);

      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(width, height);
      renderer.setClearColor(0x000000);
      this.$refs.box.appendChild(renderer.domElement);

      camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 10000);
      camera.position.set(0, 0, -96);
      camera.lookAt(new THREE.Vector3(0, 0, 0));

      manager = new THREE.LoadingManager();
      manager.onProgress = (url, itemsLoaded, itemsTotal) => {
        let num = Math.floor((itemsLoaded / itemsTotal) * 100);
        document.getElementById("loading-outer").style.width = num + "%";
        document.getElementById("progress").innerHTML = num;
        if (num == 100) {
          document.getElementById("loading").style.display = "none";
          this.initPlanet();
        }
      };

      scene = new THREE.Scene();
      scene.background = new THREE.CubeTextureLoader(manager)
        .setPath("/static/images/sky/")
        .load([
          "right.jpg",
          "left.jpg",
          "top.jpg",
          "bottom.jpg",
          "front.jpg",
          "back.jpg"
        ]);
      scene.add(camera);

      this.initLight();
      this.initTexture();
    },
    initControls() {
      controls = new FlyControls(camera, renderer.domElement);
      clock = new THREE.Clock();
      controls.movementSpeed = this.speed;
      controls.rollSpeed = Math.PI / 4;
      controls.dragToLook = true;
    },
    initGui() {
      var gui = new GUI();
      var params = new function() {
        this.speed = 100;
      }();
      gui.add(params, "speed", 1, 400).onChange(e => {
        controls.movementSpeed = (e * 120) / 400; //120 -- 403.49
        this.showSpeed = true;
        this.speedString = "当前速度: " + Math.round(e) + "倍光速";
        setTimeout(() => {
          this.showSpeed = false;
        }, 2000);
      });
    },
    initLight() {
      pointLight = new THREE.PointLight(0xffffff);
      pointLight.position.set(0, 0, 0);
      pointLight.intensity = 1;
      pointLight.distance = this.distance_ratio * 500000;
      scene.add(pointLight);
      ambientLight = new THREE.AmbientLight(0x333333);
      scene.add(ambientLight);
    },
    initTexture() {
      let loader = new THREE.TextureLoader(manager);
      taiyangT = loader.load("/static/images/texture/planets/sun.jpg");
      shuixingT = loader.load("/static/images/texture/planets/shuixing.jpg");
      jinxingT = loader.load("/static/images/texture/planets/jinxing.jpg");
      diqiuT = loader.load("/static/images/texture/planets/diqiu.jpg");
      huoxingT = loader.load("/static/images/texture/planets/huoxing.jpg");
      muxingT = loader.load("/static/images/texture/planets/muxing.jpg");
      tuxingT = loader.load("/static/images/texture/planets/tuxing.jpg");
      tianwangxingT = loader.load(
        "/static/images/texture/planets/tianwangxing.jpg"
      );
      haiwangxingT = loader.load(
        "/static/images/texture/planets/haiwangxing.jpg"
      );
      yueqiuT = loader.load("/static/images/texture/planets/yueqiu.jpg");
      asteriodsT = loader.load("/static/images/texture/planets/asteriod.jpg");
      tuxinghuanT = loader.load(
        "/static/images/texture/planets/tuxingring.png"
      );
    },
    initPlanet() {
      shuixing = this.createMesh(shuixingT, 0);
      jinxing = this.createMesh(jinxingT, 1);
      diqiu = this.createMesh(diqiuT, 2);
      huoxing = this.createMesh(huoxingT, 3);
      muxing = this.createMesh(muxingT, 4);
      tuxing = this.createMesh(tuxingT, 5);
      tianwangxing = this.createMesh(tianwangxingT, 6);
      haiwangxing = this.createMesh(haiwangxingT, 7);
      taiyang = this.createTaiyang();
      yueqiu = this.createYueqiu();
      tuxinghuan = this.createTuxinghuan();
      asteriods = this.createAsteriods();

      scene.add(shuixing);
      scene.add(jinxing);
      scene.add(diqiu);
      scene.add(huoxing);
      scene.add(muxing);
      scene.add(tuxing);
      scene.add(tianwangxing);
      scene.add(haiwangxing);
      scene.add(taiyang);
      scene.add(yueqiu);
      tuxing.add(tuxinghuan);
      scene.add(asteriods);

      this.initRings();
      this.initTween();
      // this.initControls();
      // this.initGui();
      this.show1 = true;

      this.render();
      document.getElementById("loading").style.display = "none";
    },
    initRings() {
      let material = new THREE.LineBasicMaterial({ color: 0xeeeeee });
      let geometry = new THREE.Geometry();
      let arc = new THREE.ArcCurve(
        0,
        0,
        this.moonObj.distance * this.distance_ratio
      );
      let points = arc.getPoints(1000);
      geometry.setFromPoints(points);
      let line = new THREE.Line(geometry, material);
      line.rotation.x = -Math.PI / 2;
      yueqiu.add(line);
      this.distances.forEach(d => {
        let geometry = new THREE.Geometry();
        let material = new THREE.LineBasicMaterial({ color: 0x999900 });
        let arc = new THREE.ArcCurve(0, 0, d * this.distance_ratio);
        let points = arc.getPoints(10000);
        geometry.setFromPoints(points);
        let line = new THREE.Line(geometry, material);
        line.rotation.x = -Math.PI / 2;
        scene.add(line);
      });
    },
    initTween() {
      let pos = { x: 0, y: 0, z: -96, lx: 0, ly: 0, lz: 0 };
      tween1 = new TWEEN.Tween(pos).to(
        { x: 57.91, y: 0, z: -5, lx: 57.91, ly: 0, lz: 0 },
        20 * this.animation_time
      );
      tween1.easing(TWEEN.Easing.Linear.None);
      tween2 = new TWEEN.Tween(pos).to(
        { x: 108.2, y: 0, z: -13, lx: 108.2, ly: 0, lz: 0 },
        22 * this.animation_time
      );
      tween2.easing(TWEEN.Easing.Linear.None);
      tween3 = new TWEEN.Tween(pos).to(
        { x: 149.6, y: 0, z: -14, lx: 149.6, ly: 0, lz: 0 },
        24 * this.animation_time
      );
      tween3.easing(TWEEN.Easing.Linear.None);
      tween4 = new TWEEN.Tween(pos).to(
        { x: 227.94, y: 0, z: -6, lx: 227.94, ly: 0, lz: 0 },
        27 * this.animation_time
      );
      tween4.easing(TWEEN.Easing.Linear.None);
      tween5 = new TWEEN.Tween(pos).to(
        { x: 436.5, y: 0, z: -6, lx: 436.5, ly: 0, lz: 0 },
        30 * this.animation_time
      );
      tween5.easing(TWEEN.Easing.Linear.None);
      tween6 = new TWEEN.Tween(pos).to(
        { x: 778.33, y: 0, z: -112, lx: 778.33, ly: 0, lz: 0 },
        34 * this.animation_time
      );
      tween6.easing(TWEEN.Easing.Linear.None);
      tween7 = new TWEEN.Tween(pos).to(
        { x: 1429.4, y: 0, z: -155, lx: 1429.4, ly: 0, lz: 0 },
        35 * this.animation_time
      );
      tween7.easing(TWEEN.Easing.Linear.None);
      tween8 = new TWEEN.Tween(pos).to(
        { x: 2871, y: 0, z: -46, lx: 2871, ly: 0, lz: 0 },
        36 * this.animation_time
      );
      tween8.easing(TWEEN.Easing.Linear.None);
      tween9 = new TWEEN.Tween(pos).to(
        { x: 4504, y: 0, z: -46, lx: 4504, ly: 0, lz: 0 },
        37 * this.animation_time
      );
      tween9.easing(TWEEN.Easing.Linear.None);
      tween10 = new TWEEN.Tween(pos).to(
        { x: -600, y: 452, z: 0, lx: 778.33, ly: 0, lz: 0 },
        38 * this.animation_time
      );
      tween10.easing(TWEEN.Easing.Linear.None);

      tween1
        .chain(tween2)
        .onUpdate(onUpdate)
        .delay(50 * this.animation_time)
        .onStart(() => (this.show1 = false))
        .onComplete(() => (this.show2 = true));
      tween2
        .chain(tween3)
        .onUpdate(onUpdate)
        .delay(50 * this.animation_time)
        .onStart(() => (this.show2 = false))
        .onComplete(() => (this.show3 = true));
      tween3
        .chain(tween4)
        .onUpdate(onUpdate)
        .delay(50 * this.animation_time)
        .onStart(() => (this.show3 = false))
        .onComplete(() => (this.show4 = true));
      tween4
        .chain(tween5)
        .onUpdate(onUpdate)
        .delay(50 * this.animation_time)
        .onStart(() => (this.show4 = false))
        .onComplete(() => (this.show5 = true));
      tween5
        .chain(tween6)
        .onUpdate(onUpdate)
        .delay(50 * this.animation_time)
        .onStart(() => (this.show5 = false))
        .onComplete(() => (this.show6 = true));
      tween6
        .chain(tween7)
        .onUpdate(onUpdate)
        .delay(50 * this.animation_time)
        .onStart(() => (this.show6 = false))
        .onComplete(() => (this.show7 = true));
      tween7
        .chain(tween8)
        .onUpdate(onUpdate)
        .delay(50 * this.animation_time)
        .onStart(() => (this.show7 = false))
        .onComplete(() => (this.show8 = true));
      tween8
        .chain(tween9)
        .onUpdate(onUpdate)
        .delay(50 * this.animation_time)
        .onStart(() => (this.show8 = false))
        .onComplete(() => (this.show9 = true));
      tween9
        .chain(tween10)
        .onUpdate(onUpdate)
        .delay(50 * this.animation_time)
        .onStart(() => (this.show9 = false))
        .onComplete(() => (this.show10 = true));
      tween10
        .onUpdate(onUpdate)
        .delay(50 * this.animation_time)
        .onStart(() => (this.show10 = false));

      tween1.start();

      tween10.onComplete(() => {
        this.pubRotateFlag = true;
        this.initControls();
        this.initGui();
        this.showSpeed = true;
        setTimeout(() => {
          this.showSpeed = false;
        }, 3000);
      });
    },
    createMesh(texture, index) {
      let sphere = new THREE.SphereGeometry(
        this.radiuses[index] * this.radius_ratio,
        60,
        30
      );
      let material = new THREE.MeshBasicMaterial({ map: texture });
      let mesh = new THREE.Mesh(sphere, material);
      mesh.position.x = this.distance_ratio * this.distances[index];
      return mesh;
    },
    createTaiyang() {
      let sphere = new THREE.SphereGeometry(
        this.sunObj.radius * this.radius_ratio,
        60,
        30
      );
      let material = new THREE.MeshBasicMaterial({ map: taiyangT });
      let mesh = new THREE.Mesh(sphere, material);
      mesh.add(this.createSunShine());
      return mesh;
    },
    createSunShine() {
      let canvas = document.createElement("canvas");
      canvas.width = 16;
      canvas.height = 16;
      let context = canvas.getContext("2d");
      let gradient = context.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width / 2
      );
      gradient.addColorStop(0, "rgba(255,164,33,1)");
      gradient.addColorStop(0.2, "rgba(255,164,33,1)");
      gradient.addColorStop(0.5, "rgba(255,164,33,.6)");
      gradient.addColorStop(1, "rgba(0,0,0,0)");
      context.fillStyle = gradient;
      context.fillRect(0, 0, canvas.width, canvas.height);
      let centerBallLite = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: new THREE.CanvasTexture(canvas),
          blending: THREE.AdditiveBlending
        })
      );
      centerBallLite.scale.x = centerBallLite.scale.y = centerBallLite.scale.z =
        this.sunObj.radius * 4 * this.radius_ratio;
      return centerBallLite;
    },
    createYueqiu() {
      let sphere = new THREE.SphereGeometry(
        this.moonObj.radius * this.radius_ratio,
        30,
        20
      );
      let material = new THREE.MeshBasicMaterial({ map: yueqiuT });
      let mesh = new THREE.Mesh(sphere, material);
      mesh.position.x = this.distance_ratio * this.moonObj.distance;
      let moon = new THREE.Object3D();
      moon.position.copy(diqiu.position);
      moon.add(mesh);
      return moon;
    },
    createTuxinghuan() {
      let ring = new THREE.RingGeometry(
        this.radiuses[5] * this.radius_ratio * 1.2,
        this.radiuses[5] * this.radius_ratio * 2,
        50,
        10,
        0,
        Math.PI * 2
      ); //this.radiuses[5] * this.radius_ratio * 2, this.radiuses[5] * this.radius_ratio * 1.2
      let material = new THREE.MeshLambertMaterial({
        emissive: 0xaa8766,
        transparent: false,
        opacity: 1,
        map: tuxinghuanT,
        side: THREE.DoubleSide
      });
      let mesh = new THREE.Mesh(ring, material);
      mesh.rotation.x = Math.PI / 2;
      return mesh;
    },
    createAsteriods() {
      let asteriod = new THREE.Geometry();
      let asteriodMate = new THREE.MeshBasicMaterial();
      for (let i = 0; i < 20000; i++) {
        let points = [];
        let rad = Math.random() * this.asteriodObj.radius * this.radius_ratio;
        for (let j = 0; j < 30; j++) {
          points.push(
            new THREE.Vector3(
              Math.random() * rad,
              Math.random() * rad,
              Math.random() * rad
            )
          );
        }
        let asteriodGeom = new ConvexGeometry(points);

        let asterMesh = new THREE.Mesh(asteriodGeom, asteriodMate);
        //2.17~3.64 * 14960  = 32450 ~ 54450
        // let dis = (Math.random() * 22000 + 32450) * this.distance_ratio;
        let dis = (Math.random() * 18000 + 34450) * this.distance_ratio;
        let angle = Math.random() * Math.PI * 2;
        asterMesh.position.x = dis * Math.sin(angle);
        asterMesh.position.y =
          Math.random() * this.asteriodObj.radius * this.radius_ratio * 4 -
          this.asteriodObj.radius * this.radius_ratio * 2;
        asterMesh.position.z = dis * Math.cos(angle);

        for (let k = 0; k < asterMesh.geometry.faces.length; k++) {
          asterMesh.geometry.faceVertexUvs[0][k] = [
            new THREE.Vector2(0, 0),
            new THREE.Vector2(0, 1),
            new THREE.Vector2(1, 1)
          ];
        }

        asterMesh.updateMatrix();
        asteriod.merge(asterMesh.geometry, asterMesh.matrix);
      }
      let mesh = new THREE.Mesh(
        asteriod,
        new THREE.MeshLambertMaterial({ map: asteriodsT, emissive: 0x484137 })
      );
      return mesh;
    },
    selfRotate() {
      shuixing.rotation.copy(
        new THREE.Euler(
          THREE.Math.degToRad(this.pitchs[0]),
          Math.sqrt(1 / this.self_rotation[0]) * this.self_ratio * this.timeS,
          0
        )
      );
      jinxing.rotation.copy(
        new THREE.Euler(
          THREE.Math.degToRad(this.pitchs[1]),
          Math.sqrt(1 / this.self_rotation[1]) * this.self_ratio * this.timeS,
          0
        )
      );
      diqiu.rotation.copy(
        new THREE.Euler(
          THREE.Math.degToRad(this.pitchs[2]),
          Math.sqrt(1 / this.self_rotation[2]) * this.self_ratio * this.timeS,
          0
        )
      );
      huoxing.rotation.copy(
        new THREE.Euler(
          THREE.Math.degToRad(this.pitchs[3]),
          Math.sqrt(1 / this.self_rotation[3]) * this.self_ratio * this.timeS,
          0
        )
      );
      muxing.rotation.copy(
        new THREE.Euler(
          THREE.Math.degToRad(this.pitchs[4]),
          Math.sqrt(1 / this.self_rotation[4]) * this.self_ratio * this.timeS,
          0
        )
      );
      tuxing.rotation.copy(
        new THREE.Euler(
          THREE.Math.degToRad(this.pitchs[5]),
          Math.sqrt(1 / this.self_rotation[5]) * this.self_ratio * this.timeS,
          0
        )
      );
      tianwangxing.rotation.copy(
        new THREE.Euler(
          0,
          Math.sqrt(1 / this.self_rotation[6]) * this.self_ratio * this.timeS,
          THREE.Math.degToRad(this.pitchs[6]),
          "ZYX"
        )
      );
      haiwangxing.rotation.copy(
        new THREE.Euler(
          THREE.Math.degToRad(this.pitchs[7]),
          Math.sqrt(1 / this.self_rotation[7]) * this.self_ratio * this.timeS,
          0
        )
      );
      // yueqiu.children[0].rotation.copy(new THREE.Euler(THREE.Math.degToRad(this.moonObj.pitchs), Math.sqrt(1 / this.moonObj.self_rotation) * this.self_ratio * this.timeS, 0));
      yueqiu.position.copy(diqiu.position);
      yueqiu.rotation.copy(
        new THREE.Euler(
          THREE.Math.degToRad(this.moonObj.pitchs),
          Math.sqrt(1 / this.moonObj.self_rotation) *
            this.self_ratio *
            this.timeS,
          0
        )
      );
      asteriods.rotation.copy(
        new THREE.Euler(
          0,
          (this.timeS * this.pub_ratio) / this.asteriodObj.pub_rotation / 2,
          0
        )
      );
    },
    pubRotate() {
      shuixing.position.set(
        Math.cos((this.timeP * this.pub_ratio) / this.pub_rotation[0]) *
          this.distance_ratio *
          this.distances[0],
        0,
        -Math.sin((this.timeP * this.pub_ratio) / this.pub_rotation[0]) *
          this.distance_ratio *
          this.distances[0]
      );
      jinxing.position.set(
        Math.cos((this.timeP * this.pub_ratio) / this.pub_rotation[1]) *
          this.distance_ratio *
          this.distances[1],
        0,
        -Math.sin((this.timeP * this.pub_ratio) / this.pub_rotation[1]) *
          this.distance_ratio *
          this.distances[1]
      );
      diqiu.position.set(
        Math.cos((this.timeP * this.pub_ratio) / this.pub_rotation[2]) *
          this.distance_ratio *
          this.distances[2],
        0,
        -Math.sin((this.timeP * this.pub_ratio) / this.pub_rotation[2]) *
          this.distance_ratio *
          this.distances[2]
      );
      huoxing.position.set(
        Math.cos((this.timeP * this.pub_ratio) / this.pub_rotation[3]) *
          this.distance_ratio *
          this.distances[3],
        0,
        -Math.sin((this.timeP * this.pub_ratio) / this.pub_rotation[3]) *
          this.distance_ratio *
          this.distances[3]
      );
      muxing.position.set(
        Math.cos((this.timeP * this.pub_ratio) / this.pub_rotation[4]) *
          this.distance_ratio *
          this.distances[4],
        0,
        -Math.sin((this.timeP * this.pub_ratio) / this.pub_rotation[4]) *
          this.distance_ratio *
          this.distances[4]
      );
      tuxing.position.set(
        Math.cos((this.timeP * this.pub_ratio) / this.pub_rotation[5]) *
          this.distance_ratio *
          this.distances[5],
        0,
        -Math.sin((this.timeP * this.pub_ratio) / this.pub_rotation[5]) *
          this.distance_ratio *
          this.distances[5]
      );
      tianwangxing.position.set(
        Math.cos((this.timeP * this.pub_ratio) / this.pub_rotation[6]) *
          this.distance_ratio *
          this.distances[6],
        0,
        -Math.sin((this.timeP * this.pub_ratio) / this.pub_rotation[6]) *
          this.distance_ratio *
          this.distances[6]
      );
      haiwangxing.position.set(
        Math.cos((this.timeP * this.pub_ratio) / this.pub_rotation[7]) *
          this.distance_ratio *
          this.distances[7],
        0,
        -Math.sin((this.timeP * this.pub_ratio) / this.pub_rotation[7]) *
          this.distance_ratio *
          this.distances[7]
      );
    },
    render() {
      this.timeS++;
      stats.update();
      if (controls) {
        controls.update(clock.getDelta());
      }
      this.selfRotate();
      if (this.pubRotateFlag) {
        this.timeP++;
        this.pubRotate();
      }
      TWEEN.update();
      renderer.render(scene, camera);
      this.globalID = requestAnimationFrame(this.render);
    }
  },
  mounted() {
    this.initThree();
    window.onresize = () => {
      camera.aspect = this.$refs.box.clientWidth / this.$refs.box.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(this.$refs.box.clientWidth, this.$refs.box.clientHeight);
    };
  },
  beforeDestroy() {
    renderer.forceContextLoss();
    renderer = null;
    scene = null;
    controls = null;
    clock = null;
    stats = null;
    renderer = null;
    camera = null;
    pointLight = null;
    ambientLight = null;
    tween1 = 0;
    tween2 = 0;
    tween3 = 0;
    tween4 = 0;
    tween5 = 0;
    tween6 = 0;
    tween7 = 0;
    tween8 = 0;
    tween9 = 0;
    tween10 = 0;
    manager = null;
    cancelAnimationFrame(this.globalID);
  }
};
</script>

<style lang="less" scope>
#box {
  position: relative;
  width: 100%;
  height: 100%;
  .tooltip {
    position: absolute;
    left: 50%;
    top: 100px;
    margin-left: -400px;
    width: 800px;
    height: 450px;
    background-color: rgba(0, 0, 0, 0.5);
    color: #eeeeee;
    border-radius: 30px;
    padding: 0 30px;
    box-sizing: border-box;
    .head {
      font-size: 26px;
      line-height: 50px;
      border-bottom: 1px solid #eeeeee;
      text-align: center;
    }
    .content {
      margin-top: 10px;
      text-indent: 2em;
      font-size: 16px;
      line-height: 30px;
    }
  }
  .speed {
    position: absolute;
    left: 50%;
    top: 30px;
    margin-left: -120px;
    width: 240px;
    height: 40px;
    line-height: 40px;
    background-color: rgba(0, 0, 0, 0.5);
    color: #eeeeee;
    border-radius: 10px;
    box-sizing: border-box;
    p {
      text-align: center;
    }
  }
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
