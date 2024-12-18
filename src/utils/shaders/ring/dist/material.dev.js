"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ringSpreadMaterial = ringSpreadMaterial;
exports.ringWheelMaterial = ringWheelMaterial;
exports.gridPulseMaterial = gridPulseMaterial;
exports.emphasizePulseMaterial = emphasizePulseMaterial;
exports.alternateCurtainPulseMaterial = alternateCurtainPulseMaterial;
exports.fogPulseMaterial = fogPulseMaterial;
exports.dropPulseMaterial = dropPulseMaterial;
exports.flowerPulseMaterial = flowerPulseMaterial;
exports.tornadoPulseMaterial = tornadoPulseMaterial;
exports.vortexPulseMaterial = vortexPulseMaterial;
exports.circleBreathPulseMaterial = circleBreathPulseMaterial;
exports.dotPulseMaterial = dotPulseMaterial;
exports.breathPulseMaterial = breathPulseMaterial;
exports.heartBeatPulseMaterial = heartBeatPulseMaterial;
exports.wavePulseMaterial = wavePulseMaterial;
exports.dotGatherPulseMaterial = dotGatherPulseMaterial;
exports.rotatePulseMaterial = rotatePulseMaterial;
exports.fogRingMaterial = fogRingMaterial;
exports.portalPoolMaterial = portalPoolMaterial;
exports.colorfulCircleMaterial = colorfulCircleMaterial;
exports.magicCircleMaterial = magicCircleMaterial;
exports.simpleFlowerMaterial = simpleFlowerMaterial;

