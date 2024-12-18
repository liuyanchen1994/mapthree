uniform vec3 iResolution;           // viewport resolution (in pixels)
uniform float time;                 // shader playback time (in seconds)
varying vec2 vUv;

/**
A very simple and basic navigation radar inspired from retro video games. This
is mostly a result of my boredom. :p
*/

#define PI 3.1415926535

#define ROT(x) mat2(cos(x), -sin(x), sin(x), cos(x))

#define BRIGHT_GREEN vec3(0., 1.2, 0.)
#define MEDIUM_GREEN vec3(0., .6, 0.)
#define DARK_GREEN vec3(0., .3, 0.)
#define RED vec3(10., 0., 0.)

#define RADAR_SIZE .49
#define RADAR_STRENGTH .45

// hash function by Dave_Hoskins
vec2 hash22(vec2 p)
{
	uvec2 q = uvec2(ivec2(p))*uvec2(1597334673U, 3812015801U);
	q = (q.x ^ q.y) * uvec2(1597334673U, 3812015801U);
	return vec2(q) * (1.0 / float(0xffffffffU));
}

// remaps value x from range [a, b] to range [c, d]
float remap(float x, float a, float b, float c, float d)
{
    return (((x - a) / (b - a)) * (d - c)) + c;
}

// iq's 2d line sdf
float line(vec2 p, vec2 a, vec2 b)
{
    vec2 pa = p-a, ba = b-a;
    float h = clamp( dot(pa,ba)/dot(ba,ba), 0.0, 1.0 );
    return length( pa - ba*h );
}

// thanks FabriceNeyret2, for a more efficient circle function!
float circle(vec2 p, float r, float t)
{
    // float or = r + t;
    // return smoothstep(or, or-.01, length(p)) - smoothstep(r, r-.01, length(p));
    return smoothstep(.01, -.01, abs(length(p) - r) - t * .5);
}

// Paints random enemy dots on the radar
void paintEnemies(in vec2 uv, inout vec3 col, in float radarCrossSec)
{
	for(int i = 0; i < 8; ++i)
    {
        vec2 h = 2. * hash22(vec2(float(i + 2) * 1.2)) - 1.;
        vec2 enemyLoc =  h * .6;
        float enemy = smoothstep(.04, -.04, length(uv - enemyLoc));
        col += enemy * RED * radarCrossSec;
    }
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
	// float asp=float(1)/iResolution.y;
    float asp = iResolution.x / iResolution.y;
    vec2 uv = vUv-0.5;
    
    // rotate uv over time
    vec2 rv = uv * ROT(time*1.5);
    // polar angle
    float theta = atan(rv.y, rv.x);
    theta = remap(theta, -PI, PI, 0., 1./min(1., RADAR_STRENGTH));
    vec2 a = vec2(0.), b = vec2(-asp, 0.);
    float aaLine = smoothstep(.007, 0., line(rv, a, b));
    // circle mask for drawing the radar navigation cross-section
    float radarArea = smoothstep(RADAR_SIZE, RADAR_SIZE - .01, length(uv));
    float radarCrossSec = max(0., (1. - theta - aaLine)) * radarArea;
    
    vec3 col = circle(uv, RADAR_SIZE, .01) * BRIGHT_GREEN;
    col += radarCrossSec * MEDIUM_GREEN;
    float sr = RADAR_SIZE, rStep = RADAR_SIZE/4.;
    
    // draw inner circles and lines
    for (int i = 0; i < 4; ++i)
    {
        sr -= rStep;
        col += circle(uv, sr, .01) * DARK_GREEN;
    }
    
    col += smoothstep(.005, .004, line(uv, vec2(0., -RADAR_SIZE),
				vec2(0., RADAR_SIZE))) * DARK_GREEN;
    col += smoothstep(.005, .004, line(uv, vec2(-RADAR_SIZE, 0.),
				vec2(RADAR_SIZE, 0.))) * DARK_GREEN;
    
    paintEnemies(uv, col, radarCrossSec);
    col += DARK_GREEN * radarArea * .5;
    
    fragColor = vec4(col, .1); //.1 透明度
}
void main(){
    mainImage(gl_FragColor,gl_FragCoord.xy);
}