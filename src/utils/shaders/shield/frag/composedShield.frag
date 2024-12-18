#define TAU 6.28318530718
#define MAX_ITER 5
#define PI 3.141592653589793238462643383279

precision highp float;
precision highp int;
uniform vec3 baseColor;
uniform float Star_Swamp_3D_version_1481150076458_107_brightness;
uniform float scale;
uniform float time;
uniform vec2 Tiling_Caustic1481150103620_119_resolution;
uniform vec3 backgroundColor;
uniform vec3 Tiling_Caustic1481150103620_119_color;
uniform float Tiling_Caustic1481150103620_119_speed;
uniform float Tiling_Caustic1481150103620_119_brightness;
uniform float Caustic_Image_Based1487582497347_66_speed;
uniform float Caustic_Image_Based1487582497347_66_resolution;
uniform vec3 Caustic_Image_Based1487582497347_66_color;
uniform sampler2D image;
uniform float Caustic_Image_Based1487582497347_66_brightness;
varying vec2 Star_Swamp_3D_version_1481150076458_107_vUv;
varying vec3 Star_Swamp_3D_version_1481150076458_107_vPosition;
varying vec3 Star_Swamp_3D_version_1481150076458_107_vNormal;
float field(in vec3 p) {
    float strength = 7. + .03 * log(1.e-6 + fract(sin(time) * 4373.11));
    float accum = 0.;
    float prev = 0.;
    float tw = 0.;
    for (int i = 0; i < 32; ++i) 
    {
        float mag = dot(p, p);
        p = abs(p) / mag + vec3(-.51, -.4, -1.3);
        float w = exp(-float(i) / 7.);
        accum += w * exp(-strength * pow(abs(mag - prev), 2.3));
        tw += w;
        prev = mag;
    }
    return max(0., 5. * accum / tw - .2);
}
vec3 nrand3(vec2 co) {
    vec3 a = fract(cos(co.x * 8.3e-3 + co.y) * vec3(1.3e5, 4.7e5, 2.9e5));
    vec3 b = fract(sin(co.x * 0.3e-3 + co.y) * vec3(8.1e5, 1.0e5, 0.1e5));
    vec3 c = mix(a, b, 0.5);
    return c;
}
varying vec2 Tiling_Caustic1481150103620_119_vUv;
varying vec2 Caustic_Image_Based1487582497347_66_vUv;
varying vec3 Caustic_Image_Based1487582497347_66_vPosition;
varying vec3 Caustic_Image_Based1487582497347_66_vNormal;
vec3 lig = normalize(vec3(0.9, 0.35, -0.2));
vec4 Star_Swamp_3D_version_1481150076458_107_main() {
    vec4 Star_Swamp_3D_version_1481150076458_107_gl_FragColor = vec4(0.0);
    vec3 pos = Star_Swamp_3D_version_1481150076458_107_vPosition / scale;
    vec3 p = vec3(pos / 4.) + vec3(2., -1.3, -1.);
    p += 0.18 * vec3(sin(time / 16.), sin(time / 12.), sin(time / 128.));
    vec3 p2 = vec3(pos / (4. + sin(time * 0.11) * 0.2 + 0.2 + sin(time * 0.15) * 0.3 + 0.4)) + vec3(2., -1.3, -1.);
    p2 += 0.2 * vec3(sin(time / 16.), sin(time / 12.), sin(time / 128.));
    vec3 p3 = vec3(pos / (4. + sin(time * 0.14) * 0.23 + 0.23 + sin(time * 0.19) * 0.31 + 0.31)) + vec3(2., -1.3, -1.);
    p3 += 0.25 * vec3(sin(time / 16.), sin(time / 12.), sin(time / 128.));
    float t = field(p);
    float t2 = field(p2);
    float t3 = field(p3);
    float v = (1. - exp((abs(pos.x) - 1.) * 6.)) * (1. - exp((abs(pos.y) - 1.) * 6.)) * (1. - exp((abs(pos.z) - 1.) * 6.));
    vec3 c1 = mix(.9, 1., v) * vec3(1.8 * t * t * t, 1.4 * t * t, t);
    vec3 c2 = mix(.8, 1., v) * vec3(1.9 * t2 * t2 * t2, 1.8 * t2 * t2, t2);
    vec3 c3 = mix(.8, 1., v) * vec3(1.4 * t3 * t3 * t3, 1.8 * t3 * t3, t3);
    c1 *= baseColor;
    c2 *= baseColor;
    c3 *= baseColor;
    Star_Swamp_3D_version_1481150076458_107_gl_FragColor = vec4(Star_Swamp_3D_version_1481150076458_107_brightness * vec3(c1 * 0.7 + c2 * 0.9 + c3 * 0.1), 1.0);
    return Star_Swamp_3D_version_1481150076458_107_gl_FragColor *= 0.2;
}
vec4 Tiling_Caustic1481150103620_119_main() {
    vec4 Tiling_Caustic1481150103620_119_gl_FragColor = vec4(0.0);
    if(Tiling_Caustic1481150103620_119_vUv.y < 0.5){
        discard;
    }
    vec2 uv = Tiling_Caustic1481150103620_119_vUv * Tiling_Caustic1481150103620_119_resolution;
    vec2 p = mod(uv * TAU, TAU) - 250.0;
    vec2 i = vec2(p);
    float c = 1.0;
    float inten = 0.005;
    for (int n = 0; n < MAX_ITER; n++) {
        float t = time * Tiling_Caustic1481150103620_119_speed * (1.0 - (3.5 / float(n + 1)));
        i = p + vec2(cos(t - i.x) + sin(t + i.y), sin(t - i.y) + cos(t + i.x));
        c += 1.0 / length(vec2(p.x / (sin(i.x + t) / inten), p.y / (cos(i.y + t) / inten)));
    }
    c /= float(MAX_ITER);
    c = 1.17 - pow(c, Tiling_Caustic1481150103620_119_brightness);
    vec3 rgb = vec3(pow(abs(c), 8.0));
    Tiling_Caustic1481150103620_119_gl_FragColor = vec4(rgb * Tiling_Caustic1481150103620_119_color + backgroundColor, 1.0);
    return Tiling_Caustic1481150103620_119_gl_FragColor *= 1.0;
}
vec4 Caustic_Image_Based1487582497347_66_main() {
    vec4 Caustic_Image_Based1487582497347_66_gl_FragColor = vec4(0.0);
    if(Caustic_Image_Based1487582497347_66_vUv.y<0.5){
        discard;
    }
    vec2 uvMax = (2.0 * asin(sin(2.0 * PI * Caustic_Image_Based1487582497347_66_vUv))) / PI;
    vec2 position = Caustic_Image_Based1487582497347_66_vUv * Caustic_Image_Based1487582497347_66_resolution;
    vec3 nor = vec3(0.0, 1.0, 0.0);
    float dif = max(dot(nor, lig), 0.0);
    vec3 pos = vec3(position.x, 0.0, position.y);
    float timeScale = time * Caustic_Image_Based1487582497347_66_speed;
    vec3 brdf = vec3(0.0);
    float cc = 0.55 * texture2D(image, 1.8 * 0.02 * pos.xz + 0.007 * timeScale * vec2(1.0, 0.0)).x;
    cc += 0.25 * texture2D(image, 1.8 * 0.04 * pos.xz + 0.011 * timeScale * vec2(0.0, 1.0)).x;
    cc += 0.10 * texture2D(image, 1.8 * 0.08 * pos.xz + 0.014 * timeScale * vec2(-1.0, -1.0)).x;
    cc = 0.6 * (1.0 - smoothstep(0.0, 0.025, abs(cc - 0.4))) + 0.4 * (1.0 - smoothstep(0.0, 0.150, abs(cc - 0.4)));
    vec3 col = Caustic_Image_Based1487582497347_66_color * cc;
    Caustic_Image_Based1487582497347_66_gl_FragColor = vec4(Caustic_Image_Based1487582497347_66_color * cc * Caustic_Image_Based1487582497347_66_brightness, 1.0);
    return Caustic_Image_Based1487582497347_66_gl_FragColor *= 1.0;
}
void main() {
    gl_FragColor = (Star_Swamp_3D_version_1481150076458_107_main() + Tiling_Caustic1481150103620_119_main());                        
}
