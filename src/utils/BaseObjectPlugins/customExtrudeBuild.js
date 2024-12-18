import * as THREE from "three";
import * as maptalks from "maptalks";
import { BaseObject } from "maptalks.three";
var OPTIONS = {
  altitude: 0,
  speed: 0.015,
  height: 10
};
/**
 * 自定义拔高建筑--解决点击事件 gpuclick
 */
class ExtrudeBuild extends BaseObject {
  constructor(polygon, geometry, material, layer) {
    let options = maptalks.Util.extend(
      {},
      OPTIONS,
      {},
      {
        layer
      }
    );
    super();
    //Initialize internal configuration
    // https://github.com/maptalks/maptalks.three/blob/1e45f5238f500225ada1deb09b8bab18c1b52cf2/src/BaseObject.js#L135
    this._initOptions(options);
    const { altitude } = options;
    //generate geometry
    //Initialize internal object3d
    // https://github.com/maptalks/maptalks.three/blob/1e45f5238f500225ada1deb09b8bab18c1b52cf2/src/BaseObject.js#L140
    this._createMesh(geometry, material);

    //set object3d position
    const z = layer.distanceToVector3(altitude, altitude).x;
    const position = layer.coordinateToVector3(polygon.getCenter(), z);
    this.getObject3d().position.copy(position);
    this._setPickObject3d();
    this._init();
  }
  _init() {
    const pick = this.getLayer().getPick();
    this.on("add", () => {
      pick.add(this.pickObject3d);
    });
    this.on("remove", () => {
      pick.remove(this.pickObject3d);
    });
  }

  _setPickObject3d() {
    const geometry = this.getObject3d().geometry.clone();
    const pick = this.getLayer().getPick();
    const color = pick.getColor();
    const material = new THREE.MeshBasicMaterial();
    material.color.set(color.getStyle());
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(this.getObject3d().position);

    const colorIndex = color.getHex();
    mesh._colorIndex = colorIndex;
    this.setPickObject3d(mesh);
  }

  identify() {
    return this.picked;
  }
}
export default ExtrudeBuild;
