var AU = 1.496e8;

/** A THREE.js curve describing an orbit */
OrbitalCurve = function ( orbitalElements ) {
    // console.log("run constructor");
    this.orbitalElements = orbitalElements;
};

OrbitalCurve.prototype = Object.create( THREE.Curve.prototype );

OrbitalCurve.prototype.constructor = THREE.OrbitalCurve;

OrbitalCurve.prototype.getPoint = function ( t ) {
    var coord = new calculateCartesianCoordinates(this.orbitalElements, t * 2 * Math.PI);
    // console.log(t, coord);
    return coord;
};

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

Date.prototype.setJulian = function(jd) {
    var refDate = 2440587.5;
    var timestamp = (jd - refDate) * 86400000.0;
    this.setTime(timestamp);
}

var planets = (function() {
	function planet(name, radius, color, orbitalElements) {
	    // NOTE: radius is scaled up extremely for debugging purposes
		var geometry = new THREE.SphereGeometry( radius * 200, 16, 16 );
		var material  = new THREE.MeshBasicMaterial( { color: color, overdraw : true })
		material.specular  = new THREE.Color(color);
		var mesh = new THREE.Mesh( geometry, material );	
	
	    var curve = new OrbitalCurve(orbitalElements);
		var orbitGeometry = new THREE.Geometry();
		orbitGeometry.vertices = curve.getPoints(50);
		var material = new THREE.LineBasicMaterial({ color : color });
		var orbit = new THREE.Line(orbitGeometry, material);
	
		this.name = name;
		this.geometry = geometry;
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
	
	function asteroid(id, orbitalElements) {
		this.id = id;
		this.orbitalElements = orbitalElements;
		this.name = "";
		this.taxonomyClass = "M";
		this.orbitType = 0;
		this.absoluteMagnitude = 0;
		this.diameter = 1;
	};
	
	function selectionProperties() {
		this.taxonomyClass = "M";
		this.orbitType = 0;
		this.minAbsoluteMagnitude = 0.5;
		this.maxAbsoluteMagnitude = 5;
		this.minDiameter = 0.1;
		this.maxDiameter = 550;		
	}
	
	var highlightProperties = new selectionProperties();
	var filterProperties = new selectionProperties();
	
		
	function loadAsteroidData(){
	 // http://ascavis.org:5000/mpc_more/?orderby=absolute_magnitude%20DESC&no=10&paramlim=residual_rms%3E2%20AND%20inclination%3E6
	
			var selectionString = "/mpc_more/?orderby=absolute_magnitude%20DESC&no=10&paramlim="
			var taxonomyClassStringPart;
			var orbitTypeStringPart;
			
			if(filterProperties.taxonomyClass == "all" || filterProperties.taxonomyClass == null || filterProperties.taxonomyClass == ""){
				taxonomyClassStringPart = "";
			}
			else{
				taxonomyClassStringPart = "taxonomy_class=%22"+ filterProperties.taxonomyClass +"%22%20AND%20";
			}
						
			if(filterProperties.orbitType != -1){
				orbitTypeStringPart = "orbit_type="+ filterProperties.orbitType +"%20AND%20"
			}
			else{
				orbitTypeStringPart = "";
			}
			
			selectionString += taxonomyClassStringPart + orbitTypeStringPart + "absolute_magnitude>"+ filterProperties.minAbsoluteMagnitude +"%20AND%20absolute_magnitude<" + filterProperties.maxAbsoluteMagnitude + "%20AND%20diameter>"+filterProperties.minDiameter+"%20AND%20diameter<" + filterProperties.maxDiameter; 
						
			var jqxhr = $.getJSON( selectionString, function() {
			  console.log( "success" );
			})
			  .done(function(data) {
			  		asteroids = [];		  		
			  		data.forEach( function(a){
			  			var asteroidOrbitalElements = new orbitalElements();
			  						  			
			  			asteroidOrbitalElements.referenceDate.setJulian(a.epoch_jd);
			  			asteroidOrbitalElements.orbitalPeriod = a.period;
			  			asteroidOrbitalElements.semiMajorAxis = a.semimajor_axis * AU;
			  			asteroidOrbitalElements.eccentricity = a.eccentricity;
			  			asteroidOrbitalElements.meanAnomaly = a.mean_anomaly / 180.0 * Math.PI;
			  			asteroidOrbitalElements.ascendingNode = a.ascending_node / 180.0 * Math.PI;
			  			asteroidOrbitalElements.perihelion = a.argument_of_perihelion / 180.0 * Math.PI;
			  			asteroidOrbitalElements.inclination = a.inclination / 180.0 * Math.PI;
			  			
			  			var ast = new asteroid(a.number, asteroidOrbitalElements);
			  			ast.name = a.name;
			  			
			  			asteroids.push(ast);
			  		});
			  })
			  .fail(function() {
			    console.log( "error" );
			  })
			  .always(function() {
			    //console.log( "complete" );
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
		},
		getFilterProperties: function(){
			return filterProperties;
		},
		getHighlightProperties: function(){
			return highlightProperties;
		},
		setFilterProperties: function(selectionProperties){
			filterProperties = selectionProperties;
			loadAsteroidData();
		},
		setHighlightProperties: function(selectionProperties){
			highlightProperties = selectionProperties;
		}		
	}	
}());