import Ajax from "./ajax";
/**
 * 地图相关webapi
 * @description 关于百度/高德相关的在线api(坐标查询地名地址)
 */
class webApi {
  constructor() {
    this.baiduKey = "LHbvxjEMkESd4QsxuBG5eO8sWqrpLWf0";
    this.amapKey = "b40b24190f18ebc0dac786c0a2ea8c33";
  }

  /**
   * 根据坐标查询地名地址信息(高德,百度api)
   * @param {*} lng 坐标x
   * @param {*} lat 坐标y
   * @param {*} callback 返回数据
   * @param {string} searchType 调用api类型(baidu-百度、amap-高德) 默认为百度
   */
  getAddressByLocation(lng, lat, callback, searchType = "baidu") {
    if (!lng || !lat) {
      console.warn("坐标参数不正确~");
      return;
    }
    let urls = {
      //百度api
      baidu: `http://api.map.baidu.com/geocoder/v2/?callback=renderReverse&location=${lat},${lng}&output=json&pois=1&ak=${this.baiduKey}`,
      //高德api
      amap: `http://restapi.amap.com/v3/geocode/regeo?location=${lng},${lat}&poitype=&radius=&extensions=base&batch=false&roadlevel=0&key=${this.amapKey}`
    }
    let url = urls[searchType];
    this.query(url, data => {
      if (searchType == "amap") callback && callback(data.regeocode); //.formatted_address
      else callback && callback(data.result); //.sematic_description
    })
  }

  //根据两点获取等分点
  getCoords(c1, c2, total) {
    let arr = [];
    for (var i = 0; i < total; i++) {
        let cc = [c1[0] + i * (c2[0] - c1[0]) / total, c1[1] + i * (c2[1] - c1[1]) / total]
        arr.push(cc)
    }
    console.log(JSON.stringify(arr));
    return arr;
  }

  getLocationByAddress(address, callback) {
    if (!address) {
      console.warn("地址不能为空~");
      return;
    }
    let urls = {
      //百度api
      baidu: `http://api.map.baidu.com/geocoding/v3/?address=${address}&output=json&callback=showLocation&ak=${this.baiduKey}`,
      //高德api
      amap: ``
    }
  }

  /**
   * 地点检索
   * @param {string} searchStr 搜索关键字
   * @param {function} callback 返回数据
   * @param {string} searchType 调用api类型(baidu-百度、amap-高德) 默认为高德
   * @param {number} curPage 当前页-默认第一页
   * @param {number} pageSize 每页数量-默认20条
   */
  getAddressByName(searchStr, callback, searchType = "amap", curPage = 1, pageSize = 20) {
    let urls = {
      //百度api
      baidu: `http://api.map.baidu.com/place/v2/search?query=${searchStr}&region=全国&page_num=${curPage}&page_size=${pageSize}&output=json&ak=${this.baiduKey}`,
      //高德api
      amap: `https://restapi.amap.com/v3/place/text?keywords=${searchStr}&children=1&offset=${pageSize}&page=${curPage}&extensions=base&output=JSON&key=${this.amapKey}`
    }
    let url = urls[searchType];
    this.query(url, data => {
      if (searchType == "amap") callback && callback(data.pois);
      else callback && callback(data.results);
    })
  }

  /**
   * 路径规划(导航)
   * @param {array} startPoint 起点
   * @param {array} endPoint 终点
   * @param {string} routeType 规划(导航)类型(drive-驾车 walk-步行 bicycle-骑行 bus-公交)
   * @param {function} callback 返回数据
   * @param {string} queryType 调用api类型(baidu-百度、amap-高德) 默认为百度
   */
  getRoutePlanData(startPoint, endPoint, routeType = "drive", callback, queryType = "baidu") {
    if(!Array.isArray(startPoint) || !Array.isArray(endPoint)) {
      console.warn("坐标格式不匹配~");
      return;
    }
    startPoint = [startPoint[0].toFixed(6), startPoint[1].toFixed(6)];
    endPoint = [endPoint[0].toFixed(6), endPoint[1].toFixed(6)];
    let urls = {
      //百度api
      baidu: {
        drive: `http://api.map.baidu.com/directionlite/v1/driving?origin=${startPoint[1]},${startPoint[0]}&destination=${endPoint[1]},${endPoint[0]}&ak=${this.baiduKey}`,
        walk: `http://api.map.baidu.com/directionlite/v1/walking?origin=${startPoint[1]},${startPoint[0]}&destination=${endPoint[1]},${endPoint[0]}&ak=${this.baiduKey}`,
        bicycle: `http://api.map.baidu.com/directionlite/v1/riding?origin=${startPoint[1]},${startPoint[0]}&destination=${endPoint[1]},${endPoint[0]}&ak=${this.baiduKey}`
      },
      //高德api
      amap: {
        drive: `https://restapi.amap.com/v3/direction/driving?key=${this.amapKey}&origin=${startPoint[0]},${startPoint[1]}&destination=${endPoint[0]},${endPoint[1]}`,
        walk: `https://restapi.amap.com/v3/direction/walking?key=${this.amapKey}&origin=${startPoint[0]},${startPoint[1]}&destination=${endPoint[0]},${endPoint[1]}`,
        bicycle: `https://restapi.amap.com/v4/direction/bicycling?key=${this.amapKey}&origin=${startPoint[0]},${startPoint[1]}&destination=${endPoint[0]},${endPoint[1]}`,
        // bus: ``,
      }
    }
    let url = urls[queryType][routeType];
    this.query(url, data => {
      if (queryType == "amap") callback && callback(data.pois);
      else callback && callback(data.result);
    })
  }

  query(url, callback) {
    new Ajax().getJSON(
      url, {
        jsonp: true
      },
      (obj, data) => {
        callback && callback(data);
      }
    );
  }

}
export default new webApi();