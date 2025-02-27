uniform vec3 iResolution;           // viewport resolution (in pixels)
uniform float time;                 // shader playback time (in seconds)
varying vec2 vUv;

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
	// vec2 p = (2.0*fragCoord.xy-iResolution.xy)/iResolution.y;
	vec2 p = vUv-0.5;
    float tau = 3.1415926535*2.0;
    float a = atan(p.x,p.y);
    float r = length(p)*0.75;
    vec2 uv = vec2(a/tau,r);
    // vec2 uv = vUv-0.5;
	
	//get the color
	float xCol = (uv.x - (time / 3.0)) * 3.0;
	xCol = mod(xCol, 3.0);
	vec3 horColour = vec3(0.25, 0.25, 0.25);
	
	if (xCol < 1.0) {
		
		horColour.r += 1.0 - xCol;
		horColour.g += xCol;
	}
	else if (xCol < 2.0) {
		
		xCol -= 1.0;
		horColour.g += 1.0 - xCol;
		horColour.b += xCol;
	}
	else {
		
		xCol -= 2.0;
		horColour.b += 1.0 - xCol;
		horColour.r += xCol;
	}

	// draw color beam
	uv = (3.5 * uv) - 1.0;
	float beamWidth = (0.3+0.5*cos(uv.x*10.0*tau*0.15*clamp(floor(5.0 + 10.0*cos(time)), 0.0, 10.0))) * abs(1.0 / (30.0 * uv.y));
	vec3 horBeam = vec3(beamWidth);
	fragColor = vec4((( horBeam) * horColour), 1.0);
}

void main(){
    mainImage(gl_FragColor,gl_FragCoord.xy);
}