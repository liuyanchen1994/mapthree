import * as THREE from "three";
/**
 * 环状扩散 √
 * @param {Object} opts uniforms param
 */
export function ringSpreadMaterial(opts = {}) {
  let uniforms = {
    color: { type: "c", value: new THREE.Color(opts.color || "#9999FF") },
    time: { type: "f", value: -1.5 },
    type: { type: "f", value: opts.type || 0 },
    num: { type: "f", value: opts.num || 4 }
  };
  let material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    defaultAttributeValues: {},
    vertexShader: require("./vert/ring.vert").default,
    fragmentShader: require("./frag/ringSpread.frag").default,
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
export function ringWheelMaterial(opts = {}) {
  let uniforms = {
    iResolution: { type: "v3", value: new THREE.Vector3(1, 1, 1) },
    time: { type: "f", value: -1.5 }
  };
  let material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    defaultAttributeValues: {},
    vertexShader: require("./vert/ring.vert").default,
    fragmentShader: require("./frag/ringWheel.frag").default,
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
export function gridPulseMaterial(opts = {}) {
  let uniforms = THREE.UniformsUtils.merge([
    THREE.UniformsLib.fog,
    {
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
    }
  ]);
  let material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    defaultAttributeValues: {},
    vertexShader: require("./vert/ring.vert").default,
    fragmentShader: require("./frag/gridPulse.frag").default,
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
export function emphasizePulseMaterial(opts = {}) {
  let uniforms = THREE.UniformsUtils.merge([
    THREE.UniformsLib.fog,
    {
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
    }
  ]);
  let material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    defaultAttributeValues: {},
    vertexShader: require("./vert/ring.vert").default,
    fragmentShader: require("./frag/emphasizePulse.frag").default,
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
export function alternateCurtainPulseMaterial(opts = {}) {
  let uniforms = THREE.UniformsUtils.merge([
    THREE.UniformsLib.fog,
    {
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
    }
  ]);
  let material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    defaultAttributeValues: {},
    vertexShader: require("./vert/ring.vert").default,
    fragmentShader: require("./frag/alternateCurtainPulse.frag").default,
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
export function fogPulseMaterial(opts = {}) {
  let uniforms = THREE.UniformsUtils.merge([
    THREE.UniformsLib.fog,
    {
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
    }
  ]);
  let material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    defaultAttributeValues: {},
    vertexShader: require("./vert/ring.vert").default,
    fragmentShader: require("./frag/fogPulse.frag").default,
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
export function dropPulseMaterial(opts = {}) {
  let uniforms = THREE.UniformsUtils.merge([
    THREE.UniformsLib.fog,
    {
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
    }
  ]);
  let material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    defaultAttributeValues: {},
    vertexShader: require("./vert/ring.vert").default,
    fragmentShader: require("./frag/dropPulse.frag").default,
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
export function flowerPulseMaterial(opts = {}) {
  let uniforms = THREE.UniformsUtils.merge([
    THREE.UniformsLib.fog,
    {
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
    }
  ]);
  let material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    defaultAttributeValues: {},
    vertexShader: require("./vert/ring.vert").default,
    fragmentShader: require("./frag/flowerPulse.frag").default,
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
export function tornadoPulseMaterial(opts = {}) {
  let uniforms = THREE.UniformsUtils.merge([
    THREE.UniformsLib.fog,
    {
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
    }
  ]);
  let material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    defaultAttributeValues: {},
    vertexShader: require("./vert/ring.vert").default,
    fragmentShader: require("./frag/tornadoPulse.frag").default,
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
export function vortexPulseMaterial(opts = {}) {
  let uniforms = THREE.UniformsUtils.merge([
    THREE.UniformsLib.fog,
    {
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
    }
  ]);
  let material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    defaultAttributeValues: {},
    vertexShader: require("./vert/ring.vert").default,
    fragmentShader: require("./frag/vortexPulse.frag").default,
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
export function circleBreathPulseMaterial(opts = {}) {
  let uniforms = THREE.UniformsUtils.merge([
    THREE.UniformsLib.fog,
    {
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
    }
  ]);
  let material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    defaultAttributeValues: {},
    vertexShader: require("./vert/ring.vert").default,
    fragmentShader: require("./frag/circleBreath.frag").default,
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
export function dotPulseMaterial(opts = {}) {
  let uniforms = THREE.UniformsUtils.merge([
    THREE.UniformsLib.fog,
    {
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
    }
  ]);
  let material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    defaultAttributeValues: {},
    vertexShader: require("./vert/ring.vert").default,
    fragmentShader: require("./frag/dotPulse.frag").default,
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
export function breathPulseMaterial(opts = {}) {
  let uniforms = THREE.UniformsUtils.merge([
    THREE.UniformsLib.fog,
    {
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
    }
  ]);
  let material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    defaultAttributeValues: {},
    vertexShader: require("./vert/ring.vert").default,
    fragmentShader: require("./frag/breathPulse.frag").default,
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
export function heartBeatPulseMaterial(opts = {}) {
  let uniforms = THREE.UniformsUtils.merge([
    THREE.UniformsLib.fog,
    {
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
    }
  ]);
  let material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    defaultAttributeValues: {},
    vertexShader: require("./vert/ring.vert").default,
    fragmentShader: require("./frag/heartBeatPulse.frag").default,
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
export function wavePulseMaterial(opts = {}) {
  let uniforms = THREE.UniformsUtils.merge([
    THREE.UniformsLib.fog,
    {
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
    }
  ]);
  let material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    defaultAttributeValues: {},
    vertexShader: require("./vert/ring.vert").default,
    fragmentShader: require("./frag/wavePulse.frag").default,
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
export function dotGatherPulseMaterial(opts = {}) {
  let uniforms = THREE.UniformsUtils.merge([
    THREE.UniformsLib.fog,
    {
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
    }
  ]);
  let material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    defaultAttributeValues: {},
    vertexShader: require("./vert/ring.vert").default,
    fragmentShader: require("./frag/dotGatherPulse.frag").default,
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
export function rotatePulseMaterial(opts = {}) {
  let uniforms = THREE.UniformsUtils.merge([
    THREE.UniformsLib.fog,
    {
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
    }
  ]);
  let material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    defaultAttributeValues: {},
    vertexShader: require("./vert/ring.vert").default,
    fragmentShader: require("./frag/rotatePulse.frag").default,
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
export function fogRingMaterial(opts = {}) {
  let uniforms = {
    iResolution: { type: "v3", value: new THREE.Vector3(1, 1, 1) },
    time: { type: "f", value: -1.5 }
  };
  let material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    defaultAttributeValues: {},
    vertexShader: require("./vert/ring.vert").default,
    fragmentShader: require("./frag/fogRing.frag").default,
    blending: THREE.AdditiveBlending,
    transparent: !0,
    depthWrite: !1,
    depthTest: !0,
    side: THREE.DoubleSide,
    fog: !0
  });
  return material;
}
export function portalPoolMaterial(opts = {}) {
  let uniforms = {
    color: { type: "c", value: new THREE.Color(opts.color || "#9999FF") },
    ringNum: { type: "f", value: opts.num || 20 },
    time: { type: "f", value: -1.5 }
  };
  let material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    defaultAttributeValues: {},
    vertexShader: require("./vert/ring.vert").default,
    fragmentShader: require("./frag/portalPool.frag").default,
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
export function colorfulCircleMaterial(opts = {}) {
  let uniforms = {
    iResolution: { type: "v3", value: new THREE.Vector3(1, 1, 1) },
    time: { type: "f", value: -1.5 }
  };
  let material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    defaultAttributeValues: {},
    vertexShader: require("./vert/ring.vert").default,
    fragmentShader: require("./frag/colorfulCircle.frag").default,
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
export function magicCircleMaterial(opts = {}) {
  let uniforms = {
    iResolution: { type: "v3", value: new THREE.Vector3(1, 1, 1) },
    color: { type: "c", value: new THREE.Color(opts.color || "#EDD464") },
    time: { type: "f", value: 0 }
  };
  let material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    defaultAttributeValues: {},
    vertexShader: require("./vert/ring.vert").default,
    fragmentShader: require("./frag/magicCircle.frag").default,
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
export function simpleFlowerMaterial(opts = {}) {
  let uniforms = {
    iResolution: { type: "v3", value: new THREE.Vector3(1, 1, 1) },
    color: { type: "c", value: new THREE.Color(opts.color || "#EDD464") },
    time: { type: "f", value: 0 }
  };
  let material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    defaultAttributeValues: {},
    vertexShader: require("./vert/ring.vert").default,
    fragmentShader: require("./frag/simpleFlower.frag").default,
    blending: THREE.AdditiveBlending,
    transparent: !0,
    depthWrite: !1,
    depthTest: !0,
    side: THREE.DoubleSide,
    fog: !0
  });
  return material;
}
