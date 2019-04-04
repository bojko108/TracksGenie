import TracksGenie from '../src/main';
import { assert } from 'chai';
import base from './data/base.json';
import testLine from './data/test.json';
import fs from 'fs';

describe('TracksGenie tests', () => {
  // it('Should throw exception if not a feature', () => {
  //   assert.throws(function() {
  //     return new TracksGenie([{ type: 'undefined', geometry: { type: 'undefined' } }]);
  //   }, 'You must pass a feature.');
  // });

  // it('Should throw exception if geometry is not supported', () => {
  //   assert.throws(function() {
  //     return new TracksGenie([{ type: 'Feature', geometry: { type: 'undefined' } }]);
  //   }, 'Geometry is not supported: undefined. Supported types are: LineString and MultiLineString.');
  // });

  // it('Should generate spatial index from base lines', () => {
  //   const genie = new TracksGenie(base.features);

  //   const points = genie.getBasePointsAt([24.118264, 42.151995], 50);
  //   assert.isDefined(points);
  //   assert.isArray(points);
  //   assert.equal(points.length, 5);
  // });

  it('Should process a LineString', () => {
    const genie = new TracksGenie(base.features);
    debugger;
    const line = testLine;
    const segments = genie.processLine(line);
    debugger;

    let segmentsAsJson = segments.map(segment => {
      let text = '';
      for (let i = 0; i < segment.length; i++) {
        const vertex = segment[i];
        text += `\n[${vertex[0]},${vertex[1]}]${i === segment.length - 1 ? '' : ','}`;
      }
      return `{
        "type": "Feature", 
        "properties": { "fid": 112 }, 
        "geometry": { 
          "type": "LineString", 
          "coordinates": [
            ${text}
          ]
        }
      }`;
    });

    let features = `{
      "type": "FeatureCollection",
      "name": "base",
      "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
      "features": [${segmentsAsJson.map(s => {
        return s;
      })}]
    }`;

    fs.writeFileSync('./tests/intersected.geojson', features, error => {
      if (error) {
        console.log(error);
      } else {
        console.log('file saved');
      }
    });
  });

  // it('Should simplify line', () => {
  //   const genie = new TracksGenie(base.features);

  //   const line = testLine;
  //   assert.equal(line.coordinates.length, 3478);
  //   genie.simplifyLine(line, 10, true);
  //   assert.equal(line.coordinates.length, 164);

  //   let coordinates = '';

  //   if (line.type === 'LineString') {
  //     for (let i = 0; i < line.coordinates.length; i++) {
  //       const vertex = line.coordinates[i];
  //       coordinates += `\n[${vertex[0]},${vertex[1]}]${i === line.coordinates.length - 1 ? '' : ','}`;
  //     }
  //   }

  //   if (line.type === 'MultiLineString') {
  //     for (let i = 0; i < line.coordinates.length; i++) {
  //       for (let j = 0; j < line.coordinates[i].length; j++) {
  //         const vertex = line.coordinates[i][j];
  //         coordinates += `\n[${vertex[0]},${vertex[1]}]${i === line.coordinates[i].length - 1 ? '' : ','}`;
  //       }
  //     }
  //   }

  //   let features = `{
  //     "type": "FeatureCollection",
  //     "name": "base",
  //     "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
  //     "features": [ {
  //       "type": "Feature",
  //       "properties": { "fid": 112 },
  //       "geometry": {
  //         "type": "${line.type}",
  //         "coordinates": [
  //           ${line.type === 'MultiLineString' ? '[' : ''}
  //           ${coordinates}
  //           ${line.type === 'MultiLineString' ? ']' : ''}
  //         ]
  //       }
  //     }]
  //   }`;

  //   fs.writeFileSync('./tests/simplified.geojson', features, error => {
  //     if (error) {
  //       console.log(error);
  //     } else {
  //       console.log('file saved');
  //     }
  //   });
  // });

  // it('Should test line for intersection', done => {
  //   const genie = new TracksGenie();
  //   genie.setBaseLines(base.features.map(f => f.geometry));
  //   genie.testLine(line);
  //   done();

  //   assert.equal(genie.insidePolygon([24.12432, 42.15228]), true);
  //   assert.equal(genie.insidePolygon([24.12014, 42.15855]), false);
  // });
});
