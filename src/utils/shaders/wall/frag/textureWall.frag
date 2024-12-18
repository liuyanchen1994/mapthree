precision lowp float;
precision lowp int;
uniform float time;
uniform float convert;
uniform sampler2D map;
uniform float opacity;
uniform vec3 color;
varying vec2 vUv;
void main() {
    vec2 uv = vUv;
    if(time==0.0)
        gl_FragColor = texture2D(map, vec2(uv.x, uv.y));
    else {
        if(convert==1.0)
            gl_FragColor = texture2D(map, vec2(fract(-uv.x - time), uv.y));
        else
            gl_FragColor = texture2D(map, vec2(fract(uv.x - time), uv.y));
    }
    // gl_FragColor.rgb *= color;
    gl_FragColor.a *= opacity;
}