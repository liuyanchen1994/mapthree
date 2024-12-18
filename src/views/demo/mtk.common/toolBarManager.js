import * as maptalks from "maptalks"
/**
 * 地图工具栏(放大 缩小 测距 侧面等)
 */
class toolBarApi {
  constructor() {
    this.Map = null;
  }
  /**
   * 放大
   */
  zoomIn() {
    this.Map && this.Map.zoomIn()
  }
  /**
   * 缩小
   */
  zoomOut() {
    this.Map && this.Map.zoomOut()
  }
  
  /**
   * 地图截图
   * @param {string} imgName 保存的图片名称
   * @param {boolean} isSave 是否保存(下载)图片
   */
   getMapImage(imgName, isSave = true) {
    return this.Map.toDataURL({
      mimeType: "image/jpeg", // or 'image/png'
      save: isSave, // to pop a save dialog
      fileName: imgName || "Map" // file name
    });
  }
  /**
   * 测量(测距/侧面)工具
   * @param {string} type 类型-distance/测距 area/测面
   * @param {string} lineSymbol 线样式
   * @param {string} circleSymbol 节点样式
   * @param {string} textSymbol 文字样式
   */
  initMeasureTool(type = "distance", lineSymbol, circleSymbol, textSymbol) {
    let symbol = {
      lineColor: "#5298f8",
      lineWidth: 3,
      polygonFill: "#5298f8",
      polygonOpacity: 0.2,
      shadowColor: "#5298f8",
      shadowBlur: 5
    }
    Object.assign(symbol, lineSymbol)
    let vertexSymbol = {
      markerType: "ellipse",
      markerFill: "#fff",
      markerFillOpacity: 0.8,
      markerLineColor: "#5298f8",
      markerLineWidth: 3,
      markerWidth: 10,
      markerHeight: 10
    }
    Object.assign(vertexSymbol, circleSymbol)
    let labeltextSymbol = {
      textFaceName: "Arial",
      textFill: "#5298f8",
      textHaloFill: "#fff",
      textHaloRadius: 2,
      textHaloOpacity: 1,
      textLineSpacing: 1,
      textHorizontalAlignment: "right",
      textDx: 15,
      markerLineColor: "#b4b3b3",
      markerFill: "#000"
    }
    Object.assign(labeltextSymbol, textSymbol)
    type == "distance" ? (this.distanceTool = new maptalks.DistanceTool().addTo(this.Map)) : (this.distanceTool = new maptalks.AreaTool().addTo(this.Map));
    let options = {
      symbol: symbol,
      vertexSymbol: vertexSymbol,
      labelOptions: {
        textSymbol: labeltextSymbol
        //'boxStyle': {
        //    'padding': [4, 2],
        //    'symbol': {
        //        'markerType': 'square',
        //        'markerFill': '#fff',
        //        'markerFillOpacity': 0.7,
        //        'markerLineColor': '#b4b3b3',
        //        markerLineOpacity:0
        //    }
        //}
      },
      clearButtonSymbol: [{
          markerType: "ellipse",
          markerFill: "#5298f8",
          markerLineColor: "#fff",
          markerLineOpacity: 1,
          markerLineWidth: 2,
          markerWidth: 17,
          markerHeight: 17,
          markerDx: 25,
          markerDy: -4
        },
        {
          markerType: "x",
          markerWidth: 7,
          markerHeight: 7,
          markerLineColor: "#fff",
          markerDx: 25,
          markerDy: -4
        }
      ],
      language: "zh-CN"
    };
    this.distanceTool.setOptions(options);
    // this.distanceTool.disable();
  }
  distanceOff() {
    this.distanceTool && this.distanceTool.clear();
    this.distanceTool && this.distanceTool.disable();
  }
  distanceOn() {
    this.distanceTool && this.distanceTool.enable();
  }
}
export default new toolBarApi();