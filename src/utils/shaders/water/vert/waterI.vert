precision highp float;
precision highp int;
uniform float time;
varying vec2 uv2;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 Cloud_WIP1555482451489_482_vUv;
varying vec2 vUv2;
varying vec2 Vertical_2_Color_Graident1555482451525_485_vUv;
varying vec2 Flowing_Image_Combination1555482451537_488_vUv;
varying vec3 fNormal;
varying vec3 fPosition;
vec4 Cloud_WIP1555482451489_482_main() 
{
    vec4 Cloud_WIP1555482451489_482_gl_Position = vec4(0.0);
    vNormal = normal;
    Cloud_WIP1555482451489_482_vUv = uv;
    vUv2 = uv2;
    vPosition = position;
    Cloud_WIP1555482451489_482_gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    return Cloud_WIP1555482451489_482_gl_Position *= 0.7;
}
vec4 Vertical_2_Color_Graident1555482451525_485_main() 
{
    vec4 Vertical_2_Color_Graident1555482451525_485_gl_Position = vec4(0.0);
    Vertical_2_Color_Graident1555482451525_485_vUv = uv;
    Vertical_2_Color_Graident1555482451525_485_gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    return Vertical_2_Color_Graident1555482451525_485_gl_Position *= 1.0;
}
vec4 Flowing_Image_Combination1555482451537_488_main() 
{
    vec4 Flowing_Image_Combination1555482451537_488_gl_Position = vec4(0.0);
    Flowing_Image_Combination1555482451537_488_vUv = uv;
    Flowing_Image_Combination1555482451537_488_gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    return Flowing_Image_Combination1555482451537_488_gl_Position *= 0.5;
}
vec4 Fresnel_Glow1555482451555_491_main() 
{
    vec4 Fresnel_Glow1555482451555_491_gl_Position = vec4(0.0);
    fNormal = normalize(normalMatrix * normal);
    vec4 pos = modelViewMatrix * vec4(position, 1.0);
    fPosition = pos.xyz;
    Fresnel_Glow1555482451555_491_gl_Position = projectionMatrix * pos;
    return Fresnel_Glow1555482451555_491_gl_Position *= 1.0;
}
void main() 
{
    gl_Position = Cloud_WIP1555482451489_482_main() + Vertical_2_Color_Graident1555482451525_485_main() + Flowing_Image_Combination1555482451537_488_main() + Fresnel_Glow1555482451555_491_main();
}
