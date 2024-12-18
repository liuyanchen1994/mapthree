import * as maptalks from "maptalks"
import distance from "@turf/distance";
import buffer from "@turf/buffer";
import intersect from "@turf/intersect";
import area from "@turf/area";
//空间相关计算

/**
 * 计算多个坐标点之间的距离
 * @param {Array} coords 坐标集
 * 例如: [[116.34, 39.98], [116.40, 39.90]]
 * @returns {Number} distance 距离
 */
 export function getDistanceByCoords(coords) {
  let distance = 0;
  for (let i = 0; i < coords.length - 1; i++) {
    distance += getDistance(coords[i], coords[i + 1]);
  }
  return distance;
}
//计算两点之间的距离
function getDistance(coord1, coord2) {
  const p1 = new maptalks.Marker(coord1).toGeoJSON();
  const p2 = new maptalks.Marker(coord2).toGeoJSON();
  const len = distance(p1, p2, {
    units: 'meters'
  });
  return len;
}
/**
 * 根据线以及半径计算缓冲区
 */
export function getBufferByLine(line, radius) {
  let linestring = new maptalks.LineString(line);
  let buff = buffer(linestring.toGeoJSON(), radius, { units: "meters" });
  let polygon = new maptalks.Polygon(buff.geometry.coordinates);
  return polygon.toGeoJSON();
}

/**
 * 计算两个面的交集并返回交集的面
 * @param {Object} polygon1 面 geojson
 * @param {Object} polygon2 面 geojson
 * @returns {Object} 交集面 geojson
 */
export function getIntersection(polygon1, polygon2) {
  let polygonIntersects = intersect(polygon1, polygon2);
  return polygonIntersects;
  // let polygonArea = area(polygonIntersects);
}

/**
 * 计算面的面积(平方米)
 * @param {Object} polygon 面 geojson
 * @returns {Number} 面积-平方米
 */
export function getArea(polygon) {
  let polygonArea = area(polygon);
  return polygonArea;
}