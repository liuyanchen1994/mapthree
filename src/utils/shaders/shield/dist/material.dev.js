"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.rippleShieldMaterial = rippleShieldMaterial;
exports.textureShieldMaterial = textureShieldMaterial;
exports.composedShieldMaterial = composedShieldMaterial;
exports.electricShieldMaterial = electricShieldMaterial;
exports.alarmShieldMaterial = alarmShieldMaterial;
exports.fbmShieldMaterial = fbmShieldMaterial;
exports.electricRippleShieldMaterial = electricRippleShieldMaterial;
exports.starSkyMaterial = starSkyMaterial;
exports.SequenceShieldMaterial = SequenceShieldMaterial;

var THREE = _interopRequireWildcard(require("three"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/**
 * "波纹" 防护罩
 * @param {Object} opts uniforms param 着色器变量传参
 */
function rippleShieldMaterial() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var uniforms = {
    time: {
      type: "f",
      value: 0
    },
    color: {
      type: "c",
      value: new THREE.Color(opts.color || "#99CCFF")
    },
    opacity: {
      type: "f",
      value: opts.opacity || 0.7
    },
    num: {
      type: "f",
      value: opts.num || 1
    }
  };
  var material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    defaultAttributeValues: {},
    vertexShader: require("./vert/shield.vert")["default"],
    fragmentShader: require("./frag/rippleShield.frag")["default"],
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
 * 多边形 防护罩--贴图
 * @param {Object} opts uniforms param 着色器变量传参
 */


function textureShieldMaterial() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var uniforms = {
    scale: {
      type: "f",
      value: -1.0
    },
    bias: {
      type: "f",
      value: 1.0
    },
    power: {
      type: "f",
      value: 3.3
    },
    glowColor: {
      type: "c",
      value: new THREE.Color(opts.color || "#fff")
    },
    textureMap: {
      value: opts.texture || null
    },
    repeat: {
      type: "v2",
      value: new THREE.Vector2(50.0, 50.0)
    },
    time: {
      value: 0.0
    }
  };
  var material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    defaultAttributeValues: {},
    vertexShader: require("./vert/polygonShield.vert")["default"],
    fragmentShader: require("./frag/polygonShield.frag")["default"],
    // blending: THREE.AdditiveBlending,
    transparent: !0,
    depthWrite: !1,
    depthTest: !0,
    side: THREE.DoubleSide,
    fog: !0
  });
  return material;
}
/**
 * "流光" 防护罩
 * @param {Object} opts uniforms param 着色器变量传参
 */


function composedShieldMaterial() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var uniforms = {
    time: {
      type: "f",
      glslType: "float",
      value: 0
    },
    baseColor: {
      value: new THREE.Color(opts.baseColor || "#000"),
      // value: new THREE.Color(opts.baseColor || "#000"),
      type: "c",
      glslType: "vec3"
    },
    scale: {
      value: opts.scale || "5.31611692",
      type: "f",
      glslType: "float"
    },
    Star_Swamp_3D_version_1481150076458_107_brightness: {
      value: "2.5",
      type: "f",
      glslType: "float"
    },
    cameraPosition: {
      type: "v3",
      glslType: "vec3"
    },
    backgroundColor: {
      value: new THREE.Color(opts.backgroundColor || "#000"),
      type: "c",
      glslType: "vec3"
    },
    Tiling_Caustic1481150103620_119_brightness: {
      value: "1.5",
      type: "f",
      glslType: "float"
    },
    Tiling_Caustic1481150103620_119_resolution: {
      value: {
        x: "1",
        y: 1
      },
      type: "v2",
      glslType: "vec2"
    },
    Tiling_Caustic1481150103620_119_color: {
      //流光颜色
      value: new THREE.Color(opts.flowLightColor || "#fff"),
      type: "c",
      glslType: "vec3"
    },
    Tiling_Caustic1481150103620_119_speed: {
      value: "0.5",
      type: "f",
      glslType: "float"
    },
    image: {
      value: null,
      type: "t",
      glslType: "sampler2D"
    },
    Caustic_Image_Based1487582497347_66_speed: {
      value: "0.2",
      type: "f",
      glslType: "float"
    },
    Caustic_Image_Based1487582497347_66_resolution: {
      value: "1",
      type: "f",
      glslType: "float"
    },
    Caustic_Image_Based1487582497347_66_color: {
      value: {
        r: 1,
        g: 1,
        b: 1
      },
      type: "c",
      glslType: "vec3"
    },
    Caustic_Image_Based1487582497347_66_brightness: {
      value: "1",
      type: "f",
      glslType: "float"
    }
  };
  var material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    defaultAttributeValues: {},
    vertexShader: require("./vert/composedShield.vert")["default"],
    fragmentShader: require("./frag/composedShield.frag")["default"],
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
 * "电流" 防护罩
 * @param {Object} opts uniforms param 着色器变量传参
 */


