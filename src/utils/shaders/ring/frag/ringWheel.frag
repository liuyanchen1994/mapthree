uniform vec3 iResolution;           // viewport resolution (in pixels)
uniform float time;                 // shader playback time (in seconds)
varying vec2 vUv;

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = vUv - 0.5;
    vec2 ps = (1.0/iResolution.xy)*2.0; //Kind of a antialiasing feature for smoothstep
    
    vec4 col = vec4(0.0);
    
    float angle = (atan(-uv.x, -uv.y)/3.141)+1.0;
    float dist = 0.0;
    
    float t = fract(time/6.0)*6.0;
    
    dist = smoothstep(0.08, 0.08-ps.y, length(uv)); //First stage
    dist *= smoothstep(0.034-ps.y, 0.034, length(uv));
    col += vec4(step(t-4.0, angle) * dist)+(dist*0.5);
    
    dist = smoothstep(0.11, 0.11-ps.y, length(uv)); //Second stage
    dist *= smoothstep(0.09-ps.y, 0.09, length(uv));
    col += vec4(step(t-2.0, angle) * dist)+(dist*0.5);
    
    dist = smoothstep(0.1275, 0.1275-ps.y, length(uv)); //Third stage
    dist *= smoothstep(0.12-ps.y, 0.12, length(uv));
    col += vec4(step(t, angle) * dist)+(dist*0.5);
    
    col *= vec4(0.35, 0.9, 0.4, 1.0)*0.6;
    
    fragColor = col;
}
void main() {
    mainImage(gl_FragColor,gl_FragCoord.xy);
}