precision highp float;
precision highp int;
uniform float time;
varying vec2 uv2;
varying vec2 Star_Swamp_3D_version_1481150076458_107_vUv;
varying vec3 Star_Swamp_3D_version_1481150076458_107_vPosition;
varying vec3 Star_Swamp_3D_version_1481150076458_107_vNormal;
varying vec3 Tiling_Caustic1481150103620_119_vPosition;
varying vec3 Tiling_Caustic1481150103620_119_vNormal;
varying vec2 Tiling_Caustic1481150103620_119_vUv;
varying vec2 vUv2;
varying vec2 Caustic_Image_Based1487582497347_66_vUv;
varying vec3 Caustic_Image_Based1487582497347_66_vPosition;
varying vec3 Caustic_Image_Based1487582497347_66_vNormal;
vec4 Star_Swamp_3D_version_1481150076458_107_main()
{
    vec4 Star_Swamp_3D_version_1481150076458_107_gl_Position = vec4(0.0);
    Star_Swamp_3D_version_1481150076458_107_vUv = uv;
    Star_Swamp_3D_version_1481150076458_107_vPosition = position;
    Star_Swamp_3D_version_1481150076458_107_vNormal = normal;
    Star_Swamp_3D_version_1481150076458_107_gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    return Star_Swamp_3D_version_1481150076458_107_gl_Position *= 0.2;
}
vec4 Tiling_Caustic1481150103620_119_main()
{
    vec4 Tiling_Caustic1481150103620_119_gl_Position = vec4(0.0);
    Tiling_Caustic1481150103620_119_vNormal = normal;
    Tiling_Caustic1481150103620_119_vUv = uv;
    vUv2 = uv2;
    Tiling_Caustic1481150103620_119_vPosition = position;
    Tiling_Caustic1481150103620_119_gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    return Tiling_Caustic1481150103620_119_gl_Position *= 1.0;
}
vec4 Caustic_Image_Based1487582497347_66_main()
{
    vec4 Caustic_Image_Based1487582497347_66_gl_Position = vec4(0.0);
    Caustic_Image_Based1487582497347_66_vUv = uv;
    Caustic_Image_Based1487582497347_66_vPosition = position;
    Caustic_Image_Based1487582497347_66_vNormal = normal;
    Caustic_Image_Based1487582497347_66_gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    return Caustic_Image_Based1487582497347_66_gl_Position *= 1.0;
}
void main()
{
    gl_Position = Star_Swamp_3D_version_1481150076458_107_main() + Tiling_Caustic1481150103620_119_main() + Caustic_Image_Based1487582497347_66_main();
}