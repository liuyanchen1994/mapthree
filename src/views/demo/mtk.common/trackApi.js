import * as maptalks from "maptalks"
import LineAnimPlayers from "./AnimateLine";
/**
 * 轨迹相关
 */
class trackApi {
  constructor() {
    this.Map = null;
    this.trackTemp = null;
    this.routeline = null;
    this.runStatus = "";
    this.runMarker = null;
  }
  //轨迹展示
  startTrackDraw(path, isGifMarker = true, img) {
    this.trackTemp = {
      path: path,
      isGifMarker,
      img
    };
    if (!path.length) return;
    let layer = this.getLayer("personTrackLayer");
    layer.clear();
    layer.setZIndex(111);
    if (path.length == 1) {
      this.addStartEndMarker(path[0], path[path.length - 1], layer);
      return;
    }
    new maptalks.LineString(path, {
      symbol: {
        lineColor: "#2F75E5",
        lineWidth: 4,
        lineDasharray: [30, 8],
        lineJoin: "round", //miter, round, bevel
        lineCap: "round", //butt, round, square
        markerFile: require("./img/trackmarker.png"),
        markerPlacement: "vertex", //vertex, point, vertex-first, vertex-last, center
        markerVerticalAlignment: "middle",
        markerWidth: 22,
        markerHeight: 23,
      }
    }).addTo(layer);
    //缩放到适应层级
    this.layerToExtent("personTrackLayer", this.Map)
    this.addStartEndMarker(path[0], path[path.length - 1], layer);
    this.loadAnimateTrack(path, layer, isGifMarker, img);
  }
  addStartEndMarker(s, e, layer) {
    if (s.x == e.x && s.y == e.y) {
      //起点
      new maptalks.Marker(s, {
        symbol: {
          markerFile: require("./img/samePointMarker.png")
        }
      }).addTo(layer);
      return;
    }
    //起点
    new maptalks.Marker(s, {
      symbol: {
        markerFile: require("./img/trackstart.png")
      }
    }).addTo(layer);
    //终点
    new maptalks.Marker(e, {
      symbol: {
        markerFile: require("./img/trackend.png")
      }
    }).addTo(layer);
  }
  loadAnimateTrack(path, layer, isGifMarker, img) {
    this.routeline = new LineAnimPlayers(path, {
        //轨迹线
        smoothness: 0.01, //线的平滑度，防止拐角处线会变尖
        symbol: {
          lineColor: "#5297f9",
          lineWidth: 4,
          lineOpacity: 0.01
        }
      })
      .addTo(layer)
      .createPlayer({
          duration: path.length * 2000,
          easing: "linear"
        },
        (frm, coord, _animIdx, angle) => {
          this.runStatus = frm.state.playState;
          // this.layer.getMap().setCenter(coord)
          //添加沿轨迹运动的标注
          isGifMarker
            ?
            this.CreateGifRunMarker(coord) :
            this.CreateRunMarker(coord, angle, layer, img);
          if (this.runStatus == "finished")
            this.runMarker && this.runMarker.remove();
        }
      );
    this.routeline.on("playfinish", () => {
      this.runMarker && this.runMarker.remove();
      this.runMarker = null;
    });
    // this.routeline.play()
  }
  /**
   * 添加运动的标注
   * @param {*} marker 标注
   * @param {*} coord 运动点坐标
   * @param {*} angle 车辆标注旋转角度
   */
  CreateRunMarker(coord, angle, layer, img) {
    let markerFile = require("./img/ztc.png");
    if(img) markerFile = img;
    this.runMarker = !this.runMarker ?
      new maptalks.Marker(coord, {
        symbol: {
          markerFile: markerFile,
          markerDy: 30
        }
      }).addTo(layer) :
      this.runMarker.setCoordinates(coord);
    this.runMarker.updateSymbol({
      markerRotation: angle - 90
    });
  }
  CreateGifRunMarker(coord) {
    var gifMarkerSymbol = {
      dy: -20,
      html: `<div style="width:40px;height:60px;"><img src="${require("./img/charector.gif")}" style="width:40px;height:60px;"</div>`,
    }
    this.runMarker = !this.runMarker ?
      new maptalks.ui.UIMarker([Number(coord.x), Number(coord.y)], {
        dy: gifMarkerSymbol.dy || 0,
        // single: false,
        content: gifMarkerSymbol.html || ""
      }).addTo(this.Map) :
      this.runMarker.setCoordinates(coord);
  }
  play() {
    if (this.runStatus && this.runStatus == "finished") this.replay();
    else this.routeline.play();
  }
  /**
   * 暂停
   */
  pause() {
    if (this.runStatus && this.runStatus == "finished") return;
    this.routeline.pause();
  }
  /**
   * 重放
   */
  replay() {
    this.routeline && this.routeline.pause();
    this.routeline && this.routeline.cancel();
    this.runMarker && this.runMarker.remove();
    this.routeline = null;
    this.runMarker = null;
    this.runStatus = null;
    let layer = this.getLayer("personTrackLayer");
    layer.clear()
    if (this.trackTemp) {
      this.startTrackDraw(this.trackTemp.path, this.trackTemp.isGifMarker, this.trackTemp.img);
    }
    setTimeout(() => {
      this.play();      
    }, 500);
  }
  /**
   * 快放
   */
  forward(speed) {
    if (["finished", "paused"].includes(this.runStatus)) return;
    this.routeline.setSpeed(speed || 2);
  }
  /**
   * 慢放
   */
  rewind(speed) {
    if (["finished", "paused"].includes(this.runStatus)) return;
    this.routeline.setSpeed(speed || 0.5);
  }
  /**
   * 退出
   */
  quit() {
    this.routeline && this.routeline.pause();
    this.routeline && this.routeline.cancel();
    this.runMarker && this.runMarker.remove();
    this.runStatus = null;
    this.routeline = null;
    this.runMarker = null;
    this.trackTemp = null;
    let layer = this.getLayer("personTrackLayer");
    layer.clear()
    // this.Map.setView(this.initView);
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
}
export default new trackApi();