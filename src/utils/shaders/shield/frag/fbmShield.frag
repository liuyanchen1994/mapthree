// #extension GL_OES_standard_derivatives : enable

uniform float time;
uniform float opacity;
uniform vec3 color;
uniform sampler2D noise_map;
varying vec2 vUv;

#define tau 6.2831853

mat2 makem2(in float theta){float c = cos(theta);float s = sin(theta);return mat2(c,-s,s,c);}
float noise( in vec2 x ){return texture2D(noise_map, x*.01).x;}

float fbm(in vec2 p) {
    float z=2.;
    float rz = 0.;
    vec2 bp = p;
    for (float i= 1.;i < 6.;i++)
    {
        rz+= abs((noise(p)-0.5)*2.)/z;
        z = z*2.;
        p = p*2.;
    }
    return rz;
}

float dualfbm(in vec2 p) {
    //get two rotated fbm calls and displace the domain
    vec2 p2 = p*.7;
    vec2 basis = vec2(fbm(p2-time*1.6),fbm(p2+time*1.7));
    basis = (basis-.5)*.2;
    p += basis;

    //coloring
    return fbm(p*makem2(time*0.2));
}

float circ(vec2 p) {
    float r = length(p);
    //r = log(sqrt(r));
    r = 0.5 * log(r);
    return abs(mod(r*4.,tau)-3.14)*3.+.2;
}

void main(void) {
    vec2 uv = vUv;
    vec2 uv2 = vUv;

    if (uv.y < 0.5) {
    discard;
    }

    uv.x = abs(uv.x - 0.5);
    uv*=4.;

    float rz = dualfbm(uv);
    rz *= 10.;

    //final color
    vec3 col = color / rz;
    col=pow(abs(col), vec3(.99));

    gl_FragColor = mix(vec4(col, opacity), vec4(vec3(0.), 0.1), 0.2);
}
