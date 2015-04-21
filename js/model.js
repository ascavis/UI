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
		
		var mercuryOrbitalElements = new orbitalElements();
		mercuryOrbitalElements.semiMajorAxis = 0.387098 * AU;
		mercuryOrbitalElements.orbitalPeriod = 0.240846;
		mercuryOrbitalElements.eccentricity = 0.205630;
		mercuryOrbitalElements.referenceDate = new Date("January 1, 2000 12:00:00 UTC");
		mercuryOrbitalElements.meanAnomaly = 174.796 / 180.0 * Math.PI;
		mercuryOrbitalElements.ascendingNode = -48.331 / 180.0 * Math.PI;
		mercuryOrbitalElements.perihelion =  29.124 / 180.0 * Math.PI;
		mercuryOrbitalElements.inclination = 7.005 / 180.0 * Math.PI;
		 
		var mercury = new planet('Mercury', 2439.7, 0xdadada, mercuryOrbitalElements);
		
		var venusOrbitalElements = new orbitalElements();
		venusOrbitalElements.semiMajorAxis = 0.728213 * AU;
		venusOrbitalElements.orbitalPeriod = 0.615198;
		venusOrbitalElements.eccentricity = 0.0067;
		venusOrbitalElements.referenceDate = new Date("January 1, 2000 12:00:00 UTC");
		venusOrbitalElements.meanAnomaly = 50.115 / 180.0 * Math.PI;
		venusOrbitalElements.ascendingNode = 76.678 / 180.0 * Math.PI;
		venusOrbitalElements.perihelion =  55.186 / 180.0 * Math.PI;
		venusOrbitalElements.inclination = 3.39458 / 180.0 * Math.PI;
		 
		var venus = new planet('Venus', 6051.8, 0xfff15f, venusOrbitalElements);

		var earthOrbitalElements = new orbitalElements();
		earthOrbitalElements.semiMajorAxis = 1 * AU;
		earthOrbitalElements.orbitalPeriod = 1;
		earthOrbitalElements.eccentricity = 0.0167;
		earthOrbitalElements.referenceDate = new Date("January 1, 2000 12:00:00 UTC");
		earthOrbitalElements.meanAnomaly = 355.53 / 180.0 * Math.PI;
		earthOrbitalElements.ascendingNode = -11.26064 / 180.0 * Math.PI;
		earthOrbitalElements.perihelion =  102.94719 / 180.0 * Math.PI;
		earthOrbitalElements.inclination = 0.00005 / 180.0 * Math.PI;
		 
		var earth = new planet('Earth', 6378, 0x1fd8ff, earthOrbitalElements);
				
		var marsOrbitalElements = new orbitalElements();
		marsOrbitalElements.semiMajorAxis = 1.666 * AU;
		marsOrbitalElements.orbitalPeriod = 1.8808;
		marsOrbitalElements.eccentricity = 0.0935;
		marsOrbitalElements.referenceDate = new Date("January 1, 2000 12:00:00 UTC");
		marsOrbitalElements.meanAnomaly = 19.3564 / 180.0 * Math.PI;
		marsOrbitalElements.ascendingNode = 49.562 / 180.0 * Math.PI;
		marsOrbitalElements.perihelion =  286.537 / 180.0 * Math.PI;
		marsOrbitalElements.inclination = 5.65 / 180.0 * Math.PI;
		 
		var mars = new planet('Mars', 3396, 0xff8040, marsOrbitalElements);
		
		var jupiterOrbitalElements = new orbitalElements();
		jupiterOrbitalElements.semiMajorAxis = 5.204267 * AU;
		jupiterOrbitalElements.orbitalPeriod = 11.8618;
		jupiterOrbitalElements.eccentricity = 0.048775;
		jupiterOrbitalElements.referenceDate = new Date("January 1, 2000 12:00:00 UTC");
		jupiterOrbitalElements.meanAnomaly = 18.818 / 180.0 * Math.PI;
		jupiterOrbitalElements.ascendingNode = 100.492 / 180.0 * Math.PI;
		jupiterOrbitalElements.perihelion =  275.066 / 180.0 * Math.PI;
		jupiterOrbitalElements.inclination = 1.305 / 180.0 * Math.PI;
		 
		var jupiter = new planet('Jupiter', 66854, 0xf9b256, jupiterOrbitalElements);
		
		var saturnOrbitalElements = new orbitalElements();
		saturnOrbitalElements.semiMajorAxis = 9.5820172 * AU;
		saturnOrbitalElements.orbitalPeriod = 29.4571;
		saturnOrbitalElements.eccentricity = 0.055723219;
		saturnOrbitalElements.referenceDate = new Date("January 1, 2000 12:00:00 UTC");
		saturnOrbitalElements.meanAnomaly = 320.346750 / 180.0 * Math.PI;
		saturnOrbitalElements.ascendingNode = 113.642811 / 180.0 * Math.PI;
		saturnOrbitalElements.perihelion =  336.013862 / 180.0 * Math.PI;
		saturnOrbitalElements.inclination = 2.485240 / 180.0 * Math.PI;
		 
		var saturn = new planet('Saturn', 60268, 0xfff59b, saturnOrbitalElements);
		
		var uranusOrbitalElements = new orbitalElements();
		uranusOrbitalElements.semiMajorAxis = 19.189253 * AU;
		uranusOrbitalElements.orbitalPeriod = 84.016846;
		uranusOrbitalElements.eccentricity = 0.047220087;
		uranusOrbitalElements.referenceDate = new Date("January 1, 2000 12:00:00 UTC");
		uranusOrbitalElements.meanAnomaly = 142.238600 / 180.0 * Math.PI;
		uranusOrbitalElements.ascendingNode = 73.999342 / 180.0 * Math.PI;
		uranusOrbitalElements.perihelion =  96.998857 / 180.0 * Math.PI;
		uranusOrbitalElements.inclination = 0.772556 / 180.0 * Math.PI;
		 
		var uranus = new planet('Uranus', 24973, 0x83d0f5, uranusOrbitalElements);
		
		var neptuneOrbitalElements = new orbitalElements();
		neptuneOrbitalElements.semiMajorAxis = 30.331855 * AU;
		neptuneOrbitalElements.orbitalPeriod = 164.8;
		neptuneOrbitalElements.eccentricity = 0.00867797;
		neptuneOrbitalElements.referenceDate = new Date("January 1, 2000 12:00:00 UTC");
		neptuneOrbitalElements.meanAnomaly = 259.885588 / 180.0 * Math.PI;
		neptuneOrbitalElements.ascendingNode = 131.782974 / 180.0 * Math.PI;
		neptuneOrbitalElements.perihelion =  273.219414 / 180.0 * Math.PI;
		neptuneOrbitalElements.inclination = 1.767975 / 180.0 * Math.PI;
		 
		var neptune = new planet('Neptune', 24764, 0x0033b4, neptuneOrbitalElements);
		
		return {
			getPlanets : function(){
				return [mercury, venus, earth, mars, jupiter, saturn, uranus, neptune];
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