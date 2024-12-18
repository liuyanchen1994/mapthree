varying vec3 vNormal;
varying vec3 vPosition;
void main() {
  float cy = (fract((vPosition.z - 50.0) / 100.0) + 0.7) * 0.7;
  // if(vNormal.x==0.0&&vNormal.y==1.0&&vNormal.z==0.0){
  //   cy = 1.0;
  // }
  gl_FragColor = vec4(0.0, cy, cy, 1.0);
}