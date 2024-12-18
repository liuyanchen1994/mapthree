varying vec3 vNormal;
varying vec3 vPositionNormal;
varying vec2 vUv;
void main() 
{
    vUv = uv;
    vNormal = normalize( normalMatrix * normal ); // 转换到视图空间
    vPositionNormal = normalize(( modelViewMatrix * vec4(position, 1.0) ).xyz);
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}