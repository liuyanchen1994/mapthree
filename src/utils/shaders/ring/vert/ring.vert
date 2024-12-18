precision lowp float;
precision lowp int;
varying vec2 vUv;

//////////////////////////THREE.ShaderChunk.fog_pars_vertex////////////////////////////
#ifdef USE_FOG
	varying float fogDepth;
#endif
//////////////////////////THREE.ShaderChunk.fog_pars_vertex////////////////////////////

void main() {
  vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        
  //////////////////////////THREE.ShaderChunk.fog_vertex////////////////////////////
  #ifdef USE_FOG
      fogDepth = -mvPosition.z;
  #endif
  //////////////////////////THREE.ShaderChunk.fog_vertex////////////////////////////
}