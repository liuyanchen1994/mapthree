import * as maptalks from "maptalks";
class mapApiClass {
  constructor() {
    this.Map = null;
  }

  /**
   * 地图初始化
   * @param {string} domId 地图容器dom id
   * @param {*} callFun 加载完回调
   */
  mapInit(domId, callFun) {
    this.Map && this.Map.remove();
    let options = {
      center: [114.3087835, 30.5496509],
      zoom: 13,
      minZoom: 8,
      maxZoom: 18,
      view: {
        projection: "baidu"
      },
      attribution: false,
      seamlessZoom: false,
      baseLayer: new maptalks.TileLayer("baseMap", {
        urlTemplate: `https://maponline2.bdimg.com/tile/?qt=vtile&x={x}&y={y}&z={z}&styles=pl&scaler=2&udt=20220317`,
      })
    };
    this.Map = new maptalks.Map(domId, options);
    callFun && callFun();
    this.Map.on("click", e => {
      console.log(e.coordinate);
    });
  }

  /**
   * 添加标注
   * @param {Object} data 数据集
   * @param {Object} customSymbol 自定义样式
   * @param {function} callFun 点击回调
   */
  addMarker(data, customSymbol = {}, callFun = null) {
    let layer = this.getLayer("markerLayer");
    layer.clear();
    let symbol = {
      // markerFile: require("./img/marker.png")
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
    this.layerToExtent("markerLayer");
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
}
export default mapApiClass;