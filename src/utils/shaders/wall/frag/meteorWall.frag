precision lowp float;
precision lowp int;
uniform float time;
uniform vec3 color;
uniform float opacity;
varying vec2 vUv;

//Qg
#define pi 3.1415926535
#define PI2RAD 0.01745329252
#define TWO_PI (2. * PI)

float nutsack(vec2 uv){
    uv.x *= sin(1.)*2.;
    float t =  time*0.4;
    uv.x = uv.x*180.0;
    float dx = fract(uv.x);
    uv.x = floor(uv.x);
    uv.y *= 0.15;
    float o=sin(uv.x*215.4);
    float s=cos(uv.x*33.1)*.3 +.7;
    float trail = mix(95.0,15.0,s);
    float yv = 1.0/(fract(1. - uv.y + t*s + o) * trail);
    yv = smoothstep(0.0,1.0,yv*yv);
    yv = sin(yv*pi)*(s*5.0);
    float d = sin(dx*pi);
    return yv*(d*d);
}
void main() {
    vec3 col = color * nutsack(vUv);
    // Get the jizz flowing
    col += mix(color, vec3(0.,0.,0.), vUv.y);
    gl_FragColor=vec4(col, opacity * (1. - vUv.y));
    // output the spunk
}