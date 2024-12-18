#if __VERSION__ == 100 
    #extension GL_OES_standard_derivatives : enable 
#endif
uniform float time;
uniform float opacity;
uniform vec3 color;
varying vec2 vUv;

#define E3_COUNT 40
#define E3_RADIUS 0.07
#define E3_RADIUS2 2.0

mat3 rotateX(float a) {
	float sx = sin(a), cx = cos(a);
	return mat3(vec3(1.0,0.0,0.0),vec3(0.0,cx,sx),vec3(0.0,-sx,cx));
}

mat3 rotateY(float a) {
	float sy = sin(a), cy = cos(a);
	return mat3(vec3(cy,0.0,-sy),vec3(0.0,1.0,0.0),vec3(sy,0.0,cy));
}

vec3 noisepos(int seed) {
	return vec3(fract(5147.4235*sin(vec3(55.123,43.45,16.123) + vec3(float(seed)*0.012345)))) - 0.5;
}

float hash(float a) {
	return fract(5147.4235*sin(a*0.012345));
}

// dot particles
vec4 effect3( vec3 pos, vec3 ray, float time, int seed ) {
	float a = 0.0;

	vec3 npp = normalize(pos);

	for (int i=0; i<E3_COUNT;i++) {
		float tm = time*1.0 - hash(float(i+seed));
		int s=int(floor(tm));
		float io = fract(tm);
		vec3 np = normalize(noisepos(i + seed + s*E3_COUNT));
		vec3 p = np * sqrt(1.0-io)*E3_RADIUS2 - pos;

		float ad=0.0;
		for (int k=0;k<11;k++){
			p += np*0.03;
			float rl = 1.0/dot(ray,normalize(p));
			rl = (sqrt(rl*rl - 1.0));
			ad += (1.0 - clamp(rl * length(p) / E3_RADIUS,0.0,1.0))*abs(6.0-float(5-k))*0.03 * io;
		}
		a += ad*ad;
	}

	return vec4(a*a,a*a,a,1);
}

void main(void) {
	vec2 p = vUv - 0.5;
	float dir = length(p);

	// Ray, position and rotation
	float mx = 0.;
	float my = time*0.025;
	mat3 imr = rotateX(mx) * rotateY(-my);
	vec3 ray = normalize(vec3(p,2.0))*imr;
	vec3 pos = vec3(0.0,0.0,-3.0)*imr;

	// Output to screen
	float a = 0.0;

	gl_FragColor = effect3(pos,ray,time,0)*clamp(time*0.25,0.0,1.0);
	gl_FragColor.rgb *= color;
	gl_FragColor.a *= opacity * (0.7 - dir) * 2.;
}