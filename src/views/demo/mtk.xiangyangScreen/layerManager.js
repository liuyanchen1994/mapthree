import * as maptalks from "maptalks"
class layerManager {
  constructor() {
    this.Map = null;
    this.glowInters = [];
  }

  /**
   * 获取图层，不存在则创建图层
   * @param {string} layerid 图层id
   * @param {object} map 地图对象
   * @returns {maptalks.VectorLayer}
   */
  getLayer(layerid) {
    if (!this.Map) return;
    let layer = this.Map.getLayer(layerid);
    !layer && (
      layer = new maptalks.VectorLayer(layerid, {
        forceRenderOnMoving: true,
        forceRenderOnRotating: true,
        forceRenderOnZooming: true,
        enableSimplify: false
      }).addTo(this.Map)) //创建图层
    return layer;
  }
  /**
   * 根据图层id和字段值查找要素
   * @param {string} layerid 图层id
   * @param {string} field 属性字段
   * @param {string} val 字段值
   */
  findGraphic(layerid, field, val) {
    this.clearGlowEffect();
    let layer = this.getLayer(layerid);
    if (!layer.getGeometries().length) return;
    let graphics = layer.filter(x => x.getProperties()[field] == val);
    if (!graphics.length) return;
    this.glowEffect(graphics[0]);
    let coord;
    if (graphics[0].getType() != "Point")
      coord = graphics[0].getCenter();
    else coord = graphics[0].getCoordinates();
    this.Map.panTo(coord);
    return graphics[0];
  }

  /**
   * 要素'高亮'
   * @param {maptalks.Geometry} graphic 点线面
   * @param {string} glowColor 颜色
   */
  glowEffect(graphic, glowColor = "#f00") {
    graphic.bringToFront();
    if (this.glowInters.length) {
      let status = this.glowInters.some(item => {
        return item.marker.getProperties() == graphic.getProperties();
      });
      if (status) return;
    }
    let status = true,
      shadowSize = 0;
    let glowinter = setInterval(() => {
      status == true ? shadowSize++ : shadowSize--;
      if (shadowSize > 20) status = false;
      if (shadowSize == 1) status = true;
      graphic.updateSymbol({
        shadowBlur: shadowSize,
        shadowColor: glowColor
      });
      let data = {
        marker: graphic,
        inter: glowinter
      };
      this.glowInters.push(data);
    }, 50);
  }

  clearGlowEffect() {
    if (this.glowInters.length) {
      this.glowInters.forEach(item => {
        item.marker.updateSymbol({
          shadowBlur: 0
        });
        clearInterval(item.inter);
      });
      this.glowInters = [];
    }
  }


  ClearLayerByLayerId(layerid) {
    let layer = this.Map.getLayer(layerid);
    layer && layer.clear();
  }

  clearAllLayer() {
    // var layers = this.Map.getLayers(layer => {
    //   return (layer instanceof maptalks.VectorLayer);
    // });
    var layers = this.Map.getLayers();
    layers.forEach(layer => layer.clear())
  }

  ShowLayerById(layerid) {
    let layer = this.Map.getLayer(layerid);
    layer && layer.show();
  }

  HideLayerById(layerid) {
    let layer = this.Map.getLayer(layerid);
    layer && layer.hide();
  }

  removeLayerByid(layerid) {
    let layer = this.Map.getLayer(layerid);
    layer && layer.remove();
  }

  SetLayerTopIndex(layerid) {
    let layer = this.Map.getLayer(layerid);
    layer && layer.bringToFront();
  }

  layerToExtent(layerid) {
    let layer = this.getLayer(layerid);
    if (!layer) return;
    if (layer.getGeometries().length == 0) return;
    let Extent = layer.getExtent();
    if (!Extent) return;
    let coord = Extent.getCenter();
    let zoom = this.Map.getFitZoom(Extent);
    this.Map.animateTo({
      center: coord,
      zoom: zoom
    }, {
      duration: 1000
    });
  }

