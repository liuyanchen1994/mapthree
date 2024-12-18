uniform vec3 iResolution;           // viewport resolution (in pixels)
uniform float time;                 // shader playback time (in seconds)
varying vec2 vUv;
mat2 rotate2d(float angle){
    
    return mat2(
        cos(angle), -sin(angle),
        sin(angle), cos(angle));
}


float drawRectangle( vec2 uv, vec2 position, vec2 size){

   float rectangle = step(position.x - size.x/2., uv.x) - step(position.x - size.x/2. + size.x,uv.x);
    rectangle *= step(position.y - (size.y/2.), uv.y) - step(position.y + (size.y/2.), uv.y);
    return rectangle;
}

float circle(vec2 uv, vec2 pos, float radius){ // Standard Circle
    
    return float(distance(uv, pos) < radius);
}


float circle2(vec2 uv, vec2 pos, float radius, float vignette){	//Vignette For Circle
    
    return float(smoothstep(radius*vignette, radius, distance(uv, pos)));
}

float circle3(vec2 uv, vec2 pos, float radius){ //Circle Limiter
    
    
    return float(.1-smoothstep(radius, radius+0.01, distance(uv, pos)));
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    // Normalized pixel coordinates (from 0 to 1)
    // vec2 uv = fragCoord/iResolution.xy;
	vec2 uv = vUv;
	float ratio = iResolution.x/iResolution.y;
    uv.x *= ratio;
    
    vec2 uv2 = uv;
    
    // centers pivot point
    vec2 pos = vec2(0.5*ratio,0.5);
   	vec2 pos2 = vec2(0.5*ratio,1.2);
    // translates the shape to center origin
    uv -= pos;
    uv2 -= pos2;
    
    //rotations/scales
    
  	uv2 *= rotate2d(1.5708*.5);
    
    // translates back to the shape
    uv += pos;
    uv2 += pos2;
    
    float radius = .48;
    float radius2 = sin(time*5.)/40. + 0.78; //*.2 + .4
    float radius3 = fract(time / 2.4);
    
    vec3 lightBlue = vec3(0.27,0.67,1.0);
    
    vec3 color;
    
    
    // Radar
    
    color += vec3(circle2(uv, pos, .5, 0.8)) + vec3(circle3(uv,pos,.130));
    
    color += vec3(circle2(uv, pos, radius2, 0.5) + vec3(circle3(uv,pos,radius)));
    
    color += vec3(circle3(uv, pos,radius));
    
    // Pulse
    
    color += vec3(circle2(uv, pos,radius3, 0.5)) + vec3 (circle3(uv, pos, radius3)) + vec3(circle3(uv,pos,radius)) ;
    
    // Cone of Vision
    
    color += vec3(drawRectangle(uv2, pos2, vec2(1.,1.)) + vec3(circle3(uv,pos,radius)));
    color *= lightBlue;
    
    // Output to screen
    fragColor = vec4(color,1.0);
}

void main(){
    mainImage(gl_FragColor,gl_FragCoord.xy);
}