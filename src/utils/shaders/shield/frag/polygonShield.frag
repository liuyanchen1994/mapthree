uniform vec3 glowColor;
uniform float bias;
uniform float power;
uniform float scale;
varying vec3 vNormal;
varying vec3 vPositionNormal;
uniform sampler2D textureMap;
uniform vec2 repeat;
varying vec2 vUv;
uniform float time;
void main() 
{
    vec2 uv = vUv;
    if (uv.y < 0.5) {
        discard;
    }
    float a = pow( bias + scale * abs(dot(vNormal, vPositionNormal)), power );
    //*(vec2(1.0,time))
    vec4 mapColor=texture2D( textureMap, vUv*repeat);
    gl_FragColor = vec4( glowColor*mapColor.rgb, a );
}