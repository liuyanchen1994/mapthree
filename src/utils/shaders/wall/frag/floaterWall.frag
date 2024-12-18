precision lowp float;
precision lowp int;
uniform float time;
uniform float opacity;
uniform vec3 color;
varying vec2 vUv;
float snow(vec2 uv, float scale) {
    float w = smoothstep(1.,0.,-uv.y*(scale/10.));
    if(w<.1) return 0.;
    // uv+=time/scale;
    uv.y-=time*2./scale;
    // uv.x+=sin(uv.y+time*.1)/scale;
    uv*=scale;
    vec2 s=floor(uv),f=fract(uv),p;
    float k=3.,d;
    p=.5+.35*sin(11.*fract(sin((s+p+scale)*mat2(7,3,6,5))*5.))-f;
    d=length(p);
    k=min(d,k);
    k=smoothstep(0.,k,sin(f.x+f.y)*0.01);
    return k*w;
}
void main() {
    float c = snow(vUv, 30.) * .3;
    c += snow(vUv, 20.) * .5;
    c += snow(vUv, 15.) * .8;
    c += snow(vUv, 10.);
    c += snow(vUv, 8.);
    c += snow(vUv, 6.);
    c += snow(vUv, 5.);
    float modulo = mod(time, 10.0);
    if(modulo > 5.0) {
        modulo -= ((modulo - 5.0) * 2.0);
    }
    modulo /= 5.0;
    modulo += 0.35;
    if(modulo > 1.0) {
        modulo = 1.0;
    }
    vec4 fragColor = vec4(c * modulo, c * modulo, c * modulo, c);
    vec3 fade = mix(color, vec3(0., 0., 0.), vUv.y);
    fragColor += vec4(fade, 1.);
    gl_FragColor = vec4(fragColor.rgb, fragColor.a * opacity * (1. - vUv.y));
}