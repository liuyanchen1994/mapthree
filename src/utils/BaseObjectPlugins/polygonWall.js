import * as THREE from "three";
import * as maptalks from "maptalks";
import { BaseObject } from "maptalks.three";
import { BufferGeometryUtils } from "three/examples/jsm/utils/BufferGeometryUtils.js";
var OPTIONS = {
  altitude: 0,
  speed: 0.015,
  height: 10,
  isAnimate: true
};
class PolygonWall extends BaseObject {
  constructor(polygon, options, material, layer) {
    options = maptalks.Util.extend({}, OPTIONS, options, {
      layer,
      polygon,
    });
    super();

    this._initOptions(options);
    const { altitude, height } = options;
    const geometries = this.createGeometry(polygon, layer, height);
    //合并几何体
    const mergeGeometry = BufferGeometryUtils.mergeBufferGeometries(geometries);
    this._createMesh(mergeGeometry, material);

    //set object3d position
    const z = layer.distanceToVector3(altitude, altitude).x;
    const position = layer.coordinateToVector3(polygon.getCenter(), z);
    this.getObject3d().position.copy(position);
  }
  createGeometry(polygon, layer, height) {
    height = layer.distanceToVector3(height, height).x;
    const centerPt = layer.coordinateToVector3(polygon.getCenter());
    let geometries = [];
    if (polygon instanceof maptalks.Polygon) {
      polygon = this.repairPolygon(polygon);
      let geometry = this.dealGeometry(polygon, layer, centerPt, height);
      geometries.push(geometry);
    } else {
      const lnglats = polygon.getCoordinates();
      for (let i = 0, len = lnglats.length; i < len; i++) {
        let polygon = lnglats[i];
        if (Array.isArray(polygon)) {
          polygon = new maptalks.Polygon(lnglats[i]);
          polygon = this.repairPolygon(polygon);
        }
        let geometry = this.dealGeometry(polygon, layer, centerPt, height);
        geometries.push(geometry);
      }
    }
    return geometries;
  }
  dealGeometry(polygon, layer, centerPt, height) {
    const coordinates = polygon.getShell();
    const positionsV = [];
    let joinLonLat = [];
    coordinates.forEach((lnglat) => {
      const polyPice = layer.coordinateToVector3(lnglat).sub(centerPt);
      positionsV.push(polyPice);
      joinLonLat.push(polyPice.x);
      joinLonLat.push(polyPice.y);
    });
    let geometry = this.getGeometry(positionsV, joinLonLat, height);
    return geometry;
  }

  //处理面断开的情况
  repairPolygon(polygon) {
    if (Array.isArray(polygon.getCoordinates())) {
      let coords = polygon.getCoordinates()[0];
      let lastcoord = coords[0];
      let newcoords = [...coords, ...[lastcoord], ...[lastcoord]];
      polygon.setCoordinates(newcoords);
    }
    return polygon;
  }
  
  getGeometry(positionsV, joinLonLat, height) {

    for (
      var a = joinLonLat, polySub = [], o = 0, s = 0;
      o < a.length - 2;
      o += 2, s++
    )
      0 === o
        ? (polySub[0] = Math.sqrt(
            (a[2] - a[0]) * (a[2] - a[0]) + (a[3] - a[1]) * (a[3] - a[1])
          ))
        : (polySub[s] =
            polySub[s - 1] +
            Math.sqrt(
              (a[o + 2] - a[o]) * (a[o + 2] - a[o]) +
                (a[o + 3] - a[o + 1]) * (a[o + 3] - a[o + 1])
            ));
    let pos = [],
      uvs = [];
    let polylenth = polySub[polySub.length - 1];
    for (
      let d = 0, u = pos.length, p = uvs.length;
      d < positionsV.length - 1;
      d++
    ) {
      let pv1 = positionsV[d],
        pv2 = positionsV[d + 1],
        polyPice = polySub[d];
      (pos[u++] = pv1.x),
        (pos[u++] = pv1.y),
        (pos[u++] = 0),
        (uvs[p++] = 0 === d ? 0 : polySub[d - 1] / polylenth),
        (uvs[p++] = 0),
        (pos[u++] = pv2.x),
        (pos[u++] = pv2.y),
        (pos[u++] = 0),
        (uvs[p++] = polyPice / polylenth),
        (uvs[p++] = 0),
        (pos[u++] = pv1.x),
        (pos[u++] = pv1.y),
        (pos[u++] = height),
        (uvs[p++] = 0 === d ? 0 : polySub[d - 1] / polylenth),
        (uvs[p++] = 1),
        (pos[u++] = pv1.x),
        (pos[u++] = pv1.y),
        (pos[u++] = height),
        (uvs[p++] = 0 === d ? 0 : polySub[d - 1] / polylenth),
        (uvs[p++] = 1),
        (pos[u++] = pv2.x),
        (pos[u++] = pv2.y),
        (pos[u++] = 0),
        (uvs[p++] = polyPice / polylenth),
        (uvs[p++] = 0),
        (pos[u++] = pv2.x),
        (pos[u++] = pv2.y),
        (pos[u++] = height),
        (uvs[p++] = polyPice / polylenth),
        (uvs[p++] = 1);
    }
    var geometry = new THREE.BufferGeometry();
    geometry.attributes["position"] = new THREE.BufferAttribute(
      new Float32Array(pos),
      3
    );
    geometry.attributes["uv"] = new THREE.BufferAttribute(
      new Float32Array(uvs),
      2
    );
    // geometry.setAttribute(
    //   "position",
    //   new THREE.BufferAttribute(new Float32Array(pos), 3)
    // );
    // geometry.setAttribute(
    //   "uv",
    //   new THREE.BufferAttribute(new Float32Array(uvs), 2)
    // );
    return geometry;
  };
  
  animateShow(options = {}, cb) {
    if (this._showPlayer) {
      this._showPlayer.cancel();
    }
    if (maptalks.Util.isFunction(options)) {
      options = {};
      cb = options;
    }
    const duration = options["duration"] || 1000,
      easing = options["easing"] || "out";
    const player = (this._showPlayer = maptalks.animation.Animation.animate(
      {
        scale: 1,
      },
      {
        duration: duration,
        easing: easing,
      },
      (frame) => {
        const scale = frame.styles.scale;
        // if (scale > 0) {
        this.getObject3d().scale.z = scale;
        // this.getObject3d().scale.set(scale, scale, scale);
        // }
        if (cb) {
          cb(frame, scale);
        }
      }
    ));
    player.play();
    return player;
  }

  _animation() {
    const object = this.getObject3d();
    const speed = this.getOptions().speed;
    let isAnimate = this.getOptions().isAnimate;
    if (object.material.uniforms && object.material.uniforms.time)
      isAnimate && (object.material.uniforms.time.value += speed)
  }
  
  setAltitude(altitude) {
    const z = this.getLayer().distanceToVector3(altitude, altitude).x;
    this.getObject3d().position.z = z;
  }
}
export default PolygonWall;
