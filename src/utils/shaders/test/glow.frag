varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;
void main() {
  float cy = (fract((vUv.x - 50.0) / 100.0) + 0.7) * 0.7;
  // if(vNormal.x==0.0&&vNormal.y==1.0&&vNormal.z==0.0){
  //   cy = 1.0;
  // }
  gl_FragColor = vec4(0.0, cy, cy, 1.0);
  // float dir = length(vUv);
  //   float ratio = 0.25;
  //   float opacity = 1.0;
  //   if (dir < ratio) {
  //       gl_FragColor.a *= opacity;
  //   } else {
  //       gl_FragColor.a *= mix(opacity, 0., (dir - ratio) / (0.5 - ratio));
  //   }
}