var THREE = _interopRequireWildcard(require("three"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/**
 * 环状扩散 √
 * @param {Object} opts uniforms param
 */
function ringSpreadMaterial() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var uniforms = {
    color: {
      type: "c",
      value: new THREE.Color(opts.color || "#9999FF")
    },
    time: {
      type: "f",
      value: -1.5
    },
    type: {
      type: "f",
      value: opts.type || 0
    },
    num: {
      type: "f",
      value: opts.num || 4
    }
  };
  var material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    defaultAttributeValues: {},
    vertexShader: require("./vert/ring.vert")["default"],
    fragmentShader: require("./frag/ringSpread.frag")["default"],
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
 * 环状滚轮动画 √
 * @param {Object} opts uniforms param
 */


function ringWheelMaterial() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var uniforms = {
    iResolution: {
      type: "v3",
      value: new THREE.Vector3(1, 1, 1)
    },
    time: {
      type: "f",
      value: -1.5
    }
  };
  var material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    defaultAttributeValues: {},
    vertexShader: require("./vert/ring.vert")["default"],
    fragmentShader: require("./frag/ringWheel.frag")["default"],
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
 * 跳动的网格 √
 * @param {Object} opts uniforms param
 */


function gridPulseMaterial() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var uniforms = THREE.UniformsUtils.merge([THREE.UniformsLib.fog, {
    time: {
      type: "f",
      value: 0
    },
    color: {
      type: "c",
      value: new THREE.Color(opts.color || "#EDD464")
    },
    opacity: {
      type: "f",
      value: opts.opacity || 0.9
    }
  }]);
  var material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    defaultAttributeValues: {},
    vertexShader: require("./vert/ring.vert")["default"],
    fragmentShader: require("./frag/gridPulse.frag")["default"],
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
 * 强调突出显示 旋转动画 √
 * @param {Object} opts uniforms param
 */


function emphasizePulseMaterial() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var uniforms = THREE.UniformsUtils.merge([THREE.UniformsLib.fog, {
    time: {
      type: "f",
      value: 0
    },
    color: {
      type: "c",
      value: new THREE.Color(opts.color || "#EDD464")
    },
    opacity: {
      type: "f",
      value: opts.opacity || 0.9
    }
  }]);
  var material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    defaultAttributeValues: {},
    vertexShader: require("./vert/ring.vert")["default"],
    fragmentShader: require("./frag/emphasizePulse.frag")["default"],
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
 * 交替旋转轮盘动画
 * @param {Object} opts uniforms param
 */


function alternateCurtainPulseMaterial() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var uniforms = THREE.UniformsUtils.merge([THREE.UniformsLib.fog, {
    time: {
      type: "f",
      value: 0
    },
    color: {
      type: "c",
      value: new THREE.Color(opts.color || "#EDD464")
    },
    opacity: {
      type: "f",
      value: opts.opacity || 0.9
    }
  }]);
  var material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    defaultAttributeValues: {},
    vertexShader: require("./vert/ring.vert")["default"],
    fragmentShader: require("./frag/alternateCurtainPulse.frag")["default"],
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
 * 动画雾化 √
 * @param {Object} opts uniforms param
 */


function fogPulseMaterial() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var uniforms = THREE.UniformsUtils.merge([THREE.UniformsLib.fog, {
    time: {
      type: "f",
      value: 0
    },
    color: {
      type: "c",
      value: new THREE.Color(opts.color || "#EDD464")
    },
    opacity: {
      type: "f",
      value: opts.opacity || 0.9
    }
  }]);
  var material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    defaultAttributeValues: {},
    vertexShader: require("./vert/ring.vert")["default"],
    fragmentShader: require("./frag/fogPulse.frag")["default"],
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
 * 向四周放射效果动画 √
 * @param {Object} opts uniforms param
 */


function dropPulseMaterial() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var uniforms = THREE.UniformsUtils.merge([THREE.UniformsLib.fog, {
    time: {
      type: "f",
      value: 0
    },
    color: {
      type: "c",
      value: new THREE.Color(opts.color || "#EDD464")
    },
    opacity: {
      type: "f",
      value: opts.opacity || 0.9
    }
  }]);
  var material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    defaultAttributeValues: {},
    vertexShader: require("./vert/ring.vert")["default"],
    fragmentShader: require("./frag/dropPulse.frag")["default"],
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
 * "花朵"动画 √
 * @param {Object} opts uniforms param
 */


function flowerPulseMaterial() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var uniforms = THREE.UniformsUtils.merge([THREE.UniformsLib.fog, {
    time: {
      type: "f",
      value: 0
    },
    color: {
      type: "c",
      value: new THREE.Color(opts.color || "#EDD464")
    },
    opacity: {
      type: "f",
      value: opts.opacity || 0.9
    }
  }]);
  var material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    defaultAttributeValues: {},
    vertexShader: require("./vert/ring.vert")["default"],
    fragmentShader: require("./frag/flowerPulse.frag")["default"],
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
 * "龙卷风"动画 √
 * @param {Object} opts uniforms param
 */


function tornadoPulseMaterial() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var uniforms = THREE.UniformsUtils.merge([THREE.UniformsLib.fog, {
    time: {
      type: "f",
      value: 0
    },
    color: {
      type: "c",
      value: new THREE.Color(opts.color || "#EDD464")
    },
    opacity: {
      type: "f",
      value: opts.opacity || 0.9
    }
  }]);
  var material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    defaultAttributeValues: {},
    vertexShader: require("./vert/ring.vert")["default"],
    fragmentShader: require("./frag/tornadoPulse.frag")["default"],
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
 * "旋风"动画 √
 * @param {Object} opts uniforms param
 */


function vortexPulseMaterial() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var uniforms = THREE.UniformsUtils.merge([THREE.UniformsLib.fog, {
    time: {
      type: "f",
      value: 0
    },
    color: {
      type: "c",
      value: new THREE.Color(opts.color || "#EDD464")
    },
    opacity: {
      type: "f",
      value: opts.opacity || 0.9
    }
  }]);
  var material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    defaultAttributeValues: {},
    vertexShader: require("./vert/ring.vert")["default"],
    fragmentShader: require("./frag/vortexPulse.frag")["default"],
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
 * "呼吸光圈"动画 √
 * @param {Object} opts uniforms param
 */


function circleBreathPulseMaterial() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var uniforms = THREE.UniformsUtils.merge([THREE.UniformsLib.fog, {
    time: {
      type: "f",
      value: 0
    },
    color: {
      type: "c",
      value: new THREE.Color(opts.color || "#EDD464")
    },
    opacity: {
      type: "f",
      value: opts.opacity || 0.9
    }
  }]);
  var material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    defaultAttributeValues: {},
    vertexShader: require("./vert/ring.vert")["default"],
    fragmentShader: require("./frag/circleBreath.frag")["default"],
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
 * 扩散的圆圈光点动画 √
 * @param {Object} opts uniforms param
 */


function dotPulseMaterial() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var uniforms = THREE.UniformsUtils.merge([THREE.UniformsLib.fog, {
    time: {
      type: "f",
      value: 0
    },
    color: {
      type: "c",
      value: new THREE.Color(opts.color || "#EDD464")
    },
    opacity: {
      type: "f",
      value: opts.opacity || 0.9
    }
  }]);
  var material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    defaultAttributeValues: {},
    vertexShader: require("./vert/ring.vert")["default"],
    fragmentShader: require("./frag/dotPulse.frag")["default"],
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
 * 呼吸放大光圈 √
 * @param {Object} opts uniforms param
 */


function breathPulseMaterial() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var uniforms = THREE.UniformsUtils.merge([THREE.UniformsLib.fog, {
    time: {
      type: "f",
      value: 0
    },
    color: {
      type: "c",
      value: new THREE.Color(opts.color || "#EDD464")
    },
    opacity: {
      type: "f",
      value: opts.opacity || 0.9
    }
  }]);
  var material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    defaultAttributeValues: {},
    vertexShader: require("./vert/ring.vert")["default"],
    fragmentShader: require("./frag/breathPulse.frag")["default"],
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
 * 呼吸放大光点 √
 * @param {Object} opts uniforms param
 */


function heartBeatPulseMaterial() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var uniforms = THREE.UniformsUtils.merge([THREE.UniformsLib.fog, {
    time: {
      type: "f",
      value: 0
    },
    color: {
      type: "c",
      value: new THREE.Color(opts.color || "#EDD464")
    },
    opacity: {
      type: "f",
      value: opts.opacity || 1
    }
  }]);
  var material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    defaultAttributeValues: {},
    vertexShader: require("./vert/ring.vert")["default"],
    fragmentShader: require("./frag/heartBeatPulse.frag")["default"],
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
 * 波浪
 * @param {Object} opts uniforms param
 */


function wavePulseMaterial() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var uniforms = THREE.UniformsUtils.merge([THREE.UniformsLib.fog, {
    time: {
      type: "f",
      value: 0
    },
    color: {
      type: "c",
      value: new THREE.Color(opts.color || "#EDD464")
    },
    opacity: {
      type: "f",
      value: opts.opacity || 0.9
    }
  }]);
  var material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    defaultAttributeValues: {},
    vertexShader: require("./vert/ring.vert")["default"],
    fragmentShader: require("./frag/wavePulse.frag")["default"],
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
 * 光点向中心聚集 同 dotPulseMaterial 相反
 * @param {Object} opts uniforms param
 */


function dotGatherPulseMaterial() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var uniforms = THREE.UniformsUtils.merge([THREE.UniformsLib.fog, {
    time: {
      type: "f",
      value: 0
    },
    color: {
      type: "c",
      value: new THREE.Color(opts.color || "#EDD464")
    },
    opacity: {
      type: "f",
      value: opts.opacity || 0.9
    }
  }]);
  var material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    defaultAttributeValues: {},
    vertexShader: require("./vert/ring.vert")["default"],
    fragmentShader: require("./frag/dotGatherPulse.frag")["default"],
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
 * 旋转旋涡 √
 * @param {Object} opts uniforms param
 */


function rotatePulseMaterial() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var uniforms = THREE.UniformsUtils.merge([THREE.UniformsLib.fog, {
    time: {
      type: "f",
      value: 0
    },
    color: {
      type: "c",
      value: new THREE.Color(opts.color || "#EDD464")
    },
    opacity: {
      type: "f",
      value: opts.opacity || 0.9
    }
  }]);
  var material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    defaultAttributeValues: {},
    vertexShader: require("./vert/ring.vert")["default"],
    fragmentShader: require("./frag/rotatePulse.frag")["default"],
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
 * 带烟雾效果的光圈
 * @param {Object} opts uniforms param
 */


function fogRingMaterial() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var uniforms = {
    iResolution: {
      type: "v3",
      value: new THREE.Vector3(1, 1, 1)
    },
    time: {
      type: "f",
      value: -1.5
    }
  };
  var material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    defaultAttributeValues: {},
    vertexShader: require("./vert/ring.vert")["default"],
    fragmentShader: require("./frag/fogRing.frag")["default"],
    blending: THREE.AdditiveBlending,
    transparent: !0,
    depthWrite: !1,
    depthTest: !0,
    side: THREE.DoubleSide,
    fog: !0
  });
  return material;
}

