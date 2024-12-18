/**
 * Created by Administrator on 2018/1/23 0023.
 */
import * as maptalks from 'maptalks';

/**
 * @property {Object} [options=null]
 * @property {String} [options.antiMeridian=continuous] - how to deal with the anti-meridian problem, split or continue the linestring when it cross the 180 or -180 longtitude line.
 * @property {String} [options.arrowStyle=null]                 - style of arrow, if not null, arrows will be drawn, possible values: classic
 * @property {String} [options.arrowPlacement=vertex-last]      - arrow's placement: vertex-first, vertex-last, vertex-firstlast, point
 * @memberOf LineString
 * @instance
 */
const options = {
  'arrowStyle': null,
  'arrowPlacement': 'vertex-last' //vertex-first, vertex-last, vertex-firstlast, point
};

/**
 * Represents a LineAnimPlayer type Geometry.
 * @category geometry
 * @extends LineString
 */
export default class LineAnimPlayer extends maptalks.LineString {
  /**
   * @param {Coordinate[]|Number[][]} coordinates - coordinates of the line string
   * @param {Object} [options=null] - construct options defined in [LineString]{@link LineString#options}
   */
  constructor(coordinates, options) {
    super(coordinates, options);
    this.type = 'LineAnimPlayer';
  }

  createPlayer(options = {}, cb) {
    if (maptalks.Util.isFunction(options)) {
      options = {};
      cb = options;
    }
    //const coordinates = this.getCoordinates();
    this.totalCoordinates = this.getCoordinates();
    const duration = options['duration'] || 1000;
    this.duration = duration;
    //const length = this.getLength();
    this.totalLength = this.getLength();
    const easing = options['easing'] || 'out';
    this.unitTime = options['unitTime'] || 1;
    this.aniCallback = cb;
    this.setCoordinates([]);
    this.played = 0;
    var player = maptalks.animation.Animation.animate({
      't': [0, 1]
    }, {
      'duration': this.duration,
      'easing': easing
    }, frame=>{
      this._step(frame);
    });
    this.player = player;
    return this;
  }

  _step(frame) {
    this.played = this.duration * frame.styles.t;
    var length = this.totalLength;
    var coordinates = this.totalCoordinates;
    if (!this.getMap()) {
      this.player.finish();
      this.setCoordinates(coordinates);
      if (this.aniCallback) {
        this.aniCallback(frame, coordinates[coordinates.length - 1], length - 1);
      }
      return;
    }
    var animCoords = this._drawAnimFrame(frame.styles.t, this.duration, length, coordinates);
    var currentCoordinate = (animCoords) ? animCoords[animCoords.length - 1] : coordinates[0];
    if (this.aniCallback) {
      let angle = animCoords ? this.calcAngle(currentCoordinate, animCoords[animCoords.length - 2]) : 0;
      angle ? angle = angle : angle = 0;
      this.aniCallback(frame, currentCoordinate, this._animIdx, angle);
    }
  }

  setSpeed(t) {
    // if (this.unitTime == 8 && t == 2) return;//限制快进或快退
    this.unitTime = this.unitTime * t;
    this._resetPlayer();
  }

  calcAngle(point, nextPoint) {
    const vector = [point.x-nextPoint.x,point.y - nextPoint.y];
    const k = (point.y - nextPoint.y)/(point.x-nextPoint.x);
    const thita = Math.atan(k);
    //X轴上
    if(vector[0]>0&&vector[1]==0)
      return 0;
    //第一象限
    else if(vector[0]>0&&vector[1]>0)
      return thita/Math.PI *180;
    //Y轴
    else if(vector[0]==0&&vector[1]>0)
      return 90;
    //第二象限
    else if(vector[0] < 0&&vector[1]>0)
      return thita/Math.PI *180+180;
    //X轴反方向
    else if(vector[0] < 0&&vector[1]==0)
      return 180;
    //第三象限
    else if(vector[0] < 0&&vector[1]<0)
      return thita/Math.PI *180 + 180;
    //Y轴负方向
    else if(vector[0] == 0&&vector[1]>0)
      return 270;
    //第四象限
    else if(vector[0] > 0&&vector[1]<0)
      return thita/Math.PI *180 + 360;
  }

  _resetPlayer() {
    var playing = this.player && this.player.playState === 'running';
    if (playing) {
      this.player.pause();
    }
    this._createPlayer();
    if (playing) {
      this.player.play();
    }
  }

  _createPlayer() {
    var duration = (this.duration - this.played) / this.unitTime;
    this.player.pause();
    this.player = maptalks.animation.Animation.animate({ 't': [this.played / this.duration, 1] },
      { 'speed': duration, 'easing': 'linear' },
      function (frame) {
        this._step(frame);
      }.bind(this));
  }

  cancel() {
    if (this.player) {
      this.played = 0;
      this._animIdx = 0;
      this._animLenSoFar = 0;
      this.unitTime = 1;
      //要重新生成player，是因为在加速减速时候，player变了，t:[start,end]中的start变了,如果直接cancel
      this._createPlayer();
      this.player.cancel();
      this.fire('playcancel');
      return this;
    }
    return null;
  }

  play() {
    if (this.player) {
      this.player.play();
      this.fire('playstart');
      return this;
    } else {
      console.log('You should call createPlayer method to play it!');
      return this;
    }
  }

  pause() {
    this.player.pause();
    this.fire('playpause');
    return this;
  }

  finish() {
    this.player.finish();
    //this._step({ 'styles': { 't': 1 }});
    this.fire('playfinish');
    return this;
  }

  _drawAnimFrame(t, duration, length, coordinates) {
    if (t === 0) {
      this.setCoordinates([]);
      return null;
    }
    var map = this.getMap();
    var targetLength = t * length;
    if (!this._animIdx) {
      this._animIdx = 0;
      this._animLenSoFar = 0;
      this.show();
    }
    var i, l;
    var segLen = 0;
    for (i = this._animIdx, l = coordinates.length; i < l - 1; i++) {
      segLen = map.computeLength(coordinates[i], coordinates[i + 1]);
      if (this._animLenSoFar + segLen > targetLength) {
        break;
      }
      this._animLenSoFar += segLen;
    }
    this._animIdx = i;
    if (this._animIdx >= l - 1) {
      this.setCoordinates(coordinates);
      this.unitTime = 1;
      this.fire('playfinish');
      return coordinates;
    }
    this.fire('playing');
    var idx = this._animIdx;
    var p1 = coordinates[idx],
      p2 = coordinates[idx + 1],
      span = targetLength - this._animLenSoFar,
      r = span / segLen;
    var x = p1.x + (p2.x - p1.x) * r,
      y = p1.y + (p2.y - p1.y) * r,
      targetCoord = new maptalks.Coordinate(x, y);
    var animCoords = coordinates.slice(0, this._animIdx + 1);
    animCoords.push(targetCoord);
    this.setCoordinates(animCoords);
    return animCoords;
  }
}

LineAnimPlayer.mergeOptions(options);

LineAnimPlayer.registerJSONType('LineAnimPlayer');
