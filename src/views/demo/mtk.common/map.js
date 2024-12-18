import * as maptalks from "maptalks";
import layerApi from "./layerManager"
import trackApi from "./trackApi"
import toolBarApi from "./toolBarManager"
import webApi from "./webApi"
import {
  getDrawSymbol
} from "./mapSymbol"
class mapApi {
  constructor() {
    this.config = window.mapConfig;
    this.Map = null; //地图
    this.glowInters = null;
  }

  /**
   * 地图初始化
   * @param {string} domId 地图容器dom id
   * @param {*} callFun 加载完回调
   */
  mapInit(domId, callFun) {
    this.Map && this.Map.remove();
    if (this.config.mapType == "arcgis")
      this.arcgisMapInit(domId, callFun);
    else
      this.baiduMap(domId, callFun)
  }

  /**
   * 百度地图初始化
   * @param {*} domId 地图容器
   * @param {*} callFun 加载完回调
   */
  baiduMap(domId, callFun) {
    let options = {
      center: this.config.mapCenter || [114.3087835, 30.5496509],
      zoom: this.config.initZoom || 13,
      minZoom: this.config.minZoom || 8,
      maxZoom: this.config.maxZoom || 18,
      view: {
        projection: "baidu"
      },
      attribution: false,
      baseLayer: new maptalks.TileLayer("baseMap", {
        urlTemplate: `http://online2.map.bdimg.com/tile/?qt=vtile&x={x}&y={y}&z={z}&styles=pl&scaler=1&udt=20190704`,
        subdomains: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
      }),
      layers: [
        new maptalks.TileLayer("baidu_yx_tile", {
          urlTemplate: "http://shangetu4.map.bdimg.com/it/u=x={x};y={y};z={z};v=009;type=sate&fm=46&udt=20200730",
          subdomains: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
        }).hide()
      ]
    };
    this.Map = new maptalks.Map(domId, options);
    layerApi.Map = this.Map;
    trackApi.Map = this.Map;
    toolBarApi.Map = this.Map;
    callFun && callFun(this.Map);
    this.Map.on("click", (e) => {
      console.log(e.coordinate);
    });
  }

  /**
   * arcgis地图初始化
   * @param {*} domId 地图容器
   * @param {*} callFun 加载完回调
   */
  arcgisMapInit(domId, callFun) {
    maptalks.SpatialReference.loadArcgis(
      `${this.config.baseMap}?f=pjson`,
      (err, conf) => {
        let view = conf.spatialReference;
        let center = [
          Number((view.fullExtent.xmax + view.fullExtent.xmin) / 2),
          Number((view.fullExtent.ymax + view.fullExtent.ymin) / 2),
        ];
        view.projection = "EPSG:4326";
        this.Map = new maptalks.Map(domId, {
          center: this.mapCenter || center,
          zoom: this.config.initZoom || 1,
          minZoom: this.config.minZoom || 1,
          maxZoom: this.config.maxZoom || 8,
          view: view,
          attribution: false,
          baseLayer: new maptalks.TileLayer("baseMap", {
            tileSystem: conf.tileSystem,
            tileSize: conf.tileSize,
            renderer: this.config.mapRenderer || "canvas",
            urlTemplate: `${this.config.baseMap}/tile/{z}/{y}/{x}`,
            repeatWorld: false
          }),
        });
        layerApi.Map = this.Map;
        trackApi.Map = this.Map;
        toolBarApi.Map = this.Map;
        this.Map.on("click", (e) => {
          console.log(e.coordinate);
        });
        callFun && callFun(this.Map);
        // this.drawGraphic()
        // this.trackShow();
        // setTimeout(() => {
        //   this.play();
        // }, 3000);
        // this.loadArea("421083001009")
      }
    );
  }

  /**
   * 绘制工具
   * @param {string} type 绘制类型 Point LineString Polygon
   * @param {function} drawEndCall 绘制结束返回绘制数据,格式为geojson
   * @param {Object} customSymbol 自定义样式
   * @param {function} clearLayer 是否清除图层
   * @param {function} isOnce 是否只绘制一次
   */
  drawGraphic(type = "Point", drawEndCall, customSymbol = {}, isOnce = true) {
    this.drawTool && this.drawTool.remove();
    let symbol = getDrawSymbol(type, customSymbol);
    this.drawTool = new maptalks.DrawTool({
      mode: type,
      symbol: symbol,
      once: isOnce
    }).addTo(this.Map);
    this.drawTool.on("drawend", (param) => {
      // param.geometry.addTo(layer);
      let graphic = param.geometry;
      let geojson = graphic.toGeoJSON();
      let obj = {
        geojson
      };
      this.addGraphic(obj);
      drawEndCall && drawEndCall(geojson);
    });
  }

