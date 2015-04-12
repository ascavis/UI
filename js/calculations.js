function calculateCartesianCoordinates(orbitalElements, time){
	var timeSpan = Math.round((time - orbitalElements.referenceDate) / (86400000 * 365,25));
	var trueAnomaly = orbitalElements.semiMajorAxis + timeSpan / orbitalElements.orbitalPeriod * Math.PI;
	var r_v = (orbitalElements.semiMajorAxis * (1 - Math.pow(orbitalElements.eccentricity,2)) / (1 + orbitalElements.eccentricity * Math.cos(orbitalElements.meanAnomaly)) ); 
	
	var x1 = Math.cos(orbitalElements.ascendingNode) * Math.cos(orbitalElements.perihelion) - Math.sin(orbitalElements.ascendingNode) * Math.cos(orbitalElements.inclination) * Math.sin(orbitalElements.perihelion);
	
	var x2 = Math.sin(orbitalElements.ascendingNode) * Math.cos(orbitalElements.perihelion) + Math.cos(orbitalElements.ascendingNode) * Math.cos(orbitalElements.inclination) * Math.sin(orbitalElements.perihelion);
	
	var x3 = Math.sin(orbitalElements.inclination) * Math.sin(orbitalElements.perihelion);
	
	var y1 = - Math.cos(orbitalElements.ascendingNode) * Math.sin(orbitalElements.perihelion) - Math.sin(orbitalElements.ascendingNode) * Math.cos(orbitalElements.inclination) * Math.sin(orbitalElements.perihelion);
	
	var y2 = - Math.sin(orbitalElements.ascendingNode) * Math.sin(orbitalElements.perihelion) + Math.cos(orbitalElements.ascendingNode) * Math.cos(orbitalElements.inclination) * Math.cos(orbitalElements.perihelion);
	
	var y3 = Math.sin(orbitalElements.inclination) * Math.cos(orbitalElements.perihelion);
	
	var z1 = Math.sin(orbitalElements.inclination) * Math.sin(orbitalElements.ascendingNode);
	
	var z2 = -Math.sin(orbitalElements.inclination) * Math.sin(orbitalElements.ascendingNode);
	
	var z3 = Math.cos(orbitalElements.inclination);
	
	var v1 = r_v * Math.cos(orbitalElements.meanAnomaly);
	var v2 = r_v * Math.sin(orbitalElements.meanAnomaly);
	var v3 = 0;
	
	var coordinates = new cartesianCoordinates();
	// coordinates.x = v1 * x1 + v2 * y1;
	// coordinates.y = v1 * x2 + v2 * y2;
	// coordinates.z = v1 * x2 + v2 * y3;
	
	coordinates.x = v1 * x1 + v2 * x2;
	coordinates.y = v1 * y1 + v2 * y2;
	coordinates.z = v1 * z1 + v2 * z2;
	
	return coordinates;	
}