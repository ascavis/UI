function planet(name, radius, color, orbitalElements) {
    // NOTE: radius is scaled up extremely for debugging purposes
	var geometry = new THREE.SphereGeometry( radius * 200, 16, 16 );
	var material  = new THREE.MeshBasicMaterial( { color: color, overdraw : true })
	// var material = new THREE.MeshBasicMaterial({ overdraw : true} );
	// material.map = THREE.ImageUtils.loadTexture('img/textures/world2048.jpg');
	
	// material.map.wrapS = THREE.RepeatWrapping; // This causes globe not to load
	// material.map.offset.x = 180 / ( 2 * Math.PI ); // causes globe not to load
	
	material.specular  = new THREE.Color(color);
	mesh = new THREE.Mesh( geometry, material );	

    var curve = new OrbitalCurve(orbitalElements);
	var geometry = new THREE.Geometry();
	geometry.vertices = curve.getPoints(50);
	var material = new THREE.LineBasicMaterial({ color : color });
	var orbit = new THREE.Line(geometry, material);

	this.name = name;
	this.geometry = planet;
	this.material = material;
	this.mesh = mesh;
    this.orbitMesh = orbit;
	this.orbitalElements = orbitalElements;
}


var earthOrbitalElements = new orbitalElements();
earthOrbitalElements.semiMajorAxis = 1 * AU;
earthOrbitalElements.orbitalPeriod = 1;
earthOrbitalElements.eccentricity = 0.0167;
earthOrbitalElements.referenceDate = new Date("January 1, 2000 12:00:00 UTC");
earthOrbitalElements.meanAnomaly = 355.53 / 180.0 * Math.PI;
earthOrbitalElements.ascendingNode = -11.26064 / 180.0 * Math.PI;
earthOrbitalElements.perihelion =  102.94719 / 180.0 * Math.PI;
earthOrbitalElements.inclination = 0.00005 / 180.0 * Math.PI;
 
var earth = new planet('earth', 6378, 0x1fd8ff, earthOrbitalElements);


var marsOrbitalElements = new orbitalElements();
marsOrbitalElements.semiMajorAxis = 1.666 * AU;
marsOrbitalElements.orbitalPeriod = 1.8808;
marsOrbitalElements.eccentricity = 0.0935;
marsOrbitalElements.referenceDate = new Date("January 1, 2000 12:00:00 UTC");
marsOrbitalElements.meanAnomaly = 19.3564 / 180.0 * Math.PI;
marsOrbitalElements.ascendingNode = 49.562 / 180.0 * Math.PI;
marsOrbitalElements.perihelion =  286.537 / 180.0 * Math.PI;
marsOrbitalElements.inclination = 5.65 / 180.0 * Math.PI;
 
var mars = new planet('mars', 3396, 0xff8040, marsOrbitalElements);
