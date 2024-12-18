import * as THREE from "three";

export function waterIMaterial(opts) {
  let uniforms = {
    noiseImage: { value: opts.t1, type: "t", glslType: "sampler2D" },
    scale: { value: "0.1", type: "f", glslType: "float" },
    cloudCover: {
      //云覆盖量
      value: opts.cloudCover || "0.58",
      type: "f",
      glslType: "float"
    },
    cloudBrightness: { value: "0.1", type: "f", glslType: "float" },
    cloudMorphSpeed: { value: "0.4", type: "f", glslType: "float" },
    cloudMorphDirection: { value: "-1", type: "f", glslType: "float" },
    time: { value: 1, type: "f", glslType: "float" },
    Cloud_WIP1555482451489_482_speed: {
      value: { x: "0.002", y: 0 },
      type: "v2",
      glslType: "vec2"
    },
    Cloud_WIP1555482451489_482_color: {
      value: {
        r: 0.6823529411764706,
        g: 0.8862745098039215,
        b: 0.2235294117647059
      },
      type: "c",
      glslType: "vec3"
    },
    color1: {
      value: { r: 0.054901960784313725, g: 0.5333333333333333, b: 1 },
      type: "c",
      glslType: "vec3"
    },
    color2: {
      value: { r: 0, g: 0.050980392156862744, b: 0.35294117647058826 },
      type: "c",
      glslType: "vec3"
    },
    resolution: {
      //水纹密度
      value: opts.md || "2",
      type: "f",
      glslType: "float"
    },
    image1: { value: opts.t2, type: "t", glslType: "sampler2D" },
    image2: { value: opts.t3, type: "t", glslType: "sampler2D" },
    Flowing_Image_Combination1555482451537_488_speed: {
      value: "0.01",
      type: "f",
      glslType: "float"
    },
    Flowing_Image_Combination1555482451537_488_color: {
      value: { r: 1, g: 1, b: 1 },
      type: "c",
      glslType: "vec3"
    },
    rimWidth: { value: "2", type: "f", glslType: "float" },
    fadeDistance: { value: "0.5", type: "f", glslType: "float" },
    Fresnel_Glow1555482451555_491_color: {
      value: { r: 0.6901960784313725, g: 0.9450980392156862, b: 1 },
      type: "c",
      glslType: "vec3"
    }
  };
  let material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    defaultAttributeValues: {},
    vertexShader: require("./vert/waterI.vert").default,
    fragmentShader: require("./frag/waterI.frag").default
    // blending: THREE.AdditiveBlending,
    // transparent: !0,
    // depthWrite: !1,
    // depthTest: !0,
    // side: THREE.DoubleSide,
    // fog: !0,
  });
  animate();
  function animate() {
    uniforms.time.value += 0.45;
    requestAnimationFrame(animate);
  }
  return material;
}

export function waterIIMaterial(opts) {
  let uniforms = {
    time: {
      type: "f",
      glslType: "float",
      value: 1
    },
    image1: {
      value: opts.t1,
      type: "t",
      glslType: "sampler2D"
    },
    image2: {
      value: opts.t2,
      type: "t",
      glslType: "sampler2D"
    },
    Flowing_Image_Combination1604346488794_88_speed: {
      value: "0.02",
      type: "f",
      glslType: "float"
    },
    Flowing_Image_Combination1604346488794_88_resolution: {
      value: "0.06",
      type: "f",
      glslType: "float"
    },
    Flowing_Image_Combination1604346488794_88_color: {
      value: {
        r: 0.30980392156862746,
        g: 0.39215686274509803,
        b: 0.5490196078431373
      },
      type: "c",
      glslType: "vec3"
    },
    cameraPosition: {
      type: "v3",
      glslType: "vec3"
    },
    brightness: {
      value: "0.1",
      type: "f",
      glslType: "float"
    },
    noiseImage: {
      value: opts.noise,
      type: "t",
      glslType: "sampler2D"
    },
    distortion: {
      value: "200",
      type: "f",
      glslType: "float"
    },
    contrast: {
      value: "0.5",
      type: "f",
      glslType: "float"
    },
    Noise_Ripples1604347411189_198_speed: {
      value: "10.5",
      type: "f",
      glslType: "float"
    },
    Noise_Ripples1604347411189_198_color: {
      value: {
        r: 0.5254901960784314,
        g: 0.5411764705882353,
        b: 0.4
      },
      type: "c",
      glslType: "vec3"
    },
    Noise_Ripples1604347411189_198_resolution: {
      value: {
        x: "0.3",
        y: "0.9"
      },
      type: "v2",
      glslType: "vec2"
    }
  };
  let material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    defaultAttributeValues: {},
    vertexShader: require("./vert/water2.vert").default,
    fragmentShader: require("./frag/water2.frag").default
    // blending: THREE.AdditiveBlending,
    // transparent: !0,
    // depthWrite: !1,
    // depthTest: !0,
    // side: THREE.DoubleSide,
    // fog: !0,
  });
  animate();
  function animate() {
    uniforms.time.value += 0.005;
    requestAnimationFrame(animate);
  }
  return material;
}
export function waterIIIMaterial() {
  const texture = new THREE.TextureLoader().load(
    require("../texture/CoolWater-iChannel0.jpg")
  );
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  let uniforms = {
    u_time: {
      type: "f",
      value: 0.6
    },
    u_texture: {
      type: "t",
      value: texture
    },
    u_sea_height: {
      type: "f",
      value: 0.6
    },
    u_water_scale: {
      type: "f",
      value: 0.2
    },
    u_water_speed: {
      type: "f",
      value: 3.5
    },
    u_sea_base: {
      type: "c",
      value: new THREE.Color("#193338")
    },
    u_water_color: {
      type: "c",
      value: new THREE.Color("#CCE599")
    }
  };
  let material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    defaultAttributeValues: {},
    vertexShader: require("./vert/water3.vert").default,
    fragmentShader: require("./frag/water3.frag").default,
    blending: THREE.AdditiveBlending,
    transparent: !0,
    depthWrite: !1,
    depthTest: !0,
    side: THREE.DoubleSide,
    fog: !0
  });
  animate();
  function animate() {
    uniforms.u_time.value += 0.005;
    requestAnimationFrame(animate);
  }
  return material;
}
