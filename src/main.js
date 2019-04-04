import KDBush from 'kdbush';
import { metersToDegrees } from './math';

import simplify from 'simplify-js';

export default class TracksGenie {
  constructor(baseFeatures) {
    this._pointsCounter = 0;
    this._basePoints = [];

    for (let i = 0; i < baseFeatures.length; i++) {
      this._processBaseFeature(baseFeatures[i]);
    }

    if (this._basePoints.length > 0) {
      this._index = new KDBush(this._basePoints, p => p.coordinates[0], p => p.coordinates[1], 64, Float32Array);
    }
  }

  getBasePointsAt(latLong, distanceInMeters) {
    const ids = this._index.within(latLong[0], latLong[1], metersToDegrees(distanceInMeters));
    return ids.length > 0 ? ids.map(id => this._basePoints.filter(p => p.index === id)[0]) : [];
  }

  simplifyLine(inputLine, tolerance = 1, highestQuality = false) {
    const type = inputLine.type;
    if (type !== 'LineString' && type !== 'MultiLineString') {
      throw `Geometry is not supported: ${type}. Supported types are: LineString and MultiLineString.`;
    }

    if (type === 'LineString') {
      const points = simplify(inputLine.coordinates, metersToDegrees(tolerance), highestQuality);
      inputLine.coordinates = points;
    }

    if (type === 'MultiLineString') {
      for (let i = 0; i < inputLine.coordinates.length; i++) {
        const points = simplify(inputLine.coordinates, metersToDegrees(tolerance), highestQuality);
        inputLine.coordinates[i] = points;
      }
    }
  }

  processLine(inputLine, distance = 50) {
    const type = inputLine.type;
    if (type !== 'LineString' && type !== 'MultiLineString') {
      throw `Geometry is not supported: ${type}. Supported types are: LineString and MultiLineString.`;
    }

    this.simplifyLine(inputLine, 10, true);

    let segmentsCount = 0;
    let newSegments = [];

    if (type === 'LineString') {
      const resultPoints = [];
      for (let i = 0; i < inputLine.coordinates.length; i++) {
        const vertex = inputLine.coordinates[i];
        const result = this._checkPoint(vertex, distance);
        if (result.isNew) {
          if (Array.isArray(newSegments[segmentsCount])) {
            newSegments[segmentsCount].push(vertex);
          } else {
            newSegments[segmentsCount] = [vertex];
          }
        } else {
          if (Array.isArray(newSegments[segmentsCount])) {
            segmentsCount += 1;
          }
        }
      }
      inputLine.coordinates = resultPoints;
    }

    if (type === 'MultiLineString') {
      for (let i = 0; i < inputLine.coordinates.length; i++) {
        const resultPoints = [];
        for (let j = 0; j < inputLine.coordinates[i].length; j++) {
          const vertex = inputLine.coordinates[i][j];
          const result = this._checkPoint(vertex, distance);
          if (result.isNew) {
            if (Array.isArray(newSegments[segmentsCount])) {
              newSegments[segmentsCount].push(vertex);
            } else {
              newSegments[segmentsCount] = [vertex];
            }
          } else {
            if (Array.isArray(newSegments[segmentsCount])) {
              segmentsCount += 1;
            }
          }
        }
        inputLine.coordinates[i] = resultPoints;
      }
    }

    return newSegments.filter(segment => segment.length > 1);
  }

  processLine2(inputLine, distance = 50) {
    const type = inputLine.type;
    if (type !== 'LineString' && type !== 'MultiLineString') {
      throw `Geometry is not supported: ${type}. Supported types are: LineString and MultiLineString.`;
    }

    this.simplifyLine(inputLine, 10, true);

    if (type === 'LineString') {
      const resultPoints = [];
      for (let i = 0; i < inputLine.coordinates.length; i++) {
        const vertex = inputLine.coordinates[i];
        if (this._isNewPoint(vertex, distance)) {
          resultPoints.push(vertex);
        }
      }
      inputLine.coordinates = resultPoints;
    }

    if (type === 'MultiLineString') {
      for (let i = 0; i < inputLine.coordinates.length; i++) {
        const resultPoints = [];
        for (let j = 0; j < inputLine.coordinates[i].length; j++) {
          const vertex = inputLine.coordinates[i][j];
          if (this._isNewPoint(vertex, distance)) {
            resultPoints.push(vertex);
          }
        }
        inputLine.coordinates[i] = resultPoints;
      }
    }
  }

  _checkPoint(vertex, distance) {
    const points = this.getBasePointsAt(vertex, distance);
    if (points.length < 1) {
      return { isNew: true, segmentFids: [] };
    } else {
      return { isNew: false, segmentFids: [points[0].segmentFid] };
    }
  }

  _isNewPoint(vertex, distance) {
    const points = this.getBasePointsAt(vertex, distance);
    return points.length < 1;
  }

