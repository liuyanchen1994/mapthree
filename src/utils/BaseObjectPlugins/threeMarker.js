import * as THREE from "three";
import * as maptalks from "maptalks";
import { BaseObject } from "maptalks.three";
//default values
var OPTIONS = {
  markerWidth: 30,
  markerHeight: 30,
  altitude: 0,
  isRotate: false,
  isUpDown: false,
  interactive: false,
  status: true,
  scale: false,
  scaleStatus: true,
  scaleZ: 0
};

class threeMarker extends BaseObject {
  constructor(coordinate, options, material, layer) {
    options = maptalks.Util.extend({}, OPTIONS, options, {
      layer,
      coordinate
    });
    super();
    this._initOptions(options);
    const { altitude, markerWidth, markerHeight } = options;
    //generate geometry
    let w = layer.distanceToVector3(markerWidth, markerWidth).x;
    let h = layer.distanceToVector3(markerHeight, markerHeight).x;
    const geometry = new THREE.PlaneBufferGeometry(w, h, 2);

    this._createMesh(geometry, material);

    // this._createGroup();
    // const mesh = new THREE.Mesh(geometry, material);
    // this.getObject3d().add(mesh);

    //set object3d position
    const z = layer.distanceToVector3(altitude, altitude).x;
    const jz = h / 2;
    const position = layer.coordinateToVector3(coordinate, z + jz);
    this.getObject3d().position.copy(position);
    this.getObject3d().rotation.x = Math.PI / 2;
  }

  _animation() {
    const options = this.getOptions();
    // const ring = this.getObject3d().children[0];
    const ring = this.getObject3d();
    const speed = options.speed;
    const isRotate = options.isRotate;
    //旋转
    if (speed && isRotate) ring.rotation.y += THREE.Math.degToRad(speed);

    //上下浮动
    if (options.isUpDown) {
      options.status == true
        ? (options.altitude += 1)
        : (options.altitude -= 1);
      if (options.altitude > 100 + options.markerHeight) options.status = false;
      if (options.altitude <= options.markerHeight / 2) options.status = true;
      const z = this.getLayer().distanceToVector3(
        options.altitude,
        options.altitude
      ).x;
      this.getObject3d().position.z = z;
      this._initOptions(options);
    }
    if (options.scale) {
      // options.scaleStatus == true
      //   ? (options.scaleZ += 1)
      //   : (options.scaleZ -= 1);
      // if (options.scaleZ > 100 + options.markerHeight)
      //   options.scaleStatus = false;
      // if (options.scaleZ <= options.markerHeight / 2)
      //   options.scaleStatus = true;
      // const z1 = this.getLayer().distanceToVector3(
      //   options.scaleZ,
      //   options.scaleZ
      // ).x;
    }
  }
}
export default threeMarker;
