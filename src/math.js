const R = 6731137; // WGS84

export function metersToDegrees(meters) {
  return (meters * 360) / (2 * Math.PI * R);
}

export function degreesToMeters(degrees) {
  return (2 * Math.PI * R * degrees) / 360;
}

/**
 * Convert degrees to radians
 * @public
 * @param {!Number} degrees
 * @return {Number}
 */
export function toRad(degrees) {
  return (degrees * Math.PI) / 180;
}
/**
 * Convert radians to degrees
 * @public
 * @param {!Number} radians
 * @return {Number}
 */
export function toDeg(radians) {
  return (radians / Math.PI) * 180;
}