  /**
   * 添加绘制工具绘制的的点线面数据
   * @param {Object} data 列表数据
   * @param {string} layerid 图层id
   * @param {Object} customSymbol 自定义样式
   * @param {boolean} clear 是否清除图层
   */
  addGraphic(data, layerid = "graphicLayer", customSymbol = {}, clear = true, fitZoom = true) {
    let layer = layerApi.getLayer(layerid);
    clear && layer.clear();
    let fun = data => {
      let graphic = maptalks.Geometry.fromJSON(data.geojson);
      graphic.config("smoothness", 0.02)
      let symbol = getDrawSymbol(graphic.getType())
      Object.assign(symbol, customSymbol);
      if (graphic) {
        graphic.setSymbol(symbol)
        graphic.addTo(layer);
      }
    }
    if (Array.isArray(data))
      data.forEach(item => fun(item))
    else
      fun(data)
    fitZoom && layerApi.layerToExtent(layerid);
  }

  /**
   * 添加标注
   * @param {Object} data 数据集
   * @param {Object} customSymbol 自定义样式
   * @param {function} callFun 点击回调
   */
  addMarker(data, customSymbol = {}, callFun = null) {
    let layer = layerApi.getLayer("markerLayer");
    layer.clear();
    let symbol = {
      markerFile: require("./img/marker.png")
    }
    Object.assign(symbol, customSymbol);
    let fun = data => {
      if (data.lon && data.lat) {
        if (data.symbol) symbol = data.symbol;
        new maptalks.Marker([data.lon, data.lat], {
          symbol: symbol,
          properties: data
        }).addTo(layer).on("click", e => {
          let graphic = e.target;
          let attributes = graphic.getProperties();
          callFun && callFun({
            graphic,
            attributes
          });
        })
      }
    }
    if (Array.isArray(data))
      data.forEach(item => fun(item))
    else
      fun(data)
    layerApi.layerToExtent("markerLayer");
  }

  /**
   * 添加线
   * @param {Object} data 数据集
   * @param {Object} customSymbol 自定义样式
   * @param {function} callFun 点击回调
   */
  addLine(data, customSymbol = {}, callFun = null) {
    let layer = layerApi.getLayer("lineLayer");
    layer.clear();
    let symbol = {
      lineColor: "#409EFF",
      lineWidth: 4,
    }
    Object.assign(symbol, customSymbol);
    let fun = data => {
      if (data.path) {
        if (data.symbol) symbol = data.symbol;
        new maptalks.LineString(data.path, {
          symbol: symbol,
          properties: data
        }).addTo(layer).on("click", e => {
          const attr = e.target.getProperties();
          callFun && callFun(attr);
        })
      }
    }
    if (Array.isArray(data))
      data.forEach(item => fun(item))
    else
      fun(data)
    layerApi.layerToExtent("lineLayer");
  }

  /**
   * 添加面
   * @param {Object} data 数据集
   * @param {Object} customSymbol 自定义样式
   * @param {function} callFun 点击回调
   */
  addPolygon(data, customSymbol = {}, callFun = null) {
    let layer = layerApi.getLayer("polygonLayer");
    layer.clear();
    let symbol = {
      lineColor: "#409EFF",
      lineWidth: 2,
      polygonFill: "#409EFF",
      polygonOpacity: 0.5,
    }
    Object.assign(symbol, customSymbol);
    let fun = data => {
      if (data.path) {
        if (data.symbol) symbol = data.symbol;
        new maptalks.Polygon(data.path, {
          symbol: symbol,
          properties: data
        }).addTo(layer).on("click", e => {
          const attr = e.target.getProperties();
          callFun && callFun(attr);
        })
      }
    }
    if (Array.isArray(data))
      data.forEach(item => fun(item))
    else
      fun(data)
    layerApi.layerToExtent("polygonLayer");
  }

