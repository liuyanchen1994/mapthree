import * as THREE from "three";
import * as maptalks from "maptalks";
import { BaseObject } from "maptalks.three";
var REVISION = parseInt(THREE.REVISION);
var OPTIONS = { altitude: 0, speed: 0.015 };
class RippleWalls extends BaseObject {
  constructor(polygons, options, material, layer) {
    options = maptalks.Util.extend({}, OPTIONS, options, {
      layer,
      polygons,
    });
    super();

    this._initOptions(options);
    const { altitude } = options;
    let geometries = [];
    for (let i = 0; i < polygons.length; i++) {
      let height = polygons[i].getProperties().height;
      const geometry = this.createGeometry(polygons[i], layer, height);
      geometries.push(geometry);
    }
    // let _geometries = this.mergeBufferGeometries(geometries);
    this._createMesh(geometries, material);

    //set object3d position
    const z = layer.distanceToVector3(altitude, altitude).x;
    let center = this.getPolygonsCenter(polygons);
    var v = layer.coordinateToVector3(center, z);
    this.getObject3d().position.copy(center);
  }

  getPolygonsCenter(polygons) {
    var len = polygons.length;
    var minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;

    for (var i = 0; i < len; i++) {
      var polygon = polygons[i];

      var _center = polygon.getCenter();

      var x = void 0,
        y = void 0;

      if (Array.isArray(_center)) {
        x = _center[0];
        y = _center[1];
      } else if (_center instanceof maptalks.Coordinate) {
        x = _center.x;
        y = _center.y;
      }

      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
    var center = new maptalks.Coordinate((minX + maxX) / 2, (minY + maxY) / 2);
    return center;
  }

  createGeometry(polygon, layer, height) {
    let coords = polygon.getCoordinates()[0];
    let lastcoord = coords[0];
    let newcoords = [...coords, ...[lastcoord], ...[lastcoord]];
    polygon.setCoordinates(newcoords);
    height = layer.distanceToVector3(height, height).x;
    const centerPt = layer.coordinateToVector3(polygon.getCenter());
    const wall = polygon.getShell();
    const positionsV = [];
    let joinLonLat = [];
    wall.forEach((lnglat) => {
      const polyPice = layer.coordinateToVector3(lnglat).sub(centerPt);
      positionsV.push(polyPice);
      joinLonLat.push(polyPice.x);
      joinLonLat.push(polyPice.y);
    });
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
  }

  mergeBufferGeometries(geometries) {
    var attributes = {},
      attributesLen = {};

    for (var i = 0; i < geometries.length; ++i) {
      var geometry = geometries[i];

      for (var name in geometry) {
        if (attributes[name] === undefined) {
          attributes[name] = [];
          attributesLen[name] = 0;
        }

        attributes[name].push(geometry[name]);
        attributesLen[name] += geometry[name].length;
      }
    } // merge attributes

    var mergedGeometry = {};
    var indexOffset = 0;
    var mergedIndex = [];

    for (var _name in attributes) {
      if (_name === "indices") {
        var _indices = attributes[_name];

        for (var _i = 0, len = _indices.length; _i < len; _i++) {
          var index = _indices[_i];

          for (var j = 0, len1 = index.length; j < len1; j++) {
            mergedIndex.push(index[j] + indexOffset);
          }

          indexOffset += attributes["position"][_i].length / 3;
        }
      } else {
        var mergedAttribute = this.mergeBufferAttributes(
          attributes[_name],
          attributesLen[_name]
        );
        if (!mergedAttribute) return null;
        mergedGeometry[_name] = mergedAttribute;
      }
    }

    // mergedGeometry["indices"] = new Uint32Array(mergedIndex);
    var position = mergedGeometry.position,
      // normal = mergedGeometry.normal,
      uv = mergedGeometry.uv;
    // indices = mergedGeometry.indices;
    var bufferGeomertry = new THREE.BufferGeometry();
    bufferGeomertry.attributes["position"] = new THREE.BufferAttribute(position, 3);
    bufferGeomertry.attributes["uv"] = new THREE.BufferAttribute(uv, 2);
    // this.addAttribute(
    //   bufferGeomertry,
    //   "position",
    //   new THREE.BufferAttribute(position, 3)
    // );

    // if (uv && uv.length) {
    //   this.addAttribute(
    //     bufferGeomertry,
    //     "uv",
    //     new THREE.BufferAttribute(uv, 2)
    //   );
    // }

    // bufferGeomertry.setIndex(new THREE.BufferAttribute(indices, 1));
    return bufferGeomertry;
  }

  mergeBufferAttributes(attributes, arrayLength) {
    var array = new Float32Array(arrayLength);
    var offset = 0;

    for (var i = 0; i < attributes.length; ++i) {
      array.set(attributes[i].array, offset);
      offset += attributes[i].array.length;
    }

    return array;
  }

  /**
   *
   * @param {THREE.BufferGeometry} bufferGeomertry
   * @param {String} key
   * @param {*} value
   */

  addAttribute(bufferGeomertry, key, value) {
    if (REVISION > 109) {
      bufferGeomertry.setAttribute(key, value);
    } else {
      bufferGeomertry.addAttribute(key, value);
    }

    return bufferGeomertry;
  }

  _animation() {
    const wall = this.getObject3d();
    const speed = this.getOptions().speed;
    if (wall.material.uniforms.time) wall.material.uniforms.time.value += speed;
  }
}
export default RippleWalls;
