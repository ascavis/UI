var AU = 1.496e8;

function orbitalElements() {
	this.referenceDate = new Date(2000, 1, 1, 1, 1, 1, 1);
	this.orbitalPeriod = 1;
	this.semiMajorAxis = 1;
	this.eccentricity = 0;
	this.meanAnomaly = 0;
	this.ascendingNode = 0;
	this.perihelion = 0;
	this.inclination = 0;
}

function cartesianCoordinates() {
	this.x = 0;
	this.y = 0;
	this.z = 0;
}
