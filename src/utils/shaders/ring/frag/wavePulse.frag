precision lowp float;
precision lowp int;
uniform float time;
uniform float opacity;
uniform vec3 color;
varying vec2 vUv;

void main() {
    vec2 p = vUv - 0.5;
    p *= 5.;
    float a = atan(p.y, p.x);
    float r = 1.5;
    float wr = 0.1;
    float wn = 11.;
    float ws = 1.;
    float c = length(p) - r - wr * sin(wn * a - ws * time) + wr * sin(20. * a - 10.*time);
    c = 0.1 / abs(c);
    gl_FragColor = vec4(c * color, opacity);
    
}