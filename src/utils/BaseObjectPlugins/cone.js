import * as THREE from "three";
import * as maptalks from "maptalks";
import { BaseObject } from "maptalks.three";
//default values
var OPTIONS = {
  radius: 1,
  height: 10,
  altitude: 0,
  speed: 0.0025,
  interactive: false
};
/**
 * 圆锥
 */
class cone extends BaseObject {
  constructor(coordinate, options, material, layer) {
    options = maptalks.Util.extend({}, OPTIONS, options, {
      layer,
      coordinate
    });
    super();
    this._initOptions(options);
    const { altitude, radius, height } = options;
    //generate geometry
    let r = layer.distanceToVector3(radius, radius).x;
    let h = layer.distanceToVector3(height, height).x;
    const geometry = new THREE.ConeGeometry(r, h, 100, 100);

    this._createMesh(geometry, material);

    //set object3d position
    const z = layer.distanceToVector3(altitude, altitude).x;
    const jz = h / 2;
    const position = layer.coordinateToVector3(coordinate, jz + z);
    this.getObject3d().position.copy(position);
    this.getObject3d().rotation.x = Math.PI / 2;
  }

  _animation() {
    const obj = this.getObject3d();
    const speed = this.getOptions().speed;
    if (obj.material.isShaderMaterial && obj.material.uniforms.time)
      obj.material.uniforms.time.value += speed;
  }
}
export default cone;
