precision highp float;
precision highp int;
uniform float time;
attribute vec2 uv2;
varying vec2 Flowing_Image_Combination1604346488794_88_vUv;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 Noise_Ripples1604347411189_198_vUv;
varying vec2 vUv2;

vec4 Flowing_Image_Combination1604346488794_88_main() 
{
  vec4 Flowing_Image_Combination1604346488794_88_gl_Position = vec4(0.0);
  Flowing_Image_Combination1604346488794_88_vUv = uv;
  Flowing_Image_Combination1604346488794_88_gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  return Flowing_Image_Combination1604346488794_88_gl_Position *= 1.0;
}
vec4 Noise_Ripples1604347411189_198_main() 
{
  vec4 Noise_Ripples1604347411189_198_gl_Position = vec4(0.0);
  vNormal = normal;
  Noise_Ripples1604347411189_198_vUv = uv;
  vUv2 = uv2;
  vPosition = position;
  Noise_Ripples1604347411189_198_gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  return Noise_Ripples1604347411189_198_gl_Position *= 1.0;
}
void main() 
{
  gl_Position = Flowing_Image_Combination1604346488794_88_main() + Noise_Ripples1604347411189_198_main();
}
