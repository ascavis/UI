function trueAnomaly(orbitalElements, time) {
	var timeSpan = (time.getTime() - orbitalElements.referenceDate.getTime()) / (60 * 60 * 24 * 1000 * 365.25);
    // FIXME: the following is actually the mean anomaly, a transformation is missing
    return orbitalElements.meanAnomaly + timeSpan / orbitalElements.orbitalPeriod * 2.0 * Math.PI
}

function calculateCartesianCoordinates(orbitalElements, trueAnomaly) {

    // Transformation matrix
    var cos_Om = Math.cos(orbitalElements.ascendingNode);
    var sin_Om = Math.sin(orbitalElements.ascendingNode);
    var cos_w = Math.cos(orbitalElements.perihelion);
    var sin_w = Math.sin(orbitalElements.perihelion);
    var cos_i = Math.cos(orbitalElements.inclination);
    var sin_i = Math.sin(orbitalElements.inclination);

	var x1 = cos_Om * cos_w - sin_Om * cos_i * sin_w;
	var x2 = sin_Om * cos_w + cos_Om * cos_i * sin_w;
	var x3 = sin_i * sin_w;
	
	var y1 = - cos_Om * sin_w - sin_Om * cos_i * cos_w;
	var y2 = - sin_Om * sin_w + cos_Om * cos_i * cos_w;
	var y3 = sin_i * cos_w;
	
	var z1 = sin_i * sin_Om;
	var z2 = - sin_i * cos_Om;
	var z3 = cos_i;

    // Orbital state vector w.r.t. orbital plane
	var r_v = orbitalElements.semiMajorAxis
        * (1.0 - Math.pow(orbitalElements.eccentricity, 2.0))
        / (1.0 + orbitalElements.eccentricity * Math.cos(trueAnomaly)); 
	var v1 = r_v * Math.cos(trueAnomaly);
	var v2 = r_v * Math.sin(trueAnomaly);
    //return new THREE.Vector3(v1, v2, 0);

    // Transform to global coordinate system
    return new THREE.Vector3(
        v1 * x1 + v2 * y1,
	    v1 * x2 + v2 * y2,
	    v1 * x3 + v2 * y3
    );
}
