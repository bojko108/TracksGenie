import { assert } from 'chai';
import { toDeg, toRad, metersToDegrees, degreesToMeters } from '../src/math';

describe('Math tests', () => {
  it('Should convert meters to degrees', () => {
    const meters = 50;
    const degrees = metersToDegrees(meters);
    assert.closeTo(degrees, 0.0004256025357460583, 0.1);
  });

  it('Should convert degrees to meters', () => {
    const degrees = 0.0004256025357460583;
    const meters = degreesToMeters(degrees);
    assert.closeTo(meters, 50, 0.1);
  });

  it('Should convert degrees to radians', () => {
    const radians = Math.PI / 2;
    const degrees = toDeg(radians);
    assert.closeTo(degrees, 90, 0);
  });

  it('Should convert radians to degrees', () => {
    const degrees = 90;
    const radians = toRad(degrees);
    assert.closeTo(radians, Math.PI / 2, 0);
  });
});
