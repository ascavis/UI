function orbitalElements() {
	this.referenceDate = new Date(2000, 1, 1, 1, 1, 1, 1);
	this.orbitalPeriod = 1;
	this.semiMajorAxis = 1;
	this.eccentricity = 1;
	this.meanAnomaly = 1;
	this.ascendingNode = 0;
	this.perihelion = 0;
	this.inclination = 0;
}

function cartesianCoordinates() {
	this.x = 0;
	this.y = 0;
	this.z = 0;
}

function planet(name, radius, color, orbitalElements) {
	var geometry = new THREE.SphereGeometry( radius, 32, 32 );
	var material  = new THREE.MeshBasicMaterial( { color: 0xffffff, overdraw : true })
	// var material = new THREE.MeshBasicMaterial({ overdraw : true} );
	// material.map = THREE.ImageUtils.loadTexture('img/textures/world2048.jpg');
	
	// material.map.wrapS = THREE.RepeatWrapping; // This causes globe not to load
	// material.map.offset.x = 180 / ( 2 * Math.PI ); // causes globe not to load
	
	material.specular  = new THREE.Color(color);
	mesh = new THREE.Mesh( geometry, material );	

	var curve = new THREE.EllipseCurve(
		0,  0,            // ax, aY
		orbitalElements.semiMajorAxis * 2, 10,           // xRadius, yRadius
		0,  2 * Math.PI,  // aStartAngle, aEndAngle
		false             // aClockwise
	);
	
	var path = new THREE.Path( curve.getPoints( 50 ) );
	var geometry = path.createPointsGeometry( 50 );
	var material = new THREE.LineBasicMaterial( { color : 0xff0000 } );
	
	// Create the final Object3d to add to the scene
	var ellipse = new THREE.Line( geometry, material );

	this.name = name;
	this.geometry = planet;
	this.material = material;
	this.mesh = mesh;
	this.orbitalElements = orbitalElements;
}

