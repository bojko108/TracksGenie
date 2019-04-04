import KDBush from 'kdbush';
import { metersToDegrees } from './math';

import simplify from 'simplify-js';

export default class TracksGenie {
  constructor() {
    this._index = null;

    this._basePoints = null;
    this._pointsCounter = 0;

    // this._baseLines = null;
    // this._linesCounter = 0;
  }

  setBaseLines(lines) {
    this._basePoints = [];
    // this._baseLines = {
    //   type: 'FeatureCollection',
    //   features: []
    // };

    for (let i = 0; i < lines.length; i++) {
      this._processBaseLine(lines[i]);
    }
    if (this._basePoints.length > 0) {
      this._index = new KDBush(this._basePoints, p => p.geometry.coordinates[0], p => p.geometry.coordinates[1], 64, Float32Array);
    }
    // if (this._baseLines.features.length > 0) {
    //   this._baseLines = combine(this._baseLines);
    //   try {
    //     // this._buffer = buffer(this._baseLines.features[0], 50, { units: 'meters' });
    //     this._buffer = buffer;
    //   } catch (e) {
    //     debugger;
    //     console.log(e);
    //   }
    // }
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
    // ray-casting algorithm based on
    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

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
    return simplify(points, metersToDegrees(tolerance), highestQuality);
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

    let lines = [];

    if (type === 'LineString') {
      // this._baseLines.features.push(this._toLineItem(line.coordinates));
      for (let i = 0; i < line.coordinates.length; i++) {
        this._basePoints.push(this._toTreeItem(line.coordinates[i]));
      }
    }

    if (type === 'MultiLineString') {
      for (let i = 0; i < line.coordinates.length; i++) {
        // this._baseLines.features.push(this._toLineItem(line.coordinates[i]));
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

  // _toLineItem(coordinates) {
  //   this._linesCounter += 1;
  //   return {
  //     type: 'Feature',
  //     id: this._counter,
  //     geometry: {
  //       type: 'LineString',
  //       coordinates: coordinates
  //     },
  //     properties: {}
  //   };
  // }
}
