
#if __VERSION__ == 100 
    #extension GL_OES_standard_derivatives : enable 
#endif
  uniform float time;
  uniform float opacity;
  uniform vec3 color;
  varying vec2 vUv;

float snoise(vec3 uv, float res) {
    const vec3 s = vec3(1e0, 1e2, 1e3);

    uv *= res;

    vec3 uv0 = floor(mod(uv, res))*s;
    vec3 uv1 = floor(mod(uv+vec3(1.), res))*s;

    vec3 f = fract(uv); f = f*f*(3.0-2.0*f);
    
    vec4 v = vec4(uv0.x+uv0.y+uv0.z, uv1.x+uv0.y+uv0.z,
                uv0.x+uv1.y+uv0.z, uv1.x+uv1.y+uv0.z);
    
    vec4 r = fract(sin(v*1e-1)*1e3);
    float r0 = mix(mix(r.x, r.y, f.x), mix(r.z, r.w, f.x), f.y);

    r = fract(sin((v + uv1.z - uv0.z)*1e-1)*1e3);
    float r1 = mix(mix(r.x, r.y, f.x), mix(r.z, r.w, f.x), f.y);

    return mix(r0, r1, f.z)*2.-1.;
}
  
float noise(vec2 uv, float baseres) {
    float n = 0.0;
    for (int i = 0; i < 4; i++)
    {
        float v = pow(2.0, float(i));
        n += (1.5 / v) * snoise(vec3(uv + vec2(1.,1.) * (float(i) / 17.), 1), v * baseres);
    }


    return clamp((1.0 - n) * .5, 0., 1.) * 2.0;
}

void main(void) {
    vec2 uv = vUv;

    // Tweaking vars
    vec4 color1 = vec4(0.125, 0.291, 0.923, 1.0);
    vec4 leaving = vec4(color, 1.0);
    float noise_sz = 10.0;
    float speed = 0.4;
    vec2 center = vec2(0.5, 0.5);

    float dc = 1. - (distance(uv, center) * 1.75);
    float pdc = pow(dc, 3.5);

    vec2 dir = -normalize(uv - center) * speed;

    float phase0 = fract(time * 0.3 + 0.5);
    float phase1 = fract(time * 0.3 + 0.0);

    vec2 uv0 = uv + phase0 * dir;
    vec2 uv1 = uv + phase1 * dir;

    // Rotation
    float as = pdc * sin(time * 0.9) * 1.2;
    float ca = cos(as);
    float sa = sin(as);

    mat2 rot;
    rot[0] = vec2(ca, -sa);
    rot[1] = vec2(sa, ca);

    uv0 = center + ((uv0 - center) * rot);
    uv1 = center + ((uv1 - center) * rot);

    // Samplings
    float tex0 = max(noise(uv0, noise_sz), noise(uv0 * 1.2, noise_sz));
    float tex1 = max(noise(uv1, noise_sz), noise(uv1 * 1.4, noise_sz));

    float lerp = abs((0.5 - phase0) / 0.5);
    float samplings = mix(tex0, tex1, lerp);

    vec4 c = vec4(samplings, samplings, samplings, 1.0) * mix(color1, leaving, pdc) * pdc;
    c += pow(dc, 16.0) * mix(color1, leaving, pow(dc, 16.0)) * 2.3;

    float cl = clamp(max(c.r, max(c.g, c.b)), 0.0, 1.0);

    // Output to screen
    gl_FragColor = vec4(c.rgb, cl * opacity);
}
