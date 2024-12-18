
precision lowp float;
precision lowp int;
varying vec2 vUv;
uniform float time;
uniform vec3 color;
uniform float opacity;

#define pi 3.1415926535
#define PI2RAD 0.01745329252
#define TWO_PI (2. * PI)

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

void main() {
    vec2 uv = vUv - 0.5;
    vec2 uv2 = uv;

    vec2 pos = vec2(0.0, 0.0);
    
    float dist = length(uv - pos);// * sin(3.141592 * time);

    float timing = time;

    float rippleRadius = timing;

    float diff = rippleRadius - dist;

    float func = sin(pi * diff);

    uv += uv * func * 0.1;

    float stripes = 10.0;
    float thickness = 10.0;
    float sharpness = 2.0;
    vec2 a = sin(stripes * 0.5 * pi * uv - pi/2.0);
    vec2 b = abs(a);

    vec3 colorS = vec3(0.0);
    colorS += 1.0 * exp(-thickness * b.x * (0.8 + 0.5 * sin(pi * time)));
    colorS += 1.0 * exp(-thickness * b.y);
    colorS += 0.5 * exp(-(thickness/4.0) * sin(b.x));
    colorS += 0.5 * exp(-(thickness/3.0) * b.y);

    float ddd = exp(-5.5 * clamp(pow(dist, 3.0), 0.0, 1.0));

    gl_FragColor = vec4(colorS * ddd * color, 1.0);

    float dir = length(uv2);
    float ratio = 0.25;
    if (dir < ratio) {
        gl_FragColor.a *= opacity;
    } else {
        gl_FragColor.a *= mix(opacity, 0., (dir - ratio) / (0.5 - ratio));
    }
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
