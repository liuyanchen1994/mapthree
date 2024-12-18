
// #extension GL_OES_standard_derivatives : enable //maptalks.three@0.11.5开启报错 0.11.3√
#if __VERSION__ == 100
    #extension GL_OES_standard_derivatives : enable
#endif
precision lowp float;
precision lowp int;

uniform float time;
uniform float opacity;
uniform vec3 color;
varying vec2 vUv;

//////////////////////////THREE.ShaderChunk.common////////////////////////////
#define PI 3.14159265359
#define PI2 6.28318530718
#define PI_HALF 1.5707963267949
#define RECIPROCAL_PI 0.31830988618
#define RECIPROCAL_PI2 0.15915494
#define LOG2 1.442695
#define EPSILON 1e-6
#ifndef saturate
#define saturate(a) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement(a) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float average( const in vec3 color ) { return dot( color, vec3( 0.3333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract(sin(sn) * c);
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float max3( vec3 v ) { return max( max( v.x, v.y ), v.z ); }
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
struct GeometricContext {
	vec3 position;
	vec3 normal;
	vec3 viewDir;
#ifdef CLEARCOAT
	vec3 clearcoatNormal;
#endif
};
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
vec3 projectOnPlane(in vec3 point, in vec3 pointOnPlane, in vec3 planeNormal ) {
	float distance = dot( planeNormal, point - pointOnPlane );
	return - distance * planeNormal + point;
}
float sideOfPlane( in vec3 point, in vec3 pointOnPlane, in vec3 planeNormal ) {
	return sign( dot( point - pointOnPlane, planeNormal ) );
}
vec3 linePlaneIntersect( in vec3 pointOnLine, in vec3 lineDirection, in vec3 pointOnPlane, in vec3 planeNormal ) {
	return lineDirection * ( dot( planeNormal, pointOnPlane - pointOnLine ) / dot( planeNormal, lineDirection ) ) + pointOnLine;
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
float linearToRelativeLuminance( const in vec3 color ) {
	vec3 weights = vec3( 0.2126, 0.7152, 0.0722 );
	return dot( weights, color.rgb );
}
bool isPerspectiveMatrix( mat4 m ) {
  return m[ 2 ][ 3 ] == - 1.0;
}
//////////////////////////THREE.ShaderChunk.common////////////////////////////


//////////////////////////THREE.ShaderChunk.fog_pars_fragment////////////////////////////
#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float fogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif
//////////////////////////THREE.ShaderChunk.fog_pars_fragment////////////////////////////
 

float smoothing = 1.0 / 256.0;

float Union(float a, float b) {
  return min(a, b);
}

float Substraction(float a, float b) {
    return max(a,-b);
}

float Intersection(float a, float b) {
    return max(a,b);
}

float Circle(vec2 p, float r) {
  return length(p) - r;
}

float SDF(vec2 p) {
    float t = 4.0 * (5.0 * time + 1.0 * sin(5.0 * time));
    float dt = 1.0 + 1.0 * cos(5.0 * time);
    
    float sm = clamp(1.5 * cos(2.5 * time), -1.0, 1.0);
    
    float a = atan(p.y, p.x);
    float segmentA =  sin(a * 12.0 + t) * 0.1 + 0.07;
    float segmentB = -sin(a * 12.0 - t) * 0.1 + 0.07;
    
    float ringASize = 0.4 + sm * 0.1;
    float ringBSize = 0.4 - sm * 0.1;
    float width = 0.5;
    
    float bigCircleA = Circle(p, ringASize + ringASize * width);
    
    float smallCircleA = Circle(p, ringASize);
    
    float bigCircleB = Circle(p, ringBSize + ringBSize * width);
    
    float smallCircleB = Circle(p, ringBSize);
    
    float ringA = Substraction(bigCircleA, smallCircleA);
    float ringB = Substraction(bigCircleB, smallCircleB);
    
    return Union(Intersection(ringA, segmentA), Intersection(ringB, segmentB));
}

float Render(vec2 p) {
    float dist = SDF(p);
    return smoothstep(0.0, smoothing, -dist);
}

void main(void) {
  vec2 uv = vUv - 0.5;
  vec3 colorB = vec3(1., 0., 0.);
  float alpha = Render(uv * 1.48);
  vec3 col = mix(colorB, color, alpha);
  gl_FragColor = vec4(col, 1.0);
  

  //////////////////////////THREE.ShaderChunk.fog_fragment////////////////////////////
  #ifdef USE_FOG
    #ifdef FOG_EXP2
        float fogFactor = 1.0 - exp( - fogDensity * fogDensity * fogDepth * fogDepth );
    #else
        float fogFactor = smoothstep( fogNear, fogFar, fogDepth );
    #endif
    gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
  #endif
  //////////////////////////THREE.ShaderChunk.fog_fragment////////////////////////////
}
