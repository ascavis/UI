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

var planets = (function() {
	function planet(name, radius, color, orbitalElements) {
	    // NOTE: radius is scaled up extremely for debugging purposes
		var geometry = new THREE.SphereGeometry( radius * 200, 16, 16 );
		var material  = new THREE.MeshBasicMaterial( { color: color, overdraw : true })
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
	
	return {
		getPlanets : function(){
			return [earth, mars];
		}
	}
}());

var asteroids = (function() {
	var asteroids = [];
	
	function asteroid(name, radius, color, orbitalElements) {
	    // NOTE: radius is scaled up extremely for debugging purposes
		var geometry = new THREE.SphereGeometry( radius * 200, 16, 16 );
		var material  = new THREE.MeshBasicMaterial( { color: color, overdraw : true })
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
		
		this.added = false;
	};
	
	function loadAsteroidData(){
			var jqxhr = $.getJSON( "/mpc_more/?orderby=absolute_magnitude%20DESC&no=100&paramlim=object_type=%22m%22", function() {
			  console.log( "success" );
			})
			  .done(function(data) {		  		
			  		data.forEach( function(a){
			  			var asteroidOrbitalElements = new orbitalElements();
			  			
			  			asteroidOrbitalElements.referenceDate = new Date(2000, 1, 1, 1, 1, 1, 1);
			  			asteroidOrbitalElements.orbitalPeriod = a.period;
			  			asteroidOrbitalElements.semiMajorAxis = a.semimajor_axis * AU;
			  			asteroidOrbitalElements.eccentricity = a.eccentricity;
			  			asteroidOrbitalElements.meanAnomaly = a.mean_anomaly / 180.0 * Math.PI;
			  			asteroidOrbitalElements.ascendingNode = a.ascending_node / 180.0 * Math.PI;
			  			asteroidOrbitalElements.perihelion = a.argument_of_perihelion / 180.0 * Math.PI;
			  			asteroidOrbitalElements.inclination = a.inclination / 180.0 * Math.PI;
			  			
			  			var ast = new asteroid(a.name, 2000, 0xffffff, asteroidOrbitalElements);
			  					  			
			  			asteroids.push(ast);
			  		});
			  })
			  .fail(function() {
			    console.log( "error" );
			  })
			  .always(function() {
			    console.log( "complete" );
			  });
			  
			jqxhr.complete(function() {
			  console.log( "second complete" );
			});
		};
	
	return {
		load: function(){
			loadAsteroidData();
		},
		getAsteroids: function(){
			return asteroids;
		}
	}	
}());