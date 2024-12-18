/**
 * 绘制工具样式
 * @param {string} type 样式类型
 * @param {Object} customSymbol 自定义样式
 * @returns 返回样式Object
 */
export function getDrawSymbol(type, customSymbol) {
  let symbol = {};
  switch (type) {
    case "Point":
      symbol = {
        markerFile: require("./img/marker.png")
      }
      break;
    case "LineString":
      symbol = {
        lineColor: "#409EFF",
        lineWidth: 6,
        lineCap: "round"
      };
      break;
    case "Polygon":
      symbol = {
        lineColor: "#409EFF",
        lineWidth: 3,
        polygonFill: "#409EFF",
        polygonOpacity: 0.5,
        // polygonPatternFile: drawFillStyle("#409EFF", 1, 10),
      };
      break;
  }
  Object.assign(symbol, customSymbol);
  return symbol
}


export function getClusterSymbol(maxVisiableZoom) {
  let symbol = {
    markerType: "ellipse",
    markerFill: {
      property: "count",
      type: "interval",
      stops: [
        [0, "#90c8ff"],
        [9, "#ffcb6f"],
        [19, "#ff9595"],
        [50, "#eea9ff"]
      ]
    },
    markerFillOpacity: 1,
    markerLineOpacity: 0.2,
    markerLineWidth: 15,
    markerLineColor: {
      property: "count",
      type: "interval",
      stops: [
        [0, "#90c8ff"],
        [9, "#ffcb6f"],
        [19, "#ff9595"],
        [50, "#eea9ff"]
      ]
    },
    markerWidth: {
      property: "count",
      type: "interval",
      stops: [
        [0, 35],
        [9, 35],
        [19, 35],
        [50, 35]
      ]
    },
    markerHeight: {
      property: "count",
      type: "interval",
      stops: [
        [0, 35],
        [9, 35],
        [19, 35],
        [50, 35]
      ]
    }
  };
  let textSymbol = {
    textFaceName: "Arial, Helvetica, sans-serif",
    textDy: 2,
    textSize: 16,
    textFill: "#fff"
  };
  let markerSymbol = {
    noClusterWithOneMarker: true,
    maxClusterZoom: maxVisiableZoom || 17,
    symbol: symbol,
    drawClusterText: true,
    geometryEvents: true,
    single: true,
    textSymbol: textSymbol
  };
  return markerSymbol;
}

function drawFillStyle(lineColor, lineWidth, spacing) {
  var color = lineColor || "#ccc";
  var width = lineWidth || 1.0;
  var space = spacing || 15;
  var canvas = document.createElement("canvas");
  canvas.width = spacing * 3 + lineWidth;
  canvas.height = spacing * 3 + lineWidth;
  return drawGrid(canvas, color, width, spacing, spacing);
}

function drawGrid(canvas, color, lineWidth, stepx, stepy) {
  var context = canvas.getContext("2d");
  context.strokeStyle = color;
  context.lineWidth = lineWidth;
  for (var i = stepx + 0.5; i < context.canvas.width; i += stepx) {
    context.beginPath();
    context.moveTo(i, 0);
    context.lineTo(i, context.canvas.height);
    context.stroke();
  }

  for (var i = stepy + 0.5; i < context.canvas.height; i += stepy) {
    context.beginPath();
    context.moveTo(0, i);
    context.lineTo(context.canvas.width, i);
    context.stroke();
  }
  const data = canvas.toDataURL("image/png", 1);
  return data;
}

function getEditSymbol() {
  const options = {
    //fix outline's aspect ratio when resizing
    fixAspectRatio: false,
    // geometry's symbol when editing
    // 'symbol': null,
    removeVertexOn: "contextmenu",
    //symbols of edit handles
    centerHandleSymbol: createHandleSymbol("ellipse", 1),
    vertexHandleSymbol: createHandleSymbol("ellipse", 1, 12),
    newVertexHandleSymbol: createHandleSymbol("ellipse", 0.4),
  };
  return options;
}

function createHandleSymbol(markerType, opacity, width) {
  return {
    markerType: markerType,
    markerFill: "#fff",
    // markerFillOpacity: 0.5,
    markerLineColor: "#5298f8",
    markerLineWidth: 2,
    markerWidth: width || 10,
    markerHeight: width || 10,
    opacity: opacity,
    lineDasharray: [5, 5],
    lineColor: "#5298f8",
  };
}