  loadArea(code) {
    let where, url;
    if (code.length == 6) {
      where = `${this.config.QueryCodeField.Area} = '${code}'`;
      url = this.config.areaUrl;
    }
    if (code.length == 9) {
      where = `${this.config.QueryCodeField.Street} = '${code}'`;
      url = this.config.streetUrl;
    }
    if (code.length == 12) {
      where = `${this.config.QueryCodeField.Community} = '${code}'`;
      url = this.config.communityUrl;
    }
    if (code.length == "15") {
      where = `${this.config.QueryCodeField.Grid} = '${code}'`;
      url = this.config.gridUrl;
    }
    let layer = layerApi.getLayer("areaLayer");
    layer.clear();
    if (!code) return;
    layerApi.QueryDataByUrlAndWhere({
      where
    }, url, data => {
      if (!data.features.length) return;
      let features = data.features;
      features.forEach(item => {
        const geo = item.geometry.rings[0];
        new maptalks.Polygon(geo, {
          symbol: {
            lineColor: "#4A37BD",
            lineWidth: 3,
            polygonFill: "#4A37BD",
            polygonOpacity: 0.1
          }
        }).addTo(layer)
      })
      layerApi.layerToExtent("areaLayer")
    })
  }

  /**
   * 根据百度坐标查询地址(百度api)
   * @param {Array} coord 坐标(百度坐标)
   * @param {function} callFun 返回地址
   */
  getAddressByCoord(coordinate, callFun) {
    webApi.getAddressByLocation(coordinate[0], coordinate[1], data => {
      const address = data.sematic_description;
      callFun && callFun(address);
    })
  }

  /**
   * 根据坐标查询地址(兴趣点地图服务)
   * @param {Array} coordinate 坐标(坐标系为地图服务对应的坐标)
   * @param {function} callFun 返回地址
   */
  getPoiAddressByCoord(coordinate, callFun) {
    var circle = new maptalks.Circle(coordinate, 100);
    let extent = circle.getExtent();
    let option = {
      geometry: `{xmin:${extent.xmin},ymin:${extent.ymin},xmax:${extent.xmax}, ymax: ${extent.ymax}}`,
      geometryType: "esriGeometryEnvelope",
    };
    layerApi.QueryDataByUrlAndWhere(
      option,
      this.config.poiUrl,
      (data) => {
        if (data.features.length > 0) {
          let caldata = [];
          data.features.forEach((item) => {
            const attr = item.attributes,
              geo = item.geometry;
            let poicoord = [Number(geo.x), Number(geo.y)];
            let coord1 = new maptalks.Coordinate(coordinate);
            let coord2 = new maptalks.Coordinate([poicoord[0], poicoord[1]]);
            let _len = this.Map.computeLength(coord1, coord2);
            let locate = layerApi.calcOrientation(coord2, coord1); //方位
            let _name = `${attr[this.config.QueryFieldName["Poi"]]} ${locate}约${Math.round(_len)}米`;
            caldata.push({
              len: _len,
              name: _name,
            });
          });
          caldata.sort((a, b) => {
            return a.len - b.len;
          });
          callFun && callFun(caldata[0].name);
        } else callFun && callFun("");
      }
    );
  }

  /**
   * 根据坐标查询网格
   * @param {Array} coord 坐标
   * @param {function} callFun 返回地址
   */
  getGridByCoord(coord, callFun) {
    let where = {
      geometry: {
        x: coord[0],
        y: coord[1]
      }
    };
    layerApi.QueryDataByUrlAndWhere(where, this.config.gridUrl, (result) => {
      let attr;
      if (result.features.length) attr = result.features[0].attributes;
      else attr = {};
      callFun && callFun(attr);
    });
  }

  /**
   * 根据图层id和字段值查找要素
   * @param {string} layerid 图层id
   * @param {string} field 属性字段
   * @param {string} val 字段值
   */
  findGraphic(layerid, field, val) {
    return layerApi.findGraphic(layerid, field, val)
  }

  /**
   * 轨迹展示
   * @param {Array} path 轨迹点数据集
   * @param {Boolean} isGifMarker 
   * @param {Object} img 标注图片 require("../../xx.png") 
   */
   trackShow(path, isGifMarker = true, img) {
    // path = [{
    //     x: 113.46846298627199,
    //     y: 29.837399848849405
    //   },
    //   {
    //     x: 113.47211783837693,
    //     y: 29.83865620426048
    //   },
    //   {
    //     x: 113.47417369268598,
    //     y: 29.834620638394593
    //   },
    //   {
    //     x: 113.47737168827781,
    //     y: 29.8357247083013
    //   },
    //   {
    //     x: 113.47919911433029,
    //     y: 29.832069856196345
    //   }
    // ]
    trackApi.startTrackDraw(path, isGifMarker, img);
  }

  /**
   * 播放
   */
  play() {
    trackApi.play();
  }
  /**
   * 暂停
   */
  pause() {
    trackApi.pause();
  }
  /**
   * 重放
   */
  replay() {
    trackApi.replay();
  }
  /**
   * 快放
   */
  forward(speed) {
    trackApi.forward(speed);
  }
  /**
   * 慢放
   */
  rewind(speed) {
    trackApi.rewind(speed);
  }
  /**
   * 退出
   */
  quit() {
    trackApi.quit();
  }

