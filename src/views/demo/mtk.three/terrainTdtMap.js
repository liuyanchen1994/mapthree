import * as THREE from "three";
import * as maptalks from "maptalks";
import { ThreeLayer } from "maptalks.three";
import cover from "@mapbox/tile-cover";

import rgbTerrain from "@/utils/BaseObjectPlugins/rgbImageTerrain";

const center = [108.494596, 30.8962235],
  zoom = 14,
  minzoom = 11,
  pitch = 40;
const mapboxToken = `pk.eyJ1IjoibHd5c2ltcGxlIiwiYSI6ImNrNDN2d2Y0bTA1djUzZG1tcmFwcTI3bXMifQ.ppzazP39jYrBKpdUi-S7mA`;
class mapApi {
  constructor() {
    this.Map = null;
    this.threeLayer = null;
  }

  /**
   * 加载地图
   * @param {string} domId 地图容器DIV
   * @param {function} callFun 加载完回调
   */
  loadMap(domId, callFun) {
    const subdomains = ["0", "1", "2", "3", "4", "5", "6", "7"];
    this.Map = new maptalks.Map(domId, {
      center: center,
      zoom: zoom,
      minZoom: minzoom,
      pitch: pitch,
      attribution: false,
      baseLayer: new maptalks.TileLayer("base", {
        // cssFilter: "sepia(70%) invert(90%)",
        urlTemplate: `https://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}.webp?sku=101XzrMiclXn4&access_token=${mapboxToken}`,
        // urlTemplate:
        //   "https://c.tile.thunderforest.com/transport/{z}/{x}/{y}.png?apikey=6170aad10dfd42a38d4d8c709a536f38",
        subdomains: subdomains
      })
    });
    this.Map.on("click", e => {
      console.log(e.coordinate);
    });
    this.initThreeLayer();
    setTimeout(() => {
      this.loadTerrain();
    });
    callFun && callFun();
  }

  initThreeLayer() {
    this.threeLayer = new ThreeLayer("t", {
      forceRenderOnMoving: true,
      forceRenderOnRotating: true,
      forceRenderOnZooming: true,
      animation: true
    });
    this.threeLayer.prepareToDraw = function(gl, scene, camera) {
      //环境光
      let light = new THREE.DirectionalLight(0xffffff, 2);
      light.position.set(0, -10, 10);
      scene.add(light);
      //点光源
      let pl = new THREE.PointLight(0xffffff, 2, 0);
      camera.add(pl);
    };
    this.threeLayer.addTo(this.Map);
  }

  loadTerrain() {
    let baseLayer = this.Map.getBaseLayer();
    baseLayer._getTileExtent = function(x, y, z) {
      const map = this.getMap(),
        res = map._getResolution(z),
        tileConfig = this._getTileConfig(),
        tileExtent = tileConfig.getTilePrjExtent(x, y, res);
      return tileExtent;
    };

    /**
     *
     * @param {} x
     * @param {*} y
     * @param {*} z
     */
    baseLayer._getTileLngLatExtent = function(x, y, z) {
      const tileExtent = this._getTileExtent(x, y, z);
      let max = tileExtent.getMax(),
        min = tileExtent.getMin();
      const map = this.getMap();
      const projection = map.getProjection();
      min = projection.unproject(min);
      max = projection.unproject(max);
      return new maptalks.Extent(min, max);
    };
    fetch("./hangzhou/west-lake-area.geojson")
      .then(res => res.json())
      .then(geojson => {
        const polygons = maptalks.GeoJSON.toGeometry(geojson);
        const polygon = polygons[0];
        
        // let extent = polygon.getExtent();
        let extent = this.Map.getExtent(); //{"xmin":108.43739938270585,"ymin":30.878021344188,"xmax":108.55179261729404,"ymax":30.928553286997584}
        console.log(JSON.stringify(extent))

        const { xmin, ymin, xmax, ymax } = extent;
        let coords = [[xmin, ymin], [xmin, ymax], [xmax, ymax], [xmax, ymin]];
        let rectangle = new maptalks.Polygon([coords]);
        const tiles = cover.tiles(rectangle.toGeoJSON().geometry, {
          min_zoom: 12,
          max_zoom: 12
        });
        console.log(tiles);
        //buffer
        let minx = Infinity,
          miny = Infinity,
          maxx = -Infinity,
          maxy = -Infinity;
        tiles.forEach(tile => {
          const [x, y, z] = tile;
          const { xmin, ymin, xmax, ymax } = baseLayer._getTileLngLatExtent(
            x,
            y,
            z
          );
          minx = Math.min(minx, xmin);
          maxx = Math.max(maxx, xmax);
          miny = Math.min(miny, ymin);
          maxy = Math.max(maxy, ymax);
        });
        extent = new maptalks.Extent(minx, miny, maxx, maxy);
        coords = [[minx, miny], [minx, maxy], [maxx, maxy], [maxx, miny]];
        rectangle = new maptalks.Polygon([coords]);
        // layer.addGeometry(rectangle);
        const material = new THREE.MeshBasicMaterial({
          wireframe: false,
          color: "#FFF"
        });
        this.generateCanvas(tiles, ({ image, width, height, texture }) => {
          const terrain = new rgbTerrain(
            extent,
            {
              texture,
              imageWidth: Math.ceil(width / 1),
              imageHeight: Math.ceil(height / 1),
              image,
              factor: 2.5,
              filterIndex: true,
              altitude: -50
            },
            material,
            this.threeLayer
          );
          // lines.push(terrain);
          this.threeLayer.addMesh(terrain);
          return;
          terrain.on("load", () => {
            terrain.getObject3d();
            terrain.getObject3d().material = this.getTerrainMaterial(
              terrain.getOptions().maxZ
            );
          });
        });
      });
  }

