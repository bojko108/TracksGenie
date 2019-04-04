/** 
 * tracksgenie - v1.0.0
 * description: Library for processing and matching GPS tracks.
 * author: bojko108 <bojko108@gmail.com>
 * 
 * github: https://github.com/bojko108/tracksgenie
 */
    
'use strict';

function sortKD(ids, coords, nodeSize, left, right, depth) {
    if (right - left <= nodeSize) return;
    const m = (left + right) >> 1;
    select(ids, coords, m, left, right, depth % 2);
    sortKD(ids, coords, nodeSize, left, m - 1, depth + 1);
    sortKD(ids, coords, nodeSize, m + 1, right, depth + 1);
}
function select(ids, coords, k, left, right, inc) {
    while (right > left) {
        if (right - left > 600) {
            const n = right - left + 1;
            const m = k - left + 1;
            const z = Math.log(n);
            const s = 0.5 * Math.exp(2 * z / 3);
            const sd = 0.5 * Math.sqrt(z * s * (n - s) / n) * (m - n / 2 < 0 ? -1 : 1);
            const newLeft = Math.max(left, Math.floor(k - m * s / n + sd));
            const newRight = Math.min(right, Math.floor(k + (n - m) * s / n + sd));
            select(ids, coords, k, newLeft, newRight, inc);
        }
        const t = coords[2 * k + inc];
        let i = left;
        let j = right;
        swapItem(ids, coords, left, k);
        if (coords[2 * right + inc] > t) swapItem(ids, coords, left, right);
        while (i < j) {
            swapItem(ids, coords, i, j);
            i++;
            j--;
            while (coords[2 * i + inc] < t) i++;
            while (coords[2 * j + inc] > t) j--;
        }
        if (coords[2 * left + inc] === t) swapItem(ids, coords, left, j);
        else {
            j++;
            swapItem(ids, coords, j, right);
        }
        if (j <= k) left = j + 1;
        if (k <= j) right = j - 1;
    }
}
function swapItem(ids, coords, i, j) {
    swap(ids, i, j);
    swap(coords, 2 * i, 2 * j);
    swap(coords, 2 * i + 1, 2 * j + 1);
}
function swap(arr, i, j) {
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
}

function range(ids, coords, minX, minY, maxX, maxY, nodeSize) {
    const stack = [0, ids.length - 1, 0];
    const result = [];
    let x, y;
    while (stack.length) {
        const axis = stack.pop();
        const right = stack.pop();
        const left = stack.pop();
        if (right - left <= nodeSize) {
            for (let i = left; i <= right; i++) {
                x = coords[2 * i];
                y = coords[2 * i + 1];
                if (x >= minX && x <= maxX && y >= minY && y <= maxY) result.push(ids[i]);
            }
            continue;
        }
        const m = Math.floor((left + right) / 2);
        x = coords[2 * m];
        y = coords[2 * m + 1];
        if (x >= minX && x <= maxX && y >= minY && y <= maxY) result.push(ids[m]);
        const nextAxis = (axis + 1) % 2;
        if (axis === 0 ? minX <= x : minY <= y) {
            stack.push(left);
            stack.push(m - 1);
            stack.push(nextAxis);
        }
        if (axis === 0 ? maxX >= x : maxY >= y) {
            stack.push(m + 1);
            stack.push(right);
            stack.push(nextAxis);
        }
    }
    return result;
}

function within(ids, coords, qx, qy, r, nodeSize) {
    const stack = [0, ids.length - 1, 0];
    const result = [];
    const r2 = r * r;
    while (stack.length) {
        const axis = stack.pop();
        const right = stack.pop();
        const left = stack.pop();
        if (right - left <= nodeSize) {
            for (let i = left; i <= right; i++) {
                if (sqDist(coords[2 * i], coords[2 * i + 1], qx, qy) <= r2) result.push(ids[i]);
            }
            continue;
        }
        const m = Math.floor((left + right) / 2);
        const x = coords[2 * m];
        const y = coords[2 * m + 1];
        if (sqDist(x, y, qx, qy) <= r2) result.push(ids[m]);
        const nextAxis = (axis + 1) % 2;
        if (axis === 0 ? qx - r <= x : qy - r <= y) {
            stack.push(left);
            stack.push(m - 1);
            stack.push(nextAxis);
        }
        if (axis === 0 ? qx + r >= x : qy + r >= y) {
            stack.push(m + 1);
            stack.push(right);
            stack.push(nextAxis);
        }
    }
    return result;
}
function sqDist(ax, ay, bx, by) {
    const dx = ax - bx;
    const dy = ay - by;
    return dx * dx + dy * dy;
}

const defaultGetX = p => p[0];
const defaultGetY = p => p[1];
class KDBush {
    constructor(points, getX = defaultGetX, getY = defaultGetY, nodeSize = 64, ArrayType = Float64Array) {
        this.nodeSize = nodeSize;
        this.points = points;
        const IndexArrayType = points.length < 65536 ? Uint16Array : Uint32Array;
        const ids = this.ids = new IndexArrayType(points.length);
        const coords = this.coords = new ArrayType(points.length * 2);
        for (let i = 0; i < points.length; i++) {
            ids[i] = i;
            coords[2 * i] = getX(points[i]);
            coords[2 * i + 1] = getY(points[i]);
        }
        sortKD(ids, coords, nodeSize, 0, ids.length - 1, 0);
    }
    range(minX, minY, maxX, maxY) {
        return range(this.ids, this.coords, minX, minY, maxX, maxY, this.nodeSize);
    }
    within(x, y, r) {
        return within(this.ids, this.coords, x, y, r, this.nodeSize);
    }
}

