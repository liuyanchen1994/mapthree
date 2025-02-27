precision lowp float;
precision lowp int;
varying vec2 vUv;
uniform float time;
uniform vec3 color;
uniform float opacity;

//////////////////////////THREE.ShaderChunk.common////////////////////////////
#define pi 3.14159265359
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
 
float vDrop(vec2 uv,float t) {
  uv.x = uv.x*50.0;
  float dx = fract(uv.x);
  uv.x = floor(uv.x);
  uv.y *= 0.05;
  float o=sin(uv.x*215.4);
  float s=cos(uv.x*33.1)*.3 +.7;
  float trail = mix(95.0,35.0,s);
  float yv = fract(uv.y + t*s + o) * trail;
  yv = 1.0/yv;
  yv = smoothstep(0.0,1.0,yv*yv);
  yv = sin(yv*pi)*(s*5.0);
  float d2 = sin(dx*pi);
  return yv*(d2*d2);
}

void main() {
  vec2 uv = vUv - 0.5;
  float d = length(uv)+0.5;
  uv = vec2(atan(uv.x, uv.y) / pi, 2.5 / d);
  float t =  time*0.4;
  vec3 col = vec3(1.,1.,1.) * vDrop(uv,t);
  gl_FragColor = vec4(col*(d*d), mix(opacity, -0.6, d - 0.5));
  gl_FragColor.rgb *= color;
  
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