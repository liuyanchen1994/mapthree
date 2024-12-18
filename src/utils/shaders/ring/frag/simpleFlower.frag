// uniform vec3 iResolution;           // viewport resolution (in pixels)
uniform vec3 color;
uniform float time;                 // shader playback time (in seconds)
varying vec2 vUv;
const float TWO_PI = 6.28318530718;
const float distThresh = 0.4;
const float baseRadius = 0.1;
const float brightAdjust = 4.;
const int numControlPoints = 12;

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    // vec2  uv = (2. * fragCoord.xy - iResolution.xy) / iResolution.y;
    vec2 uv = (vUv-0.5)*1.8;
    vec2  center = vec2(0);
    float speed = 1.0,
          time = time * speed,
          radius = baseRadius + baseRadius * 0.98 * sin(time), // 0.98 to reduce aliasing when all circles overlap
          dist = 0.,
          segmentRads = TWO_PI / float(numControlPoints);
    
	// create control points in a circle and check distance sum
    for(int i=0; i < numControlPoints; i++) {
        float curRads = segmentRads * float(i);
        float curRadius = radius * 2.;
        vec2 ctrlPoint = vec2(sin(curRads) * curRadius, cos(curRads) * curRadius);
        if(distance(uv, ctrlPoint) < distThresh) dist += distance(uv, ctrlPoint);
    }
    
    // adjust distance to compensate for numControlPoints addition
    dist /= float(numControlPoints);
    fragColor = vec4(pow(dist * brightAdjust,1.0) * vec3(color), 1.0);
}

void main() {
    mainImage(gl_FragColor,gl_FragCoord.xy);
}