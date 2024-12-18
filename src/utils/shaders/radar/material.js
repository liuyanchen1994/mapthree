import * as THREE from "three";

/**
 * 结合THREE.RingBufferGeometry使用--插件ringEffect
 */

/**
 * 雷达扫描-I
 * @param {Object} opts uniforms param
 */
export function radarOneMaterial(opts = {}) {
  let image = require("../texture/noise.png");
  let uniforms = {
    time: { type: "f", value: 0 },
    iResolution: { type: "v3", value: new THREE.Vector3(1, 1, 1) },
    iChannel0: { type: "t", value: new THREE.TextureLoader().load(image) }
  };
  let material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    defaultAttributeValues: {},
    vertexShader: require("./vert/common.vert").default,
    // fragmentShader: require("../test/nightCity.frag").default,
    fragmentShader: require("./frag/radarOne.frag").default,
    blending: THREE.NoBlending,
    transparent: !0,
    depthWrite: !1,
    depthTest: !0,
    side: THREE.DoubleSide,
    fog: !0
  });
  return material;
}
/**
 * 雷达扫描-II
 * @param {Object} opts uniforms param 着色器变量传参(opts.type--0: 大扇形 1:小扇形 2:环绕扫描)
 */
export function radarTwoMaterial(opts = {}) {
  let uniforms = {
    time: { type: "f", value: 0 },
    type: {
      // 0 大扇形 1小扇形 2 环绕
      type: "f",
      value: opts.type || 1
    },
    color: { type: "c", value: new THREE.Color(opts.color || 0x00ffff) }
  };
  let material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    defaultAttributeValues: {},
    vertexShader: require("./vert/radar.vert").default,
    fragmentShader: require("./frag/radarTwo.frag").default,
    blending: THREE.AdditiveBlending,
    transparent: !0,
    depthWrite: !1,
    depthTest: !0,
    side: THREE.DoubleSide,
    fog: !0
  });
  return material;
}
/**
 * 雷达扫描-III
 * @param {Object} opts uniforms param
 */
export function radarThreeMaterial(opts = {}) {
  let uniforms = {
    time: { type: "f", value: 0 },
    iResolution: { type: "v3", value: new THREE.Vector3(1, 1, 1) }
  };
  let material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    defaultAttributeValues: {},
    vertexShader: require("./vert/common.vert").default,
    fragmentShader: require("./frag/radarThree.frag").default,
    blending: THREE.NoBlending,
    transparent: !0,
    depthWrite: !1,
    depthTest: !0,
    side: THREE.DoubleSide,
    fog: !0
  });
  return material;
}
/**
 * 雷达扫描-IV
 * @param {Object} opts uniforms param
 */
export function radarFourMaterial(opts = {}) {
  let uniforms = {
    time: { type: "f", value: 0 },
    iResolution: { type: "v3", value: new THREE.Vector3(1, 1, 1) },
    iChannel0: { type: "t", value: new THREE.TextureLoader().load(opts.image) }
  };
  let material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    defaultAttributeValues: {},
    vertexShader: require("./vert/common.vert").default,
    fragmentShader: require("./frag/radarFour.frag").default,
    blending: THREE.NoBlending,
    transparent: !0,
    depthWrite: !1,
    depthTest: !0,
    side: THREE.DoubleSide,
    fog: !0
  });
  return material;
}

/**
 * 雷达扫描-V
 * @param {Object} opts uniforms param
 */
export function radarFiveMaterial(opts = {}) {
  let uniforms = {
    time: { type: "f", value: 0 },
    iResolution: { type: "v3", value: new THREE.Vector3(1, 1, 1) }
  };
  let material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    defaultAttributeValues: {},
    vertexShader: require("./vert/common.vert").default,
    fragmentShader: require("./frag/radarFive.frag").default,
    blending: THREE.NoBlending,
    transparent: !0,
    depthWrite: !0,
    depthTest: !0,
    side: THREE.DoubleSide,
    fog: !0
  });
  return material;
}
/**
 * 扇形"线性"雷达扫描
 * @param {Object} opts uniforms param 着色器变量传参
 */
export function flabellumScanMaterial(opts = {}) {
  let uniforms = {
    time: { type: "f", value: 0 },
    color: { type: "c", value: new THREE.Color(opts.color || "#ff0000") },
    opacity: { type: "f", value: opts.opacity || 1 }
  };
  let material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: require("./vert/flabellumScan.vert").default,
    fragmentShader: require("./frag/flabellumScan.frag").default,
    blending: THREE.AdditiveBlending,
    transparent: !0,
    depthWrite: !1,
    depthTest: !0,
    side: THREE.DoubleSide
  });
  return material;
}