function portalPoolMaterial() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var uniforms = {
    color: {
      type: "c",
      value: new THREE.Color(opts.color || "#9999FF")
    },
    ringNum: {
      type: "f",
      value: opts.num || 20
    },
    time: {
      type: "f",
      value: -1.5
    }
  };
  var material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    defaultAttributeValues: {},
    vertexShader: require("./vert/ring.vert")["default"],
    fragmentShader: require("./frag/portalPool.frag")["default"],
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
 * 五彩光圈
 * @param {Object} opts uniforms param
 */


function colorfulCircleMaterial() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var uniforms = {
    iResolution: {
      type: "v3",
      value: new THREE.Vector3(1, 1, 1)
    },
    time: {
      type: "f",
      value: -1.5
    }
  };
  var material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    defaultAttributeValues: {},
    vertexShader: require("./vert/ring.vert")["default"],
    fragmentShader: require("./frag/colorfulCircle.frag")["default"],
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
 * "魔法光圈"
 * @param {Object} opts uniforms param
 */


function magicCircleMaterial() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var uniforms = {
    iResolution: {
      type: "v3",
      value: new THREE.Vector3(1, 1, 1)
    },
    color: {
      type: "c",
      value: new THREE.Color(opts.color || "#EDD464")
    },
    time: {
      type: "f",
      value: 0
    }
  };
  var material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    defaultAttributeValues: {},
    vertexShader: require("./vert/ring.vert")["default"],
    fragmentShader: require("./frag/magicCircle.frag")["default"],
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
 * "魔法光圈"
 * @param {Object} opts uniforms param
 */


function simpleFlowerMaterial() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var uniforms = {
    iResolution: {
      type: "v3",
      value: new THREE.Vector3(1, 1, 1)
    },
    color: {
      type: "c",
      value: new THREE.Color(opts.color || "#EDD464")
    },
    time: {
      type: "f",
      value: 0
    }
  };
  var material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    defaultAttributeValues: {},
    vertexShader: require("./vert/ring.vert")["default"],
    fragmentShader: require("./frag/simpleFlower.frag")["default"],
    blending: THREE.AdditiveBlending,
    transparent: !0,
    depthWrite: !1,
    depthTest: !0,
    side: THREE.DoubleSide,
    fog: !0
  });
  return material;
}