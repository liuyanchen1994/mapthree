import * as THREE from "three";

export function meshPhoneMaterial(opts = {}) {
  let material = new THREE.MeshPhongMaterial({
    transparent: opts.transparent || true,
    opacity: opts.opacity || 1,
    color: opts.color || "#001138"
  });
  material.vertexColors = THREE.VertexColors;
  return material;
}
export function meshBasicMaterial(opts = {}) {
  let material = new THREE.MeshBasicMaterial({
    transparent: opts.transparent || true,
    opacity: opts.opacity || 1,
    color: opts.color || "#001138"
  });
  material.vertexColors = THREE.VertexColors;
  return material;
}
/**
 * 呼吸渐变墙着色器材质
 * @param {Object} opts uniforms param 着色器变量传参
 */
export function breathWallMaterial(opts = {}) {
  let uniforms = {
    time: { type: "f", value: 1 },
    color: { type: "c", value: new THREE.Color(opts.color || "#0099FF") },
    opacity: { type: "f", value: opts.opacity || 0.7 }
  };
  let material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    defaultAttributeValues: {},
    vertexShader: require("./vert/wall.vert").default,
    fragmentShader: require("./frag/breathWall.frag").default,
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
 * 波纹-着色器材质
 * @param {Object} opts uniforms param 着色器变量传参
 */
export function rippleWallMaterial(opts = {}) {
  let uniforms = {
    time: { type: "f", value: 0 },
    color: { type: "c", value: new THREE.Color(opts.color || "#0099FF") },
    opacity: { type: "f", value: opts.opacity || 1 },
    num: { type: "f", value: opts.num || 5 },
    hiz: { type: "f", value: 0.3 }
  };

  let material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    defaultAttributeValues: {},
    vertexShader: require("./vert/wall.vert").default,
    fragmentShader: require("./frag/rippleWall.frag").default,
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
 * 流星/粒子-着色器材质
 * @param {Object} opts uniforms param 着色器变量传参
 */
export function meteorWallMaterial(opts = {}) {
  let uniforms = {
    time: {
      type: "f",
      value: 0
    },
    color: { type: "c", value: new THREE.Color(opts.color || "#EDD464") },
    opacity: { type: "f", value: opts.opacity || 0.9 }
  };

  let material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    defaultAttributeValues: {},
    vertexShader: require("./vert/wall.vert").default,
    fragmentShader: require("./frag/meteorWall.frag").default,
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
 * "漂浮物"-着色器材质
 * @param {Object} opts uniforms param 着色器变量传参
 */
export function floaterWallMaterial(opts = {}) {
  let uniforms = {
    time: { type: "f", value: 0 },
    color: { type: "c", value: new THREE.Color(opts.color || "#0099FF") },
    opacity: { type: "f", value: opts.opacity || 0.8 }
  };

  let material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    defaultAttributeValues: {},
    vertexShader: require("./vert/wall.vert").default,
    fragmentShader: require("./frag/floaterWall.frag").default,
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
 * 贴图-着色器材质
 * @param {Object} opts uniforms param 着色器变量传参
 */
export function textureWallMaterial(opts = {}) {
  let uniforms = {
    time: {
      type: "f",
      value: 0
    },
    convert: {
      type: "f",
      value: opts.convert || 0
    },
    color: {
      type: "c",
      value: new THREE.Color(opts.color || "#0099FF")
    },
    opacity: {
      type: "f",
      value: opts.opacity || 1
    },
    map: {
      type: "t",
      value: opts.texture
    }
  };
  let material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    defaultAttributeValues: {},
    vertexShader: require("./vert/wall.vert").default,
    fragmentShader: require("./frag/textureWall.frag").default,
    blending: THREE.AdditiveBlending,
    transparent: !0,
    depthWrite: !1,
    depthTest: !0,
    side: THREE.DoubleSide,
    fog: !0
  });
  return material;
}

export function textureBuildMaterial(opts = {}) {
  let uniforms = {
    time: {
      type: "f",
      value: 0
    },
    convert: {
      type: "f",
      value: opts.convert || 0
    },
    color: {
      type: "c",
      value: new THREE.Color(opts.color || "#0099FF")
    },
    opacity: {
      type: "f",
      value: opts.opacity || 1
    },
    map: {
      type: "t",
      value: opts.texture
    }
  };
  let material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    defaultAttributeValues: {},
    vertexShader: require("./vert/wall.vert").default,
    fragmentShader: require("./frag/textureWall.frag").default
  });
  return material;
}
/**
 * "火花、火星"-着色器材质
 * @param {Object} opts uniforms param 着色器变量传参
 */
export function sparkWallMaterial(opts = {}) {
  let uniforms = {
    time: { type: "f", value: 0 },
    color: { type: "c", value: new THREE.Color(opts.color || "#0099FF") },
    opacity: { type: "f", value: opts.opacity || 0.8 }
  };
  let material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    defaultAttributeValues: {},
    vertexShader: require("./vert/wall.vert").default,
    fragmentShader: require("./frag/sparkWall.frag").default,
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
 * "火"-着色器材质
 * @param {Object} opts uniforms param 着色器变量传参
 */
export function fireWallMaterial(opts = {}) {
  let uniforms = {
    time: { type: "f", value: 0 },
    color: { type: "c", value: new THREE.Color(opts.color || "#0099FF") },
    opacity: { type: "f", value: opts.opacity || 0.8 }
  };
  let material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    defaultAttributeValues: {},
    vertexShader: require("./vert/wall.vert").default,
    fragmentShader: require("./frag/fireWall.frag").default,
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
 * "火-II"-着色器材质
 * @param {Object} opts uniforms param 着色器变量传参
 */
export function fireWallTwoMaterial(opts = {}) {
  let uniforms = {
    time: { type: "f", value: 0 },
    iResolution: { type: "v3", value: new THREE.Vector3(1, 1, 1) }
  };
  let material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    defaultAttributeValues: {},
    vertexShader: require("./vert/wall.vert").default,
    fragmentShader: require("./frag/fireWallTwo.frag").default,
    // blending: THREE.AdditiveBlending,
    transparent: !0,
    depthWrite: !1,
    depthTest: !0,
    side: THREE.DoubleSide,
    fog: !0
  });
  return material;
}