  generateCanvas(tiles, callback) {
    let minx = Infinity,
      miny = Infinity,
      maxx = -Infinity,
      maxy = -Infinity;
    tiles.forEach(tile => {
      const [x, y, z] = tile;
      minx = Math.min(minx, x);
      maxx = Math.max(maxx, x);
      miny = Math.min(miny, y);
      maxy = Math.max(maxy, y);
    });
    // console.log(maxx, minx, maxy, miny);
    const width = (maxx - minx + 1) * 256,
      height = (maxy - miny + 1) * 256;
    console.log(width, height);
    const images = [];
    tiles.forEach(tile => {
      const [x, y, z] = tile;
      const dx = (x - minx) * 256,
        dy = (y - miny) * 256;
      images.push({
        dx,
        dy,
        tile
      });
    });
    this.generateRGBImage(width, height, images, opt => {
      this.generateTexture(width, height, images, function(opt1) {
        callback && callback(Object.assign(opt, opt1));
      });
    });
  }

  generateRGBImage(width, height, images, callback) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    // document.body.appendChild(canvas);
    const ctx = canvas.getContext("2d");

    let idx = 0;

    function loadImage() {
      const { tile, dx, dy } = images[idx];
      const [x, y, z] = tile;
      const url = `https://a.tiles.mapbox.com/v4/mapbox.terrain-rgb/${z}/${x}/${y}.pngraw?access_token=${mapboxToken}`;
      // console.log(url);
      const image = new Image();
      image.src = url;
      image.crossOrigin = "Anonymous";
      image.onload = function() {
        ctx.drawImage(image, dx, dy, 256, 256);
        // console.log(canvas.toDataURL());
        idx++;
        if (idx < images.length) {
          loadImage();
        } else {
          // console.log(canvas.toDataURL());
          callback &&
            callback({
              image: canvas.toDataURL(),
              width,
              height
            });
        }
      };
    }
    loadImage();
  }

  generateTexture(width, height, images, callback) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    // document.body.appendChild(canvas);
    const ctx = canvas.getContext("2d");

    let idx = 0;

    function loadImage() {
      const { tile, dx, dy } = images[idx];
      const [x, y, z] = tile;
      // const url = `http://t1.tianditu.com/DataServer?T=img_w&X=${x}&Y=${y}&L=${z}&tk=de0dc270a51aaca3dd4e64d4f8c81ff6`;
      const url = `https://api.mapbox.com/v4/mapbox.satellite/${z}/${x}/${y}.webp?sku=101XzrMiclXn4&access_token=${mapboxToken}`;
      // console.log(url);
      const image = new Image();
      image.src = url;
      image.crossOrigin = "Anonymous";
      image.onload = function() {
        ctx.drawImage(image, dx, dy, 256, 256);
        // console.log(canvas.toDataURL());
        idx++;
        if (idx < images.length) {
          loadImage();
        } else {
          // console.log(canvas.toDataURL());
          callback &&
            callback({
              texture: canvas.toDataURL(),
              width,
              height
            });
        }
      };
    }
    loadImage();
  }

  getTerrainMaterial(maxZ) {
    const uniforms = {
      maxHeight: {
        value: maxZ
      },
      colorTop: {
        value: new THREE.Color("#87B973")
        // value: new THREE.Color("#0B5161")
      },
      opacity: {
        value: 0.8
      },
      colorBottom: {
        value: new THREE.Color("#0C1F4C")
      }
    };
    const material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: document.getElementById("vertexShader").textContent,
      fragmentShader: document.getElementById("fragmentShader").textContent
    });
    return material;
  }
}
export default mapApi;
