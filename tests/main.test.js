import TracksGenie from '../src/main';
import { assert } from 'chai';
import base from './data/base.json';
import line from './data/test.json';
import fs from 'fs';

describe('TracksGenie tests', () => {
  it('Should throw exception if geometry is not supported', () => {
    const genie = new TracksGenie();

    assert.throws(function() {
      genie.setBaseLines([{ type: 'undefined' }]);
    }, 'Geometry is not supported: undefined. Supported types are: LineString and MultiLineString.');
  });

  it('Should generate spatial index from base lines', () => {
    const genie = new TracksGenie();
    genie.setBaseLines(base.features.map(f => f.geometry));

    const points = genie.getBasePointsAt([24.118264, 42.151995], 50);
    assert.isDefined(points);
    assert.isArray(points);
    assert.equal(points.length, 5);
  });

  it('Should simplify line', () => {
    const genie = new TracksGenie();
    genie.setBaseLines(base.features.map(f => f.geometry));

    const simplifiedCoordinates = genie.simplify(line.coordinates, 10, true);

    let coords = `{
      "type": "FeatureCollection",
      "name": "base",
      "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
      "features": [
      { "type": "Feature", "properties": { "fid": 112 }, "geometry": { "type": "LineString", "coordinates": [`;

    for (let i = 0; i < simplifiedCoordinates.length; i++) {
      const vertex = simplifiedCoordinates[i];
      coords += `\n[${vertex[0]},${vertex[1]}]${i === simplifiedCoordinates.length - 1 ? '' : ','}`;
    }

    coords += ']}}]}';

    fs.writeFileSync('./tests/simplified.geojson', coords, error => {
      if (error) {
        console.log(error);
      } else {
        console.log('file saved');
      }
    });
  });

  // it('Should test line for intersection', done => {
  //   const genie = new TracksGenie();
  //   genie.setBaseLines(base.features.map(f => f.geometry));
  //   genie.testLine(line);
  //   done();

  //   assert.equal(genie.insidePolygon([24.12432, 42.15228]), true);
  //   assert.equal(genie.insidePolygon([24.12014, 42.15855]), false);
  // });
});
