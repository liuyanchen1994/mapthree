import Ajax from "./ajax"
class serviceApi {
  constructor(){}
  
  /**
   * 根据点查询点所在的区划服务数据(一般用于打点获取所属区划)
   * @param {array} coord 坐标 例如[114.3312052,30.5444257]
   * @param {string} serviceUrl 地图服务
   * @param {function} call 查询完成回调 return Array
   */
  queryServiceDataByPoint(coord, serviceUrl, call) {
    let option = {
      geometry: `{"x":${coord[0]},"y":${coord[1]},"spatialReference":{"wkid":4326}}`
    };
    this.QueryDataByUrlAndCondition(option, serviceUrl, result => {
      if (result.features.length) call(result.features[0]);
      else call([])
    });
  }
  /**
   * 查询地图服务数据
   * @param {Object} option 服务查询条件 如 { where: "1=1", outFields: "*" }
   * @param {string} url 地图服务地址
   * @param {function} callFun 回调 return Array
   */
  getServiceData(option, url, callFun) {
    this.QueryDataByUrlAndCondition(option, url, result => {
      if (result.features.length) callFun(result.features);
      else callFun && callFun([])
    })
    // let features = [];
    // result.features.forEach(item => {
    //   let attr = item.attributes;
    //   let geo = item.geometry;
    //   let ring = geo.rings;
    //   features.push({
    //     attributes: attr,
    //     rings: ring
    //   });
    // });
  }
  
  /**
   * 查询地图服务范围内数据(一般用于框选查询范围内服务(点服务) 数据)
   * @param {object} extent 查询范围
   * extent一般为geometry.getExtent()所得，geometry为polygon面
   * @param {string} serviceUrl 服务
   * @param {function} call 查询完成回调
   */
  queryExtentServiceData(extent, serviceUrl, call) {
    let _extent = [extent.xmin, extent.ymin, extent.xmax, extent.ymax];
    let mapextent = _extent.join(",");
    let geometry = `<${_extent[0]}>,<${_extent[1]}>,<${_extent[2]}>,<${_extent[3]}>`;
    let url = `${serviceUrl}/identify?geometry=${geometry}&geometryType=esriGeometryEnvelope&sr=&layers=all&layerDefs=&time=&layerTimeOptions=&tolerance=0&mapExtent=${mapextent}&imageDisplay=1056%2C816%2C96&returnGeometry=true&maxAllowableOffset=&geometryPrecision=&dynamicLayers=&returnZ=false&returnM=false&gdbVersion=&f=pjson`;
    this.queryFun(url, data => {
      call(data);
    });
  }
  
  QueryDataByUrlAndCondition(option, url, callfun) {
    let _url = url + this.parseQueryString(option);
    this.queryFun(_url, data => {
      callfun(data);
    });
  }
  queryFun(_url, _call) {
    new Ajax().getJSON(
      _url,
      {
        jsonp: true
      },
      (obj, data) => {
        _call(data);
      }
    );
  }
  parseQueryString(option) {
    let queryString = "/query?";
    let geometry = option.geometry || "";
    let where = option.where || "1=1";
    let condition = {
      where: encodeURIComponent(where),
      geometry:
        geometry instanceof Object ? JSON.stringify(geometry) : geometry,
      geometryType: option.geometryType || "esriGeometryPoint",
      inSR: option.inSR || "",
      spatialRel:
        option.esriSpatialRelIntersects || "esriSpatialRelIntersects",
      relationParam: option.relationParam || "",
      objectIds: option.objectIds || "",
      time: option.time || "",
      returnCountOnly: option.returnCountOnly || false,
      returnGeometry: option.returnGeometry || true,
      maxAllowableOffset: option.maxAllowableOffset || "",
      outSR: option.outSR || "",
      text: option.text || "",
      outFields: option.outFields || "*",
      orderByFields: option.orderByFields || ""
    };
    for (let p in condition) {
      queryString += "&" + p + "=" + condition[p];
    }
    queryString += "&f=pjson";
    return queryString;
  }
}
export default new serviceApi();