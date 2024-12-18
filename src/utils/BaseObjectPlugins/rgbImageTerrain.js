import * as THREE from "three";
import * as maptalks from "maptalks";
import { BaseObject } from "maptalks.three";
//default values
const OPTIONS = {
  interactive: false,
  altitude: 0,
  image: null,
  imageWidth: 256,
  imageHeight: 256,
  texture: null,
  factor: 1,
  filterIndex: false
};

/**
 * custom rgbImage Terrain component
 * you can customize your own components
 * */
class rgbImageTerrain extends BaseObject {
  constructor(extent, options, material, layer) {
    options = maptalks.Util.extend({}, OPTIONS, options, { layer, extent });
    const {
      texture,
      image,
      altitude,
      imageHeight,
      imageWidth,
      factor,
      filterIndex
    } = options;
    if (!image) {
      console.error("not find image");
    }
    if (!(extent instanceof maptalks.Extent)) {
      extent = new maptalks.Extent(extent);
    }
    const { xmin, ymin, xmax, ymax } = extent;
    const coords = [[xmin, ymin], [xmin, ymax], [xmax, ymax], [xmax, ymin]];
    let vxmin = Infinity,
      vymin = Infinity,
      vxmax = -Infinity,
      vymax = -Infinity;
    coords.forEach(coord => {
      const v = layer.coordinateToVector3(coord);
      const { x, y } = v;
      vxmin = Math.min(x, vxmin);
      vymin = Math.min(y, vymin);
      vxmax = Math.max(x, vxmax);
      vymax = Math.max(y, vymax);
    });
    const w = Math.abs(vxmax - vxmin),
      h = Math.abs(vymax - vymin);
    const rgbImg = generateImage(image),
      img = generateImage(texture);
    const geometry = new THREE.PlaneBufferGeometry(
      w,
      h,
      imageWidth - 1,
      imageHeight - 1
    );
    super();
    this._initOptions(options);
    this._createMesh(geometry, material);
    const z = layer.distanceToVector3(altitude, altitude).x;
    const v = layer.coordinateToVector3(extent.getCenter(), z);
    this.getObject3d().position.copy(v);
    material.transparent = true;
    if (rgbImg) {
      material.opacity = 0;
      rgbImg.onload = () => {
        const width = imageWidth,
          height = imageHeight;
        const imgdata = getRGBData(rgbImg, width, height);
        let idx = 0;
        let maxZ = -Infinity;
        //rgb to height  https://docs.mapbox.com/help/troubleshooting/access-elevation-data/
        for (let i = 0, len = imgdata.length; i < len; i += 4) {
          const R = imgdata[i],
            G = imgdata[i + 1],
            B = imgdata[i + 2];
          const height = -10000 + (R * 256 * 256 + G * 256 + B) * 0.1;
          const z = layer.distanceToVector3(height, height).x * factor;
          geometry.attributes.position.array[idx * 3 + 2] = z;
          maxZ = Math.max(z, maxZ);
          idx++;
        }
        this.getOptions().maxZ = maxZ;
        geometry.attributes.position.needsUpdate = true;
        if (filterIndex) {
          const _filterIndex = [];
          const index = geometry.getIndex().array;
          const position = geometry.attributes.position.array;
          const z = maxZ / 15;
          for (let i = 0, len = index.length; i < len; i += 3) {
            const a = index[i];
            const b = index[i + 1];
            const c = index[i + 2];
            const z1 = position[a * 3 + 2];
            const z2 = position[b * 3 + 2];
            const z3 = position[c * 3 + 2];
            if (z1 > z || z2 > z || z3 > z) {
              _filterIndex.push(a, b, c);
            }
          }
          geometry.setIndex(new THREE.Uint32BufferAttribute(_filterIndex, 1));
        }
        if (img) {
          textureLoader.load(img.src, texture => {
            material.map = texture;
            material.opacity = 1;
            material.needsUpdate = true;
            this.fire("load");
          });
        } else {
          material.opacity = 1;
        }
      };
      rgbImg.onerror = function() {
        console.error(`not load ${rgbImg.src}`);
      };
    }
  }
}
const textureLoader = new THREE.TextureLoader();
const canvas = document.createElement("canvas"),
  tileSize = 256;

function getRGBData(image, width = tileSize, height = tileSize) {
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0, width, height);
  return ctx.getImageData(0, 0, width, height).data;
}
function generateImage(image) {
  if (!image) {
    return null;
  }
  let img;
  if (typeof image === "string") {
    img = new Image();
    img.src = image;
  } else if (image instanceof HTMLCanvasElement) {
    img = new Image();
    img.src = image.toDataURL();
  } else if (image instanceof Image) {
    img = new Image();
    img.src = image.src;
    img.crossOrigin = image.crossOrigin;
  }
  if (img && !img.crossOrigin) {
    img.crossOrigin = "Anonymous";
  }
  return img;
}
export default rgbImageTerrain;
