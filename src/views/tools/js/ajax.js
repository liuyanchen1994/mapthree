class Ajax {
  constructor(){}
  jsonp(url, callback) {
    var name = '_maptalks_jsonp_' + UID();
    if (url.match(/\?/)) url += '&callback=' + name;else url += '?callback=' + name;
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;

    window[name] = function (data) {
      callback(null, data);
      document.getElementsByTagName('head')[0].removeChild(script);
      script = null;
      delete window[name];
    };

    document.getElementsByTagName('head')[0].appendChild(script);
    return this;
  }
  get(url, options, cb) {
    if (isFunction(options)) {
      var t = cb;
      cb = options;
      options = t;
    }

    if (IS_NODE && this.get.node) {
      return this.get.node(url, cb, options);
    }

    var client = this._getClient(cb);

    client.open('GET', url, true);

    if (options) {
      for (var k in options.headers) {
        client.setRequestHeader(k, options.headers[k]);
      }

      client.withCredentials = options.credentials === 'include';

      if (options['responseType']) {
        client.responseType = options['responseType'];
      }
    }

    client.send(null);
    return client;
  }
  post(url, options, cb) {
    var postData;

    if (!isString(url)) {
      var t = cb;
      postData = options;
      options = url;
      url = options.url;
      cb = t;
    } else {
      if (isFunction(options)) {
        var _t = cb;
        cb = options;
        options = _t;
      }

      options = options || {};
      postData = options.postData;
    }

    if (IS_NODE && this.post.node) {
      options.url = url;
      return this.post.node(options, postData, cb);
    }

    var client = this._getClient(cb);

    client.open('POST', options.url, true);

    if (!options.headers) {
      options.headers = {};
    }

    if (!options.headers['Content-Type']) {
      options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }

    if ('setRequestHeader' in client) {
      for (var p in options.headers) {
        if (options.headers.hasOwnProperty(p)) {
          client.setRequestHeader(p, options.headers[p]);
        }
      }
    }

    if (!isString(postData)) {
      postData = JSON.stringify(postData);
    }

    client.send(postData);
    return client;
  }
  _wrapCallback(client, cb) {
    return function () {
      if (client.readyState === 4) {
        if (client.status === 200) {
          if (client.responseType === 'arraybuffer') {
            var response = client.response;

            if (response.byteLength === 0) {
              cb(new Error('http status 200 returned without content.'));
            } else {
              cb(null, {
                data: client.response,
                cacheControl: client.getResponseHeader('Cache-Control'),
                expires: client.getResponseHeader('Expires'),
                contentType: client.getResponseHeader('Content-Type')
              });
            }
          } else {
            cb(null, client.responseText);
          }
        } else {
          cb(new Error(client.statusText + ',' + client.status));
        }
      }
    };
  }
  _getClient(cb) {
    var client;

    try {
      client = new XMLHttpRequest();
    } catch (e) {
      try {
        client = new ActiveXObject('Msxml2.XMLHTTP');
      } catch (e) {
        try {
          client = new ActiveXObject('Microsoft.XMLHTTP');
        } catch (e) {}
      }
    }

    client.onreadystatechange = this._wrapCallback(client, cb);
    return client;
  }
  getArrayBuffer(url, options, cb) {
    if (isFunction(options)) {
      var t = cb;
      cb = options;
      options = t;
    }

    if (!options) {
      options = {};
    }

    options['responseType'] = 'arraybuffer';
    return this.get(url, options, cb);
  }
  getImage(img, url, options) {
    return this.getArrayBuffer(url, options, function (err, imgData) {
      if (err) {
        if (img.onerror) {
          img.onerror(err);
        }
      } else if (imgData) {
        var URL = window.URL || window.webkitURL;
        var onload = img.onload;

        img.onload = function () {
          if (onload) {
            onload();
          }

          URL.revokeObjectURL(img.src);
        };

        var blob = new Blob([new Uint8Array(imgData.data)], {
          type: imgData.contentType
        });
        img.cacheControl = imgData.cacheControl;
        img.expires = imgData.expires;
        img.src = imgData.data.byteLength ? URL.createObjectURL(blob) : emptyImageUrl;
      }
    });
  }
  getJSON(url, options, cb) {
    if (isFunction(options)) {
      var t = cb;
      cb = options;
      options = t;
    }
  
    var callback = function callback(err, resp) {
      var data = resp ? parseJSON(resp) : null;
      cb(err, data);
    };
  
    if (options && options['jsonp']) {
      return this.jsonp(url, callback);
    }
  
    return this.get(url, options, callback);
  }
}
var IS_NODE = Object.prototype.toString.call(typeof process !== 'undefined' ? process : 0) === '[object process]' && !process.versions['electron'] && !process.versions['nw'] && !process.versions['node-webkit'];

var uid = 0;
function UID() {
  return uid++;
}
var GUID = UID;
function isFunction(obj) {
  if (isNil(obj)) {
    return false;
  }

  return typeof obj === 'function' || obj.constructor !== null && obj.constructor === Function;
}

function isNumber(val) {
  return typeof val === 'number' && !isNaN(val);
}
function isInteger(n) {
  return (n | 0) === n;
}
function isObject(obj) {
  return typeof obj === 'object' && !!obj;
}
function isString(obj) {
  if (isNil(obj)) {
    return false;
  }

  return typeof obj === 'string' || obj.constructor !== null && obj.constructor === String;
}
function parseJSON(str) {
  if (!str || !isString(str)) {
    return str;
  }

  return JSON.parse(str);
}
function isNil(obj) {
  return obj == null;
}
export default Ajax;