  /**
   * 聚合
   * @param {Array} data 数据集
   * @param {Object} customSymbol 标注自定义样式
   * @param {function} clickCall 点击回调
   * @param {string} layerId 图层名称
   * @param {number} maxVisiableZoom 最大聚合层级
   */
  clusterLayer(data, customSymbol = {}, clickCall, layerId, maxVisiableZoom) {
    !layerId && (layerId = "ClusterLayer");
    let layer = layerApi.getClusterLayer(layerId, maxVisiableZoom);
    layer.clear();
    let symbol = {
      markerFile: require("./img/store.png"),
      // textSize: 14,
      // textDy: -33,
      // textName: "{name}",
      // textFill: '#ffa500',
      // textHaloOpacity: 0.7,
      // textHaloFill: "#fff",
      // textHaloRadius: 2,
      // textFaceName: "microsoft yahei,arial,sans-serif",
    }
    Object.assign(symbol, customSymbol);
    if (!data.length) return;
    data.forEach((item) => {
      if (item.lon && item.lat && !isNaN(Number(item.lon)) && !isNaN(Number(item.lon))) {
        let marker = new maptalks.Marker([Number(item.lon), Number(item.lat)], {
          symbol: symbol,
          properties: item
        });
        marker.addTo(layer).on("click", e => {
          this.currentVideoMarker = e.target;
          let graphic = e.target;
          let attributes = graphic.getProperties();
          clickCall && clickCall({
            graphic,
            attributes
          });
        })
      }
    });
    layerApi.layerToExtent(layerId)
  }

  showInfowindow(graphic, html, dx = 0, dy = 0, show = true) {
    let option = {
      single: true,
      custom: true,
      autoPan: true,
      content: html,
      dx,
      dy
    }
    let info = new maptalks.ui.InfoWindow(option);
    info.addTo(graphic);
    if (show) info.show();
  }

  /**
   * 热力图
   * @param {array} coords 坐标
   */
  loadHeatMap(coords) {
    // coords = [
    //   [114.3392540,30.5444257],
    //   [114.3392540,30.5444257],
    //   [114.3392540,30.5444257],
    //   [114.3392540,30.5444257]
    // ];
    let layerid = `HeatMapLayer`;
    let layer = this.Map.getLayer(layerid);
    let createlayer = () => {
      layer = layerApi.getHeatMapLayer(layerid, coords)
    };
    let setdata = () => {
      layer.clear();
      layer.show();
      layer.setData(coords);
    };
    if (layer) setdata();
    else createlayer();
  }

  /**
   * 要素'高亮'
   * @param {maptalks.Geometry} graphic 点线面
   * @param {string} glowColor 颜色
   */
  glowEffect(graphic, glowColor) {
    layerApi.glowEffect(graphic, glowColor)
  }

  clearGlowEffect() {
    layerApi.clearGlowEffect();
  }

  /**
   * 缩放到图层适应层级
   * @param {string} layerid 图层名称
   */
   fitToLayer(layerid) {
    layerApi.layerToExtent(layerid);
  }

  /**
   * 清除图层
   * @param {string} layerid 图层名称
   */
  clearLayerById(layerid) {
    layerApi.ClearLayerByLayerId(layerid);
  }
  /**
   * 清除所有图层
   * @param {string} layerid 图层名称
   */
  clearAllLayer() {
    layerApi.clearAllLayer();
  }
  /**
   * 显示图层
   * @param {string} layerid 图层名称
   */
  showLayer(layerid) {
    layerApi.ShowLayerById(layerid);
  }
  /**
   * 隐藏图层
   * @param {string} layerid 图层名称
   */
  hideLayer(layerid) {
    layerApi.HideLayerById(layerid);
  }
  mapAnimateTo(option, time, call) {
    layerApi.mapAnimateTo(option, time, call)
  }
  expMapImage(imgname, isSave) {
    toolBarApi.getMapImage(imgname, isSave)
  }
  zoomIn() {
    toolBarApi.zoomIn();
  }
  zoomOut() {
    toolBarApi.zoomOut();
  }

  initMeasureTool() {
    toolBarApi.initMeasureTool();
  }

  distanceOff(){
    toolBarApi.distanceOff()
  }
  distanceOn(){
    toolBarApi.distanceOn()
  }

}
export default new mapApi()