  _processBaseFeature(feature) {
    if (feature.type !== 'Feature') {
      throw `You must pass a feature.`;
    }

    const type = feature.geometry.type;

    if (type !== 'LineString' && type !== 'MultiLineString') {
      throw `Geometry is not supported: ${type}. Supported types are: LineString and MultiLineString.`;
    }

    if (type === 'LineString') {
      const vertices = this._lineToIndex(feature.properties.fid, feature.geometry.coordinates);
      this._basePoints.push(...vertices);
    }

    if (type === 'MultiLineString') {
      for (let i = 0; i < feature.geometry.coordinates.length; i++) {
        const vertices = this._lineToIndex(feature.properties.fid, feature.geometry.coordinates[i]);
        this._basePoints.push(...vertices);
      }
    }
  }

  _lineToIndex(fid, coordinates) {
    return coordinates.map(coordinate => {
      this._pointsCounter += 1;
      return {
        index: this._pointsCounter,
        segmentFid: fid,
        coordinates: coordinate
      };
    });
  }
}

/////////////////////////////////////////////////////////////////////////
// export default class TracksGenie {
//   constructor() {
//     this._index = null;

//     this._basePoints = null;
//     this._pointsCounter = 0;

//     // this._baseLines = null;
//     // this._linesCounter = 0;
//   }

//   setBaseLines(lines) {
//     this._basePoints = [];
//     // this._baseLines = {
//     //   type: 'FeatureCollection',
//     //   features: []
//     // };

//     for (let i = 0; i < lines.length; i++) {
//       this._processBaseLine(lines[i]);
//     }
//     if (this._basePoints.length > 0) {
//       this._index = new KDBush(this._basePoints, p => p.geometry.coordinates[0], p => p.geometry.coordinates[1], 64, Float32Array);
//     }
//     // if (this._baseLines.features.length > 0) {
//     //   this._baseLines = combine(this._baseLines);
//     //   try {
//     //     // this._buffer = buffer(this._baseLines.features[0], 50, { units: 'meters' });
//     //     this._buffer = buffer;
//     //   } catch (e) {
//     //     debugger;
//     //     console.log(e);
//     //   }
//     // }
//   }

//   testLine(line) {
//     try {
//       debugger;
//       this._newPoints = line.coordinates.map(c => this.insidePolygon(c));
//       debugger;
//     } catch (e) {
//       debugger;
//       console.log(e);
//     }
//   }

//   insidePolygon(point) {
//     // ray-casting algorithm based on
//     // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

//     let x = point[0],
//       y = point[1];

//     let inside = false;
//     for (let k = 0; k < this._buffer.coordinates.length; k++) {
//       for (let m = 0; m < this._buffer.coordinates[k].length; m++) {
//         for (let i = 0, j = this._buffer.coordinates[k][m].length - 1; i < this._buffer.coordinates[k][m].length; j = i++) {
//           let xi = this._buffer.coordinates[k][m][i][0],
//             yi = this._buffer.coordinates[k][m][i][1];
//           let xj = this._buffer.coordinates[k][m][j][0],
//             yj = this._buffer.coordinates[k][m][j][1];

//           let intersect = yi > y != yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
//           if (intersect) inside = !inside;
//         }
//       }
//     }

//     return inside;
//   }

//   simplify(points, tolerance = 1, highestQuality = false) {
//     return simplify(points, metersToDegrees(tolerance), highestQuality);
//   }

//   getBasePointsAt(latLong, distanceInMeters) {
//     const ids = this._index.within(...latLong, metersToDegrees(distanceInMeters));
//     return ids.map(id => this._basePoints[id]);
//   }

//   _processBaseLine(line) {
//     const type = line.type;

//     if (type !== 'LineString' && type !== 'MultiLineString') {
//       throw `Geometry is not supported: ${type}. Supported types are: LineString and MultiLineString.`;
//     }

//     let lines = [];

//     if (type === 'LineString') {
//       // this._baseLines.features.push(this._toLineItem(line.coordinates));
//       for (let i = 0; i < line.coordinates.length; i++) {
//         this._basePoints.push(this._toTreeItem(line.coordinates[i]));
//       }
//     }

//     if (type === 'MultiLineString') {
//       for (let i = 0; i < line.coordinates.length; i++) {
//         // this._baseLines.features.push(this._toLineItem(line.coordinates[i]));
//         for (let j = 0; j < line.coordinates[i].length; j++) {
//           this._basePoints.push(this._toTreeItem(line.coordinates[i][j]));
//         }
//       }
//     }
//   }

//   _toTreeItem(coordinates) {
//     this._pointsCounter += 1;
//     return {
//       type: 'Feature',
//       id: this._pointsCounter,
//       geometry: {
//         type: 'Point',
//         coordinates: coordinates
//       },
//       properties: {}
//     };
//   }

//   // _toLineItem(coordinates) {
//   //   this._linesCounter += 1;
//   //   return {
//   //     type: 'Feature',
//   //     id: this._counter,
//   //     geometry: {
//   //       type: 'LineString',
//   //       coordinates: coordinates
//   //     },
//   //     properties: {}
//   //   };
//   // }
// }
