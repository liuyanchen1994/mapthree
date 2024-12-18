#define tau 6.2831853

precision highp float;
precision highp int;
uniform float time;
uniform float Flowing_Image_Combination1604346488794_88_speed;
uniform float Flowing_Image_Combination1604346488794_88_resolution;
uniform sampler2D image1;
uniform sampler2D image2;
uniform vec3 Flowing_Image_Combination1604346488794_88_color;
uniform float contrast;
uniform float distortion;
uniform float Noise_Ripples1604347411189_198_speed;
uniform vec3 Noise_Ripples1604347411189_198_color;
uniform float brightness;
uniform sampler2D noiseImage;
uniform vec2 Noise_Ripples1604347411189_198_resolution;
varying vec2 Flowing_Image_Combination1604346488794_88_vUv;
varying vec2 Noise_Ripples1604347411189_198_vUv;

mat2 makem2(in float theta) 
{
  float c = cos(theta);
  float s = sin(theta);
  return mat2(c, -s, s, c);
}
float noise(in vec2 x) 
{
  return texture2D(noiseImage, x * .01).x;
}
float fbm(in vec2 p) 
{
  float z = 2.;
  float rz = 0.;
  vec2 bp = p;
  for (float i = 1.;
  i < 6.0; i++) 
  {
      rz += abs((noise(p) - 0.5) * 2.0) / z;
      z = z * 2.;
      p = p * 2.;
  }
  return rz;
}
float dualfbm(in vec2 p) 
{
  vec2 p2 = p * distortion;
  vec2 basis = vec2(fbm(p2 - time * Noise_Ripples1604347411189_198_speed * 1.6), fbm(p2 + time * Noise_Ripples1604347411189_198_speed * 1.7));
  basis = (basis - .5) * .2;
  p += basis;
  return fbm(p * makem2(time * Noise_Ripples1604347411189_198_speed * 0.2));
}
vec4 Flowing_Image_Combination1604346488794_88_main() 
{
  vec4 Flowing_Image_Combination1604346488794_88_gl_FragColor = vec4(0.0);
  vec2 uv = Flowing_Image_Combination1604346488794_88_vUv.xy * Flowing_Image_Combination1604346488794_88_resolution;
  vec4 texCol = vec4(texture2D(image1, uv));
  mat3 tfm;
  tfm[0] = vec3(texCol.z, 0.0, 0);
  tfm[1] = vec3(0.0, texCol.y, 0);
  tfm[2] = vec3(0, 0, 1.0);
  vec2 muv = (vec3(uv, 1.0) * tfm).xy + time * Flowing_Image_Combination1604346488794_88_speed;
  texCol = vec4(vec3(texture2D(image2, muv)) * Flowing_Image_Combination1604346488794_88_color, 1.0);
  Flowing_Image_Combination1604346488794_88_gl_FragColor = texCol;
  return Flowing_Image_Combination1604346488794_88_gl_FragColor *= 1.0;
}
vec4 Noise_Ripples1604347411189_198_main() 
{
  vec4 Noise_Ripples1604347411189_198_gl_FragColor = vec4(0.0);
  vec2 p = (Noise_Ripples1604347411189_198_vUv.xy - 0.5) * Noise_Ripples1604347411189_198_resolution;
  float rz = dualfbm(p);
  vec3 col = (Noise_Ripples1604347411189_198_color / rz) * brightness;
  col = ((col - 0.5) * max(contrast, 0.0)) + 0.5;
  Noise_Ripples1604347411189_198_gl_FragColor = vec4(col, 1.0);
  return Noise_Ripples1604347411189_198_gl_FragColor *= 1.0;
}
void main() 
{
  gl_FragColor = (Flowing_Image_Combination1604346488794_88_main() + Noise_Ripples1604347411189_198_main());        
}
