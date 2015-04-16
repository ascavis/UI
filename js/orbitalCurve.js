/** A THREE.js curve describing an orbit */
OrbitalCurve = function ( orbitalElements ) {
    console.log("run constructor");
    this.orbitalElements = orbitalElements;
};

OrbitalCurve.prototype = Object.create( THREE.Curve.prototype );

OrbitalCurve.prototype.constructor = THREE.OrbitalCurve;

OrbitalCurve.prototype.getPoint = function ( t ) {
    var coord = new calculateCartesianCoordinates(this.orbitalElements, t * 2 * Math.PI);
    console.log(t, coord);
    return coord;
};
