precision highp float;
precision highp int;
uniform float scale;
uniform sampler2D noiseImage;
uniform vec2 Cloud_WIP1555482451489_482_speed;
uniform float cloudBrightness;
uniform float cloudMorphSpeed;
uniform float cloudMorphDirection;
uniform float cloudCover;
uniform float time;
uniform vec3 Cloud_WIP1555482451489_482_color;
uniform vec3 color1;
uniform vec3 color2;
uniform float Flowing_Image_Combination1555482451537_488_speed;
uniform float resolution;
uniform sampler2D image1;
uniform sampler2D image2;
uniform vec3 Flowing_Image_Combination1555482451537_488_color;
uniform vec3 Fresnel_Glow1555482451555_491_color;
uniform float rimWidth;
uniform float fadeDistance;
varying vec2 Cloud_WIP1555482451489_482_vUv;
varying vec2 Vertical_2_Color_Graident1555482451525_485_vUv;
varying vec2 Flowing_Image_Combination1555482451537_488_vUv;
varying vec3 fPosition;
varying vec3 fNormal;
vec4 Cloud_WIP1555482451489_482_main() {
    vec4 Cloud_WIP1555482451489_482_gl_FragColor = vec4(0.0);
    vec4 colorOutput = vec4(0.0);
    vec2 elapsed = time * Cloud_WIP1555482451489_482_speed;
    vec2 uv = (Cloud_WIP1555482451489_482_vUv + elapsed) * scale;
    for (int i = 1;i <= 4; i++) {
        float f = float(i);
        float divis = pow(2.0, f);
        float uvPow = pow(2.0, f - 1.0);
        vec4 computed = texture2D(noiseImage, uvPow * (uv + vec2(0.1, 0.0) + (time * 0.001 * cloudMorphSpeed))) / divis;
        computed += texture2D(noiseImage, uvPow * (uv + vec2(0.1))) / divis;
        computed += texture2D(noiseImage, uvPow * (uv + vec2(0.0, 0.1) + (cloudMorphDirection * time * 0.001 * cloudMorphSpeed))) / divis;
        computed *= 0.25;
        colorOutput += computed;
    }			
    colorOutput = max(colorOutput - (1.0 - cloudCover), 0.0);
    colorOutput = vec4(1.0 - pow((1.0 - cloudBrightness), colorOutput.r * 255.0));
    Cloud_WIP1555482451489_482_gl_FragColor = vec4(colorOutput.rgb, 1.0);
    return Cloud_WIP1555482451489_482_gl_FragColor *= 0.7;
}
vec4 Vertical_2_Color_Graident1555482451525_485_main(void) {
    vec4 Vertical_2_Color_Graident1555482451525_485_gl_FragColor = vec4(0.0);
    vec3 mixCol = mix(color2, color1, Vertical_2_Color_Graident1555482451525_485_vUv.y);
    Vertical_2_Color_Graident1555482451525_485_gl_FragColor = vec4(mixCol, 1.);
    return Vertical_2_Color_Graident1555482451525_485_gl_FragColor *= 1.0;
}
vec4 Flowing_Image_Combination1555482451537_488_main() {
    vec4 Flowing_Image_Combination1555482451537_488_gl_FragColor = vec4(0.0);
    vec2 uv = Flowing_Image_Combination1555482451537_488_vUv.xy * resolution;
    vec4 texCol = vec4(texture2D(image1, uv));
    mat3 tfm;
    tfm[0] = vec3(texCol.z, 0.0, 0);
    tfm[1] = vec3(0.0, texCol.y, 0);
    tfm[2] = vec3(0, 0, 1.0);
    vec2 muv = (vec3(uv, 1.0) * tfm).xy + time * Flowing_Image_Combination1555482451537_488_speed;
    texCol = vec4(vec3(texture2D(image2, muv)) * Flowing_Image_Combination1555482451537_488_color, 1.0);
    Flowing_Image_Combination1555482451537_488_gl_FragColor = texCol;
    return Flowing_Image_Combination1555482451537_488_gl_FragColor *= 0.5;
}
vec4 Fresnel_Glow1555482451555_491_main(void) {
    vec4 Fresnel_Glow1555482451555_491_gl_FragColor = vec4(0.0);
    vec3 viewDirectionW = normalize(-fNormal);
    vec3 eye = normalize(-fPosition.xyz);
    float fresnelTerm = dot(eye, fNormal);
    fresnelTerm = rimWidth * clamp(fadeDistance - fresnelTerm, 0.0, 1.);
    Fresnel_Glow1555482451555_491_gl_FragColor = vec4(Fresnel_Glow1555482451555_491_color * fresnelTerm, 1.);
    return Fresnel_Glow1555482451555_491_gl_FragColor *= 1.0;
}
void main() {
    gl_FragColor = (Cloud_WIP1555482451489_482_main() + Vertical_2_Color_Graident1555482451525_485_main() + Flowing_Image_Combination1555482451537_488_main() + Fresnel_Glow1555482451555_491_main());                        
}
