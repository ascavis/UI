var ASCAVIS = {};

ASCAVIS.Model = (function(){
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
	
	
	Date.prototype.setJulian = function(jd) {
	    var refDate = 2440587.5;
	    var timestamp = (jd - refDate) * 86400000.0;
	    this.setTime(timestamp);
	}
	
	var Planets = (function() {
		function planet(name, radius, color, orbitalElements) {
			this.name = name;
			this.radius = radius;
			this.color = color;
			this.orbitalElements = orbitalElements;
		};	
		
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
	
	var Asteroids = (function() {
		var asteroids = [];
		var jqxhr;
		
		function asteroid(id, orbitalElements) {
			this.id = id;
			this.orbitalElements = orbitalElements;
			this.name = "";
			this.taxonomyClass = "M";
			this.orbitType = 0;
			this.absoluteMagnitude = 0;
			this.radius = 1;
		};
		
		function selectionProperties() {
			this.taxonomyClass = "all";
			this.orbitType = -1;
			this.minAbsoluteMagnitude = -5;
			this.maxAbsoluteMagnitude = 10;
			this.minDiameter = 100;
			this.maxDiameter = 500;		
		}
		
		var highlightProperties = new selectionProperties();
		var filterProperties = new selectionProperties();
		
			
		function loadAsteroidData(){
				var selectionString = "/mpc_more/?orderby=absolute_magnitude%20DESC&no=1000&paramlim="
				var taxonomyClassStringPart = "";
				var orbitTypeStringPart = "";
				
				if(!(filterProperties.taxonomyClass == "all" || filterProperties.taxonomyClass == null || filterProperties.taxonomyClass == "")){
					taxonomyClassStringPart = "taxonomy_class=%22"+ filterProperties.taxonomyClass +"%22%20AND%20";
				}
							
				if(filterProperties.orbitType != -1){
					orbitTypeStringPart = "orbit_type="+ filterProperties.orbitType +"%20AND%20"
				}
				
				selectionString += taxonomyClassStringPart + orbitTypeStringPart + "absolute_magnitude>"+ filterProperties.minAbsoluteMagnitude +"%20AND%20absolute_magnitude<" + filterProperties.maxAbsoluteMagnitude + "%20AND%20diameter>"+filterProperties.minDiameter+"%20AND%20diameter<" + filterProperties.maxDiameter; 
				
				if(jqxhr && jqxhr.readyState != 4){
				    jqxhr.abort();
				}
				jqxhr = $.getJSON( selectionString, function() {
				  // console.log( "success" );
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
				  			ast.radius = a.diameter / 2;
				  			
				  			asteroids.push(ast);
				  		});
				  })
				  .fail(function() {
				    console.log( "Asteroid AJAX request failed or canceled." );
				  })
				  .always(function() {
				    //console.log( "complete" );
				  });
				  
				jqxhr.complete(function() {
				  //console.log( "second complete" );
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
	
	return {
		Asteroids: Asteroids,
		Planets: Planets,
		AU : AU,
		calculateCartesianCoordinates: function(orbitalElements, trueAnomaly) {
			return calculateCartesianCoordinates(orbitalElements, trueAnomaly);
		},
		trueAnomaly: function(orbitalElements, time){
			return trueAnomaly(orbitalElements, time);
		}		
	}	
}());