function electricShieldMaterial() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var uniforms = {
    time: {
      type: "f",
      value: 1
    },
    color: {
      type: "c",
      value: new THREE.Color(opts.color || "#9999FF")
    },
    opacity: {
      type: "f",
      value: opts.opacity || 1
    }
  };
  var material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    defaultAttributeValues: {},
    vertexShader: require("./vert/shield.vert")["default"],
    fragmentShader: require("./frag/electricShield.frag")["default"],
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
 * "警报" 防护罩
 * @param {Object} opts uniforms param 着色器变量传参
 */


function alarmShieldMaterial() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var uniforms = {
    time: {
      type: "f",
      value: 1
    },
    opacity: {
      type: "f",
      value: opts.opacity || 1
    }
  };
  var material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    defaultAttributeValues: {},
    vertexShader: require("./vert/shield.vert")["default"],
    fragmentShader: require("./frag/alarmShield.frag")["default"],
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
 * "" 防护罩
 * @param {Object} opts uniforms param 着色器变量传参
 */


function fbmShieldMaterial() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var uniforms = {
    time: {
      type: "f",
      value: 1
    },
    color: {
      type: "c",
      value: new THREE.Color(opts.color || "#9999FF")
    },
    opacity: {
      type: "f",
      value: opts.opacity || 1
    },
    noise_map: {
      type: "t",
      value: opts.texture
    }
  };
  var material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    defaultAttributeValues: {},
    vertexShader: require("./vert/shield.vert")["default"],
    fragmentShader: require("./frag/fbmShield.frag")["default"],
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
 * "电流波纹" 防护罩
 * @param {Object} opts uniforms param 着色器变量传参
 */


function electricRippleShieldMaterial() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var uniforms = {
    time: {
      type: "f",
      value: 1
    },
    color: {
      type: "c",
      value: new THREE.Color(opts.color || "#9999FF")
    },
    opacity: {
      type: "f",
      value: opts.opacity || 1
    },
    num: {
      type: "f",
      value: opts.num || 1
    }
  };
  var material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    defaultAttributeValues: {},
    vertexShader: require("./vert/shield.vert")["default"],
    fragmentShader: require("./frag/electricRippleShield.frag")["default"],
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
 * "星空" 防护罩
 * @param {Object} opts uniforms param 着色器变量传参
 */


function starSkyMaterial() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var uniforms = {
    color: {
      name: "color",
      displayName: null,
      type: "c",
      value: {
        r: 1,
        g: 1,
        b: 1
      },
      glslType: "vec3",
      useGridHelper: false,
      useRange: false,
      range: null,
      isRandom: false,
      randomRange: null,
      useToggle: false,
      toggle: null,
      description: ""
    },
    time: {
      name: "time",
      displayName: null,
      type: "f",
      value: 0.01,
      glslType: "float",
      useGridHelper: false,
      useRange: false,
      range: null,
      isRandom: false,
      randomRange: null,
      useToggle: false,
      toggle: null,
      description: ""
    },
    speed: {
      name: "speed",
      displayName: null,
      type: "f",
      value: 0.0001,
      glslType: "float",
      useGridHelper: false,
      useRange: false,
      range: null,
      isRandom: false,
      randomRange: null,
      useToggle: false,
      toggle: null,
      description: ""
    },
    brightness: {
      name: "brightness",
      displayName: null,
      type: "f",
      value: 0.001,
      glslType: "float",
      useGridHelper: false,
      useRange: false,
      range: null,
      isRandom: false,
      randomRange: null,
      useToggle: false,
      toggle: null,
      description: ""
    },
    distfading: {
      name: "distfading",
      displayName: null,
      type: "f",
      value: 0.9,
      glslType: "float",
      useGridHelper: false,
      useRange: false,
      range: null,
      isRandom: false,
      randomRange: null,
      useToggle: false,
      toggle: null,
      description: ""
    },
    twinkleSpeed: {
      name: "twinkleSpeed",
      displayName: null,
      type: "f",
      value: 2,
      glslType: "float",
      useGridHelper: false,
      useRange: false,
      range: null,
      isRandom: false,
      randomRange: null,
      useToggle: false,
      toggle: null,
      description: ""
    }
  };
  var material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    defaultAttributeValues: {},
    vertexShader: require("./vert/starSky.vert")["default"],
    fragmentShader: require("./frag/starSky.frag")["default"],
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
 *
 * @param {Object} opts uniforms param 着色器变量传参
 */


function SequenceShieldMaterial() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var uniforms = {
    time: {
      type: "f",
      value: 1
    },
    noise_map: {
      type: "t",
      value: opts.texture
    },
    iResolution: {
      type: "v3",
      value: new THREE.Vector3(1, 1, 1)
    }
  };
  var material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    defaultAttributeValues: {},
    vertexShader: require("./vert/shield.vert")["default"],
    fragmentShader: require("./frag/Sequence.frag")["default"],
    blending: THREE.AdditiveBlending,
    transparent: !0,
    depthWrite: !1,
    depthTest: !0,
    side: THREE.DoubleSide,
    fog: !0
  });
  return material;
}