const R = 6731137;
function metersToDegrees(meters) {
  return (meters * 360) / (2 * Math.PI * R);
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var simplify_1 = createCommonjsModule(function (module) {
const getSqDist = (p1, p2) => {
  const dx = (p1.x || p1[0]) - (p2.x || p2[0]),
    dy = (p1.y || p1[1]) - (p2.y || p2[1]);
  return dx * dx + dy * dy;
};
const getSqSegDist = (p, p1, p2) => {
  let x = p1.x || p1[0],
    y = p1.y || p1[1],
    dx = (p2.x || p2[0]) - x,
    dy = (p2.y || p2[1]) - y;
  if (dx !== 0 || dy !== 0) {
    let t = (((p.x || p[0]) - x) * dx + ((p.y || p[1]) - y) * dy) / (dx * dx + dy * dy);
    if (t > 1) {
      x = p2.x || p2[0];
      y = p2.y || p2[1];
    } else if (t > 0) {
      x += dx * t;
      y += dy * t;
    }
  }
  dx = (p.x || p[0]) - x;
  dy = (p.y || p[1]) - y;
  return dx * dx + dy * dy;
};
const simplifyRadialDist = (points, sqTolerance) => {
  let prevPoint = points[0],
    newPoints = [prevPoint],
    point;
  for (let i = 1, len = points.length; i < len; i++) {
    point = points[i];
    if (getSqDist(point, prevPoint) > sqTolerance) {
      newPoints.push(point);
      prevPoint = point;
    }
  }
  if (prevPoint !== point) newPoints.push(point);
  return newPoints;
};
const simplifyDPStep = (points, first, last, sqTolerance, simplified) => {
  let maxSqDist = sqTolerance,
    index;
  for (let i = first + 1; i < last; i++) {
    const sqDist = getSqSegDist(points[i], points[first], points[last]);
    if (sqDist > maxSqDist) {
      index = i;
      maxSqDist = sqDist;
    }
  }
  if (maxSqDist > sqTolerance) {
    if (index - first > 1) simplifyDPStep(points, first, index, sqTolerance, simplified);
    simplified.push(points[index]);
    if (last - index > 1) simplifyDPStep(points, index, last, sqTolerance, simplified);
  }
};
const simplifyDouglasPeucker = (points, sqTolerance) => {
  const last = points.length - 1;
  let simplified = [points[0]];
  simplifyDPStep(points, 0, last, sqTolerance, simplified);
  simplified.push(points[last]);
  return simplified;
};
const simplify = (points, tolerance, highestQuality) => {
  if (points.length <= 2) return points;
  const sqTolerance = tolerance !== undefined ? tolerance * tolerance : 1;
  points = highestQuality ? points : simplifyRadialDist(points, sqTolerance);
  points = simplifyDouglasPeucker(points, sqTolerance);
  return points;
};
(function() {
  if (typeof undefined === 'function' && undefined.amd)
    undefined(function() {
      return simplify;
    });
  else {
    module.exports = simplify;
    module.exports.default = simplify;
  }
})();
});

class TracksGenie {
  constructor() {
    this._index = null;
    this._basePoints = null;
    this._pointsCounter = 0;
  }
  setBaseLines(lines) {
    this._basePoints = [];
    for (let i = 0; i < lines.length; i++) {
      this._processBaseLine(lines[i]);
    }
    if (this._basePoints.length > 0) {
      this._index = new KDBush(this._basePoints, p => p.geometry.coordinates[0], p => p.geometry.coordinates[1], 64, Float32Array);
    }
  }
  testLine(line) {
    try {
      debugger;
      this._newPoints = line.coordinates.map(c => this.insidePolygon(c));
      debugger;
    } catch (e) {
      debugger;
      console.log(e);
    }
  }
  insidePolygon(point) {
    let x = point[0],
      y = point[1];
    let inside = false;
    for (let k = 0; k < this._buffer.coordinates.length; k++) {
      for (let m = 0; m < this._buffer.coordinates[k].length; m++) {
        for (let i = 0, j = this._buffer.coordinates[k][m].length - 1; i < this._buffer.coordinates[k][m].length; j = i++) {
          let xi = this._buffer.coordinates[k][m][i][0],
            yi = this._buffer.coordinates[k][m][i][1];
          let xj = this._buffer.coordinates[k][m][j][0],
            yj = this._buffer.coordinates[k][m][j][1];
          let intersect = yi > y != yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
          if (intersect) inside = !inside;
        }
      }
    }
    return inside;
  }
  simplify(points, tolerance = 1, highestQuality = false) {
    return simplify_1(points, metersToDegrees(tolerance), highestQuality);
  }
  getBasePointsAt(latLong, distanceInMeters) {
    const ids = this._index.within(...latLong, metersToDegrees(distanceInMeters));
    return ids.map(id => this._basePoints[id]);
  }
  _processBaseLine(line) {
    const type = line.type;
    if (type !== 'LineString' && type !== 'MultiLineString') {
      throw `Geometry is not supported: ${type}. Supported types are: LineString and MultiLineString.`;
    }
    if (type === 'LineString') {
      for (let i = 0; i < line.coordinates.length; i++) {
        this._basePoints.push(this._toTreeItem(line.coordinates[i]));
      }
    }
    if (type === 'MultiLineString') {
      for (let i = 0; i < line.coordinates.length; i++) {
        for (let j = 0; j < line.coordinates[i].length; j++) {
          this._basePoints.push(this._toTreeItem(line.coordinates[i][j]));
        }
      }
    }
  }
  _toTreeItem(coordinates) {
    this._pointsCounter += 1;
    return {
      type: 'Feature',
      id: this._pointsCounter,
      geometry: {
        type: 'Point',
        coordinates: coordinates
      },
      properties: {}
    };
  }
}

module.exports = TracksGenie;