  QueryDataByUrlAndWhere(option, url, callfun) {
    let _url = url + this.parseQueryString(option);
    maptalks.Ajax.getJSON(
      _url, {
        jsonp: true,
      },
      (obj, data) => {
        callfun(data);
      }
    );
  }

  parseQueryString(option) {
    let queryString = '/query?';
    let geometry = option.geometry || '';
    let where = option.where || '1=1';
    let condition = {
      where: encodeURIComponent(where),
      geometry: geometry instanceof Object ? JSON.stringify(geometry) : geometry,
      geometryType: option.geometryType || 'esriGeometryPoint',
      inSR: option.inSR || '',
      spatialRel: option.esriSpatialRelIntersects || 'esriSpatialRelIntersects',
      relationParam: option.relationParam || '',
      objectIds: option.objectIds || '',
      time: option.time || '',
      returnCountOnly: option.returnCountOnly || false,
      returnGeometry: option.returnGeometry || true,
      maxAllowableOffset: option.maxAllowableOffset || '',
      outSR: option.outSR || '',
      text: option.text || '',
      outFields: option.outFields || '*',
      orderByFields: option.orderByFields || ''
    };
    for (let p in condition) {
      queryString += "&" + p + "=" + condition[p];
    }
    queryString += "&f=pjson";
    return queryString;
  }


  /**
   * 根据坐标计算方位
   * @param {maptalks.Coordinate} point 
   * @param {maptalks.Coordinate} nextPoint 
   * @returns {string} 方向描述
   */
  calcOrientation(point, nextPoint) {
    const vector = [point.x - nextPoint.x, point.y - nextPoint.y];
    const k = (point.y - nextPoint.y) / (point.x - nextPoint.x);
    const thita = Math.atan(k);
    //X轴上
    if (vector[0] > 0 && vector[1] == 0) return "正东方向";
    //第一象限
    else if (vector[0] > 0 && vector[1] > 0) return "西南方向";
    //Y轴
    else if (vector[0] == 0 && vector[1] > 0) return "正北方向";
    //第二象限
    else if (vector[0] < 0 && vector[1] > 0) return "东南方向";
    //X轴反方向
    else if (vector[0] < 0 && vector[1] == 0) return "正西方向";
    //第三象限
    else if (vector[0] < 0 && vector[1] < 0) return "东北方向";
    //Y轴负方向
    else if (vector[0] == 0 && vector[1] > 0) return "正南方向";
    //第四象限
    else if (vector[0] > 0 && vector[1] < 0) return "西北方向";
    else if (vector[0] == 0 && vector[1] == 0) return "";
  }

  GetGuid(len, radix) {
    let chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
    let uuid = [],
      i;
    radix = radix || chars.length;
    if (len) {
      // Compact form
      for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix];
    } else {
      // rfc4122, version 4 form
      let r;
      // rfc4122 requires these characters
      uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
      uuid[14] = '4';
      // Fill in random data.  At i==19 set the high bits of clock sequence as
      // per rfc4122, sec. 4.1.5
      for (i = 0; i < 36; i++) {
        if (!uuid[i]) {
          r = 0 | Math.random() * 16;
          uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
        }
      }
    }
    return uuid.join('') + "guid";
  }

  // 字符串指定长度截取
  getByTextLens(str, len) {
    if (!str) return "";
    let lens = 0;
    let strText = "";
    for (var i = 0; i < str.length; i++) {
      var s = str.charAt(i);
      strText += s;
      if (s.match(/[^\x00-\xff]/gi) != null) {
        lens += 2;
      } else {
        lens += 1;
      }
      if (i == str.length - 1 && lens <= len) {
        return strText;
      } else if (lens > len) {
        let strLens = strText.length;
        let strLast = strText.substr(strLens - 1);
        let nIdx = strLast.match(/[^\x00-\xff]/gi) != null ? 2 : 2;
        strText = strText.substring(0, strLens - nIdx) + "...";
        return strText;
      }
    }
  }
}
export default new layerManager();