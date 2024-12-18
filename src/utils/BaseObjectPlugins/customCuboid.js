import * as THREE from "three";
import * as maptalks from "maptalks";
import { BaseObject } from "maptalks.three";
//default values
var OPTIONS = {
  length: 50,
  width: 50,
  height: 100,
  altitude: 0,
  interactive: true,
};
/**
 * 长方体
 */
class customCuboid extends BaseObject {
  constructor(coordinate, options, material, layer) {
    options = maptalks.Util.extend({}, OPTIONS, options, {
      layer,
      coordinate,
    });
    super();
    
    this._initOptions(options);
    const { length, width, height, altitude } = options;
    //generate geometry
    const w = layer.distanceToVector3(width, width).x;
    const h = layer.distanceToVector3(height, height).x;

    var geometry = new THREE.BoxGeometry(length, width, height);

    this._createMesh(geometry, material);
    //set object3d position
    const z = layer.distanceToVector3(altitude, altitude).x;
    const position = layer.coordinateToVector3(coordinate, z);
    this.getObject3d().position.copy(position);
  }

  setCoordinates(coordinate) {
    const position = this.getLayer().coordinateToVector3(coordinate);
    this.getObject3d().position.copy(position);
  }
}
export default customCuboid;
