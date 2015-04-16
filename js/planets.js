var earthOrbitalElements = new orbitalElements();
earthOrbitalElements.semiMajorAxis = 149600000;
earthOrbitalElements.orbitalPeriod = 1;
earthOrbitalElements.eccentricity = 0.0167;
earthOrbitalElements.referenceDate = new Date("January 1, 2000 12:00:00 UTC");
earthOrbitalElements.meanAnomaly = 355.53;
earthOrbitalElements.ascendingNode = -11.26064;
earthOrbitalElements.perihelion =  102.94719;
earthOrbitalElements.inclination = 0.00005;
 
var earth = new planet('earth', 6371, 0x1fd8ff, earthOrbitalElements);


var marsOrbitalElements = new orbitalElements();
marsOrbitalElements.semiMajorAxis = 227939100;
marsOrbitalElements.orbitalPeriod = 1.8808;
marsOrbitalElements.eccentricity = 0.0935;
marsOrbitalElements.referenceDate = new Date("January 1, 2000 12:00:00 UTC");
marsOrbitalElements.meanAnomaly = 19.3564;
marsOrbitalElements.ascendingNode = 49.562;
marsOrbitalElements.perihelion =  286.537;
marsOrbitalElements.inclination = 5.65;
 
var mars = new planet('mars', 3390, 0xff0000, marsOrbitalElements);
