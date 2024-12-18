varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;
  void main() {
      //将attributes的normal通过varying赋值给了向量vNormal
  vNormal = normal;
  vPosition = position;
      //projectionMatrix是投影变换矩阵 modelViewMatrix是相机坐标系的变换矩阵
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position.x, position.y, position.z, 1.0 );
}