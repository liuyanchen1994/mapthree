"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.radarOneMaterial = radarOneMaterial;
exports.radarTwoMaterial = radarTwoMaterial;
exports.radarThreeMaterial = radarThreeMaterial;
exports.radarFourMaterial = radarFourMaterial;
exports.radarFiveMaterial = radarFiveMaterial;
exports.flabellumScanMaterial = flabellumScanMaterial;

var THREE = _interopRequireWildcard(require("three"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/**
 * 结合THREE.RingBufferGeometry使用--插件ringEffect
 */

/**
 * 雷达扫描-I
 * @param {Object} opts uniforms param
 */
function radarOneMaterial() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var image = require("../texture/noise.png");

  var uniforms = {
    time: {
      type: "f",
      value: 0
    },
    iResolution: {
      type: "v3",
      value: new THREE.Vector3(1, 1, 1)
    },
    iChannel0: {
      type: "t",
      value: new THREE.TextureLoader().load(image)
    }
  };
  var material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    defaultAttributeValues: {},
    vertexShader: require("./vert/common.vert")["default"],
    // fragmentShader: require("../test/nightCity.frag").default,
    fragmentShader: require("./frag/radarOne.frag")["default"],
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


function radarTwoMaterial() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var uniforms = {
    time: {
      type: "f",
      value: 0
    },
    type: {
      // 0 大扇形 1小扇形 2 环绕
      type: "f",
      value: opts.type || 1
    },
    color: {
      type: "c",
      value: new THREE.Color(opts.color || 0x00ffff)
    }
  };
  var material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    defaultAttributeValues: {},
    vertexShader: require("./vert/radar.vert")["default"],
    fragmentShader: require("./frag/radarTwo.frag")["default"],
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


function radarThreeMaterial() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var uniforms = {
    time: {
      type: "f",
      value: 0
    },
    iResolution: {
      type: "v3",
      value: new THREE.Vector3(1, 1, 1)
    }
  };
  var material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    defaultAttributeValues: {},
    vertexShader: require("./vert/common.vert")["default"],
    fragmentShader: require("./frag/radarThree.frag")["default"],
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


function radarFourMaterial() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var uniforms = {
    time: {
      type: "f",
      value: 0
    },
    iResolution: {
      type: "v3",
      value: new THREE.Vector3(1, 1, 1)
    },
    iChannel0: {
      type: "t",
      value: new THREE.TextureLoader().load(opts.image)
    }
  };
  var material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    defaultAttributeValues: {},
    vertexShader: require("./vert/common.vert")["default"],
    fragmentShader: require("./frag/radarFour.frag")["default"],
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


function radarFiveMaterial() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var uniforms = {
    time: {
      type: "f",
      value: 0
    },
    iResolution: {
      type: "v3",
      value: new THREE.Vector3(1, 1, 1)
    }
  };
  var material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    defaultAttributeValues: {},
    vertexShader: require("./vert/common.vert")["default"],
    fragmentShader: require("./frag/radarFive.frag")["default"],
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


function flabellumScanMaterial() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var uniforms = {
    time: {
      type: "f",
      value: 0
    },
    color: {
      type: "c",
      value: new THREE.Color(opts.color || "#ff0000")
    },
    opacity: {
      type: "f",
      value: opts.opacity || 1
    }
  };
  var material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: require("./vert/flabellumScan.vert")["default"],
    fragmentShader: require("./frag/flabellumScan.frag")["default"],
    blending: THREE.AdditiveBlending,
    transparent: !0,
    depthWrite: !1,
    depthTest: !0,
    side: THREE.DoubleSide
  });
